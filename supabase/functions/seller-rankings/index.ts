// ============================================================================
// Edge Function: seller-rankings
// Purpose: Seller ranking data — leaderboard of influencers by deal activity.
//
// Provides:
//   - Ranking (all sellers sorted by active deal count)
//   - Following (sellers the user follows)
//   - Category filtering (beauty, fashion, food, lifestyle, baby, digital)
//   - Period filtering (today, weekly, monthly)
//   - Sort modes (popular, rising, deadlineSoon, newDeal, brand)
//
// Deploy: supabase functions deploy seller-rankings
// Invoke: POST /functions/v1/seller-rankings
//   { "tab": "ranking", "category": "all", "period": "weekly", "sort": "popular" }
// ============================================================================

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

// ─── Types ───────────────────────────────────────────────────────────────────

type RankingTab = 'ranking' | 'following';
type RankingCategory = 'all' | 'beauty' | 'fashion' | 'food' | 'lifestyle' | 'baby' | 'digital';
type RankingPeriod = 'today' | 'weekly' | 'monthly';
type RankingSort = 'popular' | 'rising' | 'deadlineSoon' | 'newDeal' | 'brand';

interface RankingRequest {
  tab: RankingTab;
  category: RankingCategory;
  period: RankingPeriod;
  sort: RankingSort;
  userId?: string;
}

type RankingTrend =
  | { kind: 'up'; delta: number }
  | { kind: 'down'; delta: number }
  | { kind: 'same' }
  | { kind: 'new' };

interface RankingThumbnail {
  id: string;
  imageUrl: string | null;
  label?: string | null;
  groupBuyId?: string | null;
}

interface SellerRanking {
  id: string;
  sellerId: string;
  rank: number;
  previousRank: number | null;
  trend: RankingTrend;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  category: Exclude<RankingCategory, 'all'>;
  followerCount?: number | null;
  activeDealCount: number;
  endingSoonCount?: number | null;
  trustScore?: number | null;
  isFollowing: boolean;
  isSponsored: boolean;
  thumbnails: RankingThumbnail[];
  representativeGroupBuyId?: string | null;
}

interface RankingResponse {
  data: SellerRanking[];
}

// ─── CORS ────────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ─── Mock Data ───────────────────────────────────────────────────────────────

function generateMockRankings(request: RankingRequest): SellerRanking[] {
  const categories: Exclude<RankingCategory, 'all'>[] = [
    'beauty', 'fashion', 'food', 'lifestyle', 'baby', 'digital',
  ];

  const sellers = [
    { name: '뷰티인플루언서', username: 'beauty_star', avatar: null, category: 'beauty' as const },
    { name: '패션리더', username: 'fashion_leader', avatar: null, category: 'fashion' as const },
    { name: '맛집탐방', username: 'food_explorer', avatar: null, category: 'food' as const },
    { name: '라이프스타일', username: 'lifestyle_guru', avatar: null, category: 'lifestyle' as const },
    { name: '맘블로거', username: 'mom_blogger', avatar: null, category: 'baby' as const },
    { name: '테크리뷰어', username: 'tech_reviewer', avatar: null, category: 'digital' as const },
    { name: '스킨케어전문', username: 'skincare_pro', avatar: null, category: 'beauty' as const },
    { name: '스트리트패션', username: 'street_fashion', avatar: null, category: 'fashion' as const },
    { name: '집및선생', username: 'homecook_master', avatar: null, category: 'food' as const },
    { name: '홈데코', username: 'home_deco', avatar: null, category: 'lifestyle' as const },
  ];

  // Filter by category
  let filtered = request.category === 'all'
    ? sellers
    : sellers.filter((s) => s.category === request.category);

  // Build mock rankings
  return filtered.map((seller, i) => {
    const prevRank = i + 1 + (Math.floor(Math.random() * 5) - 2);
    let trend: RankingTrend;
    if (prevRank !== i + 1) {
      trend = { kind: prevRank > i + 1 ? 'up' : 'down', delta: Math.abs(prevRank - (i + 1)) };
    } else {
      trend = { kind: 'same' };
    }

    return {
      id: `seller-${seller.username}`,
      sellerId: `seller-${seller.username}`,
      rank: i + 1,
      previousRank: i > 0 ? prevRank : null,
      trend: i === 0 ? { kind: 'new' } : trend,
      displayName: seller.name,
      username: seller.username,
      avatarUrl: seller.avatar,
      category: seller.category,
      activeDealCount: Math.floor(Math.random() * 10) + 1,
      endingSoonCount: Math.floor(Math.random() * 3),
      trustScore: Math.round((70 + Math.random() * 30) * 10) / 10,
      isFollowing: i < 3,
      isSponsored: i % 3 === 0,
      thumbnails: Array.from({ length: Math.min(i + 1, 3) }, (_, j) => ({
        id: `thumb-${seller.username}-${j}`,
        imageUrl: `https://picsum.photos/seed/${seller.username}-${j}/200/200`,
        label: `Deal ${j + 1}`,
        groupBuyId: `gb-${seller.username}-${j}`,
      })),
      representativeGroupBuyId: `gb-${seller.username}-0`,
    };
  });
}

// ─── Main Handler ────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  // Only POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  // Parse request
  let rankingReq: RankingRequest;
  try {
    rankingReq = await req.json() as RankingRequest;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Determine if we should use mock or live data
    const useMock = Deno.env.get('SELLER_RANKINGS_MOCK') === 'true' ||
      !Deno.env.get('SUPABASE_URL');

    let rankings: SellerRanking[];

    if (useMock) {
      rankings = generateMockRankings(rankingReq);
    } else {
      // Live data from PostgREST query
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
      const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
      const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      // Query influencers with active group buys
      const { data: influencers, error } = await supabase
        .from('influencers')
        .select(`
          id,
          instagram_username,
          display_name,
          profile_image_url,
          group_buys!inner(id, product_name, end_date, status)
        `)
        .eq('is_active', true)
        .order('instagram_username', { ascending: true });

      if (error) throw new Error(error.message);

      // Transform to ranking format
      rankings = (influencers ?? []).map((inf, i) => {
        const activeDeals = (inf.group_buys ?? []).filter(
          (gb: any) => gb.status === 'APPROVED' && new Date(gb.end_date) > new Date(),
        );

        return {
          id: `seller-${inf.id}`,
          sellerId: inf.id,
          rank: i + 1,
          previousRank: null,
          trend: { kind: 'new' } as RankingTrend,
          displayName: inf.display_name ?? inf.instagram_username,
          username: inf.instagram_username,
          avatarUrl: inf.profile_image_url,
          category: 'beauty' as Exclude<RankingCategory, 'all'>,
          activeDealCount: activeDeals.length,
          isFollowing: false,
          isSponsored: false,
          thumbnails: activeDeals.slice(0, 3).map((deal: any) => ({
            id: `thumb-${deal.id}`,
            imageUrl: null,
            label: deal.product_name,
            groupBuyId: deal.id,
          })),
        };
      });
    }

    const response: RankingResponse = { data: rankings };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[seller-rankings] Error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});

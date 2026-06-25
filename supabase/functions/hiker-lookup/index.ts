// ============================================================================
// Edge Function: hiker-lookup
// Purpose: Instagram post metadata lookup via HikerAPI
//
// Takes an Instagram post URL and returns post metadata (image, caption,
// like count, username, taken-at date). Falls back to mock mode when
// HIKER_API_KEY is not configured.
//
// Deploy: supabase functions deploy hiker-lookup
// Invoke: POST /functions/v1/hiker-lookup  { "url": "https://www.instagram.com/p/..." }
// ============================================================================

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

// ─── Types ───────────────────────────────────────────────────────────────────

interface LookupRequest {
  url: string;
}

interface InstagramMediaInfo {
  imageUrl: string | null;
  caption: string | null;
  likeCount: number | null;
  username: string | null;
  takenAt: string | null;
}

interface ErrorResponse {
  error: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

function generateMockResponse(url: string): InstagramMediaInfo {
  // Deterministic mock based on URL hash
  const hash = url.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const seed = hash % 1000;

  return {
    imageUrl: `https://picsum.photos/seed/${seed}/800/800`,
    caption: `Mock Instagram post caption for testing purposes. (seed: ${seed})`,
    likeCount: 1000 + (seed * 10),
    username: 'mock_influencer',
    takenAt: new Date(Date.now() - seed * 3600000).toISOString(),
  };
}

// ─── HikerAPI Client ─────────────────────────────────────────────────────────

async function lookupViaHikerAPI(url: string, apiKey: string): Promise<InstagramMediaInfo> {
  const response = await fetch('https://api.hikerapi.com/v1/media/by-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`HikerAPI error: ${response.status} — ${errorText}`);
  }

  const data = await response.json();

  return {
    imageUrl: data?.imageUrl ?? data?.thumbnail_url ?? null,
    caption: data?.caption ?? null,
    likeCount: data?.likeCount ?? data?.like_count ?? null,
    username: data?.username ?? data?.owner?.username ?? null,
    takenAt: data?.takenAt ?? data?.taken_at ?? null,
  };
}

// ─── CORS Headers ────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ─── Main Handler ────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  // Only POST
  if (req.method !== 'POST') {
    const error: ErrorResponse = { error: 'Method not allowed' };
    return new Response(JSON.stringify(error), {
      status: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  // Parse request body
  let body: LookupRequest;
  try {
    body = await req.json() as LookupRequest;
  } catch {
    const error: ErrorResponse = { error: 'Invalid JSON body' };
    return new Response(JSON.stringify(error), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  // Validate URL
  if (!body.url || typeof body.url !== 'string') {
    const error: ErrorResponse = { error: 'url is required' };
    return new Response(JSON.stringify(error), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  try {
    const hikerApiKey = Deno.env.get('HIKER_API_KEY') ?? '';
    const hikerMock = Deno.env.get('HIKER_MOCK') === 'true';

    let result: InstagramMediaInfo;

    if (!hikerApiKey || hikerMock) {
      // Mock mode — deterministic fake data
      console.log('[hiker-lookup] Using mock mode (no API key or HIKER_MOCK=true)');
      result = generateMockResponse(body.url);
    } else {
      // Live HikerAPI call
      console.log('[hiker-lookup] Calling HikerAPI live');
      result = await lookupViaHikerAPI(body.url, hikerApiKey);
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[hiker-lookup] Error:', message);
    const error: ErrorResponse = { error: message };
    return new Response(JSON.stringify(error), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});

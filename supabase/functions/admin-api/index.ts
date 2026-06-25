// ============================================================================
// Edge Function: admin-api
// Purpose: Admin CRUD operations that require service_role / bypass RLS.
//
// Supports all admin operations:
//   GET    /admin/group-buys      — list all group buys
//   GET    /admin/influencers     — list all influencers
//   GET    /admin/submissions     — list submissions (paginated)
//   POST   /admin/influencers     — create influencer
//   PATCH  /admin/submissions/:id — update submission
//   DELETE /admin/influencers/:id — deactivate influencer
//   POST   /admin/submissions/:id/approve — approve submission
//   POST   /admin/submissions/:id/reject  — reject submission
//   POST   /admin/group-buys      — create group buy
//   PATCH  /admin/group-buys/:id  — update group buy
//   DELETE /admin/group-buys/:id  — delete group buy
//
// Deploy: supabase functions deploy admin-api
// Invoke: POST /functions/v1/admin-api  { path, method, body? }
// ============================================================================

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AdminRequest {
  path: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: Record<string, unknown>;
  params?: Record<string, string>;
}

interface AdminResponse<T = unknown> {
  data?: T;
  error?: string;
  total?: number;
}

// ─── CORS ────────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ─── Supabase Client (service_role) ──────────────────────────────────────────

function createAdminClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ─── Route Handlers ─────────────────────────────────────────────────────────

async function handleAdminRequest(req: AdminRequest): Promise<AdminResponse> {
  const supabase = createAdminClient();
  const { path, method, body, params } = req;

  // ── Group Buys ─────────────────────────────────────────────────────────

  if (path === '/admin/group-buys' && method === 'GET') {
    const page = parseInt(params?.page ?? '1', 10);
    const limit = parseInt(params?.limit ?? '50', 10);
    const start = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('group_buys')
      .select('*, raw_post_id(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(start, start + limit - 1);

    if (error) throw new Error(error.message);
    return { data, total: count ?? 0 };
  }

  if (path.startsWith('/admin/group-buys/') && method === 'PATCH') {
    const id = path.replace('/admin/group-buys/', '');
    const { data, error } = await supabase
      .from('group_buys')
      .update(body ?? {})
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { data };
  }

  if (path === '/admin/group-buys' && method === 'POST') {
    const { data, error } = await supabase
      .from('group_buys')
      .insert(body ?? {})
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { data };
  }

  if (path.startsWith('/admin/group-buys/') && method === 'DELETE') {
    const id = path.replace('/admin/group-buys/', '');
    const { error } = await supabase
      .from('group_buys')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { data: { deleted: true } };
  }

  // ── Influencers ────────────────────────────────────────────────────────

  if (path === '/admin/influencers' && method === 'GET') {
    const { data, error } = await supabase
      .from('influencers')
      .select('*')
      .order('instagram_username', { ascending: true });

    if (error) throw new Error(error.message);
    return { data };
  }

  if (path === '/admin/influencers' && method === 'POST') {
    const { data, error } = await supabase
      .from('influencers')
      .insert({
        instagram_username: body?.instagramUsername ?? body?.instagram_username ?? '',
        display_name: body?.displayName ?? body?.display_name ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { data };
  }

  if (path.startsWith('/admin/influencers/') && method === 'DELETE') {
    const id = path.replace('/admin/influencers/', '');
    const { error } = await supabase
      .from('influencers')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { data: { deactivated: true } };
  }

  // ── Submissions ────────────────────────────────────────────────────────

  if (path === '/admin/submissions' && method === 'GET') {
    const page = parseInt(params?.page ?? '1', 10);
    const limit = parseInt(params?.limit ?? '50', 10);
    const status = params?.status ?? null;
    const start = (page - 1) * limit;

    let query = supabase
      .from('submissions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(start, start + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);

    return {
      data: { items: data, total: count ?? 0 },
      total: count ?? 0,
    };
  }

  if (path.startsWith('/admin/submissions/') && method === 'PATCH') {
    const id = path.replace('/admin/submissions/', '');
    const { data, error } = await supabase
      .from('submissions')
      .update(body ?? {})
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { data };
  }

  if (path.includes('/submissions/') && path.endsWith('/approve') && method === 'POST') {
    const id = path.split('/')[3];
    const { data, error } = await supabase.rpc('approve_submission', {
      submission_id: id,
    });

    if (error) throw new Error(error.message);
    return { data };
  }

  if (path.includes('/submissions/') && path.endsWith('/reject') && method === 'POST') {
    const id = path.split('/')[3];
    const reason = (body?.reason as string) ?? '';
    const { data, error } = await supabase.rpc('reject_submission', {
      submission_id: id,
      reason,
    });

    if (error) throw new Error(error.message);
    return { data };
  }

  // ── 404 ────────────────────────────────────────────────────────────────

  return { error: `Unknown route: ${method} ${path}` };
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
  let adminReq: AdminRequest;
  try {
    adminReq = await req.json() as AdminRequest;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  // Validate required fields
  if (!adminReq.path || !adminReq.method) {
    return new Response(
      JSON.stringify({ error: 'path and method are required' }),
      {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      },
    );
  }

  try {
    const response = await handleAdminRequest(adminReq);

    if (response.error) {
      return new Response(JSON.stringify(response), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[admin-api] Error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});

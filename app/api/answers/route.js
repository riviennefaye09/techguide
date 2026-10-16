export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Reads straight from Supabase using the service-role key, which never reaches
// the browser. There is deliberately no gate on this route: the dashboard is
// open to anyone who has the URL, and Supabase itself still rejects direct
// access (RLS on, no policies).
export async function GET(request) {
  const { searchParams } = new URL(request.url);

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return Response.json(
      { error: 'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set' },
      { status: 503 },
    );
  }

  const raw = parseInt(searchParams.get('limit') || '50', 10);
  const limit = Math.min(Math.max(Number.isNaN(raw) ? 50 : raw, 1), 200);

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/answers` +
      `?select=*&order=created_at.desc&limit=${limit}`,
    {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      cache: 'no-store',
    },
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error(`supabase ${res.status}: ${detail.slice(0, 300)}`);
    return Response.json(
      { error: `supabase returned ${res.status}` },
      { status: 502 },
    );
  }

  const rows = await res.json();

  return Response.json({
    items: rows.map((r) => ({
      id: r.id,
      ts: r.created_at,
      mode: r.mode || 'ask',
      selection: r.selection || '',
      answer: r.answer || '',
      model: r.model || '',
      ms: r.latency_ms || 0,
      error: r.error || '',
    })),
  });
}

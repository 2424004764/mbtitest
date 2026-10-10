// Edge function: anonymous, opt-in type statistics backed by Workers KV.
//
// GET  /api/stats        → { ok, total, counts: { INTJ: 12, ... } }
// POST /api/stats {type} → increments the counter for one of the 16 types
//
// Privacy: the only payload ever stored is the 4-letter type code. No IPs,
// no cookies, no identifiers. Counting is disabled (ok:false) until the
// TYPE_STATS KV namespace is bound to the Pages project.
const KEY = 'stats';
const VALID = new Set([
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
]);

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type',
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...CORS },
  });

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestGet(context) {
  const { env } = context;
  if (!env.TYPE_STATS) return json({ ok: false, reason: 'unbound' });
  try {
    const raw = await env.TYPE_STATS.get(KEY);
    const data = raw ? JSON.parse(raw) : { total: 0, counts: {} };
    return json({ ok: true, ...data });
  } catch {
    return json({ ok: false, reason: 'error' }, 500);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.TYPE_STATS) return json({ ok: false, reason: 'unbound' }, 501);
  try {
    const body = await request.json();
    const type = String(body && body.type || '').toUpperCase();
    if (!VALID.has(type)) return json({ ok: false, reason: 'bad-type' }, 400);

    // KV is eventually consistent — read-modify-write races may lose a count
    // now and then, which is fine for an anonymous aggregate.
    const raw = await env.TYPE_STATS.get(KEY);
    const data = raw ? JSON.parse(raw) : { total: 0, counts: {} };
    data.total = (data.total || 0) + 1;
    data.counts = data.counts || {};
    data.counts[type] = (data.counts[type] || 0) + 1;
    await env.TYPE_STATS.put(KEY, JSON.stringify(data));
    return json({ ok: true, ...data });
  } catch {
    return json({ ok: false, reason: 'error' }, 500);
  }
}

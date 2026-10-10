// Edge function: report the visitor's country (from Cloudflare's IP geo data)
// and cache it in a cookie so the app can pick a language synchronously later.
// Deployed automatically by Cloudflare Pages at /api/geo.
export async function onRequestGet(context) {
  const { request } = context;
  const country =
    (request.cf && request.cf.country) ||
    request.headers.get('cf-ipcountry') ||
    '';

  const headers = {
    'content-type': 'application/json',
    'cache-control': 'no-store',
  };
  if (country) {
    headers['set-cookie'] =
      'cf_country=' + country + '; Path=/; Max-Age=2592000; SameSite=Lax';
  }

  return new Response(JSON.stringify({ country }), { headers });
}

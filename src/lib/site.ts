/** Canonical site origin — keep in sync with robots.txt / sitemap. */
export const SITE_URL = 'https://mbtitest.fologde.com';

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og.png`;

/** Per-type social share card, generated at build time into dist/og/. */
export const typeOgImage = (code: string): string => `${SITE_URL}/og/${code}.png`;

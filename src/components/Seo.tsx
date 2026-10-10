import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLang } from '../i18n';
import { DEFAULT_OG_IMAGE, SITE_URL } from '../lib/site';

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

function setJsonLd(graph: unknown) {
  let el = document.getElementById('seo-jsonld') as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.id = 'seo-jsonld';
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(graph);
}

/** Fallback @graph for pages that don't pass their own structured data. */
const DEFAULT_GRAPH = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: 'MBTI Personality Test · MBTI 人格测试',
      inLanguage: ['zh-CN', 'en'],
    },
  ],
};

export interface SeoProps {
  title: string;
  description?: string;
  /** Absolute URL of the social share image; defaults to the site card. */
  ogImage?: string;
  /** true → robots noindex,nofollow (result/404 pages). */
  noindex?: boolean;
  /** Structured-data nodes; rendered as a schema.org @graph. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export default function Seo({ title, description, ogImage, noindex, jsonLd }: SeoProps) {
  const { lang } = useLang();
  const { pathname } = useLocation();

  const normalized = pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  const canonical = SITE_URL + normalized;
  const image = ogImage ?? DEFAULT_OG_IMAGE;
  const graph = jsonLd
    ? { '@context': 'https://schema.org', '@graph': Array.isArray(jsonLd) ? jsonLd : [jsonLd] }
    : DEFAULT_GRAPH;
  const graphJson = JSON.stringify(graph);

  useEffect(() => {
    document.title = title;
    setMeta('name', 'description', description ?? title);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    if (description) {
      setMeta('name', 'twitter:description', description);
      setMeta('property', 'og:description', description);
    }
    setMeta('name', 'twitter:image', image);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:url', canonical);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:locale', lang === 'zh' ? 'zh_CN' : 'en_US');
    setCanonical(canonical);
    setJsonLd(JSON.parse(graphJson));
  }, [title, description, canonical, image, noindex, graphJson, lang]);

  return null;
}

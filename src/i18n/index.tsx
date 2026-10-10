import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Lang } from '../data/schema';
import { ui } from './ui';

const LANG_KEY = 'mbti_lang';

type Params = Record<string, string | number>;

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (path: string, params?: Params) => string;
  tArr: (path: string) => readonly string[];
}

const LangContext = createContext<LangContextValue | null>(null);

type Leaf = { zh: unknown; en: unknown };

function getLeaf(path: string): unknown {
  let node: unknown = ui;
  for (const key of path.split('.')) {
    if (node && typeof node === 'object' && key in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return node;
}

function interpolate(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (m, name) =>
    name in params ? String(params[name]) : m,
  );
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

interface SyncDetection {
  lang: Lang;
  /** True when the user (or the URL) explicitly chose a language — geo must not override it. */
  explicit: boolean;
}

function detectSync(): SyncDetection {
  try {
    const param = new URLSearchParams(window.location.search).get('lang');
    if (param === 'zh' || param === 'en') return { lang: param, explicit: true };

    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'zh' || saved === 'en') return { lang: saved, explicit: true };

    const country = readCookie('cf_country');
    if (country) return { lang: country === 'CN' ? 'zh' : 'en', explicit: false };

    const nav = (navigator.language || '').toLowerCase();
    if (nav.startsWith('zh')) return { lang: 'zh', explicit: false };
  } catch {
    /* private mode etc. — fall through to default */
  }
  return { lang: 'en', explicit: false };
}

/** Ask the edge function for the visitor country; fall back to Cloudflare's own trace endpoint. */
async function fetchCountry(): Promise<string | null> {
  try {
    const res = await fetch('/api/geo', { cache: 'no-store' });
    if (res.ok) {
      const data = (await res.json()) as { country?: string };
      if (data.country) return data.country;
    }
  } catch {
    /* not deployed behind the function (e.g. vite dev) */
  }
  try {
    const res = await fetch('/cdn-cgi/trace', { cache: 'no-store' });
    if (res.ok) {
      const match = (await res.text()).match(/^loc=(\w\w)$/m);
      if (match) return match[1];
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function LangProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(detectSync, []);
  const [lang, setLangState] = useState<Lang>(initial.lang);

  // IP-based refinement on first visit, when no explicit preference exists yet.
  useEffect(() => {
    if (initial.explicit) return;
    let cancelled = false;
    fetchCountry().then((country) => {
      if (cancelled || !country) return;
      const wanted: Lang = country === 'CN' ? 'zh' : 'en';
      setLangState((prev) => (prev === wanted ? prev : wanted));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
      // Drop a forced ?lang= param so the manual choice sticks for this URL too.
      if (new URLSearchParams(window.location.search).get('lang')) {
        const url = new URL(window.location.href);
        url.searchParams.delete('lang');
        window.history.replaceState(null, '', url);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (path: string, params?: Params) => {
      const leaf = getLeaf(path) as Leaf | undefined;
      const value = leaf ? leaf[lang] : undefined;
      if (typeof value !== 'string') {
        if (import.meta.env.DEV) console.warn(`i18n missing: ${path}`);
        return path;
      }
      return interpolate(value, params);
    },
    [lang],
  );

  const tArr = useCallback(
    (path: string): readonly string[] => {
      const leaf = getLeaf(path) as Leaf | undefined;
      const value = leaf ? leaf[lang] : undefined;
      return Array.isArray(value) ? value : [];
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t, tArr }), [lang, setLang, t, tArr]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}

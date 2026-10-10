import { useEffect, useState } from 'react';
import { BarChart3, Check, Globe2 } from 'lucide-react';
import { useLang } from '../i18n';
import { ALL_TYPES, typeColor } from '../data/dimensions';
import {
  getStatsCache,
  hasOptedInStats,
  setStatsCache,
  setStatsOptedIn,
  type StatsCache,
} from '../lib/storage';
import type { TestResult } from '../data/schema';

/**
 * Anonymous, opt-in aggregate of tester types. Silent when the stats API is
 * unavailable (e.g. KV not bound yet, local dev) — the panel just hides.
 */
export default function StatsPanel({ result }: { result: TestResult }) {
  const { t } = useLang();
  const [stats, setStats] = useState<StatsCache | null>(() => getStatsCache());
  const [unavailable, setUnavailable] = useState(false);
  const [optedIn, setOptedIn] = useState(hasOptedInStats);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let live = true;
    const cached = getStatsCache();
    if (cached) {
      setStats(cached);
      return;
    }
    fetch('/api/stats')
      .then(async (res) => {
        const data = (await res.json()) as { ok?: boolean; total?: number; counts?: Record<string, number> };
        if (!live) return;
        if (!data.ok || typeof data.total !== 'number') {
          setUnavailable(true);
          return;
        }
        const next: StatsCache = { fetchedAt: Date.now(), total: data.total, counts: data.counts ?? {} };
        setStatsCache(next);
        setStats(next);
      })
      .catch(() => live && setUnavailable(true));
    return () => {
      live = false;
    };
  }, []);

  if (unavailable) return null;

  const optIn = async () => {
    if (optedIn || sending) return;
    setSending(true);
    try {
      await fetch('/api/stats', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ type: result.type }),
      });
      setStatsOptedIn();
      setOptedIn(true);
      // refresh with a local guess so the UI updates immediately
      setStats((prev) =>
        prev
          ? {
              ...prev,
              total: prev.total + 1,
              counts: { ...prev.counts, [result.type]: (prev.counts[result.type] ?? 0) + 1 },
            }
          : prev,
      );
    } catch {
      /* network hiccup — user can retry */
    } finally {
      setSending(false);
    }
  };

  const max = Math.max(1, ...ALL_TYPES.map((c) => stats?.counts[c] ?? 0));
  const mine = stats?.counts[result.type] ?? 0;
  const pct = stats && stats.total > 0 ? Math.round((mine / stats.total) * 1000) / 10 : 0;

  return (
    <section className="card mt-6 p-7 sm:p-9">
      <h2 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <BarChart3 size={17} />
        </span>
        {t('result.statsTitle')}
      </h2>
      <p className="mt-2 text-xs text-muted">{t('result.statsDesc')}</p>

      {!stats ? (
        <div className="mt-6 space-y-2">
          {ALL_TYPES.slice(0, 8).map((c) => (
            <div key={c} className="h-5 animate-pulse rounded-md bg-surface2/60" />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-1.5">
            {ALL_TYPES.map((c) => {
              const count = stats.counts[c] ?? 0;
              const w = Math.max(count > 0 ? 3 : 1, (count / max) * 100);
              const isMine = c === result.type;
              return (
                <div key={c} className="flex items-center gap-3">
                  <span
                    className={`w-12 shrink-0 text-right font-mono text-xs font-bold ${
                      isMine ? 'text-brand' : 'text-muted'
                    }`}
                  >
                    {c}
                  </span>
                  <div className="h-4 flex-1 overflow-hidden rounded-md bg-surface2/70">
                    <div
                      className="h-full rounded-md transition-all"
                      style={{
                        width: `${w}%`,
                        background: isMine ? typeColor(c) : `${typeColor(c)}66`,
                      }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-right text-xs tabular-nums text-muted">
                    {stats.total > 0 ? `${Math.round((count / stats.total) * 1000) / 10}%` : '—'}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="mt-5 rounded-xl bg-brand-soft px-4 py-3 text-sm font-medium text-brand">
            {stats.total < 50
              ? t('result.statsSampleSmall')
              : t('result.statsYou', { p: pct, type: result.type })}
          </p>
        </>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={optIn}
          disabled={optedIn || sending}
          className={`!px-5 !py-2 text-sm ${optedIn ? 'btn-secondary' : 'btn-primary'}`}
        >
          {optedIn ? <Check size={15} /> : <Globe2 size={15} />}
          {optedIn ? t('result.statsOptedIn') : t('result.statsOptIn')}
        </button>
        <span className="text-xs leading-relaxed text-muted">{t('result.statsNote')}</span>
      </div>
    </section>
  );
}

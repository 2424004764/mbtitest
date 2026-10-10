import { useMemo } from 'react';
import { ChevronDown, ListChecks } from 'lucide-react';
import { useLang } from '../i18n';
import { useQuestionBank } from '../hooks/useBank';
import { questionsFor } from '../lib/scoring';
import { dimMeta } from '../data/dimensions';
import type { Answer, TestMode } from '../data/schema';

/**
 * Post-test answer review: each item, the chosen Likert label, and which pole
 * of its dimension the answer pushed toward. Rendered only when the current
 * session carries the raw answers (fresh from the test page).
 */
export default function ReviewPanel({
  answers,
  mode,
}: {
  answers: Record<number, Answer>;
  mode: TestMode;
}) {
  const { t, lang, tArr } = useLang();
  const bank = useQuestionBank();

  const rows = useMemo(() => {
    if (!bank) return null;
    const labels = tArr('likert.labels');
    return questionsFor(bank, mode)
      .filter((q) => answers[q.id] !== undefined)
      .map((q) => {
        const a = answers[q.id];
        const lean = a * q.dir;
        const meta = dimMeta(q.dim);
        return {
          id: q.id,
          text: q.text,
          dim: q.dim,
          answerLabel: labels[3 - a] ?? String(a),
          leanLetter: lean > 0 ? meta.left : lean < 0 ? meta.right : null,
          leanLabel: lean > 0 ? meta.leftLabel : lean < 0 ? meta.rightLabel : null,
        };
      });
  }, [bank, answers, mode, tArr]);

  return (
    <section className="card mt-6 p-7 sm:p-9">
      <h2 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <ListChecks size={17} />
        </span>
        {t('result.reviewTitle')}
      </h2>
      <p className="mt-2 text-xs text-muted">{t('result.reviewDesc')}</p>

      {!rows ? (
        <div className="mt-5 space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 animate-pulse rounded-lg bg-surface2/60" />
          ))}
        </div>
      ) : (
        <details className="group mt-5 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer items-center justify-between rounded-xl border border-line bg-surface2/50 px-4 py-3 text-sm font-semibold transition-colors hover:border-brand">
            {t('result.reviewTitle')} · {rows.length}
            <ChevronDown size={16} className="text-muted transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-3 max-h-[28rem] space-y-2 overflow-y-auto pr-1">
            {rows.map((r) => (
              <div key={r.id} className="rounded-xl border border-line bg-surface2/30 p-3.5 text-sm">
                <p className="leading-relaxed">
                  <span className="mr-2 font-mono text-xs font-bold text-muted">{r.id}.</span>
                  {r.text}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-brand-soft px-2.5 py-1 font-medium text-brand">
                    {r.answerLabel}
                  </span>
                  <span className="rounded-full border border-line px-2.5 py-1 font-mono font-semibold text-muted">
                    {r.dim}
                  </span>
                  {r.leanLetter && r.leanLabel ? (
                    <span className="text-muted">
                      {t('result.reviewLean')}{' '}
                      <span className="font-semibold text-ink">
                        {r.leanLetter} · {r.leanLabel[lang]}
                      </span>
                    </span>
                  ) : (
                    <span className="text-muted/70">{t('result.reviewNeutral')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}

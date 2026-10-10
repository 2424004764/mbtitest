import { useMemo } from 'react';
import { DIMENSIONS, DIM_ORDER } from '../data/dimensions';
import type { TestResult } from '../data/schema';
import { useLang } from '../i18n';

const LINE_COLORS = ['#5b5bd6', '#c26bd6', '#2aa392', '#d9a424', '#e0685c'];

/**
 * SVG line chart of dimension leans across past tests (oldest → newest).
 * Y axis is the 0–100 leftPct of each dimension; midline marks the 50/50 tie.
 */
export default function TrendChart({ history }: { history: TestResult[] }) {
  const { lang } = useLang();

  const points = useMemo(
    () =>
      [...history]
        .filter((h) => h.date > 0)
        .sort((a, b) => a.date - b.date)
        .map((h) => ({ date: h.date, dims: h.dims })),
    [history],
  );

  if (points.length === 0) return null;

  const W = 640;
  const H = 280;
  const padL = 44;
  const padR = 16;
  const padT = 16;
  const padB = 34;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const x = (i: number) =>
    padL + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (pct: number) => padT + innerH - (pct / 100) * innerH;

  const fmt = (d: number) =>
    new Date(d).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
      month: 'short',
      day: 'numeric',
    });

  return (
    <div className="mt-5 overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-64 w-full min-w-[520px]"
        role="img"
        aria-label="dimension trend"
      >
        {/* grid: 0/25/50/75/100 */}
        {[0, 25, 50, 75, 100].map((g) => (
          <g key={g}>
            <line
              x1={padL}
              x2={W - padR}
              y1={y(g)}
              y2={y(g)}
              stroke={g === 50 ? 'currentColor' : 'none'}
              className="text-line"
              strokeWidth={1.5}
              strokeDasharray={g === 50 ? '5 4' : undefined}
            />
            <text x={padL - 8} y={y(g) + 4} textAnchor="end" className="fill-current text-[10px] text-muted">
              {g}
            </text>
          </g>
        ))}

        {DIM_ORDER.map((dim, di) => {
          const meta = DIMENSIONS.find((m) => m.key === dim)!;
          const d = points
            .map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.dims[dim].leftPct).toFixed(1)}`)
            .join(' ');
          return (
            <g key={dim}>
              <path d={d} fill="none" stroke={LINE_COLORS[di]} strokeWidth={2.5} strokeLinejoin="round" />
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={x(i)}
                  cy={y(p.dims[dim].leftPct)}
                  r={3.5}
                  fill={LINE_COLORS[di]}
                >
                  <title>{`${meta.left}/${meta.right}: ${p.dims[dim].leftPct}% · ${fmt(p.date)}`}</title>
                </circle>
              ))}
            </g>
          );
        })}

        {/* x labels: first, middle, last */}
        {points.map((p, i) => {
          const show = i === 0 || i === points.length - 1 || (points.length > 2 && i === Math.floor((points.length - 1) / 2));
          if (!show || (i === 0 && points.length > 1 && Math.floor((points.length - 1) / 2) === 0)) return null;
          return (
            <text
              key={i}
              x={x(i)}
              y={H - 10}
              textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}
              className="fill-current text-[10px] text-muted"
            >
              {fmt(p.date)}
            </text>
          );
        })}
      </svg>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {DIM_ORDER.map((dim, di) => {
          const meta = DIMENSIONS.find((m) => m.key === dim)!;
          return (
            <span key={dim} className="inline-flex items-center gap-1.5 text-xs text-muted">
              <span className="h-2 w-2 rounded-full" style={{ background: LINE_COLORS[di] }} />
              {meta.left} / {meta.right}
            </span>
          );
        })}
      </div>
    </div>
  );
}

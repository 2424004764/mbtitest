import { useId, useState } from 'react';

interface Props {
  value: number | undefined; // -3 … +3
  onChange: (v: number) => void;
  labels: readonly string[];
}

const VALUES = [3, 2, 1, 0, -1, -2, -3];

/** side: -1 disagree · 0 neutral · +1 agree — colors the scale so direction is readable at a glance */
function tone(i: number, selected: boolean): string {
  const side = i < 3 ? 1 : i > 3 ? -1 : 0;
  const dist = Math.abs(i - 3); // 1–3, strength toward each end
  if (selected) {
    if (side === 1) return 'border-transparent bg-gradient-to-br from-brand to-fuchsia-500 text-white shadow-lg shadow-brand/30';
    if (side === -1) return 'border-transparent bg-gradient-to-br from-rose-500 to-orange-400 text-white shadow-lg shadow-rose-500/30';
    return 'border-transparent bg-gradient-to-br from-slate-500 to-slate-400 text-white shadow-lg shadow-slate-400/30';
  }
  if (side === 1) {
    const tint = dist === 3 ? 'bg-brand/15 border-brand/35 text-brand' : dist === 2 ? 'bg-brand/10 border-brand/25 text-brand' : 'bg-brand/5 border-brand/20 text-brand/90';
    return `${tint} hover:scale-105 hover:border-brand/70 hover:bg-brand/20`;
  }
  if (side === -1) {
    const tint = dist === 3 ? 'bg-rose-500/15 border-rose-500/35 text-rose-500' : dist === 2 ? 'bg-rose-500/10 border-rose-500/25 text-rose-500' : 'bg-rose-500/5 border-rose-500/20 text-rose-500/90';
    return `${tint} hover:scale-105 hover:border-rose-500/70 hover:bg-rose-500/20`;
  }
  return 'border-line bg-surface2 text-muted hover:scale-105 hover:border-muted';
}

/** 7-point Likert scale, agree on the left. Index 0 of labels = strongly agree. */
export default function LikertScale({ value, onChange, labels }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);
  const groupId = useId();

  const activeIndex = hovered !== null ? hovered : value !== undefined ? 3 - value : null;
  const activeLabel = activeIndex !== null ? labels[activeIndex] : null;
  const readoutColor =
    activeIndex === null ? 'text-brand' : activeIndex < 3 ? 'text-brand' : activeIndex > 3 ? 'text-rose-500' : 'text-muted';

  const sizeFor = (i: number) => {
    const d = Math.abs(i - 3);
    // one step smaller on phones so all 7 dots fit without flex-squashing the circles
    return d === 3
      ? 'h-10 w-10 text-sm sm:h-11 sm:w-11'
      : d === 2
        ? 'h-9 w-9 text-sm sm:h-10 sm:w-10'
        : 'h-8 w-8 text-xs sm:h-9 sm:w-9';
  };

  return (
    <div role="group" aria-labelledby={groupId} className="w-full select-none">
      {/* current selection readout, tinted to match the chosen side */}
      <div className="flex h-6 items-center justify-center" aria-live="polite">
        <span className={`text-sm font-medium transition-opacity ${activeLabel ? `${readoutColor} opacity-100` : 'text-brand opacity-0'}`}>
          {activeLabel ?? '\u00A0'}
        </span>
      </div>

      <div className="flex items-end justify-center gap-1.5 sm:gap-2">
        {VALUES.map((v, i) => {
          const selected = value === v;
          return (
            <button
              key={v}
              type="button"
              aria-pressed={selected}
              title={labels[i]}
              onClick={() => onChange(v)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              className={`${sizeFor(i)} flex shrink-0 items-center justify-center rounded-full border font-semibold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                selected ? 'scale-110' : ''
              } ${tone(i, selected)}`}
            >
              {i === 3 ? '–' : ''}
            </button>
          );
        })}
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide">
        <span className="text-brand">← {labels[0]}</span>
        <span className="hidden text-muted sm:inline">{labels[3]}</span>
        <span className="text-rose-500">{labels[6]} →</span>
      </div>
      <span id={groupId} className="sr-only">Likert scale</span>
    </div>
  );
}

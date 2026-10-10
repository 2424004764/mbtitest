import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import type { Dim } from '../data/schema';
import { dimMeta } from '../data/dimensions';
import { useLang } from '../i18n';

interface Props {
  dim: Dim;
  leftPct: number;
  color: string;
  delay?: number;
  /** Show an expandable "what it means" note for the dominant side. */
  withDesc?: boolean;
}

export default function DimensionBar({ dim, leftPct, color, delay = 0, withDesc = false }: Props) {
  const { lang, t } = useLang();
  const meta = dimMeta(dim);
  const [open, setOpen] = useState(false);
  const leftDominant = leftPct >= 50;
  const dominantDesc = leftDominant ? meta.leftDesc[lang] : meta.rightDesc[lang];

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
        <span className={`font-semibold ${leftDominant ? 'text-ink' : 'text-muted'}`}>
          {meta.leftLabel[lang]}
          <span className="ml-2 font-bold tabular-nums" style={{ color: leftDominant ? color : undefined }}>
            {leftPct}%
          </span>
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted/70">
          {meta.name[lang]}
        </span>
        <span className={`font-semibold ${leftDominant ? 'text-muted' : 'text-ink'}`}>
          <span className="mr-2 font-bold tabular-nums" style={{ color: !leftDominant ? color : undefined }}>
            {100 - leftPct}%
          </span>
          {meta.rightLabel[lang]}
        </span>
      </div>

      <div className="relative h-3 w-full overflow-hidden rounded-full bg-surface2">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}b3)` }}
          initial={{ width: 0 }}
          animate={{ width: `${leftPct}%` }}
          transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="absolute inset-y-0 left-1/2 w-px bg-ink/15" />
      </div>

      {withDesc && (
        <div className="mt-1.5">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted transition-colors hover:text-brand"
          >
            <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            {t('result.poleHow')}
          </button>
          <div
            className={`grid transition-all duration-300 ${open ? 'mt-2 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
          >
            <p className="overflow-hidden text-xs leading-relaxed text-muted">{dominantDesc}</p>
          </div>
        </div>
      )}
    </div>
  );
}

import { FUNCTIONS, STACK_ROLES, stackFor } from '../data/cognitive';
import { useLang } from '../i18n';
import { typeColor } from '../data/dimensions';

/** Jungian function stack: four rows (dominant → inferior) with role labels. */
export default function CognitiveStack({ code, compact = false }: { code: string; compact?: boolean }) {
  const { lang } = useLang();
  const stack = stackFor(code);
  const color = typeColor(code);

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {stack.map((fn, i) => (
          <span
            key={fn}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold"
            style={{ background: `${color}14`, color }}
          >
            <span className="font-mono text-xs font-bold opacity-60">{i + 1}</span>
            <span className="font-mono">{fn}</span>
            <span className="font-normal text-ink/80">{FUNCTIONS[fn].name[lang]}</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-3">
      {stack.map((fn, i) => {
        const role = STACK_ROLES[i];
        const meta = FUNCTIONS[fn];
        const strength = [1, 0.72, 0.5, 0.34][i];
        return (
          <div key={fn} className="flex items-start gap-4 rounded-2xl bg-surface2/60 p-4">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-mono text-base font-extrabold"
              style={{
                background: `${color}${Math.round(strength * 40 + 20).toString(16).padStart(2, '0')}`,
                color,
              }}
            >
              {fn}
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-bold">
                {meta.name[lang]}
                <span className="ml-2 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand">
                  {role.label[lang]}
                </span>
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">{meta.desc[lang]}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted/80">
                <span className="font-semibold text-muted">{role.label[lang]}：</span>
                {role.desc[lang]}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

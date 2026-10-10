import { Link } from 'react-router-dom';
import type { TypeInfo } from '../data/schema';
import { groupMeta } from '../data/dimensions';
import { useLang } from '../i18n';

export default function TypeCard({ info, color }: { info: TypeInfo; color: string }) {
  const { lang, t } = useLang();
  const group = groupMeta(info.group);

  return (
    <Link
      to={`/type/${info.code}`}
      className="card group relative block overflow-hidden p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
      style={{ borderTop: `3px solid ${color}` }}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-[0.08] transition-opacity group-hover:opacity-[0.16]"
        style={{ background: color }}
      />
      <div className="flex items-center gap-2.5">
        <span
          className="rounded-lg px-2 py-1 font-mono text-sm font-extrabold tracking-wide"
          style={{ background: `${color}1f`, color }}
        >
          {info.code}
        </span>
        <span className="truncate font-bold">{info.name}</span>
      </div>
      <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-relaxed text-muted">{info.tagline}</p>
      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span className="rounded-full bg-surface2 px-2 py-0.5">{group.name[lang]}</span>
        <span>{t('types.populationOf', { p: info.population })}</span>
      </div>
    </Link>
  );
}

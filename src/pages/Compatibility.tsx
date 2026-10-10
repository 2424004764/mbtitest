import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeftRight,
  Check,
  Heart,
  Lightbulb,
  Link2,
  Play,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import Seo from '../components/Seo';
import { useLang } from '../i18n';
import { useTypesData } from '../hooks/useBank';
import { ALL_TYPES, typeColor } from '../data/dimensions';
import { analyzePair } from '../data/compatibility';
import { copyToClipboard } from '../lib/share';

const VALID = /^[A-Z]{4}$/;

function TypeSelect({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const types = useTypesData();
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-semibold outline-none transition-colors focus:border-brand"
      >
        {ALL_TYPES.map((c) => (
          <option key={c} value={c}>
            {c} · {types?.[c]?.name ?? ''}
          </option>
        ))}
      </select>
    </label>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${n} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={20}
          className={i <= n ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-line'}
        />
      ))}
    </span>
  );
}

export default function Compatibility() {
  const { t, lang } = useLang();
  const [params, setParams] = useSearchParams();
  const types = useTypesData();

  const [a, setA] = useState(() => {
    const v = (params.get('a') ?? '').toUpperCase();
    return VALID.test(v) && (ALL_TYPES as readonly string[]).includes(v) ? v : 'INTJ';
  });
  const [b, setB] = useState(() => {
    const v = (params.get('b') ?? '').toUpperCase();
    return VALID.test(v) && (ALL_TYPES as readonly string[]).includes(v) ? v : 'ENFP';
  });
  const [inviteCopied, setInviteCopied] = useState(false);

  // A link shared with only ?a=TYPE&invite=1 parks a challenge in sessionStorage,
  // then nudges the friend to take the quick test.
  const invited = params.get('invite') === '1';
  useEffect(() => {
    if (!invited) return;
    try {
      sessionStorage.setItem('mbti_pk_from', a);
    } catch {
      /* ignore */
    }
  }, [invited, a]);

  // keep the URL shareable
  useEffect(() => {
    const next = new URLSearchParams();
    next.set('a', a);
    next.set('b', b);
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a, b]);

  const analysis = useMemo(() => analyzePair(a, b, lang), [a, b, lang]);
  const colorA = typeColor(a);
  const colorB = typeColor(b);

  const copyInvite = async () => {
    const url = `${window.location.origin}/compatibility?a=${a}&invite=1`;
    if (await copyToClipboard(url)) {
      setInviteCopied(true);
      window.setTimeout(() => setInviteCopied(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Seo
        title={`${t('compat.title')} · ${t('brand.name')}`}
        description={t('compat.subtitle')}
      />

      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t('compat.title')}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          {t('compat.subtitle')}
        </p>
      </div>

      {/* ---------- pickers ---------- */}
      <section className="card mt-8 p-6 sm:p-8">
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
          <TypeSelect value={a} onChange={setA} label={t('compat.pickA')} />
          <button
            type="button"
            onClick={() => {
              setA(b);
              setB(a);
            }}
            className="mx-auto flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2.5 text-xs font-semibold text-muted transition-colors hover:border-brand hover:text-brand"
            aria-label={t('compat.swap')}
          >
            <ArrowLeftRight size={14} />
            {t('compat.swap')}
          </button>
          <TypeSelect value={b} onChange={setB} label={t('compat.pickB')} />
        </div>
        <p className="mt-3 text-xs text-muted/80">{t('compat.selfNote')}</p>
      </section>

      {/* ---------- VS header ---------- */}
      <motion.section
        key={`${a}-${b}`}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="card relative mt-6 overflow-hidden p-8 text-center sm:p-10"
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1.5"
          style={{ background: `linear-gradient(90deg, ${colorA}, ${colorB})` }}
        />
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <Link to={`/type/${a}`} className="group min-w-0">
            <p className="font-mono text-3xl font-extrabold sm:text-5xl" style={{ color: colorA }}>
              {a}
            </p>
            <p className="mt-1 truncate text-sm font-semibold sm:text-base">{types?.[a]?.name ?? ''}</p>
          </Link>
          <span className="rounded-full bg-surface2 px-3.5 py-1.5 font-mono text-xs font-bold text-muted">
            {t('compat.vs')}
          </span>
          <Link to={`/type/${b}`} className="group min-w-0">
            <p className="font-mono text-3xl font-extrabold sm:text-5xl" style={{ color: colorB }}>
              {b}
            </p>
            <p className="mt-1 truncate text-sm font-semibold sm:text-base">{types?.[b]?.name ?? ''}</p>
          </Link>
        </div>

        <div className="mt-7 flex flex-col items-center gap-2">
          <Stars n={Math.round(analysis.stars)} />
          <p className="text-lg font-extrabold" style={{ color: colorA }}>
            {analysis.tag}
          </p>
        </div>

        {/* shared / opposed dimension chips */}
        <div className="mt-7 grid gap-4 text-left sm:grid-cols-2">
          <div className="rounded-2xl bg-surface2/60 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
              {t('compat.sameTitle')}
            </h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {analysis.same.length === 0 ? (
                <span className="text-xs text-muted/70">—</span>
              ) : (
                analysis.same.map((s) => (
                  <span
                    key={s.key}
                    className="rounded-full px-2.5 py-1 text-xs font-semibold"
                    style={{ background: `${colorA}18`, color: colorA }}
                  >
                    {s.letter} · {s.label}
                  </span>
                ))
              )}
            </div>
          </div>
          <div className="rounded-2xl bg-surface2/60 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
              {t('compat.diffTitle')}
            </h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {analysis.diff.map((d) => (
                <span
                  key={d.key}
                  className="rounded-full border border-line px-2.5 py-1 text-xs font-semibold text-muted"
                >
                  {d.aLetter}/{d.bLetter} · {d.aLabel}/{d.bLabel}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ---------- analysis paragraphs ---------- */}
      <section className="card mt-6 p-7 sm:p-9">
        <h2 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <Heart size={17} />
          </span>
          {t('compat.analysisTitle')}
        </h2>
        <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-ink/90">
          {analysis.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {/* ---------- tips ---------- */}
      <section className="card mt-6 p-7 sm:p-9">
        <h2 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <Lightbulb size={17} />
          </span>
          {t('compat.tipsTitle')}
        </h2>
        <ul className="mt-5 space-y-3">
          {analysis.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed">
              <Check size={16} className="mt-0.5 shrink-0" style={{ color: colorA }} />
              {tip}
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- invite a friend ---------- */}
      <section className="card mt-6 p-7 sm:p-9">
        <h2 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <Users size={17} />
          </span>
          {t('compat.inviteTitle')}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">{t('compat.inviteDesc')}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={copyInvite} className="btn-primary !px-5 !py-2.5 text-sm">
            {inviteCopied ? <Check size={15} /> : <Link2 size={15} />}
            {inviteCopied ? t('compat.inviteCopied') : t('compat.inviteCopy')}
          </button>
        </div>
      </section>

      <p className="mt-8 text-center text-xs leading-relaxed text-muted">{t('compat.disclaimer')}</p>

      {/* ---------- landed from an invite link ---------- */}
      {invited && (
        <motion.section
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-2xl border border-brand/40 bg-surface p-5 shadow-2xl"
        >
          <h3 className="flex items-center gap-2 text-sm font-bold text-brand">
            <Sparkles size={16} />
            {t('compat.invitedTitle', { type: a })}
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-muted">{t('compat.invitedDesc')}</p>
          <Link to="/test?mode=quick" className="btn-primary mt-3.5 w-full !py-2.5 text-sm">
            <Play size={15} />
            {t('compat.invitedStart')}
          </Link>
        </motion.section>
      )}
    </div>
  );
}

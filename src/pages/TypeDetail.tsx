import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Play,
  Share2,
  ThumbsDown,
  ThumbsUp,
  Briefcase,
  Link2,
  Sprout,
  Star,
  Users,
} from 'lucide-react';
import Seo from '../components/Seo';
import CognitiveStack from '../components/CognitiveStack';
import { useLang } from '../i18n';
import { useExtrasData, useTypesData } from '../hooks/useBank';
import { ALL_TYPES, DIMENSIONS, groupMeta, typeColor } from '../data/dimensions';
import { SITE_URL, typeOgImage } from '../lib/site';
import { copyToClipboard, nativeShare } from '../lib/share';
import { useState } from 'react';

export default function TypeDetail() {
  const { code: rawCode = '' } = useParams();
  const code = rawCode.toUpperCase();
  const { t, lang } = useLang();
  const types = useTypesData();
  const extras = useExtrasData();
  const [copied, setCopied] = useState(false);

  const info = types?.[code];

  if (types && !info) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <p className="font-mono text-2xl font-extrabold text-muted">{code}</p>
        <p className="mt-2 text-lg font-semibold">{t('typeDetail.notFound')}</p>
        <Link to="/types" className="btn-primary mt-6">
          {t('common.back')} · {t('types.title')}
        </Link>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-line border-t-brand" />
      </div>
    );
  }

  const color = typeColor(code);
  const group = groupMeta(info.group);
  const idx = ALL_TYPES.indexOf(code as (typeof ALL_TYPES)[number]);
  const prev = ALL_TYPES[(idx - 1 + ALL_TYPES.length) % ALL_TYPES.length];
  const next = ALL_TYPES[(idx + 1) % ALL_TYPES.length];

  const share = () =>
    nativeShare(
      `${code} ${info.name}`,
      info.tagline,
      `${window.location.origin}/type/${code}`,
    );

  const copyLink = async () => {
    if (await copyToClipboard(`${window.location.origin}/type/${code}`)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  // The four letters of this type with their pole labels & descriptions
  const letters = ['EI', 'SN', 'TF', 'JP'].map((dimKey) => {
    const meta = DIMENSIONS.find((d) => d.key === dimKey)!;
    const letter = code.includes(meta.left)
      ? meta.left
      : meta.right;
    const isLeft = letter === meta.left;
    return {
      letter,
      label: (isLeft ? meta.leftLabel : meta.rightLabel)[lang],
      desc: (isLeft ? meta.leftDesc : meta.rightDesc)[lang],
    };
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Seo
        title={
          lang === 'zh'
            ? `${code} ${info.name}型人格完整解析 · ${t('brand.name')}`
            : `${code} ${info.name} Personality Type Guide · ${t('brand.name')}`
        }
        description={`${code} ${info.name} — ${info.tagline}`}
        ogImage={typeOgImage(code)}
        jsonLd={[
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: t('brand.name'), item: `${SITE_URL}/` },
              { '@type': 'ListItem', position: 2, name: t('types.title'), item: `${SITE_URL}/types` },
              { '@type': 'ListItem', position: 3, name: `${code} ${info.name}` },
            ],
          },
          {
            '@type': 'WebPage',
            name: `${code} ${info.name}`,
            description: info.tagline,
            url: `${SITE_URL}/type/${code}`,
            inLanguage: lang === 'zh' ? 'zh-CN' : 'en',
          },
        ]}
      />

      <div className="flex items-center justify-between">
        <Link to="/types" className="btn-secondary !px-4 !py-2 text-xs">
          <ChevronLeft size={14} />
          {t('types.title')}
        </Link>
        <div className="flex gap-2">
          <button type="button" onClick={share} className="btn-secondary !px-4 !py-2 text-xs">
            <Share2 size={14} />
            {t('common.share')}
          </button>
          <button type="button" onClick={copyLink} className="btn-secondary !px-4 !py-2 text-xs">
            {copied ? '✓' : <Link2 size={14} />}
          </button>
        </div>
      </div>

      {/* hero */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card relative mt-6 overflow-hidden p-8 text-center sm:p-12"
      >
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5" style={{ background: `linear-gradient(90deg, ${color}, ${color}55)` }} />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full opacity-15 blur-3xl"
          style={{ background: color }}
        />
        <p className="font-mono text-4xl font-extrabold tracking-tight sm:text-6xl" style={{ color }}>
          {code}
        </p>
        <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">{info.name}</h1>
        <p className="mt-3 text-base text-muted sm:text-lg">“{info.tagline}”</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span
            className="rounded-full px-3 py-1 font-semibold"
            style={{ background: `${group.color}1c`, color: group.color }}
          >
            {group.name[lang]}
          </span>
          <span className="rounded-full bg-surface2 px-3 py-1 font-medium text-muted">
            {t('result.rare', { p: info.population })}
          </span>
        </div>
      </motion.section>

      {/* trait makeup */}
      <section className="card mt-6 p-7 sm:p-9">
        <h2 className="text-xl font-extrabold tracking-tight">{t('typeDetail.dimsOf')}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {letters.map(({ letter, label, desc }) => (
            <div key={letter} className="flex gap-3.5 rounded-2xl bg-surface2/60 p-4">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-lg font-extrabold"
                style={{ background: `${color}1c`, color }}
              >
                {letter}
              </span>
              <div>
                <h3 className="text-sm font-bold">{label}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* overview */}
      <section className="card mt-6 p-7 sm:p-9">
        <h2 className="text-xl font-extrabold tracking-tight">{t('typeDetail.overview')}</h2>
        <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-ink/90">
          {info.overview.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {/* strengths & weaknesses */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-7">
          <h2 className="flex items-center gap-2.5 text-xl font-extrabold">
            <ThumbsUp size={17} style={{ color }} />
            {t('typeDetail.strengths')}
          </h2>
          <ul className="mt-5 space-y-3">
            {info.strengths.map((s) => (
              <li key={s} className="flex items-start gap-2.5 text-sm leading-relaxed">
                <Check size={16} className="mt-0.5 shrink-0" style={{ color }} />
                {s}
              </li>
            ))}
          </ul>
        </section>
        <section className="card p-7">
          <h2 className="flex items-center gap-2.5 text-xl font-extrabold">
            <ThumbsDown size={17} style={{ color }} />
            {t('typeDetail.weaknesses')}
          </h2>
          <ul className="mt-5 space-y-3">
            {info.weaknesses.map((s) => (
              <li key={s} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
                {s}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* careers */}
      <section className="card mt-6 p-7 sm:p-9">
        <h2 className="flex items-center gap-2.5 text-xl font-extrabold">
          <Briefcase size={17} style={{ color }} />
          {t('typeDetail.careers')}
        </h2>
        <div className="mt-5 flex flex-wrap gap-2.5">
          {info.careers.map((c) => (
            <span key={c} className="rounded-full border border-line bg-surface2 px-3.5 py-1.5 text-sm font-medium">
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* relationship */}
      <section className="card mt-6 p-7 sm:p-9">
        <h2 className="flex items-center gap-2.5 text-xl font-extrabold">
          <Heart size={17} style={{ color }} />
          {t('typeDetail.relationship')}
        </h2>
        <p className="mt-5 text-[15px] leading-relaxed text-ink/90">{info.relationship}</p>
      </section>

      {/* cognitive function stack */}
      <section id="cognitive" className="card mt-6 scroll-mt-24 p-7 sm:p-9">
        <h2 className="text-xl font-extrabold tracking-tight">
          {t('typeDetail.cognitiveOf', { code })}
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-muted">{t('cognitive.intro')}</p>
        <CognitiveStack code={code} />
      </section>

      {/* famous people (community guesses) */}
      {extras?.[code]?.famous?.length ? (
        <section className="card mt-6 p-7 sm:p-9">
          <h2 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
            <Star size={17} style={{ color }} />
            {t('typeDetail.famousTitle', { code })}
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {extras[code].famous.map((f) => (
              <div
                key={f.name}
                className="flex items-center gap-3 rounded-2xl border border-line bg-surface2/40 p-3.5"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-sm"
                  style={{ background: `${color}1c`, color }}
                >
                  {f.name.replace(/[（(].*$/, '').slice(0, 1)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{f.name}</p>
                  <p className="truncate text-xs text-muted">{f.note}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted/70">{t('typeDetail.famousNote')}</p>
        </section>
      ) : null}

      {/* growth tips */}
      {extras?.[code]?.growth?.length ? (
        <section className="card mt-6 p-7 sm:p-9">
          <h2 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
            <Sprout size={17} style={{ color }} />
            {t('typeDetail.growthTitle')}
          </h2>
          <ul className="mt-5 space-y-3">
            {extras[code].growth.map((g, i) => (
              <li key={i} className="flex items-start gap-3 rounded-2xl bg-surface2/50 p-4 text-sm leading-relaxed">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold"
                  style={{ background: `${color}1c`, color }}
                >
                  {i + 1}
                </span>
                {g}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* variants */}
      <section className="card mt-6 p-7 sm:p-9">
        <h2 className="text-xl font-extrabold tracking-tight">{t('typeDetail.variants')}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-line p-5">
            <h3 className="font-bold">
              {t('typeDetail.assertive')} <span style={{ color }}>-A</span>
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{info.variantA}</p>
          </div>
          <div className="rounded-2xl border border-line p-5">
            <h3 className="font-bold">
              {t('typeDetail.turbulent')} <span style={{ color }}>-T</span>
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{info.variantT}</p>
          </div>
        </div>
      </section>

      {/* CTA + prev/next */}
      <div className="mt-10 text-center">
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/test?mode=full" className="btn-primary">
            <Play size={17} />
            {t('typeDetail.takeTestCta')}
          </Link>
          <Link to={`/compatibility?a=${code}`} className="btn-secondary">
            <Users size={16} />
            {t('typeDetail.pairWith', { code })}
          </Link>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3">
        <Link to={`/type/${prev}`} className="card group flex items-center gap-2 p-4 text-sm transition-all hover:border-brand">
          <ChevronLeft size={16} className="text-muted transition-transform group-hover:-translate-x-0.5" />
          <div className="min-w-0">
            <p className="font-mono text-xs font-bold text-muted">{prev}</p>
            <p className="truncate font-semibold">{types?.[prev]?.name}</p>
          </div>
        </Link>
        <Link to={`/type/${next}`} className="card group flex items-center justify-end gap-2 p-4 text-right text-sm transition-all hover:border-brand">
          <div className="min-w-0">
            <p className="font-mono text-xs font-bold text-muted">{next}</p>
            <p className="truncate font-semibold">{types?.[next]?.name}</p>
          </div>
          <ChevronRight size={16} className="text-muted transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import {
  BookOpen,
  ChevronRight,
  Layers,
  Languages,
  ShieldCheck,
  Sparkles,
  Timer,
  Play,
  Users,
} from 'lucide-react';
import Seo from '../components/Seo';
import TypeCard from '../components/TypeCard';
import { useLang } from '../i18n';
import { useTypesData } from '../hooks/useBank';
import { GROUPS, typeColor } from '../data/dimensions';
import { ALL_TYPES } from '../data/dimensions';
import { getProgress } from '../lib/storage';

function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="animate-float absolute -left-32 -top-24 h-96 w-96 rounded-full opacity-25 blur-3xl dark:opacity-20"
        style={{ background: 'radial-gradient(circle, var(--brand), transparent 70%)' }}
      />
      <div
        className="animate-float absolute -right-24 top-32 h-80 w-80 rounded-full opacity-20 blur-3xl dark:opacity-15"
        style={{ background: 'radial-gradient(circle, #c26bd6, transparent 70%)', animationDelay: '-3s' }}
      />
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.18]"
        style={{
          backgroundImage:
            'radial-gradient(circle, color-mix(in srgb, var(--muted) 28%, transparent) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)',
        }}
      />
    </div>
  );
}

export default function Home() {
  const { t, lang } = useLang();
  const types = useTypesData();
  const progress = getProgress();

  const stats = [
    { v: t('home.statQuestions'), icon: Layers },
    { v: t('home.statTypes'), icon: Sparkles },
    { v: t('home.statMinutes'), icon: Timer },
    { v: t('home.statLanguages'), icon: Languages },
  ];

  const features = [
    { icon: Layers, title: t('home.feature1Title'), desc: t('home.feature1Desc') },
    { icon: Timer, title: t('home.feature2Title'), desc: t('home.feature2Desc') },
    { icon: ShieldCheck, title: t('home.feature3Title'), desc: t('home.feature3Desc') },
    { icon: Languages, title: t('home.feature4Title'), desc: t('home.feature4Desc') },
  ];

  const steps = [
    { n: '01', title: t('home.step1Title'), desc: t('home.step1Desc') },
    { n: '02', title: t('home.step2Title'), desc: t('home.step2Desc') },
    { n: '03', title: t('home.step3Title'), desc: t('home.step3Desc') },
  ];

  const faqs = [1, 2, 3, 4, 5].map((i) => ({
    q: t(`home.faq${i}Q`),
    a: t(`home.faq${i}A`),
  }));

  const faqLd = faqs.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  }));

  return (
    <div>
      <Seo
        title={`${t('brand.name')} · ${t('home.titleHighlight')}`}
        description={t('home.subtitle')}
        jsonLd={[{ '@type': 'FAQPage', mainEntity: faqLd }]}
      />

      {/* ---------- hero ---------- */}
      <section className="relative">
        <HeroBackdrop />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-20 sm:pt-24">
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-medium text-muted">
            <Sparkles size={13} className="text-brand" />
            {t('home.badge')}
          </div>

          <h1 className="animate-fade-up mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl [animation-delay:80ms]">
            {t('home.title1')}
            <span className="text-gradient">{t('home.titleHighlight')}</span>
          </h1>

          <p className="animate-fade-up mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg [animation-delay:160ms]">
            {t('home.subtitle')}
          </p>

          <div className="animate-fade-up mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row [animation-delay:240ms]">
            <Link to="/test?mode=full" className="btn-primary w-full sm:w-auto">
              <Play size={17} />
              {t('home.ctaFull')}
            </Link>
            <Link to="/test?mode=quick" className="btn-secondary w-full sm:w-auto">
              <Timer size={16} />
              {t('home.ctaQuick')}
            </Link>
          </div>

          {progress && Object.keys(progress.answers).length > 0 && (
            <div className="animate-fade-up mt-6 [animation-delay:320ms]">
              <Link
                to={`/test?mode=${progress.mode}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-4 py-2 text-sm font-semibold text-brand transition-transform hover:scale-[1.03]"
              >
                <ChevronRight size={15} />
                {t('home.resumeCta')} · {Object.keys(progress.answers).length}/{progress.mode === 'quick' ? 28 : 93}
              </Link>
            </div>
          )}

          <div className="animate-fade-up mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4 [animation-delay:400ms]">
            {stats.map(({ v, icon: Icon }) => (
              <div key={v} className="card flex flex-col items-center gap-2 px-3 py-4">
                <Icon size={18} className="text-brand" />
                <span className="text-sm font-semibold">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- two versions ---------- */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-5 md:grid-cols-2">
          <Link
            to="/test?mode=full"
            className="card group relative overflow-hidden p-7 transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand to-fuchsia-500" />
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">{t('home.fullCardTitle')}</h3>
              <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand">★</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">{t('home.fullDesc')}</p>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand">
              {t('home.ctaFull')} <ChevronRight size={15} className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
          <Link
            to="/test?mode=quick"
            className="card group relative overflow-hidden p-7 transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
            <h3 className="text-xl font-bold">{t('home.quickCardTitle')}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{t('home.quickDesc')}</p>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand">
              {t('home.ctaQuick')} <ChevronRight size={15} className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </section>

      {/* ---------- more tests (enneagram / big five / love languages) ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {t('home.moreTestsTitle')}
            </h2>
            <p className="mt-2 text-sm text-muted">{t('home.moreTestsSubtitle')}</p>
          </div>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            { to: '/quiz/enneagram', icon: '⑨', gradient: 'from-rose-500 to-orange-400' },
            { to: '/quiz/bigfive', icon: '⑤', gradient: 'from-sky-500 to-indigo-400' },
            { to: '/quiz/lovelang', icon: '♥', gradient: 'from-fuchsia-500 to-rose-400' },
          ].map((q, i) => (
            <Link
              key={q.to}
              to={q.to}
              className="card group relative overflow-hidden p-7 transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${q.gradient}`} />
              <span
                className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${q.gradient} text-xl font-bold text-white`}
              >
                {q.icon}
              </span>
              <h3 className="mt-4 text-lg font-bold">
                {i === 0
                  ? lang === 'zh'
                    ? '九型人格测试'
                    : 'Enneagram Test'
                  : i === 1
                    ? lang === 'zh'
                      ? '大五人格测试'
                      : 'Big Five Test'
                    : lang === 'zh'
                      ? '爱的语言测试'
                      : 'Love Languages'}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {i === 0
                  ? lang === 'zh'
                    ? '36 题 · 约 6 分钟 · 九种核心动机'
                    : '36 items · ≈6 min · nine core motivations'
                  : i === 1
                    ? lang === 'zh'
                      ? '30 题 · 约 5 分钟 · 五大特质光谱'
                      : '30 items · ≈5 min · five trait scales'
                    : lang === 'zh'
                      ? '30 题 · 约 5 分钟 · 五种爱语'
                      : '30 items · ≈5 min · five love languages'}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                {t('nav.start')} <ChevronRight size={15} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- matchup + blog ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <div className="grid gap-5 md:grid-cols-2">
          <Link
            to="/compatibility"
            className="card group relative overflow-hidden p-7 transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand to-rose-400" />
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <Users size={20} />
            </div>
            <h3 className="mt-4 text-xl font-bold">{t('home.pairCardTitle')}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t('home.pairCardDesc')}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">
              {t('home.pairCta')} <ChevronRight size={15} className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
          <Link
            to="/blog"
            className="card group relative overflow-hidden p-7 transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <BookOpen size={20} />
            </div>
            <h3 className="mt-4 text-xl font-bold">{t('home.blogCardTitle')}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t('home.blogCardDesc')}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">
              {t('home.blogCta')} <ChevronRight size={15} className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </section>

      {/* ---------- features ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <h2 className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
          {t('home.featuresTitle')}
        </h2>
        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <Icon size={20} />
              </div>
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- steps ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <h2 className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
          {t('home.stepsTitle')}
        </h2>
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {steps.map(({ n, title, desc }) => (
            <div key={n} className="card relative p-6">
              <span className="text-gradient text-4xl font-extrabold">{n}</span>
              <h3 className="mt-3 font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- 16 types wall ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t('home.typesTitle')}</h2>
            <p className="mt-2 text-sm text-muted">{t('home.typesSubtitle')}</p>
          </div>
          <Link to="/types" className="btn-secondary !px-5 !py-2 text-sm">
            {t('common.viewAll')} <ChevronRight size={15} />
          </Link>
        </div>

        {types ? (
          <div className="mt-8 space-y-10">
            {GROUPS.map((g) => (
              <div key={g.key}>
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: g.color }} />
                  <h3 className="font-bold" style={{ color: g.color }}>
                    {g.name[lang]}
                  </h3>
                  <span className="hidden text-sm text-muted sm:inline">{g.desc[lang]}</span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {ALL_TYPES.filter((c) => types[c]?.group === g.key).map((code) => (
                    <TypeCard key={code} info={types[code]} color={typeColor(code)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ALL_TYPES.map((c) => (
              <div key={c} className="card h-36 animate-pulse bg-surface2/50" />
            ))}
          </div>
        )}
      </section>

      {/* ---------- faq ---------- */}
      <section className="mx-auto max-w-3xl px-4 pt-20 sm:px-6">
        <h2 className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
          {t('home.faqTitle')}
        </h2>
        <div className="mt-8 space-y-3">
          {faqs.map(({ q, a }) => (
            <details key={q} className="card group p-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold">
                {q}
                <ChevronRight
                  size={17}
                  className="shrink-0 text-muted transition-transform group-open:rotate-90"
                />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ---------- final cta ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-fuchsia-600 px-6 py-14 text-center text-white">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <h2 className="relative text-2xl font-extrabold sm:text-4xl">{t('home.titleHighlight')}</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-sm text-white/85 sm:text-base">
            {t('home.badge')}
          </p>
          <Link
            to="/test?mode=full"
            className="relative mt-7 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 font-bold text-brand transition-transform hover:scale-105"
          >
            <Play size={17} />
            {t('home.ctaFull')}
          </Link>
        </div>
      </section>
    </div>
  );
}

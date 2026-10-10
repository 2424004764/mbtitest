import { useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check, Crown, Link2, RefreshCw, Sparkles, Sprout, ThumbsUp } from 'lucide-react';
import Seo from '../components/Seo';
import { useLang } from '../i18n';
import { useQuizData } from '../hooks/useBank';
import { isQuizId, type BigFiveData, type EnneaData, type LoveLangData } from '../quizzes';
import { getQuizHistory } from '../lib/storage';
import { copyToClipboard } from '../lib/share';

const ACCENTS: Record<string, string> = {
  e1: '#c2554d', e2: '#d97757', e3: '#d9a424', e4: '#a878c8', e5: '#4f8fd9',
  e6: '#5aa788', e7: '#e0708a', e8: '#b8554d', e9: '#7b74ea',
  openness: '#7b74ea', conscientiousness: '#2aa392', extraversion: '#d9a424',
  agreeableness: '#e0708a', neuroticism: '#c2554d',
  words: '#d97757', time: '#4f8fd9', gifts: '#a878c8', service: '#2aa392', touch: '#e0708a',
};

const accent = (k: string) => ACCENTS[k] ?? '#5b5bd6';

function ScoreRow({ label, pct, color, delay = 0 }: { label: string; pct: number; color: string; delay?: number }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-semibold">{label}</span>
        <span className="tabular-nums font-bold" style={{ color }}>
          {pct}%
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-surface2">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}aa)` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, delay, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function rankEntries(scores: Record<string, number>): [string, number][] {
  return Object.entries(scores).sort((x, y) => y[1] - x[1]);
}

const typeNo = (k: string) => k.replace(/^e(\d)$/, 'Type $1');

export default function QuizResult() {
  const { id = '' } = useParams();
  const { t, lang } = useLang();
  const location = useLocation();
  const data = useQuizData(id);

  const scores = useMemo(() => {
    const fromState = (location.state as { scores?: Record<string, number> } | null)?.scores;
    if (fromState) return fromState;
    if (isQuizId(id)) return getQuizHistory(id)[0]?.scores ?? null;
    return null;
  }, [location.state, id]);

  const [copied, setCopied] = useState(false);

  if (!isQuizId(id)) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <p className="text-lg font-semibold">{t('typeDetail.notFound')}</p>
        <Link to="/" className="btn-primary mt-6">
          {t('common.backHome')}
        </Link>
      </div>
    );
  }

  if (!data || !scores) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <p className="text-lg font-semibold">{t('result.notFoundLocal')}</p>
        <Link to={`/quiz/${id}`} className="btn-primary mt-6">
          {t('nav.start')}
        </Link>
      </div>
    );
  }

  const ranked = rankEntries(scores);
  const top = ranked[0];
  const runnerUp = ranked[1];

  const topLabel =
    'types' in data
      ? (data as EnneaData).types[top[0]]?.name
      : 'scales' in data
        ? (data as BigFiveData).scales[top[0]]?.name
        : (data as LoveLangData).langs[top[0]]?.name;

  const shareText =
    lang === 'zh'
      ? `我在${data.meta.name}中的结果是：${topLabel}（${top[1]}%）你也来试试吧！${window.location.origin}/quiz/${id}`
      : `My ${data.meta.name} result: ${topLabel} (${top[1]}%). Try it too: ${window.location.origin}/quiz/${id}`;

  const onCopy = async () => {
    if (await copyToClipboard(shareText)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Seo title={`${data.meta.name} · ${t('brand.name')}`} description={data.meta.description} noindex />

      {/* hero */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card relative overflow-hidden p-8 text-center sm:p-12"
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1.5"
          style={{ background: `linear-gradient(90deg, ${accent(top[0])}, ${accent(top[0])}55)` }}
        />
        <p className="text-sm font-medium text-muted">
          {data.meta.name} · {t('quiz.yourResult')}
        </p>
        {'types' in data ? <EnneaHero data={data as EnneaData} scores={scores} /> : null}
        {'scales' in data ? <BigFiveHero data={data as BigFiveData} /> : null}
        {'langs' in data ? <LoveLangHero data={data as LoveLangData} scores={scores} /> : null}
      </motion.section>

      {/* ranked scores */}
      <section className="card mt-6 p-7 sm:p-9">
        <h2 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <Crown size={17} />
          </span>
          {t('quiz.yourScore')}
        </h2>
        <div className="mt-6 space-y-4">
          {ranked.map(([key, pct], i) => {
            const label =
              'types' in data
                ? `${typeNo(key)} · ${(data as EnneaData).types[key]?.name}`
                : 'scales' in data
                  ? (data as BigFiveData).scales[key]?.name
                  : (data as LoveLangData).langs[key]?.name;
            return <ScoreRow key={key} label={label} pct={pct} color={accent(key)} delay={0.1 + i * 0.08} />;
          })}
        </div>
      </section>

      {/* deep dive for the winning scale */}
      {'types' in data ? <EnneaDetail data={data as EnneaData} scores={scores} /> : null}
      {'scales' in data ? <BigFiveDetail data={data as BigFiveData} scores={scores} /> : null}
      {'langs' in data ? <LoveLangDetail data={data as LoveLangData} scores={scores} /> : null}

      {/* runner-up hint (enneagram wing) */}
      {'types' in data && runnerUp && (data as EnneaData).types[runnerUp[0]] && (
        <section className="card mt-6 border-dashed p-7 sm:p-9">
          <h2 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <Sparkles size={17} />
            </span>
            {t('quiz.alsoLike')} {typeNo(runnerUp[0])} · {(data as EnneaData).types[runnerUp[0]].name}（{runnerUp[1]}%）
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">{t('quiz.wingNote')}</p>
        </section>
      )}

      {/* actions */}
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link to={`/quiz/${id}`} className="btn-secondary !px-5 !py-2.5 text-sm">
          <RefreshCw size={15} />
          {t('quiz.retake')}
        </Link>
        <button type="button" onClick={onCopy} className="btn-secondary !px-5 !py-2.5 text-sm">
          {copied ? <Check size={15} /> : <Link2 size={15} />}
          {copied ? t('common.copied') : t('common.copyText')}
        </button>
        <Link to="/test?mode=quick" className="btn-primary !px-5 !py-2.5 text-sm">
          {t('blog.takeTestCta')}
        </Link>
      </div>

      <p className="mt-8 text-center text-xs leading-relaxed text-muted">{t('quiz.disclaimer')}</p>
    </div>
  );
}

/* ---------- enneagram ---------- */

function EnneaHero({ data, scores }: { data: EnneaData; scores: Record<string, number> }) {
  const { lang } = useLang();
  const top = rankEntries(scores)[0];
  const info = data.types[top[0]];
  const color = accent(top[0]);
  return (
    <>
      <p className="mt-3 font-mono text-4xl font-extrabold sm:text-6xl" style={{ color }}>
        {typeNo(top[0])}
      </p>
      <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">
        {lang === 'zh' ? info.name : info.englishName}
      </h1>
      <p className="mt-3 text-base text-muted sm:text-lg">“{info.tagline}”</p>
      <p className="mt-4 text-sm font-semibold" style={{ color }}>
        {top[1]}%
      </p>
    </>
  );
}

function EnneaDetail({ data, scores }: { data: EnneaData; scores: Record<string, number> }) {
  const { t } = useLang();
  const top = rankEntries(scores)[0];
  const info = data.types[top[0]];
  const color = accent(top[0]);
  return (
    <>
      <section className="card mt-6 p-7 sm:p-9">
        <h2 className="text-xl font-extrabold tracking-tight">
          {info.name} · {info.englishName}
        </h2>
        <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-ink/90">
          {info.overview.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-7">
          <h3 className="flex items-center gap-2 text-lg font-extrabold">
            <ThumbsUp size={17} style={{ color }} />
            {t('result.strengthsTitle')}
          </h3>
          <ul className="mt-4 space-y-2.5">
            {info.strengths.map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm leading-relaxed">
                <Check size={15} className="mt-0.5 shrink-0" style={{ color }} />
                {s}
              </li>
            ))}
          </ul>
        </section>
        <section className="card p-7">
          <h3 className="flex items-center gap-2 text-lg font-extrabold">
            <Sprout size={17} style={{ color }} />
            {t('typeDetail.growthTitle')}
          </h3>
          <ul className="mt-4 space-y-2.5">
            {info.growth.map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm leading-relaxed text-muted">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
                {s}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

/* ---------- big five ---------- */

function BigFiveHero({ data }: { data: BigFiveData }) {
  const { t } = useLang();
  return (
    <>
      <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">{data.meta.tagline}</h1>
      <p className="mt-3 text-sm text-muted">{t('quiz.spectrumTitle')}</p>
    </>
  );
}

function bandOf(pct: number): 'low' | 'mid' | 'high' {
  if (pct >= 62) return 'high';
  if (pct <= 38) return 'low';
  return 'mid';
}

function BigFiveDetail({ data, scores }: { data: BigFiveData; scores: Record<string, number> }) {
  const { t } = useLang();
  return (
    <section className="card mt-6 p-7 sm:p-9">
      <h2 className="text-xl font-extrabold tracking-tight">{t('quiz.spectrumTitle')}</h2>
      <p className="mt-2 text-xs text-muted">{t('quiz.spectrumNote')}</p>
      <div className="mt-6 space-y-6">
        {Object.entries(data.scales).map(([key, scale]) => {
          const pct = scores[key] ?? 50;
          const band = bandOf(pct);
          return (
            <div key={key}>
              <ScoreRow label={scale.name} pct={pct} color={accent(key)} />
              <p className="mt-2 rounded-xl bg-surface2/60 px-4 py-3 text-sm leading-relaxed text-muted">
                <span className="font-semibold text-ink">
                  {band === 'high' ? '↑' : band === 'low' ? '↓' : '→'} {scale.name}
                </span>
                ：{scale[band]}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- love languages ---------- */

function LoveLangHero({ data, scores }: { data: LoveLangData; scores: Record<string, number> }) {
  const { t } = useLang();
  const top = rankEntries(scores)[0];
  const info = data.langs[top[0]];
  return (
    <>
      <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">{info.name}</h1>
      <p className="mt-4 text-sm font-semibold" style={{ color: accent(top[0]) }}>
        {top[1]}% · {t('quiz.primaryTitle')}
      </p>
    </>
  );
}

function LoveLangDetail({ data, scores }: { data: LoveLangData; scores: Record<string, number> }) {
  const { t } = useLang();
  const top = rankEntries(scores)[0];
  const key = top[0];
  const info = data.langs[key];
  const color = accent(key);
  return (
    <>
      <section className="card mt-6 p-7 sm:p-9">
        <h2 className="text-xl font-extrabold tracking-tight">{t('quiz.primaryTitle')}</h2>
        <p className="mt-2 text-xs text-muted">{t('quiz.primaryNote')}</p>
        <div
          className="mt-5 rounded-2xl p-6"
          style={{ background: `${color}12`, boxShadow: `inset 0 0 0 1.5px ${color}` }}
        >
          <h3 className="text-lg font-extrabold" style={{ color }}>
            {info.name}
          </h3>
          <p className="mt-3 text-[15px] leading-relaxed text-ink/90">{info.desc}</p>
        </div>
      </section>
      <section className="card mt-6 p-7 sm:p-9">
        <h2 className="text-xl font-extrabold tracking-tight">{t('quiz.tipsTitle')}</h2>
        <ul className="mt-5 space-y-3">
          {info.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
              {tip}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

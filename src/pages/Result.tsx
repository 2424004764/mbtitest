import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Briefcase,
  Check,
  Download,
  FingerprintPattern,
  Heart,
  Link2,
  ListChecks,
  RefreshCw,
  Share2,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  Trash2,
  Users,
} from 'lucide-react';
import Seo from '../components/Seo';
import DimensionBar from '../components/DimensionBar';
import CognitiveStack from '../components/CognitiveStack';
import TrendChart from '../components/TrendChart';
import StatsPanel from '../components/StatsPanel';
import ReviewPanel from '../components/ReviewPanel';
import { useLang } from '../i18n';
import { useTypesData } from '../hooks/useBank';
import { DIM_ORDER, typeColor, groupMeta, dimMeta } from '../data/dimensions';
import type { Answer, TestResult } from '../data/schema';
import { altType } from '../lib/scoring';
import {
  decodeResult,
  buildResultUrl,
  copyToClipboard,
  nativeShare,
  drawResultCard,
  downloadCanvas,
  type CardStyle,
} from '../lib/share';
import { clearHistory, getHistory } from '../lib/storage';

function SectionTitle({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">{icon}</span>
      {children}
    </h2>
  );
}

export default function Result() {
  const { t, lang } = useLang();
  const location = useLocation();
  const [params] = useSearchParams();
  const types = useTypesData();

  const state = location.state as { result?: TestResult; answers?: Record<number, Answer> } | null;
  const result: TestResult | null = useMemo(() => {
    if (state?.result) return state.result;
    const fromUrl = decodeResult(params.get('d'));
    if (fromUrl) return fromUrl;
    return getHistory()[0] ?? null;
  }, [state, params]);
  const answers = state?.answers;

  const [copied, setCopied] = useState<string | null>(null);
  const [history, setHistory] = useState(getHistory);
  const [cardStyle, setCardStyle] = useState<CardStyle>('classic');
  const [pkFrom, setPkFrom] = useState<string | null>(null);

  // A pending matchup challenge from /compatibility?a=TYPE&invite=1
  useEffect(() => {
    try {
      const v = sessionStorage.getItem('mbti_pk_from');
      if (v && /^[A-Z]{4}$/.test(v)) setPkFrom(v);
    } catch {
      /* ignore */
    }
  }, []);

  const goPk = () => {
    if (!result || !pkFrom) return;
    try {
      sessionStorage.removeItem('mbti_pk_from');
    } catch {
      /* ignore */
    }
    window.location.href = `/compatibility?a=${pkFrom}&b=${result.type}`;
  };

  const alt = result ? altType(result) : null;

  if (!result) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <p className="text-lg font-semibold">{t('result.notFoundLocal')}</p>
        <Link to="/test?mode=full" className="btn-primary mt-6">
          {t('home.ctaFull')}
        </Link>
      </div>
    );
  }

  const info = types?.[result.type];
  const color = typeColor(result.type);
  const shareUrl = buildResultUrl(result);

  const flashCopied = (key: string) => {
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1600);
  };

  const onCopyLink = async () => {
    if (await copyToClipboard(shareUrl)) flashCopied('link');
  };

  const onCopyText = async () => {
    const text = `${t('result.shareText', {
      type: `${result.type}-${result.identity}`,
      name: info?.name ?? result.type,
      tagline: info?.tagline ?? '',
    })} ${shareUrl}`;
    if (await copyToClipboard(text)) flashCopied('text');
  };

  const onShare = () =>
    nativeShare(
      `${result.type}-${result.identity} ${info?.name ?? ''}`,
      t('result.shareText', {
        type: `${result.type}-${result.identity}`,
        name: info?.name ?? result.type,
        tagline: info?.tagline ?? '',
      }),
      shareUrl,
    );

  const onDownload = () => {
    if (!info) return;
    const canvas = drawResultCard(
      result,
      color,
      {
        lang,
        typeName: info.name,
        tagline: info.tagline,
        siteLabel: 'MBTI · 16 Personalities',
        cta: lang === 'zh' ? '来测测你的人格类型' : 'Find your personality type',
        modeLabel: result.mode === 'quick' ? t('common.quickMode') : t('common.fullMode'),
      },
      cardStyle,
    );
    downloadCanvas(canvas, `MBTI-${result.type}-${result.identity}.png`);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Seo
        title={`${result.type}-${result.identity} ${info?.name ?? ''} · ${t('brand.name')}`}
        description={info?.tagline ?? t('result.title')}
        noindex
      />

      {!info ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-line border-t-brand" />
        </div>
      ) : (
        <>
          {/* ---------- pending matchup challenge ---------- */}
          {pkFrom && pkFrom !== result.type && (
            <motion.button
              type="button"
              onClick={goPk}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex w-full items-center gap-3 rounded-2xl border border-brand/40 bg-brand-soft px-5 py-4 text-left transition-transform hover:scale-[1.01]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
                <Users size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-brand">{t('result.pkBannerTitle')}</span>
                <span className="block text-xs text-brand/80">
                  {pkFrom} ↔ {result.type}
                </span>
              </span>
              <span className="shrink-0 text-xs font-bold text-brand">{t('result.pkBannerCta')} →</span>
            </motion.button>
          )}

          {/* ---------- hero ---------- */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card relative overflow-hidden p-8 text-center sm:p-12"
          >
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-1.5"
              style={{ background: `linear-gradient(90deg, ${color}, ${color}55)` }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full opacity-15 blur-3xl"
              style={{ background: color }}
            />
            <p className="text-sm font-medium text-muted">{t('result.youAre')}</p>
            <p
              className="mt-3 font-mono text-5xl font-extrabold tracking-tight sm:text-7xl"
              style={{ color }}
            >
              {result.type}-{result.identity}
            </p>
            <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">{info.name}</h1>
            <p className="mt-3 text-base text-muted sm:text-lg">“{info.tagline}”</p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span
                className="rounded-full px-3 py-1 font-semibold"
                style={{ background: `${groupMeta(info.group).color}1c`, color: groupMeta(info.group).color }}
              >
                {groupMeta(info.group).name[lang]}
              </span>
              <span className="rounded-full bg-surface2 px-3 py-1 font-medium text-muted">
                {t('result.rare', { p: info.population })}
              </span>
              <span className="rounded-full bg-surface2 px-3 py-1 font-medium text-muted">
                {result.mode === 'quick' ? t('common.quickMode') : t('common.fullMode')}
              </span>
            </div>
          </motion.section>

          {/* ---------- dimensions ---------- */}
          <section className="card mt-6 p-7 sm:p-9">
            <SectionTitle icon={<ListChecks size={17} />}>{t('result.dimsTitle')}</SectionTitle>
            <div className="mt-7 space-y-7">
              {DIM_ORDER.map((d, i) => (
                <DimensionBar
                  key={d}
                  dim={d}
                  leftPct={result.dims[d].leftPct}
                  color={color}
                  delay={0.15 + i * 0.12}
                  withDesc
                />
              ))}
            </div>
            {result.mode === 'quick' && (
              <p className="mt-7 rounded-xl bg-brand-soft px-4 py-3 text-xs leading-relaxed text-brand">
                {t('result.quickNote')}
              </p>
            )}
          </section>

          {/* ---------- alternative type (borderline dimension) ---------- */}
          {alt && alt.otherType !== result.type && types?.[alt.otherType] && (
            <section className="card mt-6 border-dashed p-7 sm:p-9">
              <h2 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <Sparkles size={17} />
                </span>
                {t('result.altTypeTitle')}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                {t('result.altTypeDesc', {
                  dim: `${dimMeta(alt.dim).left}/${dimMeta(alt.dim).right}`,
                  p: alt.dominantPct,
                  type: alt.otherType,
                })}
              </p>
              <div className="mt-4">
                <Link
                  to={`/type/${alt.otherType}`}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-surface2 px-4 py-2 text-sm font-semibold transition-colors hover:border-brand hover:text-brand"
                >
                  <span className="font-mono font-bold">{alt.otherType}</span>
                  {types[alt.otherType].name} →
                </Link>
              </div>
            </section>
          )}

          {/* ---------- overview ---------- */}
          <section className="card mt-6 p-7 sm:p-9">
            <SectionTitle icon={<span className="font-mono text-base font-extrabold">§</span>}>
              {t('result.overviewTitle')}
            </SectionTitle>
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-ink/90">
              {info.overview.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>

          {/* ---------- cognitive function stack ---------- */}
          <section className="card mt-6 p-7 sm:p-9">
            <SectionTitle icon={<span className="font-mono text-base font-extrabold">ƒ</span>}>
              {t('result.cognitiveTitle')}
            </SectionTitle>
            <p className="mt-3 text-xs leading-relaxed text-muted">{t('result.cognitiveIntro')}</p>
            <CognitiveStack code={result.type} compact />
            <Link
              to={`/type/${result.type}#cognitive`}
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
            >
              {t('common.viewDetails')} →
            </Link>
          </section>

          {/* ---------- strengths & weaknesses ---------- */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="card p-7">
              <SectionTitle icon={<ThumbsUp size={17} />}>{t('result.strengthsTitle')}</SectionTitle>
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
              <SectionTitle icon={<ThumbsDown size={17} />}>{t('result.weaknessesTitle')}</SectionTitle>
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

          {/* ---------- careers ---------- */}
          <section className="card mt-6 p-7 sm:p-9">
            <SectionTitle icon={<Briefcase size={17} />}>{t('result.careersTitle')}</SectionTitle>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {info.careers.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-line bg-surface2 px-3.5 py-1.5 text-sm font-medium"
                >
                  {c}
                </span>
              ))}
            </div>
          </section>

          {/* ---------- relationship ---------- */}
          <section className="card mt-6 p-7 sm:p-9">
            <SectionTitle icon={<Heart size={17} />}>{t('result.relationshipTitle')}</SectionTitle>
            <p className="mt-5 text-[15px] leading-relaxed text-ink/90">{info.relationship}</p>
          </section>

          {/* ---------- identity variant ---------- */}
          <section className="card mt-6 p-7 sm:p-9">
            <SectionTitle icon={<FingerprintPattern size={17} />}>
              {t('result.identityTitle')}
            </SectionTitle>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div
                className={`rounded-2xl border p-5 ${
                  result.identity === 'A' ? 'border-transparent' : 'border-line opacity-70'
                }`}
                style={result.identity === 'A' ? { background: `${color}12`, boxShadow: `inset 0 0 0 1.5px ${color}` } : undefined}
              >
                <h3 className="font-bold">
                  {t('typeDetail.assertive')} <span style={{ color }}>-A</span>
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{info.variantA}</p>
              </div>
              <div
                className={`rounded-2xl border p-5 ${
                  result.identity === 'T' ? 'border-transparent' : 'border-line opacity-70'
                }`}
                style={result.identity === 'T' ? { background: `${color}12`, boxShadow: `inset 0 0 0 1.5px ${color}` } : undefined}
              >
                <h3 className="font-bold">
                  {t('typeDetail.turbulent')} <span style={{ color }}>-T</span>
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{info.variantT}</p>
              </div>
            </div>
          </section>

          {/* ---------- share ---------- */}
          <section className="card mt-6 p-7 sm:p-9">
            <SectionTitle icon={<Share2 size={17} />}>{t('result.shareTitle')}</SectionTitle>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={onShare} className="btn-primary !px-5 !py-2.5 text-sm">
                <Share2 size={15} />
                {t('common.share')}
              </button>
              <button type="button" onClick={onCopyLink} className="btn-secondary !px-5 !py-2.5 text-sm">
                {copied === 'link' ? <Check size={15} /> : <Link2 size={15} />}
                {copied === 'link' ? t('common.copied') : t('common.copyLink')}
              </button>
              <button type="button" onClick={onCopyText} className="btn-secondary !px-5 !py-2.5 text-sm">
                {copied === 'text' ? <Check size={15} /> : <span className="font-medium">Aa</span>}
                {copied === 'text' ? t('common.copied') : t('common.copyText')}
              </button>
            </div>

            {/* card style picker + download */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold text-muted">{t('result.cardStyleTitle')}</span>
              <div className="flex gap-2">
                {(['classic', 'minimal', 'vivid'] as CardStyle[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setCardStyle(s)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      cardStyle === s
                        ? 'border-brand bg-brand-soft text-brand'
                        : 'border-line text-muted hover:border-brand hover:text-brand'
                    }`}
                  >
                    {s === 'classic' ? t('result.cardClassic') : s === 'minimal' ? t('result.cardMinimal') : t('result.cardVivid')}
                  </button>
                ))}
              </div>
              <button type="button" onClick={onDownload} className="btn-secondary !px-5 !py-2 text-sm">
                <Download size={15} />
                {t('result.downloadCard')}
              </button>
            </div>
          </section>

          {/* ---------- actions ---------- */}
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/test?mode=full" className="btn-secondary !px-5 !py-2.5 text-sm">
              <RefreshCw size={15} />
              {t('result.retake')}
            </Link>
            <Link to={`/type/${result.type}`} className="btn-secondary !px-5 !py-2.5 text-sm">
              {t('result.viewType')}
            </Link>
            <Link to="/types" className="btn-secondary !px-5 !py-2.5 text-sm">
              {t('result.browseTypes')}
            </Link>
            <Link to={`/compatibility?a=${result.type}`} className="btn-primary !px-5 !py-2.5 text-sm">
              <Users size={15} />
              {t('result.pairCta')}
            </Link>
          </div>

          {/* ---------- answer review (fresh runs only) ---------- */}
          {answers && <ReviewPanel answers={answers} mode={result.mode} />}

          {/* ---------- dimension trend across past tests ---------- */}
          <section className="card mt-6 p-7 sm:p-9">
            <SectionTitle icon={<TrendingUp size={17} />}>{t('result.trendTitle')}</SectionTitle>
            <p className="mt-2 text-xs text-muted">{t('result.trendDesc')}</p>
            {history.length >= 2 ? (
              <TrendChart history={history} />
            ) : (
              <p className="mt-5 rounded-xl bg-surface2/60 px-4 py-3 text-sm text-muted">
                {t('result.trendEmpty')}
              </p>
            )}
          </section>

          {/* ---------- anonymous stats (opt-in) ---------- */}
          <StatsPanel result={result} />

          {/* ---------- history ---------- */}
          <section className="card mt-8 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {t('result.historyTitle')}
                {history.length > 0 && (
                  <span className="ml-2 font-normal text-muted">
                    {t('result.historyCount', { n: history.length })}
                  </span>
                )}
              </h3>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    clearHistory();
                    setHistory([]);
                  }}
                  className="inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-red-500"
                >
                  <Trash2 size={13} />
                  {t('result.clearHistory')}
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="mt-3 text-sm text-muted">{t('result.historyEmpty')}</p>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                {history.map((h, i) => (
                  <span
                    key={h.date + h.type}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                      i === 0 ? 'border-brand text-brand' : 'border-line text-muted'
                    }`}
                  >
                    <span className="font-mono">{h.type}-{h.identity}</span>
                    <span className="font-normal text-muted/80">
                      {new Date(h.date).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </section>

          <p className="mt-8 text-center text-xs leading-relaxed text-muted">{t('result.disclaimer')}</p>
        </>
      )}
    </div>
  );
}

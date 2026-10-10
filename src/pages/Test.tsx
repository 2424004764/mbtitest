import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Keyboard, X } from 'lucide-react';
import Seo from '../components/Seo';
import ProgressBar from '../components/ProgressBar';
import LikertScale from '../components/LikertScale';
import QuestionHint from '../components/QuestionHint';
import { useLang } from '../i18n';
import { useQuestionBank } from '../hooks/useBank';
import { questionsFor, scoreResult } from '../lib/scoring';
import type { Answer, TestMode } from '../data/schema';
import { clearProgress, getProgress, pushHistory, saveProgress, type TestProgress } from '../lib/storage';

export default function Test() {
  const { t, tArr } = useLang();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const bank = useQuestionBank();

  const saved = useRef<TestProgress | null>(getProgress()).current;
  const [resumePrompt, setResumePrompt] = useState<boolean>(!!saved);
  const [mode, setMode] = useState<TestMode>(() => {
    const m = params.get('mode');
    return m === 'quick' ? 'quick' : 'full';
  });
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [current, setCurrent] = useState(0);
  const advanceTimer = useRef<number | undefined>(undefined);

  const questions = useMemo(
    () => (bank ? questionsFor(bank, mode) : []),
    [bank, mode],
  );
  const total = questions.length;
  const q = questions[current];
  const answeredCount = questions.filter((x) => answers[x.id] !== undefined).length;

  const persist = useCallback(
    (nextAnswers: Record<number, Answer>, nextCurrent: number, m: TestMode) => {
      if (questions.length === 0) return;
      saveProgress({ mode: m, answers: nextAnswers, current: nextCurrent, date: Date.now() });
    },
    [questions.length],
  );

  const finish = useCallback(
    (allAnswers: Record<number, Answer>) => {
      const result = scoreResult(questions, allAnswers, mode);
      pushHistory(result);
      clearProgress();
      navigate('/result', { state: { result, answers: allAnswers }, replace: true });
    },
    [questions, mode, navigate],
  );

  const answer = useCallback(
    (v: Answer) => {
      if (!q) return;
      const next = { ...answers, [q.id]: v };
      setAnswers(next);
      window.clearTimeout(advanceTimer.current);
      if (current < total - 1) {
        advanceTimer.current = window.setTimeout(() => {
          setCurrent((c) => Math.min(c + 1, total - 1));
          persist(next, current + 1, mode);
        }, 260);
      } else {
        persist(next, current, mode);
        advanceTimer.current = window.setTimeout(() => finish(next), 420);
      }
    },
    [q, answers, current, total, mode, persist, finish],
  );

  const goPrev = useCallback(() => {
    window.clearTimeout(advanceTimer.current);
    setCurrent((c) => Math.max(0, c - 1));
    persist(answers, Math.max(0, current - 1), mode);
  }, [answers, current, mode, persist]);

  const goNext = useCallback(() => {
    if (!q || answers[q.id] === undefined) return;
    window.clearTimeout(advanceTimer.current);
    if (current < total - 1) {
      setCurrent(current + 1);
      persist(answers, current + 1, mode);
    } else {
      finish(answers);
    }
  }, [q, answers, current, total, mode, persist, finish]);

  // keyboard: 1-7 answer, arrows navigate, Enter advances
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (resumePrompt) return;
      if (e.key >= '1' && e.key <= '7' && q) {
        const idx = Number(e.key) - 1;
        answer(3 - idx);
      } else if (e.key === 'ArrowLeft') {
        goPrev();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        goNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [answer, goPrev, goNext, q, resumePrompt]);

  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  const resume = () => {
    if (!saved) return;
    setMode(saved.mode);
    setAnswers(saved.answers);
    setCurrent(Math.min(saved.current, Math.max(0, total - 1)));
    setResumePrompt(false);
  };

  const startOver = () => {
    clearProgress();
    setAnswers({});
    setCurrent(0);
    setResumePrompt(false);
  };

  if (!bank || !q) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-line border-t-brand" />
      </div>
    );
  }

  const labels = tArr('likert.labels');
  const modeChip = mode === 'quick' ? t('common.quickMode') : t('common.fullMode');

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <Seo title={`${t('test.title')} · ${t('brand.name')}`} description={t('test.subtitle')} />

      {/* resume dialog */}
      <AnimatePresence>
        {resumePrompt && saved && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="card w-full max-w-md p-7"
              initial={{ scale: 0.92, y: 14 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <h2 className="text-lg font-bold">{t('test.resumeTitle')}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {t('test.resumeDesc', {
                  n: Object.keys(saved.answers).length,
                  total: saved.mode === 'quick' ? 28 : 93,
                })}
              </p>
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={resume} className="btn-primary flex-1 !py-2.5 text-sm">
                  {t('test.resumeYes')}
                </button>
                <button type="button" onClick={startOver} className="btn-secondary flex-1 !py-2.5 text-sm">
                  {t('test.resumeNo')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* header row */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            if (window.confirm(t('test.exitConfirm'))) navigate('/');
          }}
          className="rounded-full border border-line bg-surface p-2 text-muted transition-colors hover:border-brand hover:text-brand"
          aria-label={t('common.backHome')}
        >
          <X size={16} />
        </button>
        <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand">{modeChip}</span>
      </div>

      {/* progress */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted">
          <span>{t('test.questionOf', { n: current + 1, total })}</span>
          <span className="tabular-nums">{Math.round((answeredCount / total) * 100)}%</span>
        </div>
        <ProgressBar value={(answeredCount / total) * 100} />
      </div>

      {/* question card */}
      <div className="relative mt-8 min-h-64">
        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 34 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -34 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="card p-5 sm:p-9"
          >
            <p className="text-lg font-medium leading-relaxed sm:text-xl">
              {q.text}
              <QuestionHint id={q.id} />
            </p>
            <div className="mt-8">
              <LikertScale value={answers[q.id]} onChange={answer} labels={labels} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* controls */}
      <div className="mt-7 flex items-center justify-between">
        <button
          type="button"
          onClick={goPrev}
          disabled={current === 0}
          className="btn-secondary !px-4 !py-2 text-sm disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft size={16} />
          {t('test.prev')}
        </button>
        <span className="hidden items-center gap-1.5 text-xs text-muted sm:flex">
          <Keyboard size={14} />
          {t('test.keyboardHint')}
        </span>
        <button
          type="button"
          onClick={goNext}
          disabled={answers[q.id] === undefined || current >= total - 1}
          className="btn-secondary !px-4 !py-2 text-sm disabled:pointer-events-none disabled:opacity-40"
          title={answers[q.id] === undefined ? t('test.needAnswer') : undefined}
        >
          {t('test.next')}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

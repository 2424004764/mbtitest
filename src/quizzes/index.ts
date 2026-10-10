import type { Lang } from '../data/schema';

export type QuizId = 'enneagram' | 'bigfive' | 'lovelang';

export const QUIZ_IDS: readonly QuizId[] = ['enneagram', 'bigfive', 'lovelang'];

export const isQuizId = (v: string): v is QuizId => (QUIZ_IDS as readonly string[]).includes(v);

export interface QuizQuestion {
  id: number;
  text: string;
  scale: string;
  /** +1: agreement raises the scale score; -1 lowers it */
  dir: 1 | -1;
}

export interface QuizMeta {
  name: string;
  tagline: string;
  description: string;
  minutes: number;
}

export interface EnneaType {
  name: string;
  englishName: string;
  tagline: string;
  overview: string[];
  strengths: string[];
  weaknesses: string[];
  growth: string[];
}

export interface BigFiveScale {
  name: string;
  low: string;
  mid: string;
  high: string;
}

export interface LoveLangInfo {
  name: string;
  desc: string;
  tips: string[];
}

export interface EnneaData {
  meta: QuizMeta;
  questions: QuizQuestion[];
  types: Record<string, EnneaType>;
}

export interface BigFiveData {
  meta: QuizMeta;
  questions: QuizQuestion[];
  scales: Record<string, BigFiveScale>;
}

export interface LoveLangData {
  meta: QuizMeta;
  questions: QuizQuestion[];
  langs: Record<string, LoveLangInfo>;
}

export type AnyQuizData = EnneaData | BigFiveData | LoveLangData;

export interface QuizInfo {
  id: QuizId;
  /** short blurb for the home cards — UI copy lives in each JSON's meta */
  icon: string;
  gradient: string;
  load: (lang: Lang) => Promise<{ default: AnyQuizData }>;
}

export const QUIZZES: Record<QuizId, QuizInfo> = {
  enneagram: {
    id: 'enneagram',
    icon: '⑨',
    gradient: 'from-rose-500 to-orange-400',
    load: (lang) => (lang === 'zh' ? import('../data/quizzes/enneagram.zh.json') : import('../data/quizzes/enneagram.en.json')) as Promise<{ default: EnneaData }>,
  },
  bigfive: {
    id: 'bigfive',
    icon: '⑤',
    gradient: 'from-sky-500 to-indigo-400',
    load: (lang) => (lang === 'zh' ? import('../data/quizzes/bigfive.zh.json') : import('../data/quizzes/bigfive.en.json')) as Promise<{ default: BigFiveData }>,
  },
  lovelang: {
    id: 'lovelang',
    icon: '♥',
    gradient: 'from-fuchsia-500 to-rose-400',
    load: (lang) => (lang === 'zh' ? import('../data/quizzes/lovelang.zh.json') : import('../data/quizzes/lovelang.en.json')) as Promise<{ default: LoveLangData }>,
  },
};

/**
 * Aggregate Likert answers (-3…+3, scaled by direction) into 0–100 per scale.
 * A neutral pattern of answers lands at 50.
 */
export function scoreQuiz(questions: QuizQuestion[], answers: Record<number, number>): Record<string, number> {
  const sums: Record<string, { sum: number; max: number }> = {};
  for (const q of questions) {
    const slot = (sums[q.scale] ??= { sum: 0, max: 0 });
    const a = answers[q.id];
    if (a === undefined) continue;
    slot.sum += a * q.dir;
    slot.max += 3;
  }
  const out: Record<string, number> = {};
  for (const [scale, { sum, max }] of Object.entries(sums)) {
    const ratio = max === 0 ? 0 : sum / max;
    out[scale] = Math.round(((ratio + 1) / 2) * 100);
  }
  return out;
}

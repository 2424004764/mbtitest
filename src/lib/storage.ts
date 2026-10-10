import type { Answer, TestMode, TestResult } from '../data/schema';

const PROGRESS_KEY = 'mbti_progress';
const HISTORY_KEY = 'mbti_history';
const HISTORY_MAX = 10;
const STATS_OPTIN_KEY = 'mbti_stats_optin';
const STATS_CACHE_KEY = 'mbti_stats_cache';

export interface TestProgress {
  mode: TestMode;
  answers: Record<number, Answer>;
  current: number;
  date: number;
}

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — progress simply won't persist */
  }
}

export function getProgress(): TestProgress | null {
  const p = read<TestProgress>(PROGRESS_KEY);
  if (!p || (p.mode !== 'quick' && p.mode !== 'full')) return null;
  if (!p.answers || typeof p.current !== 'number') return null;
  return p;
}

export function saveProgress(p: TestProgress): void {
  write(PROGRESS_KEY, p);
}

export function clearProgress(): void {
  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch {
    /* ignore */
  }
}

export function getHistory(): TestResult[] {
  const h = read<TestResult[]>(HISTORY_KEY);
  return Array.isArray(h) ? h : [];
}

export function pushHistory(result: TestResult): void {
  const next = [result, ...getHistory()].slice(0, HISTORY_MAX);
  write(HISTORY_KEY, next);
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* ignore */
  }
}

/* ---------- anonymous type statistics (opt-in) ---------- */

export function hasOptedInStats(): boolean {
  try {
    return localStorage.getItem(STATS_OPTIN_KEY) === '1';
  } catch {
    return false;
  }
}

export function setStatsOptedIn(): void {
  try {
    localStorage.setItem(STATS_OPTIN_KEY, '1');
  } catch {
    /* ignore */
  }
}

export interface StatsCache {
  fetchedAt: number;
  total: number;
  counts: Record<string, number>;
}

const STATS_CACHE_TTL = 60 * 60 * 1000; // 1h

export function getStatsCache(): StatsCache | null {
  const c = read<StatsCache>(STATS_CACHE_KEY);
  if (!c || typeof c.total !== 'number' || !c.counts) return null;
  if (Date.now() - c.fetchedAt > STATS_CACHE_TTL) return null;
  return c;
}

export function setStatsCache(cache: StatsCache): void {
  write(STATS_CACHE_KEY, cache);
}

/* ---------- generic quiz progress & history ---------- */

export interface QuizProgress {
  answers: Record<number, Answer>;
  current: number;
  date: number;
}

export interface QuizHistoryEntry {
  /** scale key → 0–100 score */
  scores: Record<string, number>;
  date: number;
}

const key = (k: string, id: string) => `${k}_${id}`;

export function getQuizProgress(id: string): QuizProgress | null {
  const p = read<QuizProgress>(key('quiz_progress', id));
  if (!p || !p.answers || typeof p.current !== 'number') return null;
  return p;
}

export function saveQuizProgress(id: string, p: QuizProgress): void {
  write(key('quiz_progress', id), p);
}

export function clearQuizProgress(id: string): void {
  try {
    localStorage.removeItem(key('quiz_progress', id));
  } catch {
    /* ignore */
  }
}

export function getQuizHistory(id: string): QuizHistoryEntry[] {
  const h = read<QuizHistoryEntry[]>(key('quiz_history', id));
  return Array.isArray(h) ? h : [];
}

export function pushQuizHistory(id: string, scores: Record<string, number>): void {
  const next = [{ scores, date: Date.now() }, ...getQuizHistory(id)].slice(0, 5);
  write(key('quiz_history', id), next);
}

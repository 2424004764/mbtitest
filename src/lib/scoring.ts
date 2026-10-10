import type { Answer, Dim, Question, QuestionBank, TestMode, TestResult } from '../data/schema';
import { DIM_ORDER, dimMeta } from '../data/dimensions';

/** Questions used by a given mode: the quick test is a marked subset of the full bank. */
export function questionsFor(bank: QuestionBank, mode: TestMode): Question[] {
  return mode === 'quick' ? bank.questions.filter((q) => q.quick) : bank.questions;
}

/**
 * Aggregate Likert answers (-3…+3, scaled by each item's direction) into per-dimension
 * percentages toward the left letter (E/S/T/J/A). Exactly 50 means a perfect tie;
 * ties resolve to the left letter, which is rare with a 7-point scale.
 */
export function scoreResult(
  questions: Question[],
  answers: Record<number, Answer>,
  mode: TestMode,
): TestResult {
  const dims = {} as Record<Dim, { leftPct: number }>;

  for (const dim of DIM_ORDER) {
    let sum = 0;
    let max = 0;
    for (const q of questions) {
      if (q.dim !== dim) continue;
      const a = answers[q.id];
      if (a === undefined) continue;
      sum += a * q.dir;
      max += 3;
    }
    const ratio = max === 0 ? 0 : sum / max; // -1 … 1
    const leftPct = Math.round(((ratio + 1) / 2) * 100);
    dims[dim] = { leftPct };
  }

  const type = ['EI', 'SN', 'TF', 'JP']
    .map((d) => letterFor(d as Dim, dims[d as Dim].leftPct))
    .join('');
  const identity = letterFor('AT', dims.AT.leftPct) === 'A' ? 'A' : 'T';

  return { type, identity, dims, mode, date: Date.now() };
}

export function letterFor(dim: Dim, leftPct: number): string {
  const meta = dimMeta(dim);
  return leftPct >= 50 ? meta.left : meta.right;
}

/** e.g. "Introverted 72%" — label and strength of the dominant side of a dimension. */
export function dominantSide(dim: Dim, leftPct: number): { letter: string; pct: number } {
  const meta = dimMeta(dim);
  const leftWins = leftPct >= 50;
  return {
    letter: leftWins ? meta.left : meta.right,
    pct: leftWins ? leftPct : 100 - leftPct,
  };
}

/**
 * Alternative type suggestion: if one of the four letters sits close to the
 * 50/50 midline (dominant side below 55%), flipping it yields a type the
 * respondent may identify with almost as strongly.
 */
export function altType(result: TestResult): { dim: Dim; otherType: string; dominantPct: number } | null {
  let best: { dim: Dim; otherType: string; dominantPct: number } | null = null;
  for (const dim of ['EI', 'SN', 'TF', 'JP'] as Dim[]) {
    const { letter, pct } = dominantSide(dim, result.dims[dim].leftPct);
    if (pct >= 55) continue;
    if (best && pct >= best.dominantPct) continue;
    const flipped = flipLetter(result.type, dim, letter);
    best = { dim, otherType: flipped, dominantPct: pct };
  }
  return best;
}

function flipLetter(type: string, dim: Dim, current: string): string {
  const meta = dimMeta(dim);
  const other = current === meta.left ? meta.right : meta.left;
  const idx = ['EI', 'SN', 'TF', 'JP'].indexOf(dim);
  return type.slice(0, idx) + other + type.slice(idx + 1);
}

import type { Lang } from './schema';
import p1 from './hints.part1.json';
import p2 from './hints.part2.json';

type Hint = { zh: string; en: string };

const HINTS: Record<string, Hint> = { ...(p1 as Record<string, Hint>), ...(p2 as Record<string, Hint>) };

/** Clarifying text shown on hover/tap of the "?" bubble next to a question. */
export function hintFor(id: number, lang: Lang): string | null {
  const h = HINTS[String(id)];
  return h ? h[lang] : null;
}

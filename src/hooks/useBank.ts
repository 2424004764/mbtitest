import { useEffect, useState } from 'react';
import type { QuestionBank, TypesData } from '../data/schema';
import { useLang } from '../i18n';
import { importWithRetry } from '../lib/retry';
import { QUIZZES, isQuizId, type AnyQuizData } from '../quizzes';

/** Per-type extras: community celebrity guesses + growth tips. */
export interface TypeExtras {
  famous: { name: string; note: string }[];
  growth: string[];
}

export function useQuestionBank(): QuestionBank | null {
  const { lang } = useLang();
  const [bank, setBank] = useState<QuestionBank | null>(null);

  useEffect(() => {
    let live = true;
    setBank(null);
    importWithRetry(() =>
      lang === 'zh' ? import('../data/questions.zh') : import('../data/questions.en'),
    ).then((m) => {
      if (live) setBank(m.default);
    });
    return () => {
      live = false;
    };
  }, [lang]);

  return bank;
}

/** Lazily loads all 16 type profiles for the current language. */
export function useTypesData(): TypesData | null {
  const { lang } = useLang();
  const [data, setData] = useState<TypesData | null>(null);

  useEffect(() => {
    let live = true;
    setData(null);
    (async () => {
      const [part1, part2] = await Promise.all([
        importWithRetry(() =>
          lang === 'zh' ? import('../data/types.part1.zh.json') : import('../data/types.part1.en.json'),
        ),
        importWithRetry(() =>
          lang === 'zh' ? import('../data/types.part2.zh.json') : import('../data/types.part2.en.json'),
        ),
      ]);
      if (live) setData({ ...(part1.default as TypesData), ...(part2.default as TypesData) });
    })();
    return () => {
      live = false;
    };
  }, [lang]);

  return data;
}

/** Lazily loads per-type extras (famous people, growth tips) for the current language. */
export function useExtrasData(): Record<string, TypeExtras> | null {
  const { lang } = useLang();
  const [data, setData] = useState<Record<string, TypeExtras> | null>(null);

  useEffect(() => {
    let live = true;
    setData(null);
    importWithRetry(() =>
      lang === 'zh' ? import('../data/extras.zh.json') : import('../data/extras.en.json'),
    ).then((m) => {
      if (live) setData(m.default as Record<string, TypeExtras>);
    });
    return () => {
      live = false;
    };
  }, [lang]);

  return data;
}

/** Lazily loads one of the non-MBTI quizzes (enneagram / bigfive / lovelang). */
export function useQuizData(id: string): AnyQuizData | null | undefined {
  const { lang } = useLang();
  const [data, setData] = useState<AnyQuizData | null>(null);

  const valid = isQuizId(id);

  useEffect(() => {
    if (!valid) return;
    let live = true;
    setData(null);
    importWithRetry(() => QUIZZES[id].load(lang)).then((m) => {
      if (live) setData(m.default);
    });
    return () => {
      live = false;
    };
  }, [valid, id, lang]);

  if (!valid) return undefined; // unknown id → let the page 404
  return data;
}

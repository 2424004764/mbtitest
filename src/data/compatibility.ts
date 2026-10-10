import type { Lang } from './schema';
import { DIMENSIONS, GROUPS } from './dimensions';
import type { Group } from './schema';

/**
 * Type-pairing analysis engine.
 *
 * Scoring rules (inspired by popular community models, simplified so every
 * result is explainable):
 * - All four letters opposite (Socionics-style "dual"): 5.0 — the other person's
 *   cognitive strengths cover your weak spots.
 * - Same middle letters (S/N + T/F): 4.5 — you gather information and make
 *   decisions the same way, so communication flows.
 * - Same type: 4.0 — deep mutual understanding, but shared blind spots.
 * - Otherwise: 4.0 / 3.5 / 3.0 by how many letters differ.
 */

export interface SharedDim {
  key: string;
  letter: string;
  label: string;
}

export interface OpposedDim {
  key: string;
  aLetter: string;
  bLetter: string;
  aLabel: string;
  bLabel: string;
}

export interface PairAnalysis {
  score: number;
  stars: number; // 3–5, half steps
  tag: string;
  paragraphs: string[];
  tips: string[];
  same: SharedDim[];
  diff: OpposedDim[];
}

const FOUR = ['EI', 'SN', 'TF', 'JP'] as const;
type FourDim = (typeof FOUR)[number];

const lettersOf = (code: string): Record<FourDim, string> => ({
  EI: code[0],
  SN: code[1],
  TF: code[2],
  JP: code[3],
});

export function groupOf(code: string): Group {
  const [, sn, tf] = code;
  if (sn === 'N' && tf === 'T') return 'analysts';
  if (sn === 'N' && tf === 'F') return 'diplomats';
  if (sn === 'S' && tf === 'T') return 'sentinels';
  return 'explorers';
}

export function pairScore(a: string, b: string): number {
  if (a === b) return 4;
  const diffCount = FOUR.filter((d) => a[FOUR.indexOf(d)] !== b[FOUR.indexOf(d)]).length;
  if (diffCount === 4) return 5;
  const sameMiddle = a[1] === b[1] && a[2] === b[2];
  if (sameMiddle) return 4.5;
  if (diffCount === 1) return 4;
  if (diffCount === 2) return 3.5;
  return 3;
}

const TAGS: { min: number; zh: string; en: string }[] = [
  { min: 5, zh: '天作之合', en: 'A near-perfect complement' },
  { min: 4.5, zh: '默契搭档', en: 'Great chemistry' },
  { min: 4, zh: '稳定同行', en: 'Steady companions' },
  { min: 3.5, zh: '互补成长', en: 'Growth through difference' },
  { min: 3, zh: '需要磨合', en: 'Worth the effort' },
];

/** Short phrase describing how the two role-groups interact, keyed by pair of groups. */
const GROUP_PAIR_NOTES: Record<string, { zh: string; en: string }> = {
  'analysts+analysts': {
    zh: '两个理性头脑相遇，话题永远不缺深度，但感情需要有人先放下"讲道理"。',
    en: 'Two rational minds meet — depth is never in short supply, but someone has to drop the debate and just feel.',
  },
  'diplomats+diplomats': {
    zh: '两个理想主义者相遇，容易一见如故，但也容易一起把现实想得太美。',
    en: 'Two idealists who click fast — and who can idealize reality together a little too easily.',
  },
  'sentinels+sentinels': {
    zh: '两个务实的人相遇，日子会被经营得井井有条，记得给计划外留一点惊喜。',
    en: 'Two pragmatists build a well-ordered life; just leave a little room for the unplanned.',
  },
  'explorers+explorers': {
    zh: '两个行动派相遇，生活永远不无聊，但账单和承诺需要有人记得。',
    en: 'Two doers — life is never boring, but someone has to remember the bills and the promises.',
  },
  'analysts+diplomats': {
    zh: '逻辑与共情相遇：一个教对方清醒，一个教对方温柔。',
    en: 'Logic meets empathy: one teaches clarity, the other teaches kindness.',
  },
  'analysts+sentinels': {
    zh: '远见与务实相遇：一个负责画蓝图，一个负责把它盖出来。',
    en: 'Vision meets execution: one draws the blueprint, the other builds it.',
  },
  'analysts+explorers': {
    zh: '策略与冲劲相遇：一个想清楚了再动，一个动起来再想。',
    en: 'Strategy meets momentum: one thinks it through, the other moves first.',
  },
  'diplomats+sentinels': {
    zh: '理想与责任相遇：一个想让世界更好，一个想先把今天过好。',
    en: 'Ideals meet duty: one wants to save the world, the other wants today handled first.',
  },
  'diplomats+explorers': {
    zh: '意义与当下相遇：一个追问为什么活，一个正活得尽兴。',
    en: 'Meaning meets the moment: one asks why we live, the other is busy living.',
  },
  'sentinels+explorers': {
    zh: '秩序与自由相遇：一个想定好计划，一个想保留惊喜。',
    en: 'Order meets freedom: one wants the plan settled, the other keeps options open.',
  },
};

const groupNote = (a: Group, b: Group, lang: Lang): string => {
  const key = a === b ? `${a}+${a}` : [a, b].sort().join('+');
  const note = GROUP_PAIR_NOTES[key];
  return note ? note[lang] : '';
};

/** Builds the full bilingual-on-demand analysis for a type pair. */
export function analyzePair(a: string, b: string, lang: Lang): PairAnalysis {
  const score = pairScore(a, b);
  const la = lettersOf(a);
  const lb = lettersOf(b);

  const same: SharedDim[] = [];
  const diff: OpposedDim[] = [];
  for (const d of FOUR) {
    const meta = DIMENSIONS.find((m) => m.key === d)!;
    if (la[d] === lb[d]) {
      same.push({
        key: d,
        letter: la[d],
        label: (la[d] === meta.left ? meta.leftLabel : meta.rightLabel)[lang],
      });
    } else {
      diff.push({
        key: d,
        aLetter: la[d],
        bLetter: lb[d],
        aLabel: (la[d] === meta.left ? meta.leftLabel : meta.rightLabel)[lang],
        bLabel: (lb[d] === meta.left ? meta.leftLabel : meta.rightLabel)[lang],
      });
    }
  }

  const tag = (TAGS.find((x) => score >= x.min) ?? TAGS[4])[lang];
  const note = groupNote(groupOf(a), groupOf(b), lang);
  const aGroup = GROUPS.find((g) => g.key === groupOf(a))!;
  const bGroup = GROUPS.find((g) => g.key === groupOf(b))!;

  const list = (items: string[]) =>
    lang === 'zh' ? items.join('、') : items.join(', ');

  const paragraphs: string[] = [];

  // Paragraph 1 — headline reading based on the score band.
  if (score >= 5) {
    paragraphs.push(
      lang === 'zh'
        ? `${a} 与 ${b} 在四个字母上完全相反，是经典意义上的"互补型"配对：一个人的弱势功能恰好是另一个人的天赋所在。你们看世界的角度截然不同，但这种不同恰好互相补位——只要彼此欣赏，几乎不需要争抢同一个位置。`
        : `${a} and ${b} differ on all four letters — a classic complementary pairing: what is effort for one is talent for the other. You see the world from opposite angles, yet those angles interlock. When there is mutual appreciation, you rarely compete for the same role.`,
    );
  } else if (same.length >= 2 && same.some((s) => s.key === 'SN') && same.some((s) => s.key === 'TF')) {
    paragraphs.push(
      lang === 'zh'
        ? `${a} 与 ${b} 在获取信息（实感/直觉）和做决定（思考/情感）上的偏好一致，这意味着你们"说同一种语言"：不需要反复解释自己为什么这么想。默契来自相似，剩下的差异更多是节奏上的互补。`
        : `${a} and ${b} share how you take in information (S/N) and how you decide (T/F) — you effectively speak the same language and rarely need to justify how you think. The rapport comes from similarity; the remaining differences are mostly a difference of rhythm.`,
    );
  } else {
    paragraphs.push(
      lang === 'zh'
        ? `${a} 与 ${b} 是一组"求同存异"的组合：相似之处让你们能理解彼此，差异之处则需要多花一点耐心。关系不是由类型决定的，而是由两个愿意理解对方的人决定的。`
        : `${a} and ${b} are a "meet in the middle" pairing: the similarities build understanding, and the differences ask for patience. Compatibility is decided less by types than by two people willing to understand each other.`,
    );
  }

  // Paragraph 2 — shared letters.
  if (same.length > 0) {
    paragraphs.push(
      lang === 'zh'
        ? `你们的共同点：${list(same.map((s) => `${s.letter}（${s.label}）`))}。在这些维度上，你们几乎不需要解释就能明白对方，天然减少了误解的空间。`
        : `What you share: ${list(same.map((s) => `${s.letter} (${s.label})`))}. On these dimensions you get each other almost without explanation, which naturally shrinks the room for misunderstanding.`,
    );
  } else {
    paragraphs.push(
      lang === 'zh'
        ? '你们在四个字母上都不相同——没有一处天然的重叠，也意味着处处都是新鲜的视角。'
        : 'You differ on every letter — no natural overlap, which also means fresh perspectives everywhere.',
    );
  }

  // Paragraph 3 — opposed letters + group flavor.
  if (diff.length > 0) {
    const paren = (s: string) => (lang === 'zh' ? `（${s}）` : ` (${s})`);
    const diffText = list(
      diff.map((d) => `${d.aLetter}/${d.bLetter}${paren(`${d.aLabel} vs ${d.bLabel}`)}`),
    );
    paragraphs.push(
      lang === 'zh'
        ? `你们的差异集中在：${diffText}。这些差异用好了是互补，用不好就是摩擦——关键在于把对方的不同当作资源而不是错误。${note}`
        : `Where you differ: ${diffText}. Handled well, these are complements; handled poorly, friction — the key is treating the difference as a resource rather than a mistake. ${note}`,
    );
  } else {
    paragraphs.push(
      lang === 'zh'
        ? `你们是同一种类型：${a}。理解彼此毫不费力，但也要小心——你们的盲点也是同一个，遇到彼此都不擅长的事，谁也拉不动谁。${note}`
        : `You are the same type: ${a}. Understanding each other is effortless, but beware — your blind spots are identical too, and neither of you can pull the other out of them. ${note}`,
    );
  }

  if (aGroup.key !== bGroup.key) {
    const strip = (s: string) => s.replace(/[.。]+$/, '');
    paragraphs.push(
      lang === 'zh'
        ? `从组别看，${a} 属于${aGroup.name.zh}——${strip(aGroup.desc.zh)}；${b} 属于${bGroup.name.zh}——${strip(bGroup.desc.zh)}。`
        : `By role group, ${a} belongs to the ${aGroup.name.en} — ${strip(aGroup.desc.en)} — while ${b} belongs to the ${bGroup.name.en}: ${strip(bGroup.desc.en)}.`,
    );
  }

  // Tips — tailored by which dims are opposed.
  const tips: string[] = [];
  const hasDiff = (k: string) => diff.some((d) => d.key === k);
  if (hasDiff('EI')) {
    tips.push(
      lang === 'zh'
        ? '社交电量不同步：提前约定"撤退信号"，外向的一方给内向的一方留出充电时间，内向的一方偶尔陪对方热闹一场。'
        : 'Different social batteries: agree on a "retreat signal" in advance. The extravert grants recharging time; the introvert occasionally joins the fun.',
    );
  }
  if (hasDiff('SN')) {
    tips.push(
      lang === 'zh'
        ? '一个讲细节与经验、一个谈概念与可能：讨论正事时，实感方多问"具体怎么做"，直觉方多给例子，别急着否定对方的思路。'
        : 'One talks details and experience, the other concepts and possibilities: when it matters, the observant side asks "how, concretely?", and the intuitive side brings examples before pitching visions.',
    );
  }
  if (hasDiff('TF')) {
    tips.push(
      lang === 'zh'
        ? '决策方式不同：思考方先共情再给方案，情感方把需求直接说出来而不是等对方猜。'
        : 'Different decision styles: the thinker names the feeling before proposing the fix; the feeler states needs out loud instead of waiting to be read.',
    );
  }
  if (hasDiff('JP')) {
    tips.push(
      lang === 'zh'
        ? '计划与随性之争：用"共享日历 + 自由额度"折中——重要的事定死，其余时间留给即兴。'
        : 'Planner vs. free spirit: split the difference with a shared calendar plus a spontaneity budget — fix what matters, improvise the rest.',
    );
  }
  if (a === b) {
    tips.push(
      lang === 'zh'
        ? '你们太像了：刻意引入"第三方视角"（不同类型的朋友、专业建议），避免在共同的盲区里越陷越深。'
        : 'You are too alike: deliberately bring in outside perspectives — friends of other types, professional advice — before sinking deeper into a shared blind spot.',
    );
  }
  if (tips.length === 0) {
    tips.push(
      lang === 'zh'
        ? '类型只提供视角，不提供答案：定期聊聊彼此的感受与需求，比任何兼容性理论都更管用。'
        : 'Types offer a lens, not an answer: regularly checking in about feelings and needs beats any compatibility theory.',
    );
  }
  tips.push(
    lang === 'zh'
      ? '把这份解析当作聊天的起点，而不是结论——真正决定关系的，永远是你们愿意为彼此花的心思。'
      : 'Treat this analysis as a conversation starter, not a verdict — what decides a relationship is always the care you invest in each other.',
  );

  return { score, stars: Math.round(score * 2) / 2, tag, paragraphs, tips, same, diff };
}

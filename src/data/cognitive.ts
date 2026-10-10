/**
 * Cognitive functions (Jungian function stack) for each of the 16 types.
 *
 * The stack order follows the widely used Grant/Brownsword model:
 * dominant → auxiliary → tertiary → inferior. The auxiliary is always the
 * opposite attitude (E/I) of the dominant, and the perceiving/judging pair
 * alternates — determined by the middle two letters and the J/P preference.
 */

export type FunctionCode = 'Ni' | 'Ne' | 'Si' | 'Se' | 'Ti' | 'Te' | 'Fi' | 'Fe';

export interface FunctionMeta {
  code: FunctionCode;
  name: { zh: string; en: string };
  desc: { zh: string; en: string };
}

export const FUNCTIONS: Record<FunctionCode, FunctionMeta> = {
  Ni: {
    code: 'Ni',
    name: { zh: '内倾直觉', en: 'Introverted Intuition' },
    desc: {
      zh: '向内收敛的直觉：在潜意识中整合信息，过滤掉干扰，最终凝结出一个关于未来的穿透性洞见。擅长预见趋势与长期走势。',
      en: 'Inward-focused intuition: synthesizes information beneath the surface and distills it into a single penetrating insight about where things are heading.',
    },
  },
  Ne: {
    code: 'Ne',
    name: { zh: '外倾直觉', en: 'Extraverted Intuition' },
    desc: {
      zh: '向外发散的直觉：从一个触发点炸开一连串可能性和联想，善于脑暴、类比与发现别人看不见的选项。',
      en: 'Outward-facing intuition: explodes one spark into a web of possibilities and analogies. Brainstorms, connects, and spots options others miss.',
    },
  },
  Si: {
    code: 'Si',
    name: { zh: '内倾实感', en: 'Introverted Sensing' },
    desc: {
      zh: '向内沉淀的实感：把亲身经历存成高保真的内部档案，重视细节、惯例与已被验证的经验，擅长维持稳定与品质。',
      en: 'Inward-focused sensing: stores lived experience as a detailed internal archive. Values precedent, routine, and proven methods.',
    },
  },
  Se: {
    code: 'Se',
    name: { zh: '外倾实感', en: 'Extraverted Sensing' },
    desc: {
      zh: '向外敞开的实感：对当下的感官世界高度敏锐，反应快、手脚利落，擅长抓住时机、随机应变、活在此时此刻。',
      en: 'Outward-facing sensing: sharply attuned to the present sensory world. Fast reflexes, reads the room, seizes the moment.',
    },
  },
  Ti: {
    code: 'Ti',
    name: { zh: '内倾思考', en: 'Introverted Thinking' },
    desc: {
      zh: '向内打磨的思考：追求一套自洽的内部逻辑框架，凡事要拆到原理层面才罢休，讲究精确与一致性。',
      en: 'Inward-focused thinking: builds an internal framework of logic, insisting every claim reduce to first principles. Prizes precision.',
    },
  },
  Te: {
    code: 'Te',
    name: { zh: '外倾思考', en: 'Extraverted Thinking' },
    desc: {
      zh: '向外执行的思考：以结果与效率为导向组织外部世界，制定标准、排布资源、推动事情落地。',
      en: 'Outward-facing thinking: organizes the external world for results — setting metrics, marshaling resources, driving execution.',
    },
  },
  Fi: {
    code: 'Fi',
    name: { zh: '内倾情感', en: 'Introverted Feeling' },
    desc: {
      zh: '向内校准的情感：以一套高度个人化的价值观衡量一切，真诚、共情深，宁可独处也不违背内心。',
      en: 'Inward-focused feeling: weighs everything against a deeply personal value compass. Authentic, quietly empathic, non-negotiable on integrity.',
    },
  },
  Fe: {
    code: 'Fe',
    name: { zh: '外倾情感', en: 'Extraverted Feeling' },
    desc: {
      zh: '向外连接的情感：天然感知并照顾群体的情绪氛围，擅长社交润滑、凝聚人心、维系和谐。',
      en: 'Outward-facing feeling: reads and tends to the emotional climate of a group. Builds rapport, harmonizes, brings people together.',
    },
  },
};

/** Per-position meaning of the 1st–4th function in a stack. */
export const STACK_ROLES: { key: 'dominant' | 'auxiliary' | 'tertiary' | 'inferior'; label: { zh: string; en: string }; desc: { zh: string; en: string } }[] = [
  {
    key: 'dominant',
    label: { zh: '主导功能', en: 'Dominant' },
    desc: {
      zh: '你最信赖、使用起来最不费力的心理过程，几乎定义了你看待世界的默认视角。',
      en: 'Your most trusted, effortless mental process — the default lens through which you see the world.',
    },
  },
  {
    key: 'auxiliary',
    label: { zh: '辅助功能', en: 'Auxiliary' },
    desc: {
      zh: '为主观视角补充平衡的第二只手，成熟后会成为你最有力的协作工具。',
      en: 'The balancing second hand that supports your dominant — your best tool for growth once matured.',
    },
  },
  {
    key: 'tertiary',
    label: { zh: '第三功能', en: 'Tertiary' },
    desc: {
      zh: '让人放松甚至有点"幼稚"的一面，压力下被过度使用时会显得僵硬或卖弄。',
      en: 'Your lighter, somewhat childlike side; under stress it shows up as rigidity or showing off.',
    },
  },
  {
    key: 'inferior',
    label: { zh: '劣势功能', en: 'Inferior' },
    desc: {
      zh: '相反态度的薄弱环节——既是你压力下的软肋，也是中年之后最大的成长入口。',
      en: 'Your weak opposite — the soft spot under pressure, and paradoxically the biggest doorway to growth.',
    },
  },
];

/** Standard Grant-model stacks for all 16 types. */
export const COGNITIVE_STACKS: Record<string, FunctionCode[]> = {
  INTJ: ['Ni', 'Te', 'Fi', 'Se'],
  INTP: ['Ti', 'Ne', 'Si', 'Fe'],
  ENTJ: ['Te', 'Ni', 'Se', 'Fi'],
  ENTP: ['Ne', 'Ti', 'Fe', 'Si'],
  INFJ: ['Ni', 'Fe', 'Ti', 'Se'],
  INFP: ['Fi', 'Ne', 'Si', 'Te'],
  ENFJ: ['Fe', 'Ni', 'Se', 'Ti'],
  ENFP: ['Ne', 'Fi', 'Te', 'Si'],
  ISTJ: ['Si', 'Te', 'Fi', 'Ne'],
  ISFJ: ['Si', 'Fe', 'Ti', 'Ne'],
  ESTJ: ['Te', 'Si', 'Ne', 'Fi'],
  ESFJ: ['Fe', 'Si', 'Ne', 'Ti'],
  ISTP: ['Ti', 'Se', 'Ni', 'Fe'],
  ISFP: ['Fi', 'Se', 'Ni', 'Te'],
  ESTP: ['Se', 'Ti', 'Fe', 'Ni'],
  ESFP: ['Se', 'Fi', 'Te', 'Ni'],
};

const FALLBACK_STACK: FunctionCode[] = ['Ni', 'Te', 'Fi', 'Se'];

export const stackFor = (code: string): FunctionCode[] => COGNITIVE_STACKS[code] ?? FALLBACK_STACK;

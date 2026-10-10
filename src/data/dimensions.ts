import type { Dim, Group } from './schema';

export interface DimMeta {
  key: Dim;
  /** Left letter & right letter of the scale */
  left: string;
  right: string;
  name: { zh: string; en: string };
  leftLabel: { zh: string; en: string };
  rightLabel: { zh: string; en: string };
  leftDesc: { zh: string; en: string };
  rightDesc: { zh: string; en: string };
}

export const DIMENSIONS: DimMeta[] = [
  {
    key: 'EI',
    left: 'E',
    right: 'I',
    name: { zh: '头脑', en: 'Mind' },
    leftLabel: { zh: '外向', en: 'Extraverted' },
    rightLabel: { zh: '内向', en: 'Introverted' },
    leftDesc: {
      zh: '外向的人从与外界的人和活动互动中获得能量，他们主动表达、反应快，喜欢在交流中梳理思路。',
      en: 'Extraverted individuals gain energy from engaging with people and activity. They think out loud, act first, and recharge in company.',
    },
    rightDesc: {
      zh: '内向的人从独处和内心世界中获得能量，他们先思考后表达，喜欢深度而非广度的社交。',
      en: 'Introverted individuals recharge through solitude and inner reflection. They think before speaking and prefer depth over breadth in connection.',
    },
  },
  {
    key: 'SN',
    left: 'S',
    right: 'N',
    name: { zh: '精力', en: 'Energy' },
    leftLabel: { zh: '实感', en: 'Observant' },
    rightLabel: { zh: '直觉', en: 'Intuitive' },
    leftDesc: {
      zh: '实感型的人关注具体、真实、当下的事物，相信经验与事实，擅长把握细节，讲求实用。',
      en: 'Observant individuals focus on what is concrete, real, and present. They trust experience and facts, excel with details, and prize practicality.',
    },
    rightDesc: {
      zh: '直觉型的人关注可能性、模式与深层含义，喜欢想象与概念，善于发现事物之间的联系。',
      en: 'Intuitive individuals are drawn to possibilities, patterns, and deeper meaning. They love ideas and abstractions, and connect dots others miss.',
    },
  },
  {
    key: 'TF',
    left: 'T',
    right: 'F',
    name: { zh: '天性', en: 'Nature' },
    leftLabel: { zh: '思考', en: 'Thinking' },
    rightLabel: { zh: '情感', en: 'Feeling' },
    leftDesc: {
      zh: '思考型的人依据逻辑与客观标准做决定，重视公平与效率，直言不讳，就事论事。',
      en: 'Thinking individuals decide by logic and objective criteria. They value fairness and efficiency, and address the problem rather than the feeling.',
    },
    rightDesc: {
      zh: '情感型的人依据价值观与对他人的影响做决定，重视和谐与共情，照顾感受，乐于付出。',
      en: 'Feeling individuals decide by values and impact on people. They value harmony and empathy, and weigh hearts as much as facts.',
    },
  },
  {
    key: 'JP',
    left: 'J',
    right: 'P',
    name: { zh: '策略', en: 'Tactics' },
    leftLabel: { zh: '判断', en: 'Judging' },
    rightLabel: { zh: '展望', en: 'Prospecting' },
    leftDesc: {
      zh: '判断型的人喜欢计划、秩序和确定性，提前安排、按时完成，追求有始有终的掌控感。',
      en: 'Judging individuals prefer plans, order, and certainty. They schedule ahead, finish early, and find comfort in closure.',
    },
    rightDesc: {
      zh: '展望型的人喜欢灵活、随机应变，保留选择的余地，享受即兴与探索带来的自由。',
      en: 'Prospecting individuals prefer flexibility and spontaneity. They keep options open, adapt on the fly, and thrive on improvisation.',
    },
  },
  {
    key: 'AT',
    left: 'A',
    right: 'T',
    name: { zh: '身份', en: 'Identity' },
    leftLabel: { zh: '自信', en: 'Assertive' },
    rightLabel: { zh: '敏感', en: 'Turbulent' },
    leftDesc: {
      zh: '自信型（-A）从容稳定，不太受外界评价影响，能承受压力，对自己和生活感到满意。',
      en: 'Assertive (-A) individuals are even-tempered and self-assured. They resist stress, shrug off opinion, and rest easy with who they are.',
    },
    rightDesc: {
      zh: '敏感型（-T）在意结果与他人反馈，追求卓越的动机更强，情绪起伏更大，成长欲旺盛。',
      en: 'Turbulent (-T) individuals are success-driven and sensitive to feedback. They feel more, push harder, and never stop refining themselves.',
    },
  },
];

export const DIM_ORDER: Dim[] = ['EI', 'SN', 'TF', 'JP', 'AT'];

export interface GroupMeta {
  key: Group;
  name: { zh: string; en: string };
  desc: { zh: string; en: string };
  color: string;
}

export const GROUPS: GroupMeta[] = [
  {
    key: 'analysts',
    name: { zh: '分析家', en: 'Analysts' },
    desc: {
      zh: '理性、独立、永远在追问"为什么"的策略思考者。',
      en: 'Rational, independent strategists who never stop asking why.',
    },
    color: '#6a63e8',
  },
  {
    key: 'diplomats',
    name: { zh: '外交家', en: 'Diplomats' },
    desc: {
      zh: '温暖、理想主义、以价值观和意义为罗盘的共情者。',
      en: 'Warm, idealistic empaths guided by values and meaning.',
    },
    color: '#2aa392',
  },
  {
    key: 'sentinels',
    name: { zh: '守卫者', en: 'Sentinels' },
    desc: {
      zh: '务实、可靠、把责任与秩序视为底线的执行者。',
      en: 'Practical, dependable doers who prize order and duty.',
    },
    color: '#d9a424',
  },
  {
    key: 'explorers',
    name: { zh: '探险家', en: 'Explorers' },
    desc: {
      zh: '机敏、活在当下、善于随机应变的行动派。',
      en: 'Quick, present-focused experimenters who act on opportunity.',
    },
    color: '#e0685c',
  },
];

/** Theme color per type, keyed by type code */
export const TYPE_COLORS: Record<string, string> = {
  INTJ: '#5a55d8',
  INTP: '#7b74ea',
  ENTJ: '#4640b8',
  ENTP: '#948ef4',
  INFJ: '#1d9c8c',
  INFP: '#35b39d',
  ENFJ: '#128577',
  ENFP: '#52c4a9',
  ISTJ: '#c2951f',
  ISFJ: '#d4a83a',
  ESTJ: '#a3770e',
  ESFJ: '#e0b64e',
  ISTP: '#d05f4e',
  ISFP: '#e0708a',
  ESTP: '#bf4a3c',
  ESFP: '#ec8b5f',
};

export const ALL_TYPES = [
  'INTJ',
  'INTP',
  'ENTJ',
  'ENTP',
  'INFJ',
  'INFP',
  'ENFJ',
  'ENFP',
  'ISTJ',
  'ISFJ',
  'ESTJ',
  'ESFJ',
  'ISTP',
  'ISFP',
  'ESTP',
  'ESFP',
] as const;

export const typeColor = (code: string): string => TYPE_COLORS[code] ?? '#5b5bd6';

export const groupMeta = (key: Group): GroupMeta =>
  GROUPS.find((g) => g.key === key) ?? GROUPS[0];

export const dimMeta = (key: Dim): DimMeta =>
  DIMENSIONS.find((d) => d.key === key) ?? DIMENSIONS[0];

export type Dim = 'EI' | 'SN' | 'TF' | 'JP' | 'AT';
export type Group = 'analysts' | 'diplomats' | 'sentinels' | 'explorers';
export type Lang = 'zh' | 'en';
export type TestMode = 'quick' | 'full';
/** Likert answer: -3 (strongly disagree) … +3 (strongly agree) */
export type Answer = number;

export interface Question {
  id: number;
  text: string;
  dim: Dim;
  /** +1: agreement pushes toward the left letter (E/S/T/J/A); -1 toward the right letter */
  dir: 1 | -1;
  /** Included in the 28-question quick test */
  quick: boolean;
}

export interface QuestionBank {
  questions: Question[];
}

export interface TypeInfo {
  code: string;
  name: string;
  tagline: string;
  group: Group;
  /** Approximate share of global population, percent */
  population: number;
  overview: string[];
  strengths: string[];
  weaknesses: string[];
  careers: string[];
  relationship: string;
  variantA: string;
  variantT: string;
}

export type TypesData = Record<string, TypeInfo>;

export interface DimScore {
  /** 0–100, percentage toward the left letter of the dimension */
  leftPct: number;
}

export interface TestResult {
  /** 4-letter type, e.g. "INTJ" */
  type: string;
  /** Identity variant: A (assertive) or T (turbulent) */
  identity: 'A' | 'T';
  dims: Record<Dim, DimScore>;
  mode: TestMode;
  date: number;
}

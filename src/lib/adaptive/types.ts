export interface CharStat {
  key_char: string;
  correct_count: number;
  error_count: number;
  total_count: number;
  total_latency_ms: number;
  last_seen?: string;
}

export interface ComboStat {
  combo: string;
  correct_count: number;
  error_count: number;
  total_count: number;
  last_seen?: string;
}

export interface DifficultWord {
  word: string;
  correct_count: number;
  error_count: number;
  total_count: number;
  last_seen?: string;
}

export interface CharStatsPayload {
  chars: Array<{ key: string; correct: number; errors: number; total: number; latency: number }>;
  combos: Array<{ combo: string; correct: number; errors: number; total: number }>;
  words: Array<{ word: string; correct: number; errors: number; total: number }>;
}

export type SkillTier = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
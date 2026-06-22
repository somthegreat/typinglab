import { commonWords } from '@/data/words';
import type { CharStat, DifficultWord } from './types';
import { charWeaknessScore } from './engine';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

export type Difficulty = 1 | 2 | 3 | 4 | 5;

const LENGTH_BY_DIFFICULTY: Record<Difficulty, number> = {
  1: 25,
  2: 40,
  3: 55,
  4: 70,
  5: 90,
};

export interface AdaptiveExerciseOpts {
  stats: CharStat[];
  difficultWords?: DifficultWord[];
  difficulty?: Difficulty;
  length?: number;
}

function weightedPick<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function buildLetterPool(stats: CharStat[]): { letters: string[]; weights: number[] } {
  const statMap = new Map(stats.map((s) => [s.key_char.toLowerCase(), s]));
  const weights: number[] = [];
  for (const ch of ALPHABET) {
    const s = statMap.get(ch);
    if (!s || s.total_count < 5) {
      weights.push(2); // neutral / unseen
    } else {
      const score = charWeaknessScore(s);
      const acc = s.correct_count / Math.max(1, s.total_count);
      if (acc >= 0.98 && s.total_count >= 50) weights.push(0.5); // mastered
      else weights.push(1 + score * 8); // weak letters weighted heavily
    }
  }
  return { letters: ALPHABET, weights };
}

function pickWordContaining(target: string): string {
  const pool = commonWords.filter((w) => w.includes(target));
  if (pool.length === 0) return target.repeat(3);
  return pool[Math.floor(Math.random() * pool.length)];
}

function makePseudoWord(letters: string[], weights: number[], len: number): string {
  let w = '';
  for (let i = 0; i < len; i++) w += weightedPick(letters, weights);
  return w;
}

export function generateAdaptiveExercise(opts: AdaptiveExerciseOpts): string {
  const difficulty = (opts.difficulty ?? 2) as Difficulty;
  const targetLen = opts.length ?? LENGTH_BY_DIFFICULTY[difficulty];
  const { letters, weights } = buildLetterPool(opts.stats);

  const top = [...opts.stats]
    .filter((s) => s.total_count >= 10)
    .sort((a, b) => charWeaknessScore(b) - charWeaknessScore(a))
    .slice(0, 5)
    .map((s) => s.key_char.toLowerCase());

  const difficult = (opts.difficultWords ?? []).slice(0, 10).map((d) => d.word);

  const out: string[] = [];
  let total = 0;
  while (total < targetLen) {
    const r = Math.random();
    let word: string;
    if (difficult.length && r < 0.15) {
      word = difficult[Math.floor(Math.random() * difficult.length)];
    } else if (top.length && r < 0.55) {
      word = pickWordContaining(top[Math.floor(Math.random() * top.length)]);
    } else if (r < 0.8) {
      word = commonWords[Math.floor(Math.random() * commonWords.length)];
    } else {
      const wlen = 3 + Math.floor(Math.random() * 4);
      word = makePseudoWord(letters, weights, wlen);
    }
    out.push(word);
    total += word.length + 1;
  }
  return out.join(' ');
}

export function adjustDifficulty(current: Difficulty, recentAccuracy: number): Difficulty {
  if (recentAccuracy >= 95 && current < 5) return (current + 1) as Difficulty;
  if (recentAccuracy < 85 && current > 1) return (current - 1) as Difficulty;
  return current;
}

export function exerciseLength(d: Difficulty): number {
  return LENGTH_BY_DIFFICULTY[d];
}
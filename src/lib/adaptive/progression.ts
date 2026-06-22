import type { SkillTier } from './types';

export const TIERS: SkillTier[] = ['beginner', 'intermediate', 'advanced', 'expert', 'master'];

export const TIER_LABEL: Record<SkillTier, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
  master: 'Master',
};

export const TIER_COLOR: Record<SkillTier, string> = {
  beginner: 'text-emerald-400',
  intermediate: 'text-sky-400',
  advanced: 'text-violet-400',
  expert: 'text-amber-400',
  master: 'text-pink-400',
};

/**
 * Combined skill score: WPM * accuracy bonus + mastered-letter bonus.
 * 0..100 normalized.
 */
export function skillScore(opts: { wpm: number; accuracy: number; masteredLetters: number }): number {
  const wpmComp = Math.min(100, opts.wpm) * (opts.accuracy / 100); // 0..100
  const masteryComp = Math.min(20, opts.masteredLetters); // 0..20 (extra credit)
  return Math.min(100, wpmComp + masteryComp);
}

export function tierFromScore(score: number): SkillTier {
  if (score >= 85) return 'master';
  if (score >= 65) return 'expert';
  if (score >= 45) return 'advanced';
  if (score >= 25) return 'intermediate';
  return 'beginner';
}

export function nextTier(t: SkillTier): SkillTier | null {
  const i = TIERS.indexOf(t);
  return i < TIERS.length - 1 ? TIERS[i + 1] : null;
}

export function progressToNext(score: number): number {
  const thresholds = [0, 25, 45, 65, 85, 100];
  for (let i = 0; i < thresholds.length - 1; i++) {
    if (score >= thresholds[i] && score < thresholds[i + 1]) {
      return ((score - thresholds[i]) / (thresholds[i + 1] - thresholds[i])) * 100;
    }
  }
  return 100;
}
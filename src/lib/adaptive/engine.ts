import type { CharStat, ComboStat, DifficultWord } from './types';

const MIN_SAMPLES = 10;
const MASTERY_SAMPLES = 50;
const MASTERY_ACCURACY = 0.98;

export function charAccuracy(s: CharStat): number {
  return s.total_count > 0 ? s.correct_count / s.total_count : 1;
}

export function charAvgLatency(s: CharStat): number {
  return s.total_count > 0 ? s.total_latency_ms / s.total_count : 0;
}

/** Higher = worse. Weighted: 60% errors, 30% slowness, 10% recency. */
export function charWeaknessScore(s: CharStat, slowBaselineMs = 220): number {
  if (s.total_count === 0) return 0.5;
  const errorRate = s.error_count / s.total_count;
  const avgLat = charAvgLatency(s);
  const slowness = Math.max(0, Math.min(1, (avgLat - slowBaselineMs) / 400));
  const daysSince = s.last_seen ? Math.max(0, (Date.now() - new Date(s.last_seen).getTime()) / 86_400_000) : 30;
  const recency = Math.min(1, daysSince / 14);
  return errorRate * 0.6 + slowness * 0.3 + recency * 0.1;
}

export function getWeakLetters(stats: CharStat[], n = 5): CharStat[] {
  return [...stats]
    .filter((s) => s.total_count >= MIN_SAMPLES)
    .sort((a, b) => charWeaknessScore(b) - charWeaknessScore(a))
    .slice(0, n);
}

export function getStrongestLetters(stats: CharStat[], n = 5): CharStat[] {
  return [...stats]
    .filter((s) => s.total_count >= MIN_SAMPLES)
    .sort((a, b) => charAccuracy(b) - charAccuracy(a))
    .slice(0, n);
}

export function getMasteredLetters(stats: CharStat[]): CharStat[] {
  return stats.filter((s) => s.total_count >= MASTERY_SAMPLES && charAccuracy(s) >= MASTERY_ACCURACY);
}

export function getWeakBigrams(combos: ComboStat[], n = 8): ComboStat[] {
  return [...combos]
    .filter((c) => c.total_count >= MIN_SAMPLES)
    .sort((a, b) => b.error_count / Math.max(1, b.total_count) - a.error_count / Math.max(1, a.total_count))
    .slice(0, n);
}

export function getDifficultWords(words: DifficultWord[], n = 10): DifficultWord[] {
  return [...words]
    .filter((w) => w.total_count >= 2 && w.error_count > 0)
    .sort((a, b) => b.error_count / Math.max(1, b.total_count) - a.error_count / Math.max(1, a.total_count))
    .slice(0, n);
}

/** Compare last-7-days slice vs prior period to find improvements. */
export function getMostImproved(prev: CharStat[], curr: CharStat[], n = 5) {
  const prevMap = new Map(prev.map((s) => [s.key_char, s]));
  const deltas = curr
    .map((c) => {
      const p = prevMap.get(c.key_char);
      if (!p) return null;
      const delta = charWeaknessScore(p) - charWeaknessScore(c);
      return { key: c.key_char, delta };
    })
    .filter((x): x is { key: string; delta: number } => !!x && x.delta > 0);
  return deltas.sort((a, b) => b.delta - a.delta).slice(0, n);
}
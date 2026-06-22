import type { CharStatsPayload } from './types';

/**
 * Build a per-character + bigram + word payload from a completed run.
 * keyTimestamps[i] = timestamp (ms) the user pressed the i-th expected char.
 */
export function buildPayload(params: {
  targetText: string;
  errors: Set<number>;
  keyTimestamps: number[];
}): CharStatsPayload {
  const { targetText, errors, keyTimestamps } = params;
  const charMap = new Map<string, { correct: number; errors: number; total: number; latency: number }>();
  const comboMap = new Map<string, { correct: number; errors: number; total: number }>();
  const wordMap = new Map<string, { correct: number; errors: number; total: number }>();

  const upserts = (m: typeof charMap, key: string) => {
    let v = m.get(key);
    if (!v) {
      v = { correct: 0, errors: 0, total: 0, latency: 0 } as any;
      m.set(key, v);
    }
    return v;
  };

  // chars
  for (let i = 0; i < targetText.length; i++) {
    const ch = targetText[i];
    if (!ch || ch === ' ') continue;
    const key = ch.toLowerCase();
    const slot = upserts(charMap, key);
    slot.total += 1;
    if (errors.has(i)) slot.errors += 1;
    else slot.correct += 1;
    if (i > 0 && keyTimestamps[i] && keyTimestamps[i - 1]) {
      const dt = keyTimestamps[i] - keyTimestamps[i - 1];
      if (dt > 20 && dt < 3000) slot.latency += dt;
    }
  }

  // bigrams
  for (let i = 0; i < targetText.length - 1; i++) {
    const bg = (targetText[i] + targetText[i + 1]).toLowerCase();
    if (/\s/.test(bg)) continue;
    const slot = comboMap.get(bg) ?? { correct: 0, errors: 0, total: 0 };
    slot.total += 1;
    if (errors.has(i) || errors.has(i + 1)) slot.errors += 1;
    else slot.correct += 1;
    comboMap.set(bg, slot);
  }

  // words (mistyped only counted as error word)
  const words = targetText.split(/\s+/);
  let cursor = 0;
  for (const w of words) {
    if (!w) {
      cursor += 1;
      continue;
    }
    let hadError = false;
    for (let j = 0; j < w.length; j++) {
      if (errors.has(cursor + j)) {
        hadError = true;
        break;
      }
    }
    const key = w.toLowerCase().slice(0, 64);
    const slot = wordMap.get(key) ?? { correct: 0, errors: 0, total: 0 };
    slot.total += 1;
    if (hadError) slot.errors += 1;
    else slot.correct += 1;
    wordMap.set(key, slot);
    cursor += w.length + 1;
  }

  return {
    chars: Array.from(charMap.entries()).map(([key, v]) => ({ key, ...v })),
    combos: Array.from(comboMap.entries()).map(([combo, v]) => ({ combo, ...v })),
    words: Array.from(wordMap.entries()).map(([word, v]) => ({ word, ...v })),
  };
}

const LOCAL_KEY = 'typinglab.adaptive.local';

export function saveLocalChars(userKey: string, payload: CharStatsPayload) {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[userKey] = payload;
    localStorage.setItem(LOCAL_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function loadLocalChars(userKey: string): CharStatsPayload | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    return map[userKey] ?? null;
  } catch {
    return null;
  }
}
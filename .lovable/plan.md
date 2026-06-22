# Adaptive Learning Platform – Plan

Turn TypingLab into a Keybr-style adaptive tutor on top of the existing typing engine, weak-keys data, AI coach, and Lovable Cloud backend.

## 1. Per-character performance tracking
Extend the existing `weak_keys` table and add a new `key_combinations` table to capture bigrams/trigrams.

Each completed test/lesson/practice run will, in a single batched call, update for every typed character:
- correct count, error count, total attempts
- rolling mean inter-keystroke latency (ms) → derived per-char WPM
- last_seen timestamp (for decay)

A new `difficult_words` table stores words the user mistyped (word + error rate + last seen).

## 2. Weakness detection engine (`src/lib/adaptive/`)
Pure TS module that ranks keys/bigrams/words using a weighted score:
`score = errorRate * 0.6 + slowness * 0.3 + recency * 0.1`

Exports:
- `getWeakLetters(stats, n)`
- `getWeakBigrams(stats, n)`
- `getDifficultWords(stats, n)`
- `getMasteredLetters(stats)` (accuracy ≥ 98% over ≥ 50 attempts)

## 3. Personalized exercise generator
`generateAdaptiveExercise({ stats, difficulty, length })`:
- Builds a weighted alphabet pool: weak letters weighted ~5×, neutral 2×, mastered 0.5×.
- Assembles pseudo-words from that pool, mixed with real words from `src/data/words.ts` that contain target letters/bigrams.
- Injects user's top difficult words at ~15% frequency.
- Output length scales with difficulty.

## 4. Skill progression
Replace current tier logic (bronze/silver/gold/diamond) with:
Beginner → Intermediate → Advanced → Expert → Master
Thresholds based on combined WPM + accuracy + mastered-letter count. Migration converts existing `skill_tier` values.

## 5. Adaptive difficulty controller
Per-session state tracks rolling accuracy over last 3 exercises:
- > 95% → bump difficulty (longer, more weak letters, add bigrams/punctuation)
- < 85% → drop difficulty (shorter, fewer new letters)
- Adjusts exercise length 20 → 80 chars dynamically.

## 6. Analytics
New `/learn/analytics` view with Recharts:
- WPM over time
- Accuracy over time
- Top weakest keys (bar)
- Most-improved keys (compare last 7d vs prior 7d)
- Streak calendar (reuse `PracticeStreaksCalendar`)
- Daily attempts chart

## 7. Personalized dashboard (`/learn`)
New page becomes the main learning hub:
- Current level + progress bar to next tier
- Live WPM / accuracy cards
- Weakest 5 letters + Strongest 5 letters
- Trend sparkline (last 14 days)
- Big "Start Adaptive Session" CTA
- AI coach summary card (top recommendation)

## 8. AI Coach upgrade
Extend existing `ai-assistant` edge function with a new `mode: "coach"`:
- Sends user's aggregated stats (weak keys, bigrams, recent WPM/accuracy trend, mastered letters).
- Returns: short analysis, 3 personalized recommendations, suggested next drill, explanation of most common mistake pattern.
- Uses `google/gemini-3-flash-preview` via Lovable AI Gateway.
- Surfaced on dashboard + dedicated `/learn/coach` panel.

## 9. Adaptive Session UI (`/learn/session`)
Wraps existing `useTypingTest` hook:
- Generates exercise from adaptive engine
- After each exercise: shows mini-stats, updates per-char tracking via RPC, asks engine for next difficulty, auto-loads next exercise.
- "Press any button to start" prompt (matches existing convention).

## 10. Data architecture
- Server of truth: Lovable Cloud (existing). RLS per user.
- Local cache: `localStorage` mirror keyed by user id for instant load + offline; sync on reconnect.
- All new tables get GRANTs + RLS scoped to `auth.uid()`.
- New RPC `record_char_stats(payload jsonb)` accepts a batch of per-char + bigram updates so one test = one round-trip.

## 11. Branding & nav
- Keep TypingLab name, glassmorphism, Inter/JetBrains Mono.
- Add "Learn" entry to the navbar (desktop dropdown + mobile sheet) pointing to `/learn`, becomes the primary CTA on the home page above "Start Test".
- Existing Test / Lessons / Games / Practice pages stay; they also feed the same per-char tracking so the adaptive engine learns from everything.

## Technical summary
- New tables: `key_combinations`, `difficult_words`, `char_stats` (extends `weak_keys` with speed/latency); migration + GRANTs + RLS.
- New RPCs: `record_char_stats`, updated tier calculation in `record_test_result`.
- New module: `src/lib/adaptive/{engine.ts, generator.ts, difficulty.ts, progression.ts}`.
- New hooks: `useCharStats`, `useAdaptiveSession`, `useAICoach`.
- New pages: `src/pages/Learn.tsx`, `src/pages/LearnSession.tsx`, `src/pages/LearnAnalytics.tsx`, `src/pages/LearnCoach.tsx`.
- Edge function update: `supabase/functions/ai-assistant/index.ts` adds coach mode.
- Tracking hook injected into `TypingTest`, `LessonPractice`, `DailyChallenge`, `CustomTypingTest`, `Practice`, `FocusMode`.

This is a large build; I'll ship it in one pass once you approve.

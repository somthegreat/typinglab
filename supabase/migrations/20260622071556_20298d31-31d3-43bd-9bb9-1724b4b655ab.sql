
-- char_stats: per-character performance
CREATE TABLE public.char_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_char TEXT NOT NULL,
  correct_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  total_count INTEGER NOT NULL DEFAULT 0,
  total_latency_ms BIGINT NOT NULL DEFAULT 0,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, key_char)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.char_stats TO authenticated;
GRANT ALL ON public.char_stats TO service_role;
ALTER TABLE public.char_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own char stats" ON public.char_stats
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_char_stats_updated BEFORE UPDATE ON public.char_stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- key_combinations: bigrams/trigrams
CREATE TABLE public.key_combinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  combo TEXT NOT NULL,
  correct_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  total_count INTEGER NOT NULL DEFAULT 0,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, combo)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.key_combinations TO authenticated;
GRANT ALL ON public.key_combinations TO service_role;
ALTER TABLE public.key_combinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own key combinations" ON public.key_combinations
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_key_combinations_updated BEFORE UPDATE ON public.key_combinations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- difficult_words
CREATE TABLE public.difficult_words (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  correct_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  total_count INTEGER NOT NULL DEFAULT 0,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, word)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.difficult_words TO authenticated;
GRANT ALL ON public.difficult_words TO service_role;
ALTER TABLE public.difficult_words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own difficult words" ON public.difficult_words
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_difficult_words_updated BEFORE UPDATE ON public.difficult_words
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Batch upsert RPC
CREATE OR REPLACE FUNCTION public.record_char_stats(p_payload jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_char jsonb;
  v_combo jsonb;
  v_word jsonb;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_payload ? 'chars' THEN
    FOR v_char IN SELECT * FROM jsonb_array_elements(p_payload->'chars') LOOP
      INSERT INTO public.char_stats (user_id, key_char, correct_count, error_count, total_count, total_latency_ms)
      VALUES (
        v_user_id,
        LEFT((v_char->>'key')::text, 4),
        GREATEST(0, COALESCE((v_char->>'correct')::int, 0)),
        GREATEST(0, COALESCE((v_char->>'errors')::int, 0)),
        GREATEST(0, COALESCE((v_char->>'total')::int, 0)),
        GREATEST(0, COALESCE((v_char->>'latency')::bigint, 0))
      )
      ON CONFLICT (user_id, key_char) DO UPDATE SET
        correct_count = char_stats.correct_count + EXCLUDED.correct_count,
        error_count = char_stats.error_count + EXCLUDED.error_count,
        total_count = char_stats.total_count + EXCLUDED.total_count,
        total_latency_ms = char_stats.total_latency_ms + EXCLUDED.total_latency_ms,
        last_seen = now();
    END LOOP;
  END IF;

  IF p_payload ? 'combos' THEN
    FOR v_combo IN SELECT * FROM jsonb_array_elements(p_payload->'combos') LOOP
      INSERT INTO public.key_combinations (user_id, combo, correct_count, error_count, total_count)
      VALUES (
        v_user_id,
        LEFT((v_combo->>'combo')::text, 8),
        GREATEST(0, COALESCE((v_combo->>'correct')::int, 0)),
        GREATEST(0, COALESCE((v_combo->>'errors')::int, 0)),
        GREATEST(0, COALESCE((v_combo->>'total')::int, 0))
      )
      ON CONFLICT (user_id, combo) DO UPDATE SET
        correct_count = key_combinations.correct_count + EXCLUDED.correct_count,
        error_count = key_combinations.error_count + EXCLUDED.error_count,
        total_count = key_combinations.total_count + EXCLUDED.total_count,
        last_seen = now();
    END LOOP;
  END IF;

  IF p_payload ? 'words' THEN
    FOR v_word IN SELECT * FROM jsonb_array_elements(p_payload->'words') LOOP
      INSERT INTO public.difficult_words (user_id, word, correct_count, error_count, total_count)
      VALUES (
        v_user_id,
        LEFT((v_word->>'word')::text, 64),
        GREATEST(0, COALESCE((v_word->>'correct')::int, 0)),
        GREATEST(0, COALESCE((v_word->>'errors')::int, 0)),
        GREATEST(0, COALESCE((v_word->>'total')::int, 0))
      )
      ON CONFLICT (user_id, word) DO UPDATE SET
        correct_count = difficult_words.correct_count + EXCLUDED.correct_count,
        error_count = difficult_words.error_count + EXCLUDED.error_count,
        total_count = difficult_words.total_count + EXCLUDED.total_count,
        last_seen = now();
    END LOOP;
  END IF;
END;
$$;

-- Migrate existing tier labels to Beginner/Intermediate/Advanced/Expert/Master
UPDATE public.profiles SET skill_tier = CASE
  WHEN skill_tier = 'bronze' THEN 'beginner'
  WHEN skill_tier = 'silver' THEN 'intermediate'
  WHEN skill_tier = 'gold' THEN 'advanced'
  WHEN skill_tier = 'diamond' THEN 'expert'
  ELSE COALESCE(skill_tier, 'beginner')
END;

-- Update the XP tier function
CREATE OR REPLACE FUNCTION public.update_user_xp(p_xp_amount integer)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_current_xp INTEGER;
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_new_tier TEXT;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF p_xp_amount <= 0 THEN RAISE EXCEPTION 'XP amount must be positive'; END IF;
  IF p_xp_amount > 1000 THEN RAISE EXCEPTION 'XP amount exceeds per-call limit'; END IF;

  SELECT COALESCE(xp, 0) INTO v_current_xp FROM public.profiles WHERE user_id = v_user_id;
  v_new_xp := v_current_xp + p_xp_amount;
  v_new_level := GREATEST(1, (v_new_xp / 1000) + 1);
  v_new_tier := CASE
    WHEN v_new_level >= 50 THEN 'master'
    WHEN v_new_level >= 30 THEN 'expert'
    WHEN v_new_level >= 15 THEN 'advanced'
    WHEN v_new_level >= 5 THEN 'intermediate'
    ELSE 'beginner'
  END;

  UPDATE public.profiles SET xp = v_new_xp, level = v_new_level, skill_tier = v_new_tier
  WHERE user_id = v_user_id;
END;
$$;


-- 1. FRIENDSHIPS: only recipient can accept pending requests
DROP POLICY IF EXISTS "Users can update their own friendships" ON public.friendships;

CREATE POLICY "Recipient can accept pending friend request"
ON public.friendships
FOR UPDATE
TO authenticated
USING (auth.uid() = friend_id AND status = 'pending')
WITH CHECK (auth.uid() = friend_id AND status IN ('accepted', 'rejected'));

-- 2. PROFILES: restrict column-level UPDATE to non-stat columns only
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Recreate policy (still owner-scoped) but combined with column grants below
CREATE POLICY "Users can update own profile preferences"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Revoke broad UPDATE then grant only to safe (non-stat) columns
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (
  username,
  avatar_url,
  theme,
  sound_enabled,
  font_size,
  line_height,
  high_contrast,
  reduced_motion,
  screen_reader_mode,
  updated_at
) ON public.profiles TO authenticated;

-- 3. Server-side function to record a test result and update stats safely
CREATE OR REPLACE FUNCTION public.record_test_result(
  p_wpm integer,
  p_raw_wpm integer,
  p_accuracy numeric,
  p_correct_chars integer,
  p_incorrect_chars integer,
  p_total_chars integer,
  p_test_mode text,
  p_test_duration integer,
  p_word_count integer,
  p_text_content text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_result_id uuid;
  v_profile public.profiles%ROWTYPE;
  v_today date := CURRENT_DATE;
  v_yesterday date := CURRENT_DATE - INTERVAL '1 day';
  v_new_streak integer;
  v_word_count integer;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validation / anti-cheat bounds
  IF p_wpm < 0 OR p_wpm > 300 THEN
    RAISE EXCEPTION 'WPM out of valid range';
  END IF;
  IF p_raw_wpm < 0 OR p_raw_wpm > 400 THEN
    RAISE EXCEPTION 'Raw WPM out of valid range';
  END IF;
  IF p_accuracy < 0 OR p_accuracy > 100 THEN
    RAISE EXCEPTION 'Accuracy out of valid range';
  END IF;
  IF p_correct_chars < 0 OR p_incorrect_chars < 0 OR p_total_chars < 0 THEN
    RAISE EXCEPTION 'Character counts must be non-negative';
  END IF;
  IF p_total_chars > 100000 THEN
    RAISE EXCEPTION 'Total chars exceeds limit';
  END IF;
  IF p_test_duration IS NOT NULL AND (p_test_duration < 0 OR p_test_duration > 7200) THEN
    RAISE EXCEPTION 'Test duration out of range';
  END IF;

  INSERT INTO public.test_results (
    user_id, wpm, raw_wpm, accuracy, correct_chars, incorrect_chars,
    total_chars, test_mode, test_duration, word_count, text_content
  ) VALUES (
    v_user_id, p_wpm, p_raw_wpm, p_accuracy, p_correct_chars, p_incorrect_chars,
    p_total_chars, p_test_mode, p_test_duration, p_word_count,
    LEFT(COALESCE(p_text_content, ''), 500)
  )
  RETURNING id INTO v_result_id;

  SELECT * INTO v_profile FROM public.profiles WHERE user_id = v_user_id;
  IF NOT FOUND THEN
    RETURN v_result_id;
  END IF;

  v_new_streak := COALESCE(v_profile.current_streak, 0);
  IF v_profile.last_practice_date = v_yesterday THEN
    v_new_streak := v_new_streak + 1;
  ELSIF v_profile.last_practice_date IS DISTINCT FROM v_today THEN
    v_new_streak := 1;
  END IF;

  v_word_count := FLOOR(p_total_chars / 5.0);

  UPDATE public.profiles SET
    best_wpm = GREATEST(COALESCE(best_wpm, 0), p_wpm),
    best_accuracy = GREATEST(COALESCE(best_accuracy, 0), p_accuracy),
    total_tests_completed = COALESCE(total_tests_completed, 0) + 1,
    total_words_typed = COALESCE(total_words_typed, 0) + v_word_count,
    current_streak = v_new_streak,
    longest_streak = GREATEST(COALESCE(longest_streak, 0), v_new_streak),
    last_practice_date = v_today
  WHERE user_id = v_user_id;

  RETURN v_result_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.record_test_result(integer, integer, numeric, integer, integer, integer, text, integer, integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_test_result(integer, integer, numeric, integer, integer, integer, text, integer, integer, text) TO authenticated;

-- 4. Block direct INSERT to test_results (force via RPC)
DROP POLICY IF EXISTS "Users can insert own test results" ON public.test_results;
CREATE POLICY "Block direct inserts to test_results"
ON public.test_results
AS RESTRICTIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (false);


-- 1. race_participants INSERT must enforce auth.uid() = user_id
DROP POLICY IF EXISTS "Authenticated users can join races" ON public.race_participants;
CREATE POLICY "Authenticated users can join races"
ON public.race_participants
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 2. races INSERT must enforce auth.uid() = host_id
DROP POLICY IF EXISTS "Authenticated users can create races" ON public.races;
CREATE POLICY "Authenticated users can create races"
ON public.races
FOR INSERT
WITH CHECK (auth.uid() = host_id);

-- 3. user_achievements: lock down direct inserts; use SECURITY DEFINER RPC
DROP POLICY IF EXISTS "Users can insert own achievements" ON public.user_achievements;

CREATE OR REPLACE FUNCTION public.award_achievement(p_achievement_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_req_type text;
  v_req_value integer;
  v_profile public.profiles%ROWTYPE;
  v_qualifies boolean := false;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT requirement_type, requirement_value
    INTO v_req_type, v_req_value
  FROM public.achievements
  WHERE id = p_achievement_id;

  IF v_req_type IS NULL THEN
    RAISE EXCEPTION 'Achievement not found';
  END IF;

  -- Already earned? no-op
  IF EXISTS (
    SELECT 1 FROM public.user_achievements
    WHERE user_id = v_user_id AND achievement_id = p_achievement_id
  ) THEN
    RETURN false;
  END IF;

  SELECT * INTO v_profile FROM public.profiles WHERE user_id = v_user_id;

  IF v_req_type = 'wpm' THEN
    v_qualifies := COALESCE(v_profile.best_wpm, 0) >= v_req_value;
  ELSIF v_req_type = 'accuracy' THEN
    v_qualifies := COALESCE(v_profile.best_accuracy, 0) >= v_req_value;
  ELSIF v_req_type = 'tests_completed' THEN
    v_qualifies := COALESCE(v_profile.total_tests_completed, 0) >= v_req_value;
  ELSIF v_req_type = 'words_typed' THEN
    v_qualifies := COALESCE(v_profile.total_words_typed, 0) >= v_req_value;
  ELSIF v_req_type = 'streak' THEN
    v_qualifies := COALESCE(v_profile.current_streak, 0) >= v_req_value;
  END IF;

  IF NOT v_qualifies THEN
    RAISE EXCEPTION 'Achievement requirements not met';
  END IF;

  INSERT INTO public.user_achievements (user_id, achievement_id)
  VALUES (v_user_id, p_achievement_id)
  ON CONFLICT DO NOTHING;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.award_achievement(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.award_achievement(uuid) TO authenticated;

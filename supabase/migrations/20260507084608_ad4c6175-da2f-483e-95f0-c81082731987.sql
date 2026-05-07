-- Cap XP per call on both overloads
CREATE OR REPLACE FUNCTION public.update_user_xp(p_xp_amount integer)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_current_xp INTEGER;
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_new_tier TEXT;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_xp_amount <= 0 THEN
    RAISE EXCEPTION 'XP amount must be positive';
  END IF;

  IF p_xp_amount > 1000 THEN
    RAISE EXCEPTION 'XP amount exceeds per-call limit';
  END IF;

  SELECT COALESCE(xp, 0) INTO v_current_xp
  FROM public.profiles
  WHERE user_id = v_user_id;

  v_new_xp := v_current_xp + p_xp_amount;
  v_new_level := GREATEST(1, (v_new_xp / 1000) + 1);
  v_new_tier := CASE
    WHEN v_new_level >= 50 THEN 'diamond'
    WHEN v_new_level >= 30 THEN 'gold'
    WHEN v_new_level >= 15 THEN 'silver'
    ELSE 'bronze'
  END;

  UPDATE public.profiles
  SET xp = v_new_xp, level = v_new_level, skill_tier = v_new_tier
  WHERE user_id = v_user_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_xp(p_user_id uuid, p_xp_amount integer)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_current_xp INTEGER;
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_new_tier TEXT;
BEGIN
  IF p_xp_amount <= 0 THEN
    RAISE EXCEPTION 'XP amount must be positive';
  END IF;

  IF p_xp_amount > 1000 THEN
    RAISE EXCEPTION 'XP amount exceeds per-call limit';
  END IF;

  SELECT COALESCE(xp, 0) INTO v_current_xp
  FROM public.profiles
  WHERE user_id = p_user_id;

  v_new_xp := v_current_xp + p_xp_amount;
  v_new_level := GREATEST(1, (v_new_xp / 1000) + 1);
  v_new_tier := CASE
    WHEN v_new_level >= 50 THEN 'diamond'
    WHEN v_new_level >= 30 THEN 'gold'
    WHEN v_new_level >= 15 THEN 'silver'
    ELSE 'bronze'
  END;

  UPDATE public.profiles
  SET xp = v_new_xp, level = v_new_level, skill_tier = v_new_tier
  WHERE user_id = p_user_id;
END;
$function$;

-- Realtime authorization: restrict channel subscriptions to the published tables
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read allowed realtime topics" ON realtime.messages;
CREATE POLICY "Authenticated can read allowed realtime topics"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() IN ('races', 'race_participants', 'chat_messages', 'messages')
);

DROP POLICY IF EXISTS "Authenticated can broadcast on allowed topics" ON realtime.messages;
CREATE POLICY "Authenticated can broadcast on allowed topics"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  realtime.topic() IN ('races', 'race_participants', 'chat_messages', 'messages')
);

-- 1. Realtime messages: tighten INSERT (broadcast) policy
DROP POLICY IF EXISTS "Authenticated can broadcast scoped realtime topics" ON realtime.messages;
DROP POLICY IF EXISTS "Authenticated can insert scoped realtime topics" ON realtime.messages;

CREATE POLICY "Scoped realtime broadcast"
ON realtime.messages FOR INSERT
TO authenticated
WITH CHECK (
  (
    realtime.topic() IN ('chat_messages', 'messages')
    AND auth.uid() IS NOT NULL
  )
  OR (
    realtime.topic() LIKE 'race-%'
    AND EXISTS (
      SELECT 1 FROM public.races r
      WHERE r.id::text = substring(realtime.topic() FROM 6)
        AND (
          r.host_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.race_participants rp
            WHERE rp.race_id = r.id AND rp.user_id = auth.uid()
          )
        )
    )
  )
);

-- 2. race_participants: bound updates
DROP POLICY IF EXISTS "Users can update own participation" ON public.race_participants;
CREATE POLICY "Users can update own participation"
ON public.race_participants FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND progress BETWEEN 0 AND 100
  AND wpm BETWEEN 0 AND 300
  AND accuracy BETWEEN 0 AND 100
  AND (position IS NULL OR position BETWEEN 1 AND 100)
);

-- 3. game_scores: SECURITY DEFINER RPC + block direct inserts
CREATE OR REPLACE FUNCTION public.submit_game_score(
  p_game_type text,
  p_score integer,
  p_level_reached integer,
  p_words_typed integer
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_username text;
  v_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_game_type IS NULL OR length(p_game_type) > 50 THEN
    RAISE EXCEPTION 'Invalid game type';
  END IF;
  IF p_score < 0 OR p_score > 1000000 THEN
    RAISE EXCEPTION 'Score out of range';
  END IF;
  IF p_level_reached < 0 OR p_level_reached > 1000 THEN
    RAISE EXCEPTION 'Level out of range';
  END IF;
  IF p_words_typed < 0 OR p_words_typed > 100000 THEN
    RAISE EXCEPTION 'Words typed out of range';
  END IF;

  SELECT username INTO v_username FROM public.profiles WHERE user_id = v_user_id;

  INSERT INTO public.game_scores (user_id, username, game_type, score, level_reached, words_typed)
  VALUES (v_user_id, v_username, p_game_type, p_score, p_level_reached, p_words_typed)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.submit_game_score(text, integer, integer, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_game_score(text, integer, integer, integer) TO authenticated;

DROP POLICY IF EXISTS "Users can submit their own scores" ON public.game_scores;
CREATE POLICY "Block direct inserts to game_scores"
ON public.game_scores AS RESTRICTIVE FOR INSERT
TO anon, authenticated
WITH CHECK (false);

-- 4. tournament_entries: SECURITY DEFINER RPC + block direct inserts
CREATE OR REPLACE FUNCTION public.submit_tournament_entry(
  p_tournament_id uuid,
  p_wpm integer,
  p_accuracy numeric,
  p_score integer
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_username text;
  v_id uuid;
  v_status text;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_wpm < 0 OR p_wpm > 300 THEN
    RAISE EXCEPTION 'WPM out of range';
  END IF;
  IF p_accuracy < 0 OR p_accuracy > 100 THEN
    RAISE EXCEPTION 'Accuracy out of range';
  END IF;
  IF p_score < 0 OR p_score > 1000000 THEN
    RAISE EXCEPTION 'Score out of range';
  END IF;

  SELECT status INTO v_status FROM public.tournaments WHERE id = p_tournament_id;
  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Tournament not found';
  END IF;

  SELECT username INTO v_username FROM public.profiles WHERE user_id = v_user_id;

  INSERT INTO public.tournament_entries (tournament_id, user_id, username, wpm, accuracy, score)
  VALUES (p_tournament_id, v_user_id, v_username, p_wpm, p_accuracy, p_score)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.submit_tournament_entry(uuid, integer, numeric, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_tournament_entry(uuid, integer, numeric, integer) TO authenticated;

DROP POLICY IF EXISTS "Users can submit their own entries" ON public.tournament_entries;
CREATE POLICY "Block direct inserts to tournament_entries"
ON public.tournament_entries AS RESTRICTIVE FOR INSERT
TO anon, authenticated
WITH CHECK (false);

-- 5. Storage: drop broad listing policy on avatars
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

-- 6. Revoke anon EXECUTE on internal trigger helper
REVOKE EXECUTE ON FUNCTION public.enforce_username_from_profile() FROM PUBLIC, anon;

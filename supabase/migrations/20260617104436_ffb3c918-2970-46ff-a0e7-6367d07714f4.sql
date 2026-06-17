-- 1) Chat message length enforced at DB level
ALTER TABLE public.chat_messages
  DROP CONSTRAINT IF EXISTS chat_messages_message_length;
ALTER TABLE public.chat_messages
  ADD CONSTRAINT chat_messages_message_length
  CHECK (char_length(message) BETWEEN 1 AND 500);

-- 2) Tournament entry: only allow during active window
CREATE OR REPLACE FUNCTION public.submit_tournament_entry(p_tournament_id uuid, p_wpm integer, p_accuracy numeric, p_score integer)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_username text;
  v_id uuid;
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

  IF NOT EXISTS (
    SELECT 1 FROM public.tournaments
    WHERE id = p_tournament_id
      AND status = 'active'
      AND now() BETWEEN start_date AND end_date
  ) THEN
    RAISE EXCEPTION 'Tournament is not currently active';
  END IF;

  SELECT username INTO v_username FROM public.profiles WHERE user_id = v_user_id;

  INSERT INTO public.tournament_entries (tournament_id, user_id, username, wpm, accuracy, score)
  VALUES (p_tournament_id, v_user_id, v_username, p_wpm, p_accuracy, p_score)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$function$;

-- 3) Realtime: drop the unscoped broadcast policy so the scoped one (with ownership/membership checks) is the only path
DROP POLICY IF EXISTS "Authenticated can broadcast on allowed topics" ON realtime.messages;

-- 4) Username format constraint to harden against prompt-injection content
-- Normalize any existing invalid usernames first so the constraint can be added.
UPDATE public.profiles
SET username = 'user_' || substr(user_id::text, 1, 8)
WHERE username IS NULL
   OR username !~ '^[a-zA-Z0-9_-]{3,50}$';

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_username_format;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_username_format
  CHECK (username ~ '^[a-zA-Z0-9_-]{3,50}$');
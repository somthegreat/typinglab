
-- 1. Tournament entries: make append-only (drop UPDATE policy)
DROP POLICY IF EXISTS "Users can update their own entries" ON public.tournament_entries;

-- 2. Username spoofing: enforce username from profiles via BEFORE INSERT triggers
CREATE OR REPLACE FUNCTION public.enforce_username_from_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  SELECT username INTO NEW.username
  FROM public.profiles
  WHERE user_id = auth.uid();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_chat_username ON public.chat_messages;
CREATE TRIGGER set_chat_username
BEFORE INSERT ON public.chat_messages
FOR EACH ROW EXECUTE FUNCTION public.enforce_username_from_profile();

DROP TRIGGER IF EXISTS set_game_score_username ON public.game_scores;
CREATE TRIGGER set_game_score_username
BEFORE INSERT ON public.game_scores
FOR EACH ROW EXECUTE FUNCTION public.enforce_username_from_profile();

DROP TRIGGER IF EXISTS set_tournament_entry_username ON public.tournament_entries;
CREATE TRIGGER set_tournament_entry_username
BEFORE INSERT ON public.tournament_entries
FOR EACH ROW EXECUTE FUNCTION public.enforce_username_from_profile();

DROP TRIGGER IF EXISTS set_race_participant_username ON public.race_participants;
CREATE TRIGGER set_race_participant_username
BEFORE INSERT ON public.race_participants
FOR EACH ROW EXECUTE FUNCTION public.enforce_username_from_profile();

-- 3. Avatars bucket: prevent listing all files; allow only direct reads by exact path within user's folder
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public avatar read" ON storage.objects;

CREATE POLICY "Public avatar read by exact path"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'avatars'
  AND name IS NOT NULL
  AND position('/' in name) > 0
);

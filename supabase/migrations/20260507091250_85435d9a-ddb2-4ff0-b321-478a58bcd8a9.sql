
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

REVOKE INSERT, UPDATE, DELETE ON public.user_achievements FROM anon, authenticated;

DROP POLICY IF EXISTS "Block direct inserts to user_achievements" ON public.user_achievements;
CREATE POLICY "Block direct inserts to user_achievements"
ON public.user_achievements
AS RESTRICTIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (false);

-- Fix the SECURITY DEFINER view issue by recreating as SECURITY INVOKER
-- Drop and recreate the view with proper security settings

DROP VIEW IF EXISTS public.leaderboard_profiles;

-- Recreate as a regular view (SECURITY INVOKER is default)
-- Since we're querying profiles directly and profiles now requires auth,
-- we need to grant SELECT on the view and make it work for anonymous/public access
CREATE VIEW public.leaderboard_profiles 
WITH (security_invoker = true)
AS
SELECT 
  id,
  user_id,
  username,
  avatar_url,
  best_wpm,
  best_accuracy,
  total_tests_completed,
  level,
  xp,
  skill_tier
FROM public.profiles
WHERE best_wpm IS NOT NULL AND best_wpm > 0;

-- Since SECURITY INVOKER means the view uses the querying user's permissions,
-- and we want the leaderboard to be publicly viewable, we need to create
-- a function that can read the limited profile data instead

-- Create a secure RPC function for fetching leaderboard data
CREATE OR REPLACE FUNCTION public.get_leaderboard(
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  username text,
  avatar_url text,
  best_wpm integer,
  best_accuracy numeric,
  total_tests_completed integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Validate limit to prevent abuse
  IF p_limit < 1 OR p_limit > 100 THEN
    p_limit := 50;
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.username,
    p.avatar_url,
    p.best_wpm,
    p.best_accuracy,
    p.total_tests_completed
  FROM profiles p
  WHERE p.best_wpm IS NOT NULL AND p.best_wpm > 0
  ORDER BY p.best_wpm DESC
  LIMIT p_limit;
END;
$$;

-- 1. Revoke anonymous GraphQL/PostgREST visibility on all public tables
REVOKE SELECT ON ALL TABLES IN SCHEMA public FROM anon;

-- Re-grant SELECT to authenticated so app continues to work (RLS still enforces row access)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- 2. Lock down SECURITY DEFINER functions not meant to be called by clients
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 3. Restrict client-callable RPCs to authenticated users only
REVOKE EXECUTE ON FUNCTION public.award_achievement(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.start_race(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.begin_racing(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.update_user_xp(integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.update_user_xp(uuid, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_or_create_daily_challenge(date) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_leaderboard(integer) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.award_achievement(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.start_race(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.begin_racing(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_xp(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_daily_challenge(date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(integer) TO authenticated;

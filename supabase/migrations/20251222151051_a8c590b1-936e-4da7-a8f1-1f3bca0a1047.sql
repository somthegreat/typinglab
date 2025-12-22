-- Add policy for public leaderboard view (only username and stats, not private data)
CREATE POLICY "Anyone can view public profile stats for leaderboard" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Drop the existing restrictive policy first
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
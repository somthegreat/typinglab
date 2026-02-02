-- Fix 1: Create a restricted view for leaderboard data and restrict profiles access
-- This prevents exposure of sensitive user data while allowing leaderboard functionality

-- Create a view with only the fields needed for leaderboards
CREATE OR REPLACE VIEW public.leaderboard_profiles AS
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

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view public profile stats for leaderboard" ON public.profiles;

-- Create a new policy that only allows users to view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Fix 2: Update handle_new_user to reject invalid usernames instead of allowing NULL
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_username TEXT;
BEGIN
  -- Extract username from user metadata
  v_username := NEW.raw_user_meta_data ->> 'username';
  
  -- If no username provided, generate a default one
  IF v_username IS NULL OR TRIM(v_username) = '' THEN
    v_username := 'user_' || substr(NEW.id::text, 1, 8);
  ELSE
    v_username := TRIM(v_username);
  END IF;
  
  -- Validate length (3-50 characters)
  IF LENGTH(v_username) < 3 THEN
    v_username := v_username || '_user';
  END IF;
  
  IF LENGTH(v_username) > 50 THEN
    v_username := substr(v_username, 1, 50);
  END IF;
  
  -- Validate characters - replace invalid chars with underscore
  v_username := regexp_replace(v_username, '[^a-zA-Z0-9_-]', '_', 'g');
  
  -- Ensure at least 3 valid characters after cleanup
  IF LENGTH(v_username) < 3 THEN
    v_username := 'user_' || substr(NEW.id::text, 1, 8);
  END IF;
  
  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, v_username);
  
  RETURN NEW;
END;
$$;

-- Fix 3: Create a secure function for getting/creating daily challenges
-- This prevents spam by using a SECURITY DEFINER function with proper logic

CREATE OR REPLACE FUNCTION public.get_or_create_daily_challenge(p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(
  id uuid,
  challenge_date date,
  text_content text,
  target_wpm integer,
  target_accuracy numeric,
  reward_points integer,
  challenge_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_challenge_id UUID;
  v_text_content TEXT;
  v_target_wpm INTEGER;
  v_target_accuracy NUMERIC;
  v_reward_points INTEGER;
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Try to get existing challenge for the date
  RETURN QUERY
  SELECT dc.id, dc.challenge_date, dc.text_content, dc.target_wpm, 
         dc.target_accuracy, dc.reward_points, dc.challenge_type
  FROM daily_challenges dc
  WHERE dc.challenge_date = p_date
  LIMIT 1;
  
  -- If we returned rows, exit
  IF FOUND THEN
    RETURN;
  END IF;
  
  -- Only allow creating challenges for today or future dates
  IF p_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Cannot create challenges for past dates';
  END IF;
  
  -- Only allow creating challenges up to 7 days in advance
  IF p_date > CURRENT_DATE + INTERVAL '7 days' THEN
    RAISE EXCEPTION 'Cannot create challenges more than 7 days in advance';
  END IF;
  
  -- Generate challenge parameters
  v_text_content := 'the quick brown fox jumps over the lazy dog';
  v_target_wpm := 30 + (floor(random() * 3) * 10)::integer; -- 30, 40, or 50
  v_target_accuracy := 90 + (floor(random() * 3) * 2.5); -- 90, 92.5, or 95
  v_reward_points := CASE 
    WHEN v_target_wpm >= 50 THEN 25
    WHEN v_target_wpm >= 40 THEN 15
    ELSE 10
  END;
  
  -- Insert new challenge with conflict handling
  INSERT INTO daily_challenges (challenge_date, text_content, target_wpm, target_accuracy, reward_points, challenge_type)
  VALUES (p_date, v_text_content, v_target_wpm, v_target_accuracy, v_reward_points, 'standard')
  ON CONFLICT (challenge_date) DO NOTHING
  RETURNING daily_challenges.id INTO v_challenge_id;
  
  -- Return the challenge (whether newly created or existing)
  RETURN QUERY
  SELECT dc.id, dc.challenge_date, dc.text_content, dc.target_wpm, 
         dc.target_accuracy, dc.reward_points, dc.challenge_type
  FROM daily_challenges dc
  WHERE dc.challenge_date = p_date
  LIMIT 1;
END;
$$;

-- Remove the overly permissive INSERT policy for daily_challenges
DROP POLICY IF EXISTS "Authenticated users can insert daily challenges" ON public.daily_challenges;

-- Add unique constraint on challenge_date if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'daily_challenges_challenge_date_key'
  ) THEN
    ALTER TABLE public.daily_challenges ADD CONSTRAINT daily_challenges_challenge_date_key UNIQUE (challenge_date);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- Constraint already exists
END;
$$;
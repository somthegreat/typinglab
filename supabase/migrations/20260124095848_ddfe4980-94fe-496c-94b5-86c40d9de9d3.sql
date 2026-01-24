-- Fix 1: Add DELETE policy for chat_messages
CREATE POLICY "Users can delete own messages"
ON public.chat_messages
FOR DELETE
USING (auth.uid() = user_id);

-- Fix 2: Add database constraints for chat message validation
ALTER TABLE public.chat_messages ADD CONSTRAINT message_length 
  CHECK (length(message) BETWEEN 1 AND 500);
ALTER TABLE public.chat_messages ADD CONSTRAINT message_not_empty 
  CHECK (trim(message) <> '');

-- Fix 3: Create avatars storage bucket with proper policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Users can upload their own avatars (file must start with their user id)
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = split_part(name, '-', 1)
);

-- Policy: Anyone can view avatars (public bucket)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Policy: Users can update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = split_part(name, '-', 1)
);

-- Policy: Users can delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = split_part(name, '-', 1)
);

-- Fix 4: Update XP function to use auth.uid() instead of parameter to prevent privilege escalation
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
  -- Get the authenticated user's ID - prevents privilege escalation
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Validate XP amount is positive
  IF p_xp_amount <= 0 THEN
    RAISE EXCEPTION 'XP amount must be positive';
  END IF;
  
  -- Get current XP
  SELECT COALESCE(xp, 0) INTO v_current_xp 
  FROM public.profiles 
  WHERE user_id = v_user_id;
  
  v_new_xp := v_current_xp + p_xp_amount;
  
  -- Calculate level (every 1000 XP = 1 level)
  v_new_level := GREATEST(1, (v_new_xp / 1000) + 1);
  
  -- Calculate tier based on level
  v_new_tier := CASE
    WHEN v_new_level >= 50 THEN 'diamond'
    WHEN v_new_level >= 30 THEN 'gold'
    WHEN v_new_level >= 15 THEN 'silver'
    ELSE 'bronze'
  END;
  
  -- Update profile
  UPDATE public.profiles 
  SET xp = v_new_xp, level = v_new_level, skill_tier = v_new_tier
  WHERE user_id = v_user_id;
END;
$function$;

-- Fix 5: Create a function to safely start races with server-side timing
CREATE OR REPLACE FUNCTION public.start_race(p_race_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_host_id UUID;
  v_current_status TEXT;
BEGIN
  -- Get the race host and current status
  SELECT host_id, status INTO v_host_id, v_current_status
  FROM public.races
  WHERE id = p_race_id;
  
  -- Verify the caller is the host
  IF auth.uid() IS NULL OR auth.uid() <> v_host_id THEN
    RAISE EXCEPTION 'Only the host can start the race';
  END IF;
  
  -- Verify race is in waiting status
  IF v_current_status <> 'waiting' THEN
    RAISE EXCEPTION 'Race must be in waiting status to start';
  END IF;
  
  -- Set to countdown status
  UPDATE public.races
  SET status = 'countdown'
  WHERE id = p_race_id;
END;
$function$;

-- Create a function to transition race to racing status (called after countdown)
CREATE OR REPLACE FUNCTION public.begin_racing(p_race_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_host_id UUID;
  v_current_status TEXT;
BEGIN
  -- Get the race host and current status
  SELECT host_id, status INTO v_host_id, v_current_status
  FROM public.races
  WHERE id = p_race_id;
  
  -- Verify the caller is the host
  IF auth.uid() IS NULL OR auth.uid() <> v_host_id THEN
    RAISE EXCEPTION 'Only the host can begin the race';
  END IF;
  
  -- Verify race is in countdown status
  IF v_current_status <> 'countdown' THEN
    RAISE EXCEPTION 'Race must be in countdown status to begin racing';
  END IF;
  
  -- Set to racing status with server-side timestamp
  UPDATE public.races
  SET status = 'racing', started_at = now()
  WHERE id = p_race_id;
END;
$function$;
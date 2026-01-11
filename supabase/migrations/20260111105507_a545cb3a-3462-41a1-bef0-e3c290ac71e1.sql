-- Fix 1: Update handle_new_user() function with proper input validation
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_username TEXT;
BEGIN
  -- Extract and validate username from user metadata
  v_username := NEW.raw_user_meta_data ->> 'username';
  
  -- Apply validation rules
  IF v_username IS NOT NULL THEN
    -- Trim whitespace
    v_username := TRIM(v_username);
    
    -- Check length (must be between 3 and 50 characters)
    IF LENGTH(v_username) < 3 OR LENGTH(v_username) > 50 THEN
      v_username := NULL; -- Use column default
    END IF;
    
    -- Check allowed characters (alphanumeric, underscore, dash only)
    IF v_username IS NOT NULL AND v_username !~ '^[a-zA-Z0-9_-]+$' THEN
      v_username := NULL; -- Use column default
    END IF;
  END IF;
  
  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, v_username);
  
  RETURN NEW;
END;
$$;

-- Fix 2: Replace overly permissive INSERT policy on daily_challenges
-- Drop the existing permissive policy
DROP POLICY IF EXISTS "Anyone can insert daily challenges" ON public.daily_challenges;

-- Create a more restrictive policy - only authenticated users can insert
-- This prevents anonymous spam while still allowing the app to function
CREATE POLICY "Authenticated users can insert daily challenges" 
ON public.daily_challenges 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);
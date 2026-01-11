-- =============================================
-- COMPREHENSIVE FEATURE EXPANSION MIGRATION
-- =============================================

-- 1. USER XP & LEVELS SYSTEM
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS skill_tier TEXT DEFAULT 'bronze';

-- 2. FRIENDS SYSTEM
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  friend_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, blocked
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friendships" 
ON public.friendships FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friend requests" 
ON public.friendships FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own friendships" 
ON public.friendships FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete their own friendships" 
ON public.friendships FOR DELETE 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- 3. GLOBAL CHAT
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  username TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view chat messages" 
ON public.chat_messages FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can send messages" 
ON public.chat_messages FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- 4. CUSTOM WORD LISTS
CREATE TABLE IF NOT EXISTS public.custom_word_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  words TEXT[] NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_word_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own and public lists" 
ON public.custom_word_lists FOR SELECT 
USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create own lists" 
ON public.custom_word_lists FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lists" 
ON public.custom_word_lists FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lists" 
ON public.custom_word_lists FOR DELETE 
USING (auth.uid() = user_id);

-- 5. WEEKLY TOURNAMENTS
CREATE TABLE IF NOT EXISTS public.tournaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming', -- upcoming, active, completed
  prize_xp INTEGER DEFAULT 500,
  text_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tournaments" 
ON public.tournaments FOR SELECT 
USING (true);

-- 6. TOURNAMENT ENTRIES
CREATE TABLE IF NOT EXISTS public.tournament_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  username TEXT,
  wpm INTEGER NOT NULL,
  accuracy NUMERIC NOT NULL,
  score INTEGER NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);

ALTER TABLE public.tournament_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tournament entries" 
ON public.tournament_entries FOR SELECT 
USING (true);

CREATE POLICY "Users can submit their own entries" 
ON public.tournament_entries FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries" 
ON public.tournament_entries FOR UPDATE 
USING (auth.uid() = user_id);

-- 7. TYPING GAMES HIGH SCORES
CREATE TABLE IF NOT EXISTS public.game_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  username TEXT,
  game_type TEXT NOT NULL, -- word_rain, speed_chase, typing_defense
  score INTEGER NOT NULL,
  level_reached INTEGER DEFAULT 1,
  words_typed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view game scores" 
ON public.game_scores FOR SELECT 
USING (true);

CREATE POLICY "Users can submit their own scores" 
ON public.game_scores FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 8. PRACTICE REMINDERS
CREATE TABLE IF NOT EXISTS public.practice_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  enabled BOOLEAN DEFAULT true,
  reminder_time TIME DEFAULT '09:00:00',
  days_of_week INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- 0=Sun, 1=Mon, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.practice_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reminders" 
ON public.practice_reminders FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reminders" 
ON public.practice_reminders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders" 
ON public.practice_reminders FOR UPDATE 
USING (auth.uid() = user_id);

-- 9. TYPING CERTIFICATES
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  certificate_type TEXT NOT NULL, -- speed_milestone, accuracy_master, streak_champion
  title TEXT NOT NULL,
  description TEXT,
  wpm INTEGER,
  accuracy NUMERIC,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own certificates" 
ON public.certificates FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can issue certificates" 
ON public.certificates FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 10. SESSION HISTORY (detailed practice logs)
CREATE TABLE IF NOT EXISTS public.practice_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_type TEXT NOT NULL, -- test, lesson, game, race
  duration_seconds INTEGER NOT NULL,
  wpm INTEGER,
  accuracy NUMERIC,
  xp_earned INTEGER DEFAULT 0,
  details JSONB, -- flexible storage for session-specific data
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" 
ON public.practice_sessions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" 
ON public.practice_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 11. Add accessibility preferences to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS high_contrast BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reduced_motion BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS screen_reader_mode BOOLEAN DEFAULT false;

-- 12. Function to calculate and update XP/Level
CREATE OR REPLACE FUNCTION public.update_user_xp(
  p_user_id UUID,
  p_xp_amount INTEGER
) RETURNS void
LANGUAGE plpgsql SECURITY INVOKER
AS $$
DECLARE
  v_current_xp INTEGER;
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_new_tier TEXT;
BEGIN
  -- Get current XP
  SELECT COALESCE(xp, 0) INTO v_current_xp 
  FROM public.profiles 
  WHERE user_id = p_user_id;
  
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
  WHERE user_id = p_user_id;
END;
$$;
-- Create daily challenges table
CREATE TABLE public.daily_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_date DATE NOT NULL UNIQUE,
  text_content TEXT NOT NULL,
  target_wpm INTEGER NOT NULL DEFAULT 40,
  target_accuracy NUMERIC NOT NULL DEFAULT 95,
  reward_points INTEGER NOT NULL DEFAULT 10,
  challenge_type TEXT NOT NULL DEFAULT 'standard',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

-- Anyone can view challenges
CREATE POLICY "Anyone can view daily challenges" 
ON public.daily_challenges 
FOR SELECT 
USING (true);

-- Create user challenge completions table
CREATE TABLE public.challenge_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.daily_challenges(id),
  wpm INTEGER NOT NULL,
  accuracy NUMERIC NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  points_earned INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, challenge_id)
);

-- Enable RLS
ALTER TABLE public.challenge_completions ENABLE ROW LEVEL SECURITY;

-- Users can view own completions
CREATE POLICY "Users can view own challenge completions" 
ON public.challenge_completions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert own completions
CREATE POLICY "Users can insert own challenge completions" 
ON public.challenge_completions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add font_size and line_height to profiles for text customization
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS font_size TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS line_height TEXT DEFAULT 'relaxed';
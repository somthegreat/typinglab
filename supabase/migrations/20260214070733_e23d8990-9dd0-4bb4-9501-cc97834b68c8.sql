-- Create typing_goals table
CREATE TABLE public.typing_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_type TEXT NOT NULL, -- 'wpm', 'accuracy', 'sessions', 'minutes'
  target_value NUMERIC NOT NULL,
  period TEXT NOT NULL DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly'
  current_value NUMERIC NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.typing_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals"
ON public.typing_goals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own goals"
ON public.typing_goals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
ON public.typing_goals FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
ON public.typing_goals FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_typing_goals_updated_at
BEFORE UPDATE ON public.typing_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
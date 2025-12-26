-- Allow anyone to insert daily challenges (auto-generated when none exists)
CREATE POLICY "Anyone can insert daily challenges" 
ON public.daily_challenges 
FOR INSERT 
WITH CHECK (true);
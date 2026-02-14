CREATE POLICY "Users can delete own reminders"
ON public.practice_reminders
FOR DELETE
USING (auth.uid() = user_id);
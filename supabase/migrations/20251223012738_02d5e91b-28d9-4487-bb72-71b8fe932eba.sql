-- Create races table for multiplayer racing
CREATE TABLE public.races (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID NOT NULL,
  text_content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting', -- waiting, countdown, racing, finished
  max_players INTEGER DEFAULT 4,
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create race_participants table
CREATE TABLE public.race_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  race_id UUID NOT NULL REFERENCES public.races(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  username TEXT,
  progress INTEGER DEFAULT 0,
  wpm INTEGER DEFAULT 0,
  accuracy NUMERIC DEFAULT 0,
  finished_at TIMESTAMP WITH TIME ZONE,
  position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.races ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_participants ENABLE ROW LEVEL SECURITY;

-- Races policies - anyone can view active races
CREATE POLICY "Anyone can view races" ON public.races FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create races" ON public.races FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Host can update own race" ON public.races FOR UPDATE USING (auth.uid() = host_id);

-- Race participants policies
CREATE POLICY "Anyone can view race participants" ON public.race_participants FOR SELECT USING (true);
CREATE POLICY "Authenticated users can join races" ON public.race_participants FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own participation" ON public.race_participants FOR UPDATE USING (auth.uid() = user_id);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.races;
ALTER PUBLICATION supabase_realtime ADD TABLE public.race_participants;
-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT,
  avatar_url TEXT,
  total_tests_completed INTEGER DEFAULT 0,
  total_words_typed INTEGER DEFAULT 0,
  best_wpm INTEGER DEFAULT 0,
  best_accuracy DECIMAL(5,2) DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_practice_date DATE,
  sound_enabled BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'dark',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create test_results table for storing test history
CREATE TABLE public.test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  test_mode TEXT NOT NULL,
  test_duration INTEGER,
  word_count INTEGER,
  wpm INTEGER NOT NULL,
  raw_wpm INTEGER NOT NULL,
  accuracy DECIMAL(5,2) NOT NULL,
  correct_chars INTEGER NOT NULL,
  incorrect_chars INTEGER NOT NULL,
  total_chars INTEGER NOT NULL,
  text_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lessons table for typing curriculum
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  difficulty INTEGER DEFAULT 1,
  keys_focus TEXT[] NOT NULL,
  content TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lesson_progress table for tracking user progress
CREATE TABLE public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT false,
  best_wpm INTEGER DEFAULT 0,
  best_accuracy DECIMAL(5,2) DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  unlocked BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Create achievements table for available achievements
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_achievements table for tracking earned achievements
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create weak_keys table for tracking keys user struggles with
CREATE TABLE public.weak_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  key_char TEXT NOT NULL,
  error_count INTEGER DEFAULT 1,
  total_count INTEGER DEFAULT 1,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, key_char)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weak_keys ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Test results policies
CREATE POLICY "Users can view own test results" ON public.test_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own test results" ON public.test_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Lessons policies (public read)
CREATE POLICY "Anyone can view lessons" ON public.lessons FOR SELECT USING (true);

-- Lesson progress policies
CREATE POLICY "Users can view own lesson progress" ON public.lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own lesson progress" ON public.lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lesson progress" ON public.lesson_progress FOR UPDATE USING (auth.uid() = user_id);

-- Achievements policies (public read)
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (true);

-- User achievements policies
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Weak keys policies
CREATE POLICY "Users can view own weak keys" ON public.weak_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weak keys" ON public.weak_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own weak keys" ON public.weak_keys FOR UPDATE USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'username');
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lesson_progress_updated_at BEFORE UPDATE ON public.lesson_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_weak_keys_updated_at BEFORE UPDATE ON public.weak_keys FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, category, requirement_type, requirement_value) VALUES
('First Steps', 'Complete your first typing test', 'trophy', 'milestone', 'tests_completed', 1),
('Speed Demon', 'Reach 50 WPM', 'zap', 'speed', 'wpm', 50),
('Turbo Typist', 'Reach 75 WPM', 'rocket', 'speed', 'wpm', 75),
('Lightning Fingers', 'Reach 100 WPM', 'bolt', 'speed', 'wpm', 100),
('Perfect Score', 'Achieve 100% accuracy in a test', 'target', 'accuracy', 'accuracy', 100),
('Sharp Shooter', 'Achieve 95% accuracy or higher 10 times', 'crosshair', 'accuracy', 'high_accuracy_count', 10),
('Marathon Runner', 'Complete 50 typing tests', 'medal', 'milestone', 'tests_completed', 50),
('Century Club', 'Complete 100 typing tests', 'award', 'milestone', 'tests_completed', 100),
('Word Warrior', 'Type 10,000 words total', 'sword', 'milestone', 'total_words', 10000),
('Dedicated Learner', 'Complete all home row lessons', 'book', 'lessons', 'home_row_complete', 1),
('Keyboard Master', 'Complete all typing lessons', 'crown', 'lessons', 'all_lessons_complete', 1),
('On Fire', 'Maintain a 7-day streak', 'flame', 'streak', 'streak', 7),
('Unstoppable', 'Maintain a 30-day streak', 'fire', 'streak', 'streak', 30);

-- Insert default lessons
INSERT INTO public.lessons (title, description, category, difficulty, keys_focus, content, order_index) VALUES
('Home Row Basics', 'Learn the foundation keys: ASDF and JKL;', 'home_row', 1, ARRAY['a','s','d','f','j','k','l',';'], 'asdf jkl; asdf jkl; fjdk sl;a fjdk sl;a', 1),
('Home Row Practice', 'Practice home row keys with common words', 'home_row', 1, ARRAY['a','s','d','f','j','k','l',';'], 'sad dad fad lad ask all fall flask', 2),
('Home Row Advanced', 'Advanced home row combinations', 'home_row', 2, ARRAY['a','s','d','f','j','k','l',';'], 'flask salad falls laddsasks dads fads', 3),
('Top Row Introduction', 'Learn the top row keys: QWERT and YUIOP', 'top_row', 2, ARRAY['q','w','e','r','t','y','u','i','o','p'], 'qwert yuiop qwert yuiop weir your trip', 4),
('Top Row Words', 'Common words using top row', 'top_row', 2, ARRAY['q','w','e','r','t','y','u','i','o','p'], 'write power quote tower Europe', 5),
('Top Row Mastery', 'Master the top row with speed', 'top_row', 3, ARRAY['q','w','e','r','t','y','u','i','o','p'], 'typewriter property requirement opportunity', 6),
('Bottom Row Basics', 'Learn the bottom row keys: ZXCVB and NM,.', 'bottom_row', 2, ARRAY['z','x','c','v','b','n','m',',','.'], 'zxcvb nm,. zxcvb nm,. zinc vex numb', 7),
('Bottom Row Words', 'Common words with bottom row', 'bottom_row', 3, ARRAY['z','x','c','v','b','n','m',',','.'], 'box zone bench calm cabin verb', 8),
('Full Keyboard Easy', 'Combine all rows with easy words', 'full_keyboard', 3, ARRAY['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'], 'the quick brown fox jumps over lazy dog', 9),
('Full Keyboard Medium', 'Practice full keyboard with longer text', 'full_keyboard', 4, ARRAY['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'], 'programming requires patience and practice to master the keyboard', 10),
('Full Keyboard Advanced', 'Challenge yourself with complex text', 'full_keyboard', 5, ARRAY['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'], 'extraordinary achievements come from consistent effort and dedication', 11),
('Numbers Introduction', 'Learn the number row', 'numbers', 3, ARRAY['1','2','3','4','5','6','7','8','9','0'], '123 456 789 0 1234567890 12345 67890', 12),
('Punctuation Basics', 'Master common punctuation marks', 'punctuation', 4, ARRAY['.',',','!','?',';',':'], 'Hello, world! How are you? Great; thanks.', 13),
('Special Characters', 'Learn special characters and symbols', 'special', 5, ARRAY['@','#','$','%','^','&','*','(',')'], 'email@test.com $100 50% (brackets) #hashtag', 14);
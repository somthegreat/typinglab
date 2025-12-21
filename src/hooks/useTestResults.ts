import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { TypingStats } from './useTypingTest';

export interface TestResult {
  id: string;
  user_id: string;
  wpm: number;
  raw_wpm: number;
  accuracy: number;
  correct_chars: number;
  incorrect_chars: number;
  total_chars: number;
  test_mode: string;
  test_duration: number | null;
  word_count: number | null;
  text_content: string | null;
  created_at: string | null;
}

export const useTestResults = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['test-results', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('test_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TestResult[];
    },
    enabled: !!user,
  });
};

export const useSaveTestResult = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { stats: TypingStats; mode: string; wordCount?: number; textContent?: string }) => {
      if (!user) throw new Error('Must be logged in to save results');
      
      const { stats, mode, wordCount, textContent } = params;
      
      const { error } = await supabase.from('test_results').insert({
        user_id: user.id,
        wpm: stats.wpm,
        raw_wpm: stats.rawWpm,
        accuracy: stats.accuracy,
        correct_chars: stats.correctChars,
        incorrect_chars: stats.incorrectChars,
        total_chars: stats.totalChars,
        test_mode: mode,
        test_duration: stats.timeElapsed,
        word_count: wordCount,
        text_content: textContent?.slice(0, 500),
      });

      if (error) throw error;

      // Update profile stats
      await updateProfileStats(user.id, stats);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-results'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

const updateProfileStats = async (userId: string, stats: TypingStats) => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (!profile) return;

  const today = new Date().toISOString().split('T')[0];
  const lastPractice = profile.last_practice_date;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let newStreak = profile.current_streak || 0;
  if (lastPractice === yesterday) {
    newStreak += 1;
  } else if (lastPractice !== today) {
    newStreak = 1;
  }

  const wordCount = Math.floor(stats.totalChars / 5);

  await supabase.from('profiles').update({
    best_wpm: Math.max(profile.best_wpm || 0, stats.wpm),
    best_accuracy: Math.max(Number(profile.best_accuracy) || 0, stats.accuracy),
    total_tests_completed: (profile.total_tests_completed || 0) + 1,
    total_words_typed: (profile.total_words_typed || 0) + wordCount,
    current_streak: newStreak,
    longest_streak: Math.max(profile.longest_streak || 0, newStreak),
    last_practice_date: today,
  }).eq('user_id', userId);
};

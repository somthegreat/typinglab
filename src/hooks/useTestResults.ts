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

      const { error } = await supabase.rpc('record_test_result', {
        p_wpm: stats.wpm,
        p_raw_wpm: stats.rawWpm,
        p_accuracy: stats.accuracy,
        p_correct_chars: stats.correctChars,
        p_incorrect_chars: stats.incorrectChars,
        p_total_chars: stats.totalChars,
        p_test_mode: mode,
        p_test_duration: stats.timeElapsed ?? null,
        p_word_count: wordCount ?? null,
        p_text_content: textContent?.slice(0, 500) ?? null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-results'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

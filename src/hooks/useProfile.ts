import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  best_wpm: number | null;
  best_accuracy: number | null;
  total_tests_completed: number | null;
  total_words_typed: number | null;
  current_streak: number | null;
  longest_streak: number | null;
  last_practice_date: string | null;
  theme: string | null;
  sound_enabled: boolean | null;
}

export const useProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!user,
  });
};

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type TimeFilter = 'all' | 'week' | 'month';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string | null;
  best_wpm: number | null;
  best_accuracy: number | null;
  total_tests_completed: number | null;
  avatar_url: string | null;
}

export const useLeaderboard = (filter: TimeFilter = 'all', limit: number = 50) => {
  return useQuery({
    queryKey: ['leaderboard', filter, limit],
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      let query = supabase
        .from('profiles')
        .select('id, user_id, username, best_wpm, best_accuracy, total_tests_completed, avatar_url')
        .not('best_wpm', 'is', null)
        .gt('best_wpm', 0)
        .order('best_wpm', { ascending: false })
        .limit(limit);
      
      // Note: For time-based filtering, we would need to query test_results 
      // and aggregate by user. For now, we use best_wpm from profiles.
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data || [];
    },
  });
};

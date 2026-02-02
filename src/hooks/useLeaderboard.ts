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
      // Use the secure RPC function to get leaderboard data
      // This prevents exposure of sensitive profile fields
      const { data, error } = await supabase
        .rpc('get_leaderboard', { p_limit: limit });
      
      if (error) throw error;
      
      // Note: For time-based filtering, we would need to query test_results 
      // and aggregate by user. For now, we use best_wpm from profiles.
      
      return (data || []) as LeaderboardEntry[];
    },
  });
};

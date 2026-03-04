import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const usePersonalBest = (gameType: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['personal-best', gameType, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('game_scores')
        .select('score, level_reached, words_typed, created_at')
        .eq('user_id', user.id)
        .eq('game_type', gameType)
        .order('score', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });
};

export const useGameLeaderboard = (gameType: string, limit = 10) => {
  return useQuery({
    queryKey: ['game-leaderboard', gameType, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('game_scores')
        .select('username, score, level_reached, words_typed, created_at')
        .eq('game_type', gameType)
        .order('score', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    },
  });
};

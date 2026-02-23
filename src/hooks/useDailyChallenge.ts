import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DailyChallenge {
  id: string;
  challenge_date: string;
  text_content: string;
  target_wpm: number;
  target_accuracy: number;
  reward_points: number;
  challenge_type: string;
}

interface ChallengeCompletion {
  id: string;
  challenge_id: string;
  wpm: number;
  accuracy: number;
  completed_at: string;
  points_earned: number;
}

export const useDailyChallenge = () => {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['daily-challenge', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_or_create_daily_challenge', { p_date: today });

      if (error) throw error;
      
      const row = data?.[0];
      if (!row) throw new Error('Failed to get daily challenge');
      
      return {
        id: row.out_id,
        challenge_date: row.out_challenge_date,
        text_content: row.out_text_content,
        target_wpm: row.out_target_wpm,
        target_accuracy: row.out_target_accuracy,
        reward_points: row.out_reward_points,
        challenge_type: row.out_challenge_type,
      } as DailyChallenge;
    },
    enabled: !!user, // Only fetch if user is authenticated
  });
};

export const useChallengeCompletion = (challengeId: string | undefined) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['challenge-completion', challengeId, user?.id],
    queryFn: async () => {
      if (!user || !challengeId) return null;

      const { data, error } = await supabase
        .from('challenge_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('challenge_id', challengeId)
        .maybeSingle();

      if (error) throw error;
      return data as ChallengeCompletion | null;
    },
    enabled: !!user && !!challengeId,
  });
};

export const useCompleteChallenge = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      challengeId,
      wpm,
      accuracy,
      targetWpm,
      targetAccuracy,
      rewardPoints,
    }: {
      challengeId: string;
      wpm: number;
      accuracy: number;
      targetWpm: number;
      targetAccuracy: number;
      rewardPoints: number;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const passed = wpm >= targetWpm && accuracy >= targetAccuracy;
      const pointsEarned = passed ? rewardPoints : 0;

      const { data, error } = await supabase
        .from('challenge_completions')
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          wpm,
          accuracy,
          points_earned: pointsEarned,
        })
        .select()
        .single();

      if (error) throw error;
      return { ...data, passed };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-completion'] });
    },
  });
};

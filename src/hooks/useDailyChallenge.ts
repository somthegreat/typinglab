import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { generateRandomWords } from '@/data/words';

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
      // Try to get today's challenge
      const { data: existing, error } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('challenge_date', today)
        .maybeSingle();

      if (existing) return existing as DailyChallenge;

      // If no challenge exists for today, create one
      const challengeText = generateRandomWords(30);
      const targets = [
        { wpm: 30, accuracy: 90, points: 10 },
        { wpm: 40, accuracy: 92, points: 15 },
        { wpm: 50, accuracy: 95, points: 25 },
      ];
      const target = targets[Math.floor(Math.random() * targets.length)];

      const { data: newChallenge, error: insertError } = await supabase
        .from('daily_challenges')
        .insert({
          challenge_date: today,
          text_content: challengeText,
          target_wpm: target.wpm,
          target_accuracy: target.accuracy,
          reward_points: target.points,
          challenge_type: 'standard',
        })
        .select()
        .maybeSingle();

      if (insertError) throw insertError;
      if (!newChallenge) throw new Error('Failed to create challenge');
      return newChallenge as DailyChallenge;
    },
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
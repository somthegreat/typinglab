import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string | null;
}

export const useAchievements = () => {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('requirement_value', { ascending: true });
      
      if (error) throw error;
      return data as Achievement[];
    },
  });
};

export const useUserAchievements = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as UserAchievement[];
    },
    enabled: !!user,
  });
};

export const useCheckAchievements = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { wpm: number; accuracy: number }) => {
      if (!user) return [];
      
      const { wpm, accuracy } = params;
      const newlyEarned: Achievement[] = [];

      // Get all achievements and user's earned ones
      const [{ data: achievements }, { data: earned }, { data: profile }] = await Promise.all([
        supabase.from('achievements').select('*'),
        supabase.from('user_achievements').select('achievement_id').eq('user_id', user.id),
        supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
      ]);

      if (!achievements || !profile) return [];

      const earnedIds = new Set(earned?.map(e => e.achievement_id) || []);

      for (const achievement of achievements) {
        if (earnedIds.has(achievement.id)) continue;

        let shouldEarn = false;

        switch (achievement.requirement_type) {
          case 'wpm':
            shouldEarn = wpm >= achievement.requirement_value;
            break;
          case 'accuracy':
            shouldEarn = accuracy >= achievement.requirement_value;
            break;
          case 'tests_completed':
            shouldEarn = (profile.total_tests_completed || 0) >= achievement.requirement_value;
            break;
          case 'words_typed':
            shouldEarn = (profile.total_words_typed || 0) >= achievement.requirement_value;
            break;
          case 'streak':
            shouldEarn = (profile.current_streak || 0) >= achievement.requirement_value;
            break;
        }

        if (shouldEarn) {
          await supabase.from('user_achievements').insert({
            user_id: user.id,
            achievement_id: achievement.id,
          });
          newlyEarned.push(achievement);
        }
      }

      return newlyEarned;
    },
    onSuccess: (earned) => {
      if (earned && earned.length > 0) {
        earned.forEach(a => {
          toast.success(`🏆 Achievement Unlocked: ${a.name}!`, {
            description: a.description,
          });
        });
        queryClient.invalidateQueries({ queryKey: ['user-achievements'] });
      }
    },
  });
};

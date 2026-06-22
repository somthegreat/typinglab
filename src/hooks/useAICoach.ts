import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CoachAdvice {
  summary: string;
  recommendations: string[];
  next_drill: string;
  common_mistake: string;
}

export const useAICoach = () => {
  return useMutation({
    mutationFn: async (): Promise<CoachAdvice> => {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { mode: 'coach' },
      });
      if (error) throw error;
      return data as CoachAdvice;
    },
  });
};
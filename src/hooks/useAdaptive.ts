import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { CharStat, ComboStat, DifficultWord, CharStatsPayload } from '@/lib/adaptive/types';

export const useCharStats = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['char-stats', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<CharStat[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('char_stats')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return (data ?? []) as CharStat[];
    },
  });
};

export const useKeyCombinations = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['key-combinations', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<ComboStat[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('key_combinations')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return (data ?? []) as ComboStat[];
    },
  });
};

export const useDifficultWords = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['difficult-words', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<DifficultWord[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('difficult_words')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return (data ?? []) as DifficultWord[];
    },
  });
};

export const useRecordCharStats = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CharStatsPayload) => {
      if (!user) return;
      const { error } = await supabase.rpc('record_char_stats', { p_payload: payload as any });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['char-stats'] });
      qc.invalidateQueries({ queryKey: ['key-combinations'] });
      qc.invalidateQueries({ queryKey: ['difficult-words'] });
    },
  });
};
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface WeakKey {
  id: string;
  key_char: string;
  error_count: number;
  total_count: number;
  error_rate: number;
}

export const useWeakKeys = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['weak-keys', user?.id],
    queryFn: async (): Promise<WeakKey[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('weak_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('error_count', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(key => ({
        ...key,
        error_rate: key.total_count ? (key.error_count || 0) / key.total_count * 100 : 0,
      }));
    },
    enabled: !!user,
  });
};

export const useUpdateWeakKeys = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (keyErrors: Map<string, { errors: number; total: number }>) => {
      if (!user) return;
      
      for (const [keyChar, stats] of keyErrors.entries()) {
        const { data: existing } = await supabase
          .from('weak_keys')
          .select('*')
          .eq('user_id', user.id)
          .eq('key_char', keyChar)
          .single();
        
        if (existing) {
          await supabase
            .from('weak_keys')
            .update({
              error_count: (existing.error_count || 0) + stats.errors,
              total_count: (existing.total_count || 0) + stats.total,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('weak_keys')
            .insert({
              user_id: user.id,
              key_char: keyChar,
              error_count: stats.errors,
              total_count: stats.total,
            });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weak-keys'] });
    },
  });
};

export const generateWeakKeyPractice = (weakKeys: WeakKey[], wordCount: number = 20): string => {
  if (weakKeys.length === 0) return '';
  
  // Get top 5 weakest keys
  const topWeak = weakKeys.slice(0, 5).map(k => k.key_char);
  
  // Common words containing these keys
  const practiceWords: Record<string, string[]> = {
    'a': ['away', 'again', 'always', 'about', 'after', 'apple', 'amazing'],
    'b': ['before', 'bring', 'break', 'best', 'because', 'brown', 'build'],
    'c': ['come', 'could', 'change', 'clear', 'create', 'close', 'center'],
    'd': ['done', 'down', 'during', 'design', 'decide', 'dream', 'double'],
    'e': ['every', 'even', 'enough', 'example', 'early', 'evening', 'energy'],
    'f': ['from', 'first', 'find', 'follow', 'fast', 'future', 'finally'],
    'g': ['great', 'going', 'getting', 'give', 'group', 'grow', 'game'],
    'h': ['have', 'help', 'here', 'high', 'however', 'happy', 'happen'],
    'i': ['into', 'include', 'inside', 'idea', 'important', 'instead', 'increase'],
    'j': ['just', 'join', 'jump', 'judge', 'journey', 'job', 'joke'],
    'k': ['know', 'keep', 'kind', 'known', 'king', 'kitchen', 'kick'],
    'l': ['look', 'long', 'little', 'large', 'learn', 'local', 'leave'],
    'm': ['more', 'make', 'much', 'most', 'might', 'moment', 'morning'],
    'n': ['never', 'next', 'number', 'nothing', 'notice', 'night', 'nature'],
    'o': ['only', 'other', 'over', 'often', 'once', 'order', 'outside'],
    'p': ['place', 'point', 'people', 'problem', 'program', 'present', 'power'],
    'q': ['question', 'quick', 'quite', 'quality', 'quiet', 'quarter', 'queen'],
    'r': ['right', 'really', 'reason', 'result', 'return', 'remain', 'reach'],
    's': ['some', 'still', 'start', 'should', 'small', 'since', 'simple'],
    't': ['that', 'then', 'think', 'these', 'through', 'there', 'today'],
    'u': ['under', 'until', 'using', 'usually', 'understand', 'upon', 'unique'],
    'v': ['very', 'view', 'value', 'voice', 'various', 'visit', 'version'],
    'w': ['would', 'where', 'which', 'while', 'world', 'write', 'within'],
    'x': ['example', 'explain', 'expect', 'exact', 'extra', 'explore', 'expand'],
    'y': ['year', 'young', 'your', 'yourself', 'yesterday', 'yellow', 'yield'],
    'z': ['zone', 'zero', 'zigzag', 'zenith', 'zeal', 'zoom', 'zodiac'],
  };
  
  const words: string[] = [];
  
  for (let i = 0; i < wordCount; i++) {
    const key = topWeak[i % topWeak.length];
    const keyWords = practiceWords[key] || practiceWords['a'];
    words.push(keyWords[Math.floor(Math.random() * keyWords.length)]);
  }
  
  return words.join(' ');
};

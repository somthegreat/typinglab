import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Lesson {
  id: string;
  title: string;
  description: string | null;
  category: string;
  content: string;
  keys_focus: string[];
  order_index: number;
  difficulty: number | null;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean | null;
  unlocked: boolean | null;
  best_wpm: number | null;
  best_accuracy: number | null;
  attempts: number | null;
}

export const useLessons = () => {
  return useQuery({
    queryKey: ['lessons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data as Lesson[];
    },
  });
};

export const useLessonProgress = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['lesson-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as LessonProgress[];
    },
    enabled: !!user,
  });
};

export const useUpdateLessonProgress = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { lessonId: string; wpm: number; accuracy: number; completed: boolean }) => {
      if (!user) throw new Error('Must be logged in');
      
      const { lessonId, wpm, accuracy, completed } = params;
      
      // Check if progress exists
      const { data: existing } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (existing) {
        await supabase.from('lesson_progress').update({
          best_wpm: Math.max(existing.best_wpm || 0, wpm),
          best_accuracy: Math.max(Number(existing.best_accuracy) || 0, accuracy),
          attempts: (existing.attempts || 0) + 1,
          completed: completed || existing.completed,
          completed_at: completed ? new Date().toISOString() : existing.completed_at,
        }).eq('id', existing.id);
      } else {
        await supabase.from('lesson_progress').insert({
          user_id: user.id,
          lesson_id: lessonId,
          best_wpm: wpm,
          best_accuracy: accuracy,
          attempts: 1,
          completed,
          unlocked: true,
          completed_at: completed ? new Date().toISOString() : null,
        });
      }

      // Unlock next lesson if completed
      if (completed) {
        const { data: lessons } = await supabase
          .from('lessons')
          .select('id, order_index')
          .order('order_index');
        
        const currentLesson = lessons?.find(l => l.id === lessonId);
        const nextLesson = lessons?.find(l => l.order_index === (currentLesson?.order_index || 0) + 1);
        
        if (nextLesson) {
          const { data: nextProgress } = await supabase
            .from('lesson_progress')
            .select('id')
            .eq('user_id', user.id)
            .eq('lesson_id', nextLesson.id)
            .maybeSingle();

          if (!nextProgress) {
            await supabase.from('lesson_progress').insert({
              user_id: user.id,
              lesson_id: nextLesson.id,
              unlocked: true,
            });
          } else {
            await supabase.from('lesson_progress').update({ unlocked: true }).eq('id', nextProgress.id);
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-progress'] });
    },
  });
};

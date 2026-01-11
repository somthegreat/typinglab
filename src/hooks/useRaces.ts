import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { generateRandomWords } from '@/data/words';

interface Race {
  id: string;
  host_id: string;
  text_content: string;
  status: 'waiting' | 'countdown' | 'racing' | 'finished';
  max_players: number;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
}

interface RaceParticipant {
  id: string;
  race_id: string;
  user_id: string;
  username: string | null;
  progress: number;
  wpm: number;
  accuracy: number;
  finished_at: string | null;
  position: number | null;
  created_at: string;
}

export const useActiveRaces = () => {
  return useQuery({
    queryKey: ['active-races'],
    queryFn: async (): Promise<Race[]> => {
      const { data, error } = await supabase
        .from('races')
        .select('*')
        .in('status', ['waiting', 'countdown'])
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return (data || []) as Race[];
    },
    refetchInterval: 5000,
  });
};

export const useRace = (raceId: string | null) => {
  const [race, setRace] = useState<Race | null>(null);
  const [participants, setParticipants] = useState<RaceParticipant[]>([]);

  useEffect(() => {
    if (!raceId) return;

    // Initial fetch
    const fetchRace = async () => {
      const { data: raceData } = await supabase
        .from('races')
        .select('*')
        .eq('id', raceId)
        .single();
      
      if (raceData) setRace(raceData as Race);

      const { data: participantsData } = await supabase
        .from('race_participants')
        .select('*')
        .eq('race_id', raceId);
      
      if (participantsData) setParticipants(participantsData as RaceParticipant[]);
    };

    fetchRace();

    // Subscribe to realtime updates
    const raceChannel = supabase
      .channel(`race-${raceId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'races', filter: `id=eq.${raceId}` },
        (payload) => {
          if (payload.new) setRace(payload.new as Race);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'race_participants', filter: `race_id=eq.${raceId}` },
        async () => {
          // Refetch all participants on any change
          const { data } = await supabase
            .from('race_participants')
            .select('*')
            .eq('race_id', raceId);
          if (data) setParticipants(data as RaceParticipant[]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(raceChannel);
    };
  }, [raceId]);

  return { race, participants };
};

export const useCreateRace = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<Race> => {
      if (!user) throw new Error('Must be logged in');

      const textContent = generateRandomWords(30);
      
      const { data, error } = await supabase
        .from('races')
        .insert({
          host_id: user.id,
          text_content: textContent,
          status: 'waiting',
        })
        .select()
        .single();

      if (error) throw error;
      return data as Race;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-races'] });
    },
  });
};

export const useJoinRace = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ raceId, username }: { raceId: string; username: string }) => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('race_participants')
        .insert({
          race_id: raceId,
          user_id: user.id,
          username,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });
};

export const useStartRace = () => {
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ raceId, hostId }: { raceId: string; hostId: string }) => {
      // Security: Verify caller is the host before attempting to start
      if (!user || user.id !== hostId) {
        throw new Error('Only the host can start the race');
      }
      
      const { error } = await supabase
        .from('races')
        .update({ status: 'countdown' })
        .eq('id', raceId);

      if (error) throw error;

      // After 3 seconds, start the race
      setTimeout(async () => {
        await supabase
          .from('races')
          .update({ status: 'racing', started_at: new Date().toISOString() })
          .eq('id', raceId);
      }, 3000);
    },
  });
};

export const useUpdateProgress = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      raceId, 
      progress, 
      wpm, 
      accuracy 
    }: { 
      raceId: string; 
      progress: number; 
      wpm: number; 
      accuracy: number;
    }) => {
      if (!user) return;

      const { error } = await supabase
        .from('race_participants')
        .update({ progress, wpm, accuracy })
        .eq('race_id', raceId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
  });
};

export const useFinishRace = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      raceId, 
      wpm, 
      accuracy,
      position
    }: { 
      raceId: string; 
      wpm: number; 
      accuracy: number;
      position: number;
    }) => {
      if (!user) return;

      const { error } = await supabase
        .from('race_participants')
        .update({ 
          progress: 100, 
          wpm, 
          accuracy, 
          position,
          finished_at: new Date().toISOString() 
        })
        .eq('race_id', raceId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
  });
};
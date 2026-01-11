import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TypingTest from '@/components/typing/TypingTest';

interface Tournament {
  id: string;
  name: string;
  text_content: string;
  prize_xp: number;
}

interface TournamentPlayProps {
  tournament: Tournament;
  onComplete: () => void;
  onBack: () => void;
}

const TournamentPlay: React.FC<TournamentPlayProps> = ({ tournament, onComplete, onBack }) => {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);

  const handleComplete = async (results: { wpm: number; accuracy: number }) => {
    if (!user || submitted) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', user.id)
        .single();

      const score = Math.round(results.wpm * (results.accuracy / 100) * 10);

      await supabase.from('tournament_entries').insert({
        tournament_id: tournament.id,
        user_id: user.id,
        username: profile?.username || 'Anonymous',
        wpm: results.wpm,
        accuracy: results.accuracy,
        score,
      });

      await supabase.rpc('update_user_xp', { p_user_id: user.id, p_xp_amount: 50 });

      setSubmitted(true);
      toast.success('Tournament entry submitted!');
      setTimeout(onComplete, 2000);
    } catch (error) {
      toast.error('Failed to submit entry');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <h2 className="text-2xl font-bold text-center mb-4">{tournament.name}</h2>
        <TypingTest 
          customText={tournament.text_content}
          onComplete={handleComplete}
        />
      </div>
    </Layout>
  );
};

export default TournamentPlay;

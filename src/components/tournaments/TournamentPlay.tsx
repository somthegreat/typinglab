import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import CustomTypingTest from '@/components/typing/CustomTypingTest';

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
      const score = Math.round(results.wpm * (results.accuracy / 100) * 10);

      await supabase.rpc('submit_tournament_entry', {
        p_tournament_id: tournament.id,
        p_wpm: results.wpm,
        p_accuracy: results.accuracy,
        p_score: score,
      });

      await supabase.rpc('update_user_xp', { p_xp_amount: 50 });

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
        <CustomTypingTest 
          text={tournament.text_content}
          onComplete={handleComplete}
        />
      </div>
    </Layout>
  );
};

export default TournamentPlay;

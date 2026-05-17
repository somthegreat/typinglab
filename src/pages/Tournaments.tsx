import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Calendar, Users, Star, Clock, Medal } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format, isPast, isFuture, isWithinInterval } from 'date-fns';
import TournamentPlay from '@/components/tournaments/TournamentPlay';
import SEO from "@/components/SEO";

interface Tournament {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_xp: number;
  text_content: string;
}

interface TournamentEntry {
  id: string;
  tournament_id: string;
  user_id: string;
  username: string;
  wpm: number;
  accuracy: number;
  score: number;
  submitted_at: string;
}

const Tournaments: React.FC = () => {
  const { user } = useAuth();
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);
  const queryClient = useQueryClient();

  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data as Tournament[];
    },
  });

  const { data: myEntries = [] } = useQuery({
    queryKey: ['tournament-entries', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('tournament_entries')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as TournamentEntry[];
    },
    enabled: !!user,
  });

  const getLeaderboard = async (tournamentId: string) => {
    const { data } = await supabase
      .from('tournament_entries')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('score', { ascending: false })
      .limit(10);
    return data as TournamentEntry[];
  };

  const getTournamentStatus = (tournament: Tournament) => {
    const now = new Date();
    const start = new Date(tournament.start_date);
    const end = new Date(tournament.end_date);

    if (isPast(end)) return 'completed';
    if (isFuture(start)) return 'upcoming';
    return 'active';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'upcoming':
        return <Badge variant="secondary">Upcoming</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      default:
        return null;
    }
  };

  const activeTournaments = tournaments.filter(t => getTournamentStatus(t) === 'active');
  const upcomingTournaments = tournaments.filter(t => getTournamentStatus(t) === 'upcoming');
  const completedTournaments = tournaments.filter(t => getTournamentStatus(t) === 'completed');

  const hasSubmitted = (tournamentId: string) => {
    return myEntries.some(e => e.tournament_id === tournamentId);
  };

  if (activeTournament) {
    return (
      <>
        <SEO title="Typing Tournaments | TypingLab" description="Join scheduled typing tournaments, compete head-to-head, and earn ranking points against the community." path="/tournaments" />
        <TournamentPlay
        tournament={activeTournament}
        onComplete={() => {
          setActiveTournament(null);
          queryClient.invalidateQueries({ queryKey: ['tournament-entries'] });
        }}
        onBack={() => setActiveTournament(null)}
      />
      </>
  );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-neon-yellow" />
            <h1 className="text-3xl font-bold gradient-text">Tournaments</h1>
          </div>
          <p className="text-muted-foreground">Compete in weekly tournaments and win XP prizes!</p>
        </div>

        <Tabs defaultValue="active">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active ({activeTournaments.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({upcomingTournaments.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedTournaments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {activeTournaments.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No active tournaments right now</p>
                  <p className="text-sm text-muted-foreground mt-2">Check back soon!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeTournaments.map((tournament) => (
                  <Card key={tournament.id} className="glass-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-neon-yellow" />
                          {tournament.name}
                        </CardTitle>
                        {getStatusBadge('active')}
                      </div>
                      <CardDescription>{tournament.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-6 mb-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Ends {format(new Date(tournament.end_date), 'MMM d, h:mm a')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-neon-yellow" />
                          {tournament.prize_xp} XP Prize
                        </div>
                      </div>

                      {hasSubmitted(tournament.id) ? (
                        <div className="flex items-center gap-2 text-green-500">
                          <Medal className="w-5 h-5" />
                          <span>Entry submitted! Check leaderboard for results.</span>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => setActiveTournament(tournament)}
                          disabled={!user}
                        >
                          Enter Tournament
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
            {upcomingTournaments.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="py-12 text-center text-muted-foreground">
                  No upcoming tournaments scheduled
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {upcomingTournaments.map((tournament) => (
                  <Card key={tournament.id} className="glass-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{tournament.name}</CardTitle>
                        {getStatusBadge('upcoming')}
                      </div>
                      <CardDescription>{tournament.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Starts {format(new Date(tournament.start_date), 'MMM d, h:mm a')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-neon-yellow" />
                          {tournament.prize_xp} XP Prize
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {completedTournaments.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="py-12 text-center text-muted-foreground">
                  No completed tournaments yet
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {completedTournaments.slice(0, 5).map((tournament) => (
                  <Card key={tournament.id} className="glass-card opacity-75">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{tournament.name}</CardTitle>
                        {getStatusBadge('completed')}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        Ended {format(new Date(tournament.end_date), 'MMM d, yyyy')}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Tournaments;

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, Award } from 'lucide-react';
import { useGameLeaderboard } from '@/hooks/useGameScores';

const GAME_TYPES = [
  { id: 'word_rain', label: 'Word Rain' },
  { id: 'speed_chase', label: 'Speed Chase' },
  { id: 'typing_defense', label: 'Typing Defense' },
  { id: 'word_scramble', label: 'Word Scramble' },
  { id: 'zombie_survival', label: 'Zombie Survival' },
];

const RankIcon: React.FC<{ rank: number }> = ({ rank }) => {
  if (rank === 1) return <Trophy className="w-5 h-5 text-neon-yellow" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
  return <span className="w-5 text-center text-sm text-muted-foreground font-mono">{rank}</span>;
};

const LeaderboardTable: React.FC<{ gameType: string }> = ({ gameType }) => {
  const { data: scores, isLoading } = useGameLeaderboard(gameType);

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  if (!scores?.length) return <div className="text-center py-8 text-muted-foreground">No scores yet. Be the first!</div>;

  return (
    <div className="space-y-2">
      {scores.map((entry, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg ${i < 3 ? 'bg-primary/5 border border-primary/10' : 'bg-card/50'}`}
        >
          <RankIcon rank={i + 1} />
          <span className="flex-1 font-medium truncate">{entry.username || 'Anonymous'}</span>
          <span className="font-bold text-primary">{entry.score}</span>
          <span className="text-xs text-muted-foreground w-16 text-right">{entry.words_typed} words</span>
        </div>
      ))}
    </div>
  );
};

const GameLeaderboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('word_rain');

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-neon-yellow" />
          Game Leaderboards
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-4">
            {GAME_TYPES.map(g => (
              <TabsTrigger key={g.id} value={g.id} className="text-xs">
                {g.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {GAME_TYPES.map(g => (
            <TabsContent key={g.id} value={g.id}>
              <LeaderboardTable gameType={g.id} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GameLeaderboard;

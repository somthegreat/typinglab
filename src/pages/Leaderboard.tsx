import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useLeaderboard, TimeFilter } from '@/hooks/useLeaderboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award, User, Zap, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import SEO from "@/components/SEO";

const Leaderboard: React.FC = () => {
  const [filter, setFilter] = useState<TimeFilter>('all');
  const { data: leaderboard, isLoading } = useLeaderboard(filter);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const getRankClass = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-300/10 border-gray-400/30';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-orange-500/10 border-amber-600/30';
      default:
        return '';
    }
  };

  return (
    <>
      <SEO title="Global Typing Leaderboard | TypingLab" description="See how your typing speed and accuracy rank against typists worldwide on the global TypingLab leaderboard." path="/leaderboard" />
      <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">Top typists ranked by WPM</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center gap-2 mb-8">
          {(['all', 'week', 'month'] as TimeFilter[]).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className={cn(filter === f && 'neon-glow')}
            >
              {f === 'all' ? 'All Time' : f === 'week' ? 'This Week' : 'This Month'}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : leaderboard?.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">No rankings yet</p>
              <p className="text-sm text-muted-foreground">Complete typing tests to appear on the leaderboard!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {leaderboard?.map((entry, index) => (
              <Card
                key={entry.id}
                className={cn(
                  'glass-card transition-all duration-300 hover:scale-[1.01]',
                  getRankClass(index + 1)
                )}
              >
                <CardContent className="flex items-center gap-4 py-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-12 flex justify-center">
                    {getRankIcon(index + 1)}
                  </div>

                  {/* Avatar & Name */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-10 w-10 border-2 border-border">
                      <AvatarImage src={entry.avatar_url || undefined} />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">
                        {entry.username || 'Anonymous'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.total_tests_completed || 0} tests
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-primary">
                        <Zap className="w-4 h-4" />
                        <span className="text-xl font-bold">{entry.best_wpm || 0}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">WPM</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-correct">
                        <Target className="w-4 h-4" />
                        <span className="text-xl font-bold">{entry.best_accuracy?.toFixed(1) || 0}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Accuracy</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
    </>
  );
};

export default Leaderboard;

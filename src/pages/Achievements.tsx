import React from 'react';
import Layout from '@/components/layout/Layout';
import { Trophy, Zap, Target, Flame, Medal, Lock, BookOpen, Rocket } from 'lucide-react';
import { useAchievements, useUserAchievements } from '@/hooks/useAchievements';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

const iconMap: Record<string, React.ElementType> = {
  Trophy,
  Zap,
  Target,
  Flame,
  Medal,
  BookOpen,
  Rocket,
};

const Achievements: React.FC = () => {
  const { user } = useAuth();
  const { data: achievements, isLoading: achievementsLoading } = useAchievements();
  const { data: userAchievements, isLoading: userLoading } = useUserAchievements();

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Sign in to earn achievements</h2>
          <p className="text-muted-foreground mb-6">Create an account to unlock achievements and track your milestones.</p>
          <Link to="/auth">
            <Button size="lg" className="neon-glow">Sign In</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const isLoading = achievementsLoading || userLoading;
  
  const earnedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);
  const earnedCount = earnedIds.size;
  const totalCount = achievements?.length || 0;

  const getEarnedDate = (achievementId: string) => {
    const ua = userAchievements?.find(u => u.achievement_id === achievementId);
    return ua?.earned_at ? format(new Date(ua.earned_at), 'MMM d, yyyy') : null;
  };

  // Group by category
  const categories = achievements?.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, typeof achievements>) || {};

  const categoryLabels: Record<string, { label: string; color: string }> = {
    speed: { label: '⚡ Speed', color: 'text-primary' },
    accuracy: { label: '🎯 Accuracy', color: 'text-accent' },
    streak: { label: '🔥 Streaks', color: 'text-neon-orange' },
    milestone: { label: '🏆 Milestones', color: 'text-neon-yellow' },
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Achievements</h1>
            <p className="text-muted-foreground">Earn badges by reaching milestones</p>
          </div>
          <div className="stat-card text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-neon-yellow" />
            <div className="text-2xl font-bold">{earnedCount}/{totalCount}</div>
            <div className="text-sm text-muted-foreground">Unlocked</div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading achievements...</div>
        ) : (
          <div className="space-y-8">
            {Object.entries(categories).map(([category, categoryAchievements]) => {
              const catInfo = categoryLabels[category] || { label: category, color: 'text-primary' };
              
              return (
                <div key={category}>
                  <h2 className={`text-xl font-semibold mb-4 ${catInfo.color}`}>{catInfo.label}</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryAchievements?.map((achievement) => {
                      const earned = earnedIds.has(achievement.id);
                      const earnedDate = getEarnedDate(achievement.id);
                      const Icon = iconMap[achievement.icon] || Trophy;

                      return (
                        <div 
                          key={achievement.id} 
                          className={`stat-card flex items-center gap-4 transition-all ${
                            earned 
                              ? 'ring-2 ring-primary/50' 
                              : 'opacity-50 grayscale'
                          }`}
                        >
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            earned ? 'bg-primary/20' : 'bg-muted'
                          }`}>
                            {earned ? (
                              <Icon className="w-7 h-7 text-primary" />
                            ) : (
                              <Lock className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold">{achievement.name}</h3>
                            <p className="text-sm text-muted-foreground truncate">{achievement.description}</p>
                            {earnedDate && (
                              <p className="text-xs text-primary mt-1">Earned {earnedDate}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Achievements;

import React from 'react';
import Layout from '@/components/layout/Layout';
import { Trophy, Zap, Target, Flame, Medal, Lock } from 'lucide-react';

const Achievements: React.FC = () => {
  const achievements = [
    { name: 'First Steps', description: 'Complete your first typing test', icon: Trophy, earned: false },
    { name: 'Speed Demon', description: 'Reach 50 WPM', icon: Zap, earned: false },
    { name: 'Turbo Typist', description: 'Reach 75 WPM', icon: Zap, earned: false },
    { name: 'Lightning Fingers', description: 'Reach 100 WPM', icon: Zap, earned: false },
    { name: 'Perfect Score', description: 'Achieve 100% accuracy', icon: Target, earned: false },
    { name: 'On Fire', description: 'Maintain a 7-day streak', icon: Flame, earned: false },
    { name: 'Marathon Runner', description: 'Complete 50 typing tests', icon: Medal, earned: false },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Achievements</h1>
        <p className="text-muted-foreground mb-8">Earn badges by reaching milestones</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement, i) => (
            <div key={i} className={`stat-card flex items-center gap-4 ${!achievement.earned && 'opacity-50'}`}>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${achievement.earned ? 'bg-primary/20' : 'bg-muted'}`}>
                {achievement.earned ? (
                  <achievement.icon className="w-7 h-7 text-primary" />
                ) : (
                  <Lock className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">{achievement.name}</h3>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Achievements;

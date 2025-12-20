import React from 'react';
import Layout from '@/components/layout/Layout';
import { BarChart3, Zap, Target, Clock, Award } from 'lucide-react';

const Stats: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Your Statistics</h1>
        <p className="text-muted-foreground mb-8">Track your typing progress over time</p>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Zap, label: 'Best WPM', value: '--', color: 'text-primary' },
            { icon: Target, label: 'Avg Accuracy', value: '--%', color: 'text-accent' },
            { icon: Clock, label: 'Tests Completed', value: '0', color: 'text-neon-orange' },
            { icon: Award, label: 'Current Streak', value: '0 days', color: 'text-neon-yellow' },
          ].map(({ icon: Icon, label, value, color }, i) => (
            <div key={i} className="stat-card text-center">
              <Icon className={`w-8 h-8 mx-auto mb-2 ${color}`} />
              <div className="text-3xl font-bold">{value}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        <div className="glass-card rounded-xl p-8 text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No data yet</h3>
          <p className="text-muted-foreground">Complete some typing tests to see your progress charts!</p>
        </div>
      </div>
    </Layout>
  );
};

export default Stats;

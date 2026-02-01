import React from 'react';
import { Link } from 'react-router-dom';
import { Keyboard, Zap, Target, Calendar, ArrowRight, Users, BookOpen, BarChart3, Trophy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';

const Index: React.FC = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="animate-fade-up max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Improve your typing skills today
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
              Master Your
              <span className="gradient-text block">Typing Speed</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
              Build speed and accuracy with real-time feedback, structured lessons, 
              and compete with friends in multiplayer races.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/test">
                <Button size="lg" className="gap-2 px-8 h-12 text-base font-medium">
                  <Keyboard className="w-5 h-5" />
                  Start Typing Test
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/lessons">
                <Button variant="outline" size="lg" className="gap-2 px-8 h-12 text-base font-medium">
                  <BookOpen className="w-5 h-5" />
                  Learn to Type
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold mb-3">Everything you need to type faster</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              A complete platform for improving your typing skills with tools designed for all levels.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { to: '/test', icon: Zap, title: 'Speed Test', description: 'Measure your WPM and accuracy with customizable tests', color: 'text-primary' },
              { to: '/challenge', icon: Calendar, title: 'Daily Challenge', description: 'Complete daily challenges to earn points and build streaks', color: 'text-accent' },
              { to: '/race', icon: Users, title: 'Multiplayer Race', description: 'Compete with friends and other typists in real-time', color: 'text-neon-pink' },
              { to: '/practice', icon: Target, title: 'Focused Practice', description: 'Work on specific keys and patterns to fix weak points', color: 'text-neon-green' },
            ].map(({ to, icon: Icon, title, description, color }) => (
              <Link key={to} to={to} className="group">
                <div className="stat-card h-full">
                  <div className={`w-12 h-12 rounded-lg bg-current/10 flex items-center justify-center mb-4 ${color}`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Secondary Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <Link to="/stats" className="group">
              <div className="stat-card h-full flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">Detailed Statistics</h3>
                  <p className="text-sm text-muted-foreground">Track progress with charts, heatmaps, and performance insights.</p>
                </div>
              </div>
            </Link>
            
            <Link to="/leaderboard" className="group">
              <div className="stat-card h-full flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">Leaderboards</h3>
                  <p className="text-sm text-muted-foreground">See how you rank against other typists worldwide.</p>
                </div>
              </div>
            </Link>
            
            <Link to="/achievements" className="group">
              <div className="stat-card h-full flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-neon-yellow/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-neon-yellow" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">Achievements</h3>
                  <p className="text-sm text-muted-foreground">Unlock badges and rewards as you improve your skills.</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-semibold mb-4">Ready to improve your typing?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Start with a quick test to see where you stand, then use our tools to get faster.
          </p>
          <Link to="/test">
            <Button size="lg" className="gap-2 px-8">
              Take the Test
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Index;

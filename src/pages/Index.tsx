import React from 'react';
import { Link } from 'react-router-dom';
import { Keyboard, Zap, Target, Calendar, ArrowRight, Users, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';

const Index: React.FC = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="animate-fade-up max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="gradient-text">Type Faster.</span>
              <br />
              <span className="text-foreground">Type Better.</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Improve your typing speed and accuracy with real-time feedback, 
              daily challenges, and multiplayer races.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/test">
                <Button size="lg" className="gap-2 px-6">
                  <Keyboard className="w-5 h-5" />
                  Start Typing
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/lessons">
                <Button variant="outline" size="lg" className="gap-2 px-6">
                  <BookOpen className="w-5 h-5" />
                  Learn to Type
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { to: '/test', icon: Zap, title: 'Speed Test', description: 'Test your WPM', color: 'text-primary' },
              { to: '/challenge', icon: Calendar, title: 'Daily Challenge', description: 'Earn points', color: 'text-accent' },
              { to: '/race', icon: Users, title: 'Race Friends', description: 'Compete live', color: 'text-neon-pink' },
              { to: '/practice', icon: Target, title: 'Practice', description: 'Fix weak keys', color: 'text-neon-green' },
            ].map(({ to, icon: Icon, title, description, color }) => (
              <Link key={to} to={to}>
                <div className="stat-card group hover:scale-[1.02] transition-all cursor-pointer h-full">
                  <Icon className={`w-8 h-8 ${color} mb-3`} />
                  <h3 className="text-lg font-semibold mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
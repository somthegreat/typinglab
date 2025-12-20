import React from 'react';
import { Link } from 'react-router-dom';
import { Keyboard, Zap, Target, Trophy, BookOpen, BarChart3, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';

const Index: React.FC = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slow" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Master your typing skills</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">Type Faster.</span>
              <br />
              <span className="text-foreground">Type Better.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              The ultimate typing platform to improve your speed and accuracy. 
              Track your progress, earn achievements, and become a typing master.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/test">
                <Button size="lg" className="gap-2 text-lg px-8 py-6 neon-glow">
                  <Keyboard className="w-5 h-5" />
                  Start Typing
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/lessons">
                <Button variant="outline" size="lg" className="gap-2 text-lg px-8 py-6">
                  <BookOpen className="w-5 h-5" />
                  Learn to Type
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Everything you need to <span className="gradient-text">type faster</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: 'Real-time Stats', description: 'See your WPM and accuracy update as you type with instant feedback.', color: 'text-primary' },
              { icon: Target, title: 'Multiple Modes', description: 'Timed tests, word count, quotes, or custom text - choose your challenge.', color: 'text-accent' },
              { icon: BookOpen, title: 'Typing Lessons', description: 'Learn proper technique with structured lessons from basics to advanced.', color: 'text-neon-green' },
              { icon: BarChart3, title: 'Track Progress', description: 'Beautiful charts showing your improvement over time.', color: 'text-neon-orange' },
              { icon: Trophy, title: 'Achievements', description: 'Earn badges and maintain daily streaks to stay motivated.', color: 'text-neon-yellow' },
              { icon: Keyboard, title: 'Beautiful Design', description: 'Clean, modern interface with dark mode and sound effects.', color: 'text-neon-pink' },
            ].map(({ icon: Icon, title, description, color }, i) => (
              <div key={i} className="stat-card group hover:scale-105 transition-transform" style={{ animationDelay: `${i * 0.1}s` }}>
                <Icon className={`w-10 h-10 ${color} mb-4`} />
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="glass-card rounded-3xl p-12 text-center neon-border">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to improve your typing?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of users who have improved their typing speed. Start your journey today!
            </p>
            <Link to="/auth">
              <Button size="lg" className="gap-2 neon-glow">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;

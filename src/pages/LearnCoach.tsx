import React, { useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/SEO';
import { Link } from 'react-router-dom';
import { ArrowLeft, Brain, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useAICoach } from '@/hooks/useAICoach';

const LearnCoach: React.FC = () => {
  const { user } = useAuth();
  const coach = useAICoach();

  useEffect(() => {
    if (user && !coach.data && !coach.isPending) {
      coach.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-2">Sign in to talk to your AI coach</h2>
          <Link to="/auth"><Button>Sign In</Button></Link>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <SEO title="AI Coach | TypingLab" description="Personalized typing recommendations from your AI coach." path="/learn/coach" />
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Link to="/learn" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Learn
          </Link>

          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-2">
                <Brain className="w-3.5 h-3.5" />
                AI Coach
              </div>
              <h1 className="text-3xl font-bold">Your personalized analysis</h1>
            </div>
            <Button variant="outline" onClick={() => coach.mutate()} disabled={coach.isPending} className="gap-2">
              <RefreshCw className={`w-4 h-4 ${coach.isPending ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {coach.isPending && (
            <div className="glass-card p-8 text-center">
              <Brain className="w-10 h-10 mx-auto mb-3 text-primary animate-pulse" />
              <p className="text-muted-foreground">Analyzing your typing patterns…</p>
            </div>
          )}

          {coach.error && (
            <div className="glass-card p-6 text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-destructive" />
              <p className="text-sm text-muted-foreground">Couldn't reach the coach. Try refresh in a moment.</p>
            </div>
          )}

          {coach.data && (
            <div className="space-y-4">
              <div className="glass-card p-5">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Summary</h3>
                <p className="text-base">{coach.data.summary}</p>
              </div>

              <div className="glass-card p-5">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Recommendations</h3>
                <ul className="space-y-2">
                  {coach.data.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="glass-card p-5">
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">What to practice next</h3>
                  <p className="text-sm mb-4">{coach.data.next_drill}</p>
                  <Link to="/learn/session"><Button size="sm" className="gap-2"><Sparkles className="w-4 h-4" /> Start drill</Button></Link>
                </div>
                <div className="glass-card p-5">
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Most common mistake</h3>
                  <p className="text-sm">{coach.data.common_mistake}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
};

export default LearnCoach;
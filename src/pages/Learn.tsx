import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useCharStats, useDifficultWords } from '@/hooks/useAdaptive';
import {
  charAccuracy,
  getWeakLetters,
  getStrongestLetters,
  getMasteredLetters,
} from '@/lib/adaptive/engine';
import {
  skillScore,
  tierFromScore,
  TIER_LABEL,
  TIER_COLOR,
  nextTier,
  progressToNext,
} from '@/lib/adaptive/progression';
import { ArrowRight, Brain, Target, Sparkles, TrendingUp, Activity, Zap } from 'lucide-react';

const Learn: React.FC = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: stats = [] } = useCharStats();
  const { data: words = [] } = useDifficultWords();

  const summary = useMemo(() => {
    const weak = getWeakLetters(stats, 5);
    const strong = getStrongestLetters(stats, 5);
    const mastered = getMasteredLetters(stats);
    const score = skillScore({
      wpm: profile?.best_wpm ?? 0,
      accuracy: profile?.best_accuracy ?? 0,
      masteredLetters: mastered.length,
    });
    const tier = tierFromScore(score);
    return { weak, strong, mastered, score, tier };
  }, [stats, profile]);

  if (!user) {
    return (
      <>
        <SEO title="Adaptive Learning | TypingLab" description="An AI-powered adaptive typing tutor that learns from your mistakes and builds custom drills automatically." path="/learn" />
        <Layout>
          <div className="container mx-auto px-4 py-16 text-center">
            <Brain className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h1 className="text-3xl font-bold mb-2">Adaptive Learning</h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Sign in to unlock a personalized typing tutor that adapts to your weakest keys, generates custom drills, and tracks your progress over time.
            </p>
            <Link to="/auth"><Button size="lg">Sign In to Start Learning</Button></Link>
          </div>
        </Layout>
      </>
    );
  }

  const next = nextTier(summary.tier);

  return (
    <>
      <SEO title="Adaptive Learning | TypingLab" description="An AI-powered adaptive typing tutor that learns from your mistakes and builds custom drills automatically." path="/learn" />
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Adaptive AI Tutor
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back{profile?.username ? `, ${profile.username}` : ''}.</h1>
            <p className="text-muted-foreground">Your personalized learning hub. Every keystroke makes it smarter.</p>
          </div>

          {/* Tier card */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Current Level</div>
                <div className={`text-3xl font-bold ${TIER_COLOR[summary.tier]}`}>{TIER_LABEL[summary.tier]}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {summary.mastered.length} letters mastered · skill score {Math.round(summary.score)}/100
                </div>
              </div>
              <Link to="/learn/session">
                <Button size="lg" className="gap-2 h-12 px-6">
                  <Zap className="w-5 h-5" />
                  Start Adaptive Session
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{TIER_LABEL[summary.tier]}</span>
                <span>{next ? TIER_LABEL[next] : 'Max tier'}</span>
              </div>
              <Progress value={progressToNext(summary.score)} className="h-2" />
            </div>
          </div>

          {/* Stat row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatBox label="Best WPM" value={profile?.best_wpm ?? 0} icon={Activity} accent="text-primary" />
            <StatBox label="Best Accuracy" value={`${profile?.best_accuracy ?? 0}%`} icon={Target} accent="text-emerald-400" />
            <StatBox label="Streak" value={`${profile?.current_streak ?? 0}d`} icon={TrendingUp} accent="text-amber-400" />
            <StatBox label="Sessions" value={profile?.total_tests_completed ?? 0} icon={Brain} accent="text-violet-400" />
          </div>

          {/* Weak vs strong */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-destructive" />
                Your weakest letters
              </h3>
              {summary.weak.length === 0 ? (
                <p className="text-sm text-muted-foreground">Complete a few sessions so I can find your weak spots.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {summary.weak.map((s) => (
                    <div key={s.key_char} className="px-3 py-1.5 rounded-lg bg-destructive/15 border border-destructive/30">
                      <span className="font-mono font-bold text-base">{s.key_char.toUpperCase()}</span>
                      <span className="text-xs ml-2 text-muted-foreground">{Math.round(charAccuracy(s) * 100)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Your strongest letters
              </h3>
              {summary.strong.length === 0 ? (
                <p className="text-sm text-muted-foreground">Keep typing — strengths will appear here.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {summary.strong.map((s) => (
                    <div key={s.key_char} className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30">
                      <span className="font-mono font-bold text-base">{s.key_char.toUpperCase()}</span>
                      <span className="text-xs ml-2 text-muted-foreground">{Math.round(charAccuracy(s) * 100)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CTA grid */}
          <div className="grid md:grid-cols-3 gap-4">
            <NavCard to="/learn/coach" icon={Brain} title="AI Coach" desc="Get personalized analysis and what to practice next." />
            <NavCard to="/learn/analytics" icon={TrendingUp} title="Analytics" desc="WPM, accuracy, improvements and trouble keys over time." />
            <NavCard to="/learn/session" icon={Zap} title="Adaptive Drill" desc="A custom drill built from your weakest letters and words." />
          </div>

          {words.length > 0 && (
            <div className="glass-card p-5 mt-6">
              <h3 className="text-sm font-semibold mb-3">Words you struggle with</h3>
              <div className="flex flex-wrap gap-2">
                {words.slice(0, 12).map((w) => (
                  <span key={w.word} className="px-2 py-1 rounded-md bg-secondary text-sm font-mono">{w.word}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
};

const StatBox: React.FC<{ label: string; value: React.ReactNode; icon: React.ElementType; accent: string }> = ({ label, value, icon: Icon, accent }) => (
  <div className="glass-card p-4">
    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-1">
      <Icon className={`w-4 h-4 ${accent}`} />
      {label}
    </div>
    <div className="text-2xl font-bold font-mono">{value}</div>
  </div>
);

const NavCard: React.FC<{ to: string; icon: React.ElementType; title: string; desc: string }> = ({ to, icon: Icon, title, desc }) => (
  <Link to={to} className="group">
    <div className="stat-card h-full">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  </Link>
);

export default Learn;
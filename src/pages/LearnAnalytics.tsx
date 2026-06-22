import React, { useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/SEO';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTestResults } from '@/hooks/useTestResults';
import { useCharStats } from '@/hooks/useAdaptive';
import { charAccuracy, charAvgLatency, getWeakLetters } from '@/lib/adaptive/engine';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';

const LearnAnalytics: React.FC = () => {
  const { user } = useAuth();
  const { data: tests = [] } = useTestResults();
  const { data: stats = [] } = useCharStats();

  const timeSeries = useMemo(() => {
    return [...tests]
      .slice(0, 50)
      .reverse()
      .map((t, i) => ({
        i: i + 1,
        wpm: t.wpm,
        accuracy: t.accuracy,
      }));
  }, [tests]);

  const weakBars = useMemo(
    () =>
      getWeakLetters(stats, 10).map((s) => ({
        key: s.key_char.toUpperCase(),
        errors: s.error_count,
        accuracy: Math.round(charAccuracy(s) * 100),
      })),
    [stats]
  );

  const speedBars = useMemo(
    () =>
      [...stats]
        .filter((s) => s.total_count >= 10)
        .sort((a, b) => charAvgLatency(b) - charAvgLatency(a))
        .slice(0, 10)
        .map((s) => ({ key: s.key_char.toUpperCase(), ms: Math.round(charAvgLatency(s)) })),
    [stats]
  );

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-2">Sign in to see analytics</h2>
          <Link to="/auth"><Button>Sign In</Button></Link>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <SEO title="Learning Analytics | TypingLab" description="Charts and trends showing your typing improvement and weak keys." path="/learn/analytics" />
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Link to="/learn" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Learn
          </Link>
          <h1 className="text-3xl font-bold mb-6">Learning Analytics</h1>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <ChartCard title="WPM over recent sessions">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="i" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))' }} />
                  <Line type="monotone" dataKey="wpm" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Accuracy over recent sessions">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="i" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))' }} />
                  <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <ChartCard title="Top trouble keys (errors)">
              {weakBars.length === 0 ? (
                <Empty />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={weakBars}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="key" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))' }} />
                    <Bar dataKey="errors" fill="hsl(var(--destructive))" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
            <ChartCard title="Slowest keys (avg ms)">
              {speedBars.length === 0 ? (
                <Empty />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={speedBars}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="key" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))' }} />
                    <Bar dataKey="ms" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>
        </div>
      </Layout>
    </>
  );
};

const ChartCard: React.FC<React.PropsWithChildren<{ title: string }>> = ({ title, children }) => (
  <div className="glass-card p-5">
    <h3 className="text-sm font-semibold mb-3">{title}</h3>
    {children}
  </div>
);

const Empty: React.FC = () => (
  <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
    Not enough data yet — run a few adaptive drills to populate this chart.
  </div>
);

export default LearnAnalytics;
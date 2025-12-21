import React from 'react';
import Layout from '@/components/layout/Layout';
import { BarChart3, Zap, Target, Clock, Award, TrendingUp } from 'lucide-react';
import { useTestResults } from '@/hooks/useTestResults';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Stats: React.FC = () => {
  const { user } = useAuth();
  const { data: testResults, isLoading: resultsLoading } = useTestResults();
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Sign in to track your progress</h2>
          <p className="text-muted-foreground mb-6">Create an account to save your typing statistics and view your improvement over time.</p>
          <Link to="/auth">
            <Button size="lg" className="neon-glow">Sign In</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const isLoading = resultsLoading || profileLoading;

  // Prepare chart data
  const chartData = testResults?.slice(0, 30).reverse().map((result, index) => ({
    name: result.created_at ? format(new Date(result.created_at), 'MMM d') : `Test ${index + 1}`,
    wpm: result.wpm,
    accuracy: result.accuracy,
    rawWpm: result.raw_wpm,
  })) || [];

  // Calculate averages
  const avgWpm = testResults && testResults.length > 0 
    ? Math.round(testResults.reduce((sum, r) => sum + r.wpm, 0) / testResults.length)
    : 0;
  const avgAccuracy = testResults && testResults.length > 0
    ? Math.round(testResults.reduce((sum, r) => sum + Number(r.accuracy), 0) / testResults.length)
    : 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Your Statistics</h1>
        <p className="text-muted-foreground mb-8">Track your typing progress over time</p>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : (
          <>
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: Zap, label: 'Best WPM', value: profile?.best_wpm || '--', color: 'text-primary' },
                { icon: Target, label: 'Avg Accuracy', value: `${avgAccuracy || '--'}%`, color: 'text-accent' },
                { icon: Clock, label: 'Tests Completed', value: profile?.total_tests_completed || 0, color: 'text-neon-orange' },
                { icon: Award, label: 'Current Streak', value: `${profile?.current_streak || 0} days`, color: 'text-neon-yellow' },
              ].map(({ icon: Icon, label, value, color }, i) => (
                <div key={i} className="stat-card text-center">
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${color}`} />
                  <div className="text-3xl font-bold">{value}</div>
                  <div className="text-sm text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="stat-card text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{avgWpm}</div>
                <div className="text-sm text-muted-foreground">Average WPM</div>
              </div>
              <div className="stat-card text-center">
                <Target className="w-6 h-6 mx-auto mb-2 text-accent" />
                <div className="text-2xl font-bold">{profile?.best_accuracy ? `${Number(profile.best_accuracy).toFixed(1)}%` : '--'}</div>
                <div className="text-sm text-muted-foreground">Best Accuracy</div>
              </div>
              <div className="stat-card text-center">
                <Award className="w-6 h-6 mx-auto mb-2 text-neon-yellow" />
                <div className="text-2xl font-bold">{profile?.total_words_typed?.toLocaleString() || 0}</div>
                <div className="text-sm text-muted-foreground">Words Typed</div>
              </div>
            </div>

            {chartData.length > 0 ? (
              <div className="space-y-8">
                <div className="glass-card rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">WPM Progress</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Area type="monotone" dataKey="wpm" stroke="hsl(var(--primary))" fill="url(#wpmGradient)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-card rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Accuracy Trend</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[80, 100]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ fill: 'hsl(var(--accent))' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-card rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Tests</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-muted-foreground text-sm border-b border-border">
                          <th className="pb-3">Date</th>
                          <th className="pb-3">Mode</th>
                          <th className="pb-3">WPM</th>
                          <th className="pb-3">Accuracy</th>
                          <th className="pb-3">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testResults?.slice(0, 10).map((result) => (
                          <tr key={result.id} className="border-b border-border/50">
                            <td className="py-3">{result.created_at ? format(new Date(result.created_at), 'MMM d, h:mm a') : '-'}</td>
                            <td className="py-3 capitalize">{result.test_mode}</td>
                            <td className="py-3 font-semibold text-primary">{result.wpm}</td>
                            <td className="py-3 text-accent">{Number(result.accuracy).toFixed(1)}%</td>
                            <td className="py-3 text-muted-foreground">{result.test_duration}s</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-xl p-8 text-center">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No data yet</h3>
                <p className="text-muted-foreground mb-4">Complete some typing tests to see your progress charts!</p>
                <Link to="/test">
                  <Button className="neon-glow">Start Typing</Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Stats;

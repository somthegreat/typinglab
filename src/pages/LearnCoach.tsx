import React, { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/SEO';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Brain, Sparkles, RefreshCw, AlertCircle,
  TrendingUp, Target, MessageSquare, Send, User as UserIcon, Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useAICoach } from '@/hooks/useAICoach';
import { useTestResults } from '@/hooks/useTestResults';
import { useCharStats, useDifficultWords } from '@/hooks/useAdaptive';
import { useAIChat } from '@/hooks/useAIChat';
import { charAccuracy, getWeakLetters } from '@/lib/adaptive/engine';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Area, AreaChart,
} from 'recharts';
import ReactMarkdown from 'react-markdown';

const LearnCoach: React.FC = () => {
  const { user } = useAuth();
  const coach = useAICoach();
  const { data: tests = [] } = useTestResults();
  const { data: charStats = [] } = useCharStats();
  const { data: hardWords = [] } = useDifficultWords();
  const chat = useAIChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && !coach.data && !coach.isPending) {
      coach.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [chat.messages]);

  const chartData = useMemo(() => {
    return [...tests]
      .slice(0, 30)
      .reverse()
      .map((t, i) => ({
        idx: i + 1,
        wpm: t.wpm,
        accuracy: Number(t.accuracy),
        date: t.created_at ? new Date(t.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '',
      }));
  }, [tests]);

  const recentTests = useMemo(() => tests.slice(0, 8), [tests]);

  const improvements = useMemo(() => {
    const weak = getWeakLetters(charStats, 6).map((s) => ({
      label: s.key_char.toUpperCase(),
      accuracy: Math.round(charAccuracy(s) * 100),
      samples: s.total_count,
    }));
    return weak;
  }, [charStats]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || chat.isLoading) return;
    setInput('');
    chat.sendMessage(text);
  };

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
        <div className="container mx-auto px-4 py-8 max-w-5xl">
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

              <div className="grid md:grid-cols-2 gap-4">
                <div className="glass-card p-5">
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-primary" /> Your plan
                  </h3>
                  <ul className="space-y-2">
                    {coach.data.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="mt-0.5 inline-flex w-5 h-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-[11px] font-semibold">{i + 1}</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="glass-card p-5">
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">What to practice next</h3>
                  <p className="text-sm mb-4">{coach.data.next_drill}</p>
                  <Link to="/learn/session"><Button size="sm" className="gap-2"><Sparkles className="w-4 h-4" /> Start drill</Button></Link>
                  <p className="text-xs text-muted-foreground mt-4"><span className="font-medium text-foreground">Common mistake:</span> {coach.data.common_mistake}</p>
                </div>
              </div>
            </div>
          )}

          {/* Progress charts */}
          <div className="grid lg:grid-cols-2 gap-4 mt-6">
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> WPM over last {chartData.length || 0} tests
              </h3>
              <p className="text-xs text-muted-foreground mb-3">Speed trend across your recent sessions.</p>
              {chartData.length === 0 ? (
                <p className="text-sm text-muted-foreground">Complete a test to see your progress chart.</p>
              ) : (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="wpmFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="idx" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                      <Area type="monotone" dataKey="wpm" stroke="hsl(var(--primary))" fill="url(#wpmFill)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" /> Accuracy over time
              </h3>
              <p className="text-xs text-muted-foreground mb-3">Keep this line as flat and high as possible.</p>
              {chartData.length === 0 ? (
                <p className="text-sm text-muted-foreground">No accuracy data yet.</p>
              ) : (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="idx" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                      <Line type="monotone" dataKey="accuracy" stroke="rgb(52 211 153)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Improvement areas */}
          <div className="glass-card p-5 mt-6">
            <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" /> Where you can improve
            </h3>
            <p className="text-xs text-muted-foreground mb-4">Letters and words your fingers stumble on the most.</p>
            {improvements.length === 0 ? (
              <p className="text-sm text-muted-foreground">Run a few drills so we can surface your trouble spots.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                {improvements.map((it) => (
                  <div key={it.label} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-destructive/15 border border-destructive/30 flex items-center justify-center font-mono font-bold">
                      {it.label}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{it.samples} samples</span>
                        <span className="font-mono">{it.accuracy}%</span>
                      </div>
                      <Progress value={it.accuracy} className="h-1.5" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {hardWords.length > 0 && (
              <div className="border-t border-border/50 pt-3">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Words that trip you up</div>
                <div className="flex flex-wrap gap-2">
                  {hardWords.slice(0, 12).map((w) => (
                    <span key={w.word} className="px-2 py-1 rounded-md bg-secondary text-sm font-mono">{w.word}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recent tests */}
          <div className="glass-card p-5 mt-6">
            <h3 className="text-sm font-semibold mb-3">Recent tests</h3>
            {recentTests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tests recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border/50">
                      <th className="py-2 pr-3">Date</th>
                      <th className="py-2 pr-3">Mode</th>
                      <th className="py-2 pr-3 text-right">WPM</th>
                      <th className="py-2 pr-3 text-right">Raw</th>
                      <th className="py-2 pr-3 text-right">Accuracy</th>
                      <th className="py-2 pr-3 text-right">Chars</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTests.map((t) => (
                      <tr key={t.id} className="border-b border-border/30 last:border-0">
                        <td className="py-2 pr-3 text-muted-foreground">
                          {t.created_at ? new Date(t.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="py-2 pr-3"><span className="px-2 py-0.5 rounded-full bg-secondary text-xs">{t.test_mode}</span></td>
                        <td className="py-2 pr-3 text-right font-mono font-semibold">{t.wpm}</td>
                        <td className="py-2 pr-3 text-right font-mono text-muted-foreground">{t.raw_wpm}</td>
                        <td className="py-2 pr-3 text-right font-mono">{Number(t.accuracy).toFixed(1)}%</td>
                        <td className="py-2 pr-3 text-right font-mono text-muted-foreground">{t.total_chars}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Chat */}
          <div className="glass-card p-5 mt-6">
            <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" /> Ask your coach
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Ask anything — "Why am I slow on numbers?", "Build me a 10-minute plan", "How do I fix my pinky?".
            </p>

            <div
              ref={scrollRef}
              className="h-72 overflow-y-auto rounded-lg border border-border/50 bg-background/40 p-3 mb-3 space-y-3"
            >
              {chat.messages.length === 0 && (
                <div className="text-sm text-muted-foreground text-center mt-12">
                  Start a conversation below.
                </div>
              )}
              {chat.messages.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="w-7 h-7 shrink-0 rounded-full bg-primary/15 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      m.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-secondary text-foreground rounded-bl-sm'
                    }`}
                  >
                    {m.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                        <ReactMarkdown>{m.content || '…'}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    )}
                  </div>
                  {m.role === 'user' && (
                    <div className="w-7 h-7 shrink-0 rounded-full bg-secondary flex items-center justify-center">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
              {chat.isLoading && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 shrink-0 rounded-full bg-primary/15 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                  <div className="bg-secondary rounded-2xl px-3 py-2 text-sm text-muted-foreground">Thinking…</div>
                </div>
              )}
              {chat.error && (
                <div className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {chat.error}</div>
              )}
            </div>

            <form onSubmit={handleSend} className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask the coach a question…"
                aria-label="Ask the coach a question"
                className="min-h-[44px] max-h-32 resize-none"
                rows={1}
              />
              <Button type="submit" disabled={!input.trim() || chat.isLoading} className="gap-1 shrink-0">
                <Send className="w-4 h-4" /> Send
              </Button>
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default LearnCoach;
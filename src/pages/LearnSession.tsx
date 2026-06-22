import React, { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/SEO';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTypingTest } from '@/hooks/useTypingTest';
import { useCharStats, useDifficultWords, useRecordCharStats } from '@/hooks/useAdaptive';
import { generateAdaptiveExercise, adjustDifficulty, exerciseLength, Difficulty } from '@/lib/adaptive/generator';
import { buildPayload } from '@/lib/adaptive/tracker';
import { RefreshCw, Sparkles, ChevronUp, ChevronDown, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const LearnSession: React.FC = () => {
  const { user } = useAuth();
  const { data: stats = [] } = useCharStats();
  const { data: difficultWords = [] } = useDifficultWords();
  const recordStats = useRecordCharStats();

  const [difficulty, setDifficulty] = useState<Difficulty>(2);
  const [exercise, setExercise] = useState<string>('');
  const [round, setRound] = useState(1);
  const [history, setHistory] = useState<{ wpm: number; accuracy: number; difficulty: Difficulty }[]>([]);
  const keyTimestamps = useRef<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const newExercise = (d: Difficulty) => {
    const text = generateAdaptiveExercise({
      stats,
      difficultWords,
      difficulty: d,
      length: exerciseLength(d),
    });
    setExercise(text);
    keyTimestamps.current = [];
  };

  useEffect(() => {
    if (!exercise && (stats.length || !user)) {
      newExercise(difficulty);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats.length, user]);

  const handleComplete = async () => {
    const finalStats = stats; // dummy ref; below uses real stats from hook
  };

  const {
    currentIndex,
    errors,
    stats: runStats,
    isStarted,
    isFinished,
    handleKeyDown,
    reset,
    targetText,
  } = useTypingTest({
    text: exercise || ' ',
    onComplete: async (s) => {
      // record per-char stats
      if (user) {
        const payload = buildPayload({
          targetText: exercise,
          errors,
          keyTimestamps: keyTimestamps.current,
        });
        try {
          await recordStats.mutateAsync(payload);
        } catch (e) {
          console.error('record stats failed', e);
        }
      }
      setHistory((h) => [...h, { wpm: s.wpm, accuracy: s.accuracy, difficulty }]);
    },
  });

  const keyDownWrapper = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key.length === 1) {
      keyTimestamps.current[currentIndex] = performance.now();
    }
    handleKeyDown(e);
  };

  const nextRound = () => {
    const recent = history.slice(-3);
    const avgAcc = recent.length
      ? recent.reduce((s, r) => s + r.accuracy, 0) / recent.length
      : runStats.accuracy;
    const newDiff = adjustDifficulty(difficulty, avgAcc);
    setDifficulty(newDiff);
    setRound((r) => r + 1);
    reset();
    newExercise(newDiff);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const reroll = () => {
    reset();
    newExercise(difficulty);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const recentAcc = useMemo(() => {
    const r = history.slice(-3);
    return r.length ? Math.round(r.reduce((s, x) => s + x.accuracy, 0) / r.length) : null;
  }, [history]);

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2">Sign in to start adaptive practice</h2>
          <Link to="/auth"><Button size="lg">Sign In</Button></Link>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <SEO title="Adaptive Session | TypingLab" description="A continuously-adapting typing drill personalized to your weak letters and words." path="/learn/session" />
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <Link to="/learn" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Learn
            </Link>
            <div className="flex items-center gap-2">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Difficulty</div>
              <div className="px-3 py-1 rounded-md bg-secondary font-mono text-sm">{difficulty} / 5</div>
              <Button size="icon" variant="ghost" onClick={() => setDifficulty((d) => Math.min(5, (d + 1) as Difficulty) as Difficulty)}>
                <ChevronUp className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setDifficulty((d) => Math.max(1, (d - 1) as Difficulty) as Difficulty)}>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-10 mb-6">
            <Stat label="Round" value={round} />
            <Stat label="WPM" value={runStats.wpm} />
            <Stat label="Accuracy" value={`${runStats.accuracy}%`} />
            {recentAcc !== null && <Stat label="Avg (last 3)" value={`${recentAcc}%`} />}
          </div>

          <div
            className="glass-card p-8 mb-6 cursor-text relative min-h-[180px]"
            onClick={() => inputRef.current?.focus()}
          >
            <input
              ref={inputRef}
              type="text"
              className="absolute opacity-0 pointer-events-none"
              onKeyDown={keyDownWrapper}
              autoFocus
            />
            <div className="font-mono text-xl tracking-wide leading-relaxed select-none">
              {targetText.split('').map((char, i) => {
                let cls = 'char-untyped';
                if (i < currentIndex) cls = errors.has(i) ? 'char-incorrect' : 'char-correct';
                else if (i === currentIndex) cls = 'char-current';
                return (
                  <span key={i} className={cls}>{char}</span>
                );
              })}
            </div>
            {!isStarted && !isFinished && exercise && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
                <p className="text-muted-foreground">Press any button to start</p>
              </div>
            )}
            {isFinished && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/85 backdrop-blur-sm rounded-xl flex-col gap-3">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">{runStats.wpm} WPM · {runStats.accuracy}%</div>
                  <div className="text-sm text-muted-foreground mb-4">Stats recorded — adapting next drill...</div>
                </div>
                <Button size="lg" onClick={nextRound} className="gap-2">
                  <Sparkles className="w-4 h-4" /> Next Adaptive Drill
                </Button>
              </div>
            )}
          </div>

          <div className={cn("flex justify-center gap-2", isFinished && "hidden")}>
            <Button variant="ghost" onClick={reroll} className="gap-2">
              <RefreshCw className="w-4 h-4" /> New text (same difficulty)
            </Button>
          </div>

          {history.length > 0 && (
            <div className="mt-8 glass-card p-4">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Session history</h3>
              <div className="flex flex-wrap gap-2">
                {history.map((h, i) => (
                  <span key={i} className="px-2 py-1 rounded bg-secondary text-xs font-mono">
                    R{i + 1}: {h.wpm}wpm {h.accuracy}% · d{h.difficulty}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
};

const Stat: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="text-center">
    <div className="text-3xl font-bold font-mono">{value}</div>
    <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
  </div>
);

export default LearnSession;
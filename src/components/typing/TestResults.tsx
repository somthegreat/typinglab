import React from 'react';
import { TypingStats } from '@/hooks/useTypingTest';
import { Button } from '@/components/ui/button';
import { RefreshCw, RotateCcw, Target, Zap, Clock, CheckCircle, XCircle } from 'lucide-react';

interface TestResultsProps {
  stats: TypingStats;
  onRetry: () => void;
  onNewTest: () => void;
}

const TestResults: React.FC<TestResultsProps> = ({ stats, onRetry, onNewTest }) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 animate-fade-up">
      <h2 className="text-3xl font-bold text-center mb-8 gradient-text">Test Complete!</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="stat-card text-center">
          <Zap className="w-8 h-8 mx-auto mb-2 text-primary" />
          <div className="text-4xl font-bold text-foreground">{stats.wpm}</div>
          <div className="text-sm text-muted-foreground">WPM</div>
        </div>

        <div className="stat-card text-center">
          <Target className="w-8 h-8 mx-auto mb-2 text-accent" />
          <div className="text-4xl font-bold text-correct">{stats.accuracy}%</div>
          <div className="text-sm text-muted-foreground">Accuracy</div>
        </div>

        <div className="stat-card text-center">
          <Clock className="w-8 h-8 mx-auto mb-2 text-neon-orange" />
          <div className="text-4xl font-bold text-foreground">{stats.timeElapsed}s</div>
          <div className="text-sm text-muted-foreground">Time</div>
        </div>

        <div className="stat-card text-center">
          <Zap className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <div className="text-3xl font-bold text-foreground">{stats.rawWpm}</div>
          <div className="text-sm text-muted-foreground">Raw WPM</div>
        </div>

        <div className="stat-card text-center">
          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-correct" />
          <div className="text-3xl font-bold text-foreground">{stats.correctChars}</div>
          <div className="text-sm text-muted-foreground">Correct</div>
        </div>

        <div className="stat-card text-center">
          <XCircle className="w-8 h-8 mx-auto mb-2 text-destructive" />
          <div className="text-3xl font-bold text-foreground">{stats.incorrectChars}</div>
          <div className="text-sm text-muted-foreground">Errors</div>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Button variant="outline" size="lg" onClick={onRetry} className="gap-2">
          <RotateCcw className="w-5 h-5" />
          Retry
        </Button>
        <Button size="lg" onClick={onNewTest} className="gap-2 neon-glow">
          <RefreshCw className="w-5 h-5" />
          New Test
        </Button>
      </div>
    </div>
  );
};

export default TestResults;

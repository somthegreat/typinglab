import React from 'react';
import { TypingStats } from '@/hooks/useTypingTest';
import { Button } from '@/components/ui/button';
import { RefreshCw, RotateCcw, Target, Zap, Clock, CheckCircle, XCircle, Play, Shield, ShieldAlert, Share2 } from 'lucide-react';
import { TestReplay } from '@/hooks/useTestReplay';
import { CheatDetection } from '@/hooks/useAntiCheat';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';

interface TestResultsProps {
  stats: TypingStats;
  onRetry: () => void;
  onNewTest: () => void;
  replay?: TestReplay | null;
  onPlayReplay?: () => void;
  antiCheatStatus?: { isValid: boolean; score: number; warnings: CheatDetection[] };
}

const TestResults: React.FC<TestResultsProps> = ({ 
  stats, 
  onRetry, 
  onNewTest,
  replay,
  onPlayReplay,
  antiCheatStatus
}) => {
  const handleShare = async () => {
    const shareText = `🎯 Just scored ${stats.wpm} WPM with ${stats.accuracy}% accuracy on TypeMaster! Can you beat my score?`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TypeMaster Results',
          text: shareText,
          url: window.location.origin,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: 'Copied to clipboard!',
        description: 'Share your results with friends',
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 animate-fade-up">
      <h2 className="text-3xl font-bold text-center mb-2 gradient-text">Test Complete!</h2>
      
      {/* Anti-cheat status */}
      {antiCheatStatus && (
        <div className="flex justify-center mb-6">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                antiCheatStatus.isValid 
                  ? 'bg-correct/20 text-correct' 
                  : 'bg-destructive/20 text-destructive'
              }`}>
                {antiCheatStatus.isValid ? (
                  <>
                    <Shield className="w-4 h-4" />
                    Verified ({antiCheatStatus.score}% trust)
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4" />
                    Not verified
                  </>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {antiCheatStatus.isValid 
                ? 'This test passed anti-cheat validation'
                : `Issues detected: ${antiCheatStatus.warnings.map(w => w.message).join(', ')}`
              }
            </TooltipContent>
          </Tooltip>
        </div>
      )}

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

      <div className="flex flex-wrap justify-center gap-4">
        <Button variant="outline" size="lg" onClick={onRetry} className="gap-2">
          <RotateCcw className="w-5 h-5" />
          Retry
        </Button>
        <Button size="lg" onClick={onNewTest} className="gap-2 neon-glow">
          <RefreshCw className="w-5 h-5" />
          New Test
        </Button>
        {replay && onPlayReplay && (
          <Button variant="secondary" size="lg" onClick={onPlayReplay} className="gap-2">
            <Play className="w-5 h-5" />
            Watch Replay
          </Button>
        )}
        <Button variant="ghost" size="lg" onClick={handleShare} className="gap-2">
          <Share2 className="w-5 h-5" />
          Share
        </Button>
      </div>
    </div>
  );
};

export default TestResults;

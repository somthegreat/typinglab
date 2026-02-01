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
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Test Complete</h2>
        
        {/* Anti-cheat status */}
        {antiCheatStatus && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                antiCheatStatus.isValid 
                  ? 'bg-correct/10 text-correct' 
                  : 'bg-destructive/10 text-destructive'
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
        )}
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="stat-card text-center py-8">
          <Zap className="w-6 h-6 mx-auto mb-3 text-primary" />
          <div className="text-4xl font-bold text-foreground mb-1">{stats.wpm}</div>
          <div className="text-sm text-muted-foreground font-medium">WPM</div>
        </div>

        <div className="stat-card text-center py-8">
          <Target className="w-6 h-6 mx-auto mb-3 text-accent" />
          <div className="text-4xl font-bold text-correct mb-1">{stats.accuracy}%</div>
          <div className="text-sm text-muted-foreground font-medium">Accuracy</div>
        </div>

        <div className="stat-card text-center py-8">
          <Clock className="w-6 h-6 mx-auto mb-3 text-muted-foreground" />
          <div className="text-4xl font-bold text-foreground mb-1">{stats.timeElapsed}s</div>
          <div className="text-sm text-muted-foreground font-medium">Time</div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="stat-card text-center py-4">
          <div className="text-2xl font-semibold text-foreground">{stats.rawWpm}</div>
          <div className="text-xs text-muted-foreground">Raw WPM</div>
        </div>

        <div className="stat-card text-center py-4">
          <div className="flex items-center justify-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-correct" />
            <span className="text-2xl font-semibold text-foreground">{stats.correctChars}</span>
          </div>
          <div className="text-xs text-muted-foreground">Correct</div>
        </div>

        <div className="stat-card text-center py-4">
          <div className="flex items-center justify-center gap-1.5">
            <XCircle className="w-4 h-4 text-destructive" />
            <span className="text-2xl font-semibold text-foreground">{stats.incorrectChars}</span>
          </div>
          <div className="text-xs text-muted-foreground">Errors</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="outline" size="lg" onClick={onRetry} className="gap-2 h-11">
          <RotateCcw className="w-4 h-4" />
          Retry Same Text
        </Button>
        <Button size="lg" onClick={onNewTest} className="gap-2 h-11">
          <RefreshCw className="w-4 h-4" />
          New Test
        </Button>
        {replay && onPlayReplay && (
          <Button variant="outline" size="lg" onClick={onPlayReplay} className="gap-2 h-11">
            <Play className="w-4 h-4" />
            Watch Replay
          </Button>
        )}
        <Button variant="ghost" size="lg" onClick={handleShare} className="gap-2 h-11">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </div>
    </div>
  );
};

export default TestResults;

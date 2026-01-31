import React, { useState } from 'react';
import { TestReplay, useReplayPlayer } from '@/hooks/useTestReplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, FastForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TestReplayPlayerProps {
  replay: TestReplay;
  onClose?: () => void;
}

const TestReplayPlayer: React.FC<TestReplayPlayerProps> = ({ replay, onClose }) => {
  const [speed, setSpeed] = useState(1);
  const {
    isPlaying,
    currentText,
    currentWpm,
    currentAccuracy,
    errors,
    playReplay,
    pauseReplay,
    resetReplay,
  } = useReplayPlayer();

  const handlePlay = () => {
    if (isPlaying) {
      pauseReplay();
    } else {
      if (currentText.length >= replay.targetText.length) {
        resetReplay();
      }
      playReplay(replay, speed);
    }
  };

  const handleReset = () => {
    resetReplay();
  };

  const handleSpeedChange = (value: number[]) => {
    setSpeed(value[0]);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Test Replay</span>
          <div className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
            <span>{replay.finalWpm} WPM</span>
            <span>•</span>
            <span>{replay.finalAccuracy.toFixed(1)}%</span>
            <span>•</span>
            <span>{format(replay.createdAt, 'MMM d, h:mm a')}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Bar */}
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{currentWpm}</div>
            <div className="text-sm text-muted-foreground">WPM</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-correct">{currentAccuracy.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {currentText.length}/{replay.targetText.length}
            </div>
            <div className="text-sm text-muted-foreground">Progress</div>
          </div>
        </div>

        {/* Typing Display */}
        <div className="glass-card rounded-xl p-6 font-mono text-lg leading-relaxed tracking-wide min-h-[150px]">
          {replay.targetText.split('').map((char, index) => {
            let className = 'text-muted-foreground';
            if (index < currentText.length) {
              className = errors.has(index) ? 'text-destructive bg-destructive/20 rounded' : 'text-correct';
            } else if (index === currentText.length) {
              className = 'border-l-2 border-primary animate-pulse';
            }
            return (
              <span key={index} className={className}>
                {char}
              </span>
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="icon" onClick={handleReset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button size="lg" onClick={handlePlay} className="gap-2">
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Play
              </>
            )}
          </Button>
          <div className="flex items-center gap-2 w-40">
            <FastForward className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={[speed]}
              onValueChange={handleSpeedChange}
              min={0.5}
              max={4}
              step={0.5}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-8">{speed}x</span>
          </div>
        </div>

        {onClose && (
          <div className="flex justify-center">
            <Button variant="ghost" onClick={onClose}>
              Close Replay
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestReplayPlayer;

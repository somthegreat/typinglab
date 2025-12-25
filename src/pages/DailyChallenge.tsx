import React, { useState, useRef, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useDailyChallenge, useChallengeCompletion, useCompleteChallenge } from '@/hooks/useDailyChallenge';
import { useTypingTest, TypingStats } from '@/hooks/useTypingTest';
import { useAuth } from '@/contexts/AuthContext';
import { useSound } from '@/contexts/SoundContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Target, Zap, Trophy, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const DailyChallenge: React.FC = () => {
  const { user } = useAuth();
  const { data: challenge, isLoading: challengeLoading } = useDailyChallenge();
  const { data: completion, isLoading: completionLoading } = useChallengeCompletion(challenge?.id);
  const completeChallenge = useCompleteChallenge();
  const { playKeySound, playErrorSound, playSuccessSound } = useSound();
  
  const [showResults, setShowResults] = useState(false);
  const [finalStats, setFinalStats] = useState<TypingStats | null>(null);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleComplete = async (stats: TypingStats) => {
    setFinalStats(stats);
    setShowResults(true);

    if (user && challenge) {
      try {
        const result = await completeChallenge.mutateAsync({
          challengeId: challenge.id,
          wpm: stats.wpm,
          accuracy: stats.accuracy,
          targetWpm: challenge.target_wpm,
          targetAccuracy: challenge.target_accuracy,
          rewardPoints: challenge.reward_points,
        });

        if (result.passed) {
          playSuccessSound();
          toast.success(`Challenge completed! +${challenge.reward_points} points`);
        } else {
          toast.info('Challenge attempted. Try again tomorrow!');
        }
      } catch (error) {
        toast.error('Failed to save result');
      }
    }
  };

  const { input, isStarted, currentIndex, errors, stats, handleKeyDown, reset, targetText } = useTypingTest({
    text: challenge?.text_content || '',
    onComplete: handleComplete,
  });

  const handleKeyDownWrapper = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setPressedKey(e.key);
    if (e.key.length === 1) {
      const expectedChar = targetText[currentIndex];
      if (e.key === expectedChar) {
        playKeySound();
      } else {
        playErrorSound();
      }
    }
    handleKeyDown(e);
    setTimeout(() => setPressedKey(null), 100);
  };

  if (challengeLoading || completionLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Loading challenge...</div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold gradient-text mb-4">Daily Challenge</h1>
          <p className="text-muted-foreground mb-6">Sign in to participate in daily challenges</p>
          <Link to="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const passed = completion && completion.wpm >= (challenge?.target_wpm || 0) && completion.accuracy >= (challenge?.target_accuracy || 0);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Daily Challenge</h1>
          <p className="text-muted-foreground">Complete today's typing challenge to earn points</p>
        </div>

        {/* Challenge Targets */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="stat-card text-center">
            <CardContent className="p-4">
              <Zap className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{challenge?.target_wpm} WPM</div>
              <div className="text-xs text-muted-foreground">Target Speed</div>
            </CardContent>
          </Card>
          <Card className="stat-card text-center">
            <CardContent className="p-4">
              <Target className="w-6 h-6 mx-auto mb-2 text-accent" />
              <div className="text-2xl font-bold">{challenge?.target_accuracy}%</div>
              <div className="text-xs text-muted-foreground">Target Accuracy</div>
            </CardContent>
          </Card>
          <Card className="stat-card text-center">
            <CardContent className="p-4">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-neon-yellow" />
              <div className="text-2xl font-bold">+{challenge?.reward_points}</div>
              <div className="text-xs text-muted-foreground">Reward Points</div>
            </CardContent>
          </Card>
        </div>

        {completion ? (
          <Card className={`glass-card ${passed ? 'border-correct' : 'border-destructive'}`}>
            <CardHeader className="text-center">
              {passed ? (
                <CheckCircle className="w-16 h-16 mx-auto text-correct mb-4" />
              ) : (
                <XCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
              )}
              <CardTitle className="text-2xl">
                {passed ? 'Challenge Completed!' : 'Challenge Attempted'}
              </CardTitle>
              <CardDescription>
                {passed
                  ? `You earned ${completion.points_earned} points!`
                  : 'Come back tomorrow for a new challenge'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold">{completion.wpm}</div>
                  <div className="text-sm text-muted-foreground">WPM</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{completion.accuracy}%</div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : showResults && finalStats ? (
          <Card className="glass-card">
            <CardHeader className="text-center">
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center gap-8 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{finalStats.wpm}</div>
                  <div className="text-sm text-muted-foreground">WPM</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{finalStats.accuracy}%</div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Live Stats */}
            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">{stats.wpm}</div>
                <div className="text-sm text-muted-foreground">WPM</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-correct">{stats.accuracy}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>

            {/* Typing Area */}
            <div
              className="glass-card rounded-2xl p-8 mb-6 cursor-text relative"
              onClick={() => inputRef.current?.focus()}
            >
              <input
                ref={inputRef}
                type="text"
                className="absolute opacity-0 pointer-events-none"
                onKeyDown={handleKeyDownWrapper}
                autoFocus
              />
              
              <div className="typing-text leading-loose">
                {targetText.split('').map((char, index) => {
                  let className = 'char-untyped';
                  if (index < currentIndex) {
                    className = errors.has(index) ? 'char-incorrect' : 'char-correct';
                  } else if (index === currentIndex) {
                    className = 'char-current';
                  }
                  return (
                    <span key={index} className={className}>
                      {char}
                    </span>
                  );
                })}
              </div>

              {!isStarted && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-2xl">
                  <p className="text-muted-foreground text-lg">Click here and start typing...</p>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <Button variant="ghost" size="lg" onClick={reset} className="gap-2">
                <RefreshCw className="w-5 h-5" />
                Reset
              </Button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default DailyChallenge;
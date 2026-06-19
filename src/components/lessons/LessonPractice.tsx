import React, { useRef, useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { ArrowLeft, RotateCcw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Lesson, useUpdateLessonProgress } from '@/hooks/useLessons';
import { useTypingTest, TypingStats } from '@/hooks/useTypingTest';
import { useCheckAchievements } from '@/hooks/useAchievements';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LessonPracticeProps {
  lesson: Lesson;
  onBack: () => void;
}

const LessonPractice: React.FC<LessonPracticeProps> = ({ lesson, onBack }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showResults, setShowResults] = useState(false);
  const [finalStats, setFinalStats] = useState<TypingStats | null>(null);
  
  const updateProgress = useUpdateLessonProgress();
  const checkAchievements = useCheckAchievements();

  const handleComplete = async (stats: TypingStats) => {
    setFinalStats(stats);
    setShowResults(true);
    
    const completed = stats.accuracy >= 90 && stats.wpm >= 20;
    
    await updateProgress.mutateAsync({
      lessonId: lesson.id,
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      completed,
    });

    await checkAchievements.mutateAsync({ wpm: stats.wpm, accuracy: stats.accuracy });

    if (completed) {
      toast.success('Lesson completed! 🎉', {
        description: 'You can now move to the next lesson.',
      });
    } else {
      toast.info('Keep practicing!', {
        description: 'Reach 90% accuracy and 20 WPM to complete this lesson.',
      });
    }
  };

  const { currentIndex, errors, stats, handleKeyDown, reset, targetText, isStarted, isFinished } = useTypingTest({
    text: lesson.content,
    onComplete: handleComplete,
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleRetry = () => {
    reset();
    setShowResults(false);
    setFinalStats(null);
    inputRef.current?.focus();
  };

  if (showResults && finalStats) {
    const passed = finalStats.accuracy >= 90 && finalStats.wpm >= 20;
    
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center animate-fade-up">
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
              passed ? 'bg-correct/20' : 'bg-neon-orange/20'
            }`}>
              <CheckCircle className={`w-10 h-10 ${passed ? 'text-correct' : 'text-neon-orange'}`} />
            </div>
            
            <h2 className="text-3xl font-bold mb-2">
              {passed ? 'Lesson Complete!' : 'Keep Practicing!'}
            </h2>
            <p className="text-muted-foreground mb-8">
              {passed 
                ? 'Great job! You can now move to the next lesson.' 
                : 'Reach 90% accuracy and 20 WPM to complete this lesson.'}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="stat-card text-center">
                <div className="text-4xl font-bold text-primary">{finalStats.wpm}</div>
                <div className="text-sm text-muted-foreground">WPM</div>
                <div className="text-xs text-muted-foreground mt-1">(Need 20+)</div>
              </div>
              <div className="stat-card text-center">
                <div className="text-4xl font-bold text-accent">{finalStats.accuracy}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
                <div className="text-xs text-muted-foreground mt-1">(Need 90%+)</div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="outline" size="lg" onClick={onBack} className="gap-2">
                <ArrowLeft className="w-5 h-5" />
                Back to Lessons
              </Button>
              <Button size="lg" onClick={handleRetry} className="gap-2 neon-glow">
                <RotateCcw className="w-5 h-5" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={onBack} className="gap-2 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Lessons
          </Button>

          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
            <p className="text-muted-foreground">{lesson.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-sm text-muted-foreground">Focus keys:</span>
              {lesson.keys_focus.map(key => (
                <span 
                  key={key} 
                  className="px-2 py-1 text-xs bg-primary/20 text-primary rounded font-mono uppercase"
                >
                  {key}
                </span>
              ))}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-center gap-8 mb-8">
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
              onKeyDown={handleKeyDown}
              autoFocus
            />
            
            <div className="typing-text leading-loose text-xl">
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
                <p className="text-muted-foreground text-lg">Press any button to start</p>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <Button variant="ghost" size="lg" onClick={handleRetry} className="gap-2">
              <RotateCcw className="w-5 h-5" />
              Reset
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LessonPractice;

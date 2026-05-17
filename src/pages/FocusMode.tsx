import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTypingTest, TypingStats } from '@/hooks/useTypingTest';
import { generateRandomWords } from '@/data/words';
import { X, RefreshCw, Zap } from 'lucide-react';
import { useSound } from '@/contexts/SoundContext';
import { useSaveTestResult } from '@/hooks/useTestResults';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import SEO from "@/components/SEO";

const FocusMode: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playSuccessSound } = useSound();
  const saveTestResult = useSaveTestResult();

  const [text, setText] = useState(() => generateRandomWords(50));
  const [showResults, setShowResults] = useState(false);
  const [finalStats, setFinalStats] = useState<TypingStats | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleComplete = useCallback((stats: TypingStats) => {
    setFinalStats(stats);
    setShowResults(true);
    playSuccessSound();

    if (user) {
      saveTestResult.mutate({
        stats,
        mode: 'focus',
        textContent: text,
      });
    }
  }, [user, text, playSuccessSound, saveTestResult]);

  const {
    currentIndex,
    errors,
    isStarted,
    stats,
    handleKeyDown: onKeyDown,
    reset,
  } = useTypingTest({
    text,
    disableBackspace: true,
    onComplete: handleComplete,
  });

  const handleRestart = () => {
    const newText = generateRandomWords(50);
    setText(newText);
    setShowResults(false);
    setFinalStats(null);
    reset();
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      navigate('/test');
      return;
    }
    if (showResults && (e.key === 'Tab' || e.key === 'Enter')) {
      e.preventDefault();
      handleRestart();
      return;
    }
    onKeyDown(e);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <>
      <SEO title="Focus Mode — Distraction-Free Typing | TypingLab" description="Enter full-screen distraction-free typing with backspace disabled and auto-saved sessions for deep practice." path="/focus" />
      <div
      className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Minimal top bar */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-muted-foreground">
        <div className="flex items-center gap-6 text-sm font-mono">
          {isStarted && (
            <>
              <span className="text-primary font-bold text-lg">{stats.wpm} <span className="text-xs font-normal">WPM</span></span>
              <span className="text-accent">{stats.accuracy}%</span>
            </>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); navigate('/test'); }}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
          title="Exit Focus Mode (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <input
        ref={inputRef}
        type="text"
        className="absolute opacity-0 pointer-events-none"
        onKeyDown={handleKeyDown}
        autoFocus
      />

      {showResults && finalStats ? (
        <div className="text-center animate-fade-in">
          <Zap className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h2 className="text-5xl font-bold mb-2">{finalStats.wpm} <span className="text-2xl text-muted-foreground">WPM</span></h2>
          <p className="text-xl text-accent mb-8">{finalStats.accuracy.toFixed(1)}% accuracy</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleRestart} size="lg" className="gap-2">
              <RefreshCw className="w-4 h-4" /> Again
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/test')}>
              Exit
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Tab+Enter to restart • Esc to exit</p>
        </div>
      ) : (
        <div className="max-w-3xl w-full px-8">
          <div className="text-2xl leading-relaxed font-mono tracking-wide">
            {text.split('').map((char, index) => {
              let className = 'text-muted-foreground/40';
              if (index < currentIndex) {
                className = errors.has(index)
                  ? 'text-destructive'
                  : 'text-foreground';
              } else if (index === currentIndex) {
                className = 'text-foreground border-b-2 border-primary';
              }
              return (
                <span key={index} className={className}>
                  {char === ' ' && index === currentIndex ? '·' : char}
                </span>
              );
            })}
          </div>
          <p className="text-center text-xs text-muted-foreground/50 mt-12">
            Esc to exit • Just type to begin
          </p>
        </div>
      )}
    </div>
    </>
  );
};

export default FocusMode;

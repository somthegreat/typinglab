import React, { useState, useRef, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useWeakKeys, generateWeakKeyPractice } from '@/hooks/useWeakKeys';
import { useSound } from '@/contexts/SoundContext';
import { Link } from 'react-router-dom';
import { Target, RefreshCw, Zap } from 'lucide-react';
import VirtualKeyboard from '@/components/typing/VirtualKeyboard';
import SEO from "@/components/SEO";

const Practice: React.FC = () => {
  const { user } = useAuth();
  const { data: weakKeys, isLoading } = useWeakKeys();
  const { playKeySound, playErrorSound, playSuccessSound } = useSound();

  const [practiceText, setPracticeText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState<Set<number>>(new Set());
  const [isComplete, setIsComplete] = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (weakKeys && weakKeys.length > 0) {
      setPracticeText(generateWeakKeyPractice(weakKeys, 25));
    }
  }, [weakKeys]);

  const handleRefresh = () => {
    if (weakKeys && weakKeys.length > 0) {
      setPracticeText(generateWeakKeyPractice(weakKeys, 25));
    }
    setCurrentIndex(0);
    setErrors(new Set());
    setIsComplete(false);
    setStartTime(null);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isComplete) return;

    if (!startTime) {
      setStartTime(Date.now());
    }

    setPressedKey(e.key);
    setTimeout(() => setPressedKey(null), 100);

    if (e.key === 'Backspace') {
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
        setErrors(prev => {
          const newErrors = new Set(prev);
          newErrors.delete(currentIndex - 1);
          return newErrors;
        });
      }
      return;
    }

    if (e.key.length === 1) {
      playKeySound();
      const expectedChar = practiceText[currentIndex];
      
      if (e.key !== expectedChar) {
        setErrors(prev => new Set(prev).add(currentIndex));
        playErrorSound();
      }
      
      setCurrentIndex(prev => prev + 1);

      if (currentIndex + 1 >= practiceText.length) {
        setIsComplete(true);
        playSuccessSound();
      }
    }
  };

  const calculateStats = () => {
    if (!startTime) return { wpm: 0, accuracy: 0 };
    
    const timeElapsed = (Date.now() - startTime) / 1000 / 60;
    const correctChars = currentIndex - errors.size;
    const wpm = Math.round((correctChars / 5) / Math.max(timeElapsed, 0.01));
    const accuracy = currentIndex > 0 ? Math.round((correctChars / currentIndex) * 100) : 100;
    
    return { wpm, accuracy };
  };

  if (!user) {
    return (
      <>
        <SEO title="Focused Typing Practice | TypingLab" description="Target your weak keys and trouble patterns with focused practice drills designed to fix specific typing mistakes." path="/practice" />
        <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Sign in to practice</h2>
          <p className="text-muted-foreground mb-6">Create an account to track your weak keys and get personalized practice!</p>
          <Link to="/auth">
            <Button size="lg" className="neon-glow">Sign In</Button>
          </Link>
        </div>
      </Layout>
      </>
  );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Loading your weak keys...</p>
        </div>
      </Layout>
    );
  }

  if (!weakKeys || weakKeys.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">No weak keys detected yet</h2>
          <p className="text-muted-foreground mb-6">Complete some typing tests first to identify which keys you struggle with!</p>
          <Link to="/test">
            <Button size="lg" className="neon-glow">Start Typing Test</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const { wpm, accuracy } = calculateStats();
  const topWeakKeys = weakKeys.slice(0, 5);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Weak Key Practice</h1>
        <p className="text-muted-foreground mb-6">Practice words containing your problem keys to improve accuracy.</p>

        {/* Weak keys display */}
        <div className="glass-card rounded-xl p-4 mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Your weakest keys:</h3>
          <div className="flex flex-wrap gap-2">
            {topWeakKeys.map(key => (
              <div 
                key={key.id} 
                className="px-3 py-1.5 rounded-lg bg-destructive/20 border border-destructive/40 text-destructive-foreground"
              >
                <span className="font-mono font-bold">{key.key_char.toUpperCase()}</span>
                <span className="text-xs ml-2 text-muted-foreground">{key.error_rate.toFixed(1)}% errors</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{wpm}</div>
            <div className="text-sm text-muted-foreground">WPM</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-correct">{accuracy}%</div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </div>
        </div>

        {/* Typing area */}
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
          
          <div className="typing-text leading-loose">
            {practiceText.split('').map((char, index) => {
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

          {isComplete && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl">
              <div className="text-center">
                <Zap className="w-16 h-16 mx-auto mb-4 text-neon-yellow" />
                <h3 className="text-2xl font-bold mb-2">Practice Complete!</h3>
                <p className="text-muted-foreground mb-4">{wpm} WPM • {accuracy}% Accuracy</p>
                <Button onClick={handleRefresh} className="neon-glow">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Practice Again
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Virtual keyboard */}
        <VirtualKeyboard 
          currentKey={practiceText[currentIndex] || ''} 
          pressedKey={pressedKey}
          errors={errors}
          targetText={practiceText}
          currentIndex={currentIndex}
        />

        {/* Refresh button */}
        <div className="flex justify-center mt-6">
          <Button variant="ghost" onClick={handleRefresh} className="gap-2">
            <RefreshCw className="w-5 h-5" />
            New Practice Text
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Practice;
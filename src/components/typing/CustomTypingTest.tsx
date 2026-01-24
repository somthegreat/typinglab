import React, { useState, useRef, useEffect } from 'react';
import { useTypingTest, TypingStats } from '@/hooks/useTypingTest';
import { cn } from '@/lib/utils';
import VirtualKeyboard from './VirtualKeyboard';
import { useSound } from '@/contexts/SoundContext';

interface CustomTypingTestProps {
  text: string;
  onComplete: (stats: { wpm: number; accuracy: number }) => void;
  showKeyboard?: boolean;
}

const CustomTypingTest: React.FC<CustomTypingTestProps> = ({ text, onComplete, showKeyboard = false }) => {
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { playKeySound, playErrorSound, playSuccessSound } = useSound();

  const handleComplete = (stats: TypingStats) => {
    playSuccessSound();
    onComplete({ wpm: stats.wpm, accuracy: stats.accuracy });
  };

  const { input, isStarted, isFinished, currentIndex, errors, stats, handleKeyDown, reset, targetText } = useTypingTest({
    text,
    onComplete: handleComplete
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

  return (
    <div className="max-w-4xl mx-auto">
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
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">{currentIndex}/{targetText.length}</div>
          <div className="text-sm text-muted-foreground">Progress</div>
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
        
        <div className="font-mono text-lg leading-relaxed tracking-wide">
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

      {showKeyboard && (
        <div className="mb-6">
          <VirtualKeyboard 
            currentKey={targetText[currentIndex] || ''} 
            pressedKey={pressedKey}
            errors={errors}
            targetText={targetText}
            currentIndex={currentIndex}
            layout="qwerty"
          />
        </div>
      )}
    </div>
  );
};

export default CustomTypingTest;

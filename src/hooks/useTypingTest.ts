import { useState, useCallback, useEffect, useRef } from 'react';
import { useSound } from '@/contexts/SoundContext';

export interface TypingStats {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  timeElapsed: number;
}

interface UseTypingTestOptions {
  text: string;
  timeLimit?: number;
  wordLimit?: number;
  onComplete?: (stats: TypingStats) => void;
}

export const useTypingTest = ({ text, timeLimit, wordLimit, onComplete }: UseTypingTestOptions) => {
  const [input, setInput] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState<Set<number>>(new Set());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { playKeySound, playErrorSound } = useSound();

  const targetText = text.trim();

  const calculateStats = useCallback((): TypingStats => {
    const correctChars = currentIndex - errors.size;
    const incorrectChars = errors.size;
    const totalChars = currentIndex;
    const minutes = timeElapsed / 60;
    const words = correctChars / 5;
    const rawWords = totalChars / 5;
    
    return {
      wpm: minutes > 0 ? Math.round(words / minutes) : 0,
      rawWpm: minutes > 0 ? Math.round(rawWords / minutes) : 0,
      accuracy: totalChars > 0 ? Math.round((correctChars / totalChars) * 100 * 100) / 100 : 100,
      correctChars,
      incorrectChars,
      totalChars,
      timeElapsed
    };
  }, [currentIndex, errors.size, timeElapsed]);

  const finishTest = useCallback(() => {
    setIsFinished(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    const stats = calculateStats();
    onComplete?.(stats);
  }, [calculateStats, onComplete]);

  useEffect(() => {
    if (isStarted && !isFinished) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1;
          if (timeLimit && newTime >= timeLimit) {
            finishTest();
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isStarted, isFinished, timeLimit, finishTest]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isFinished) return;

    if (!isStarted && e.key.length === 1) {
      setIsStarted(true);
      setStartTime(Date.now());
    }

    if (e.key === 'Backspace') {
      if (currentIndex > 0) {
        const newIndex = currentIndex - 1;
        setCurrentIndex(newIndex);
        setInput(prev => prev.slice(0, -1));
        setErrors(prev => {
          const newErrors = new Set(prev);
          newErrors.delete(newIndex);
          return newErrors;
        });
      }
      return;
    }

    if (e.key.length === 1) {
      const expectedChar = targetText[currentIndex];
      const typedChar = e.key;

      if (typedChar === expectedChar) {
        playKeySound();
      } else {
        playErrorSound();
        setErrors(prev => new Set(prev).add(currentIndex));
      }

      setInput(prev => prev + typedChar);
      setCurrentIndex(prev => prev + 1);

      // Check if test is complete
      if (currentIndex + 1 >= targetText.length) {
        finishTest();
      }

      // Check word limit
      if (wordLimit) {
        const typedWords = (input + typedChar).split(/\s+/).filter(Boolean).length;
        if (typedWords >= wordLimit) {
          finishTest();
        }
      }
    }
  }, [isStarted, isFinished, currentIndex, targetText, input, wordLimit, playKeySound, playErrorSound, finishTest]);

  const reset = useCallback(() => {
    setInput('');
    setIsStarted(false);
    setIsFinished(false);
    setStartTime(null);
    setTimeElapsed(0);
    setCurrentIndex(0);
    setErrors(new Set());
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  const stats = calculateStats();

  return {
    input,
    isStarted,
    isFinished,
    currentIndex,
    errors,
    stats,
    timeElapsed,
    timeRemaining: timeLimit ? Math.max(0, timeLimit - timeElapsed) : null,
    handleKeyDown,
    reset,
    targetText
  };
};

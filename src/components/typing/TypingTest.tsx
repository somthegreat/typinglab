import React, { useState, useRef, useEffect } from 'react';
import { useTypingTest, TypingStats } from '@/hooks/useTypingTest';
import { generateRandomWords } from '@/data/words';
import { getRandomQuote } from '@/data/quotes';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock, Hash, Quote, FileText, Keyboard, Eye, EyeOff, Shield, ShieldAlert, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import TestResults from './TestResults';
import VirtualKeyboard, { KeyboardLayout } from './VirtualKeyboard';
import KeyboardLayoutSelector from '@/components/KeyboardLayoutSelector';
import TextSettings, { FontSize, LineHeight, getFontSizeClass, getLineHeightClass } from '@/components/TextSettings';
import { useSaveTestResult } from '@/hooks/useTestResults';
import { useCheckAchievements } from '@/hooks/useAchievements';
import { useUpdateWeakKeys } from '@/hooks/useWeakKeys';
import { useAuth } from '@/contexts/AuthContext';
import { useSound } from '@/contexts/SoundContext';
import { useAntiCheat } from '@/hooks/useAntiCheat';
import { useTestReplay, TestReplay } from '@/hooks/useTestReplay';
import TestReplayPlayer from '@/components/TestReplayPlayer';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type TestMode = 'time' | 'words' | 'quote' | 'custom';
type TimeOption = 15 | 30 | 60 | 120;
type WordOption = 10 | 25 | 50 | 100;

const TypingTest: React.FC = () => {
  const [mode, setMode] = useState<TestMode>('time');
  const [timeOption, setTimeOption] = useState<TimeOption>(30);
  const [wordOption, setWordOption] = useState<WordOption>(25);
  const [text, setText] = useState(() => generateRandomWords(50));
  const [customText, setCustomText] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [finalStats, setFinalStats] = useState<TypingStats | null>(null);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [keyboardLayout, setKeyboardLayout] = useState<KeyboardLayout>('qwerty');
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [lineHeight, setLineHeight] = useState<LineHeight>('relaxed');
  const [lastReplay, setLastReplay] = useState<TestReplay | null>(null);
  const [showReplayPlayer, setShowReplayPlayer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousWpmRef = useRef<number>(0);
  
  const { user } = useAuth();
  const saveTestResult = useSaveTestResult();
  const checkAchievements = useCheckAchievements();
  const updateWeakKeys = useUpdateWeakKeys();
  const { playKeySound, playErrorSound, playSuccessSound } = useSound();
  const antiCheat = useAntiCheat();
  const replay = useTestReplay();
  const getTestText = () => {
    switch (mode) {
      case 'quote': return getRandomQuote().text;
      case 'custom': return customText || 'Enter your custom text above to begin typing.';
      case 'words': return generateRandomWords(wordOption);
      default: return generateRandomWords(100);
    }
  };

  const handleComplete = async (stats: TypingStats) => {
    // Stop replay recording
    const testReplay = replay.stopRecording(targetText, stats.wpm, stats.accuracy);
    setLastReplay(testReplay);
    
    // Get anti-cheat validation
    const validation = antiCheat.getValidationStatus();
    
    setFinalStats(stats);
    setShowResults(true);
    
    if (user && validation.isValid) {
      await saveTestResult.mutateAsync({
        stats,
        mode,
        wordCount: mode === 'words' ? wordOption : undefined,
        textContent: text,
      });
      await checkAchievements.mutateAsync({ wpm: stats.wpm, accuracy: stats.accuracy });
      
      // Track weak keys
      const keyErrors = new Map<string, { errors: number; total: number }>();
      targetText.split('').forEach((char, index) => {
        const lowerChar = char.toLowerCase();
        if (!keyErrors.has(lowerChar)) {
          keyErrors.set(lowerChar, { errors: 0, total: 0 });
        }
        const current = keyErrors.get(lowerChar)!;
        current.total++;
        if (errors.has(index)) {
          current.errors++;
        }
      });
      await updateWeakKeys.mutateAsync(keyErrors);
    }
  };

  const { input, isStarted, isFinished, currentIndex, errors, stats, timeRemaining, handleKeyDown, reset, targetText } = useTypingTest({
    text: text,
    timeLimit: mode === 'time' ? timeOption : undefined,
    wordLimit: mode === 'words' ? wordOption : undefined,
    onComplete: handleComplete
  });

  // Check WPM spikes for anti-cheat
  useEffect(() => {
    if (isStarted && stats.wpm > 0) {
      antiCheat.checkWpmSpike(stats.wpm, previousWpmRef.current);
      previousWpmRef.current = stats.wpm;
    }
  }, [stats.wpm, isStarted, antiCheat]);

  const refreshText = () => {
    const newText = getTestText();
    setText(newText);
    reset();
    antiCheat.reset();
    replay.reset();
    previousWpmRef.current = 0;
    setShowResults(false);
    setShowReplayPlayer(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    refreshText();
  }, [mode, timeOption, wordOption]);

  const handleRetry = () => {
    reset();
    antiCheat.reset();
    replay.reset();
    previousWpmRef.current = 0;
    setShowResults(false);
    setShowReplayPlayer(false);
    inputRef.current?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    antiCheat.checkPaste(e);
  };

  // Handle focus loss
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isStarted && !isFinished) {
        antiCheat.checkFocusLoss();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isStarted, isFinished, antiCheat]);

  const handleKeyDownWrapper = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setPressedKey(e.key);
    
    // Start recording on first keypress
    if (!replay.isRecording && e.key.length === 1) {
      replay.startRecording();
    }
    
    // Anti-cheat: check key timing
    if (e.key.length === 1) {
      antiCheat.checkKeyTiming(e.key);
    }
    
    // Play sound based on correctness
    if (e.key.length === 1) {
      const expectedChar = targetText[currentIndex];
      const isCorrect = e.key === expectedChar;
      
      if (isCorrect) {
        playKeySound();
        replay.recordEvent('keypress', e.key, currentIndex, stats.wpm, stats.accuracy);
      } else {
        playErrorSound();
        replay.recordEvent('error', e.key, currentIndex, stats.wpm, stats.accuracy);
      }
    } else if (e.key === 'Backspace') {
      replay.recordEvent('backspace', '', currentIndex - 1, stats.wpm, stats.accuracy);
    }
    
    handleKeyDown(e);
    setTimeout(() => setPressedKey(null), 100);
  };

  if (showReplayPlayer && lastReplay) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <TestReplayPlayer 
          replay={lastReplay} 
          onClose={() => setShowReplayPlayer(false)} 
        />
      </div>
    );
  }

  if (showResults && finalStats) {
    return (
      <TestResults 
        stats={finalStats} 
        onRetry={handleRetry} 
        onNewTest={refreshText}
        replay={lastReplay}
        onPlayReplay={() => setShowReplayPlayer(true)}
        antiCheatStatus={antiCheat.getValidationStatus()}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Mode Selection */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
        <div className="flex items-center bg-secondary rounded-lg p-1">
          {[
            { mode: 'time' as TestMode, icon: Clock, label: 'Time' },
            { mode: 'words' as TestMode, icon: Hash, label: 'Words' },
            { mode: 'quote' as TestMode, icon: Quote, label: 'Quote' },
            { mode: 'custom' as TestMode, icon: FileText, label: 'Custom' },
          ].map(({ mode: m, icon: Icon, label }) => (
            <Button
              key={m}
              variant={mode === m ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode(m)}
              className={cn("gap-2 h-9", mode !== m && "text-muted-foreground")}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Button>
          ))}
        </div>

        {mode === 'time' && (
          <div className="flex gap-2">
            {([15, 30, 60, 120] as TimeOption[]).map(t => (
              <Button key={t} variant={timeOption === t ? 'secondary' : 'ghost'} size="sm" onClick={() => setTimeOption(t)}>
                {t}s
              </Button>
            ))}
          </div>
        )}

        {mode === 'words' && (
          <div className="flex gap-2">
            {([10, 25, 50, 100] as WordOption[]).map(w => (
              <Button key={w} variant={wordOption === w ? 'secondary' : 'ghost'} size="sm" onClick={() => setWordOption(w)}>
                {w}
              </Button>
            ))}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowKeyboard(!showKeyboard)}
          className="gap-2"
        >
          {showKeyboard ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <Keyboard className="w-4 h-4" />
        </Button>

        <KeyboardLayoutSelector layout={keyboardLayout} onLayoutChange={setKeyboardLayout} />

        <TextSettings
          fontSize={fontSize}
          lineHeight={lineHeight}
          onFontSizeChange={setFontSize}
          onLineHeightChange={setLineHeight}
        />
      </div>

      {mode === 'custom' && (
        <textarea
          value={customText}
          onChange={(e) => { setCustomText(e.target.value); setText(e.target.value); }}
          placeholder="Paste or type your custom text here..."
          className="w-full p-4 mb-6 rounded-xl bg-secondary border border-border text-foreground resize-none h-24 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      )}

      {/* Stats Bar */}
      <div className="flex items-center justify-center gap-12 mb-8">
        {mode === 'time' && timeRemaining !== null && (
          <div className="text-center">
            <div className="text-4xl font-bold text-primary font-mono">{timeRemaining}</div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">seconds</div>
          </div>
        )}
        <div className="text-center">
          <div className="text-4xl font-bold text-foreground font-mono">{stats.wpm}</div>
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">WPM</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-correct font-mono">{stats.accuracy}%</div>
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Accuracy</div>
        </div>
      </div>

      {/* Typing Area */}
      <div 
        className="glass-card p-8 mb-6 cursor-text relative"
        onClick={() => inputRef.current?.focus()}
      >
        <input
          ref={inputRef}
          type="text"
          className="absolute opacity-0 pointer-events-none"
          onKeyDown={handleKeyDownWrapper}
          onPaste={handlePaste}
          autoFocus
        />
        
        <div className={cn("font-mono tracking-wide leading-relaxed", getFontSizeClass(fontSize), getLineHeightClass(lineHeight))}>
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
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
            <p className="text-muted-foreground">Press any button to start</p>
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
            layout={keyboardLayout}
          />
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button variant="ghost" size="lg" onClick={refreshText} className="gap-2">
          <RefreshCw className="w-5 h-5" />
          New Test
        </Button>
      </div>
    </div>
  );
};

export default TypingTest;

import React, { useState, useRef, useEffect } from 'react';
import { useTypingTest, TypingStats } from '@/hooks/useTypingTest';
import { generateRandomWords } from '@/data/words';
import { getRandomQuote } from '@/data/quotes';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock, Hash, Quote, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import TestResults from './TestResults';

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
  const inputRef = useRef<HTMLInputElement>(null);

  const getTestText = () => {
    switch (mode) {
      case 'quote': return getRandomQuote().text;
      case 'custom': return customText || 'Enter your custom text above to begin typing.';
      case 'words': return generateRandomWords(wordOption);
      default: return generateRandomWords(100);
    }
  };

  const handleComplete = (stats: TypingStats) => {
    setFinalStats(stats);
    setShowResults(true);
  };

  const { input, isStarted, isFinished, currentIndex, errors, stats, timeRemaining, handleKeyDown, reset, targetText } = useTypingTest({
    text: text,
    timeLimit: mode === 'time' ? timeOption : undefined,
    wordLimit: mode === 'words' ? wordOption : undefined,
    onComplete: handleComplete
  });

  const refreshText = () => {
    const newText = getTestText();
    setText(newText);
    reset();
    setShowResults(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    refreshText();
  }, [mode, timeOption, wordOption]);

  const handleRetry = () => {
    reset();
    setShowResults(false);
    inputRef.current?.focus();
  };

  if (showResults && finalStats) {
    return <TestResults stats={finalStats} onRetry={handleRetry} onNewTest={refreshText} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Mode Selection */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
        <div className="flex items-center gap-2 glass-card rounded-full p-1">
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
              className={cn("gap-2", mode === m && "neon-glow")}
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
      </div>

      {mode === 'custom' && (
        <textarea
          value={customText}
          onChange={(e) => { setCustomText(e.target.value); setText(e.target.value); }}
          placeholder="Paste or type your custom text here..."
          className="w-full p-4 mb-6 rounded-xl bg-secondary/50 border border-border text-foreground resize-none h-24 font-mono"
        />
      )}

      {/* Stats Bar */}
      <div className="flex items-center justify-center gap-8 mb-8">
        {mode === 'time' && timeRemaining !== null && (
          <div className="text-4xl font-bold text-primary font-mono">{timeRemaining}s</div>
        )}
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

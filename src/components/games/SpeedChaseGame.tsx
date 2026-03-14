import React, { useState, useEffect, useRef, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play, RotateCcw, Timer, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { commonWords } from '@/data/words';
import { useSound } from '@/contexts/SoundContext';
import PersonalBestBadge from './PersonalBestBadge';
import ScorePopup, { useScorePopups } from './ScorePopup';
import DifficultySelector, { Difficulty, DIFFICULTY_CONFIGS } from './DifficultySelector';

interface SpeedChaseGameProps {
  onBack: () => void;
}

const SpeedChaseGame: React.FC<SpeedChaseGameProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { playKeySound, playSuccessSound } = useSound();
  const { popups, addPopup } = useScorePopups();
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [input, setInput] = useState('');
  const [wordsTyped, setWordsTyped] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const config = DIFFICULTY_CONFIGS[difficulty];

  const getRandomWord = useCallback(() => {
    const maxIdx = Math.min(commonWords.length, config.wordMaxIndex);
    return commonWords[Math.floor(Math.random() * maxIdx)];
  }, [config.wordMaxIndex]);

  const startGame = () => {
    setGameState('playing');
    setTimeLeft(config.timer);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setWordsTyped(0);
    setMultiplier(1);
    setCurrentWord(getRandomWord());
    setInput('');
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('gameover');
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [gameState, timeLeft]);

  useEffect(() => {
    if (streak >= 20) setMultiplier(4);
    else if (streak >= 10) setMultiplier(3);
    else if (streak >= 5) setMultiplier(2);
    else setMultiplier(1);
  }, [streak]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    if (value.toLowerCase() === currentWord.toLowerCase()) {
      const points = currentWord.length * 10 * multiplier;
      setScore(prev => prev + points);
      setStreak(prev => {
        const ns = prev + 1;
        setMaxStreak(m => Math.max(m, ns));
        if (ns === 5) addPopup('🔥 x2 Multiplier!', 'streak');
        else if (ns === 10) addPopup('⚡ x3 Multiplier!', 'streak');
        else if (ns === 20) addPopup('💥 x4 Multiplier!', 'streak');
        return ns;
      });
      setWordsTyped(prev => prev + 1);
      setCurrentWord(getRandomWord());
      setInput('');
      playSuccessSound();
      addPopup(`+${points}`, 'score');
      if (currentWord.length >= 8) {
        setTimeLeft(prev => Math.min(prev + 2, config.timer + 30));
        addPopup('+2s Bonus!', 'bonus');
      }
    } else {
      playKeySound();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Tab') {
      e.preventDefault();
      setStreak(0);
      setCurrentWord(getRandomWord());
      setInput('');
    }
  };

  const saveScore = async () => {
    if (!user) return;
    try {
      const { data: profile } = await supabase.from('profiles').select('username').eq('user_id', user.id).single();
      await supabase.from('game_scores').insert({ user_id: user.id, username: profile?.username || 'Anonymous', game_type: 'speed_chase', score, level_reached: maxStreak, words_typed: wordsTyped });
      await supabase.rpc('update_user_xp', { p_xp_amount: Math.floor(score / 10) });
      toast.success('Score saved!');
    } catch (error) { console.error('Failed to save score:', error); }
  };

  useEffect(() => { if (gameState === 'gameover' && user) saveScore(); }, [gameState]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
          {gameState === 'playing' && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-muted-foreground" />
                <span className={`font-bold ${timeLeft <= 10 ? 'text-destructive animate-pulse' : ''}`}>{timeLeft}s</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-neon-yellow" />
                <span className="font-bold">x{multiplier}</span>
              </div>
            </div>
          )}
        </div>

        <div className="relative bg-background/50 border rounded-lg p-8 mb-4">
          <ScorePopup popups={popups} />
          {gameState === 'idle' && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Speed Chase</h2>
              <p className="text-muted-foreground mb-2">Type as many words as possible! Build streaks for multipliers. Press Space to skip.</p>
              <PersonalBestBadge gameType="speed_chase" />
              <DifficultySelector selected={difficulty} onChange={setDifficulty} />
              <Button size="lg" onClick={startGame}><Play className="w-5 h-5 mr-2" /> Start Game</Button>
            </div>
          )}
          {gameState === 'playing' && (
            <div className="text-center">
              <div className="mb-6">
                <div className="text-sm text-muted-foreground mb-2">Score: <span className="text-primary font-bold">{score}</span> • Streak: <span className="text-neon-green font-bold">{streak}</span></div>
                <Progress value={(timeLeft / config.timer) * 100} className="h-2" />
              </div>
              <div className="mb-8">
                <div className="text-4xl font-mono font-bold text-primary mb-2">{currentWord}</div>
                {multiplier > 1 && <div className="text-sm text-neon-yellow animate-pulse">{multiplier}x Multiplier Active!</div>}
              </div>
              <Input ref={inputRef} value={input} onChange={handleInput} onKeyDown={handleKeyDown} placeholder="Type here..." className="text-xl text-center" autoFocus />
            </div>
          )}
          {gameState === 'gameover' && (
            <div className="text-center">
              <h2 className="text-3xl font-bold text-primary mb-4">Time's Up!</h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-card rounded-lg p-4"><div className="text-2xl font-bold">{score}</div><div className="text-sm text-muted-foreground">Score</div></div>
                <div className="bg-card rounded-lg p-4"><div className="text-2xl font-bold">{wordsTyped}</div><div className="text-sm text-muted-foreground">Words</div></div>
                <div className="bg-card rounded-lg p-4"><div className="text-2xl font-bold">{maxStreak}</div><div className="text-sm text-muted-foreground">Max Streak</div></div>
              </div>
              <Button size="lg" onClick={startGame}><RotateCcw className="w-5 h-5 mr-2" /> Play Again</Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SpeedChaseGame;

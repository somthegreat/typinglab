import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { commonWords } from '@/data/words';
import { useSound } from '@/contexts/SoundContext';
import PersonalBestBadge from './PersonalBestBadge';
import ScorePopup, { useScorePopups } from './ScorePopup';

interface FallingWord {
  id: string;
  word: string;
  x: number;
  y: number;
  speed: number;
}

interface WordRainGameProps {
  onBack: () => void;
}

const WordRainGame: React.FC<WordRainGameProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { playKeySound, playSuccessSound, playErrorSound } = useSound();
  const { popups, addPopup } = useScorePopups();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [words, setWords] = useState<FallingWord[]>([]);
  const [input, setInput] = useState('');
  const [wordsTyped, setWordsTyped] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const lastSpawnRef = useRef(0);

  const getRandomWord = useCallback(() => {
    return commonWords[Math.floor(Math.random() * Math.min(commonWords.length, 100 + level * 50))];
  }, [level]);

  const spawnWord = useCallback(() => {
    const newWord: FallingWord = {
      id: Math.random().toString(36).substr(2, 9),
      word: getRandomWord(),
      x: Math.random() * 80 + 10,
      y: 0,
      speed: 0.3 + level * 0.1,
    };
    setWords(prev => [...prev, newWord]);
  }, [getRandomWord, level]);

  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    const now = Date.now();
    const spawnInterval = Math.max(2000 - level * 200, 800);

    if (now - lastSpawnRef.current > spawnInterval) {
      spawnWord();
      lastSpawnRef.current = now;
    }

    setWords(prev => {
      const updated = prev.map(word => ({
        ...word,
        y: word.y + word.speed,
      }));

      const fallen = updated.filter(w => w.y >= 100);
      if (fallen.length > 0) {
        playErrorSound();
        setLives(l => {
          const newLives = l - fallen.length;
          if (newLives <= 0) {
            setGameState('gameover');
          }
          return Math.max(0, newLives);
        });
      }

      return updated.filter(w => w.y < 100);
    });

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, level, spawnWord]);

  useEffect(() => {
    if (gameState === 'playing') {
      animationRef.current = requestAnimationFrame(gameLoop);
      inputRef.current?.focus();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, gameLoop]);

  useEffect(() => {
    if (wordsTyped > 0 && wordsTyped % 10 === 0) {
      setLevel(prev => prev + 1);
      addPopup(`⬆️ Level ${level + 1}!`, 'streak');
    }
  }, [wordsTyped, level]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setInput(value);

    const matchedWord = words.find(w => w.word.toLowerCase() === value);
    if (matchedWord) {
      const points = matchedWord.word.length * 10 * level;
      setWords(prev => prev.filter(w => w.id !== matchedWord.id));
      setScore(prev => prev + points);
      setWordsTyped(prev => prev + 1);
      setInput('');
      playSuccessSound();
      addPopup(`+${points}`, 'score');
    } else {
      playKeySound();
    }
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setLives(3);
    setWords([]);
    setWordsTyped(0);
    lastSpawnRef.current = Date.now();
  };

  const pauseGame = () => {
    setGameState(gameState === 'playing' ? 'paused' : 'playing');
  };

  const saveScore = async () => {
    if (!user) return;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', user.id)
        .single();

      await supabase.from('game_scores').insert({
        user_id: user.id,
        username: profile?.username || 'Anonymous',
        game_type: 'word_rain',
        score,
        level_reached: level,
        words_typed: wordsTyped,
      });

      await supabase.rpc('update_user_xp', { p_xp_amount: Math.floor(score / 10) });
      toast.success('Score saved!');
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  };

  useEffect(() => {
    if (gameState === 'gameover' && user) {
      saveScore();
    }
  }, [gameState]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Score:</span>{' '}
              <span className="font-bold text-primary">{score}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Level:</span>{' '}
              <span className="font-bold text-neon-yellow">{level}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Lives:</span>{' '}
              <span className="font-bold">{'❤️'.repeat(lives)}</span>
            </div>
          </div>
        </div>

        <div 
          ref={gameAreaRef}
          className="relative bg-background/50 border rounded-lg h-[400px] overflow-hidden mb-4"
        >
          <ScorePopup popups={popups} />

          {gameState === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <h2 className="text-2xl font-bold mb-4">Word Rain</h2>
              <p className="text-muted-foreground mb-4">Type the falling words before they hit the ground!</p>
              <PersonalBestBadge gameType="word_rain" />
              <Button size="lg" onClick={startGame} className="mt-4">
                <Play className="w-5 h-5 mr-2" /> Start Game
              </Button>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
              <h2 className="text-3xl font-bold text-destructive mb-4">Game Over!</h2>
              <p className="text-xl mb-2">Final Score: <span className="text-primary font-bold">{score}</span></p>
              <p className="text-muted-foreground mb-6">You reached level {level} and typed {wordsTyped} words</p>
              <Button size="lg" onClick={startGame}>
                <RotateCcw className="w-5 h-5 mr-2" /> Play Again
              </Button>
            </div>
          )}

          {gameState === 'paused' && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <Button size="lg" onClick={pauseGame}>
                <Play className="w-5 h-5 mr-2" /> Resume
              </Button>
            </div>
          )}

          {(gameState === 'playing' || gameState === 'paused') && words.map(word => (
            <div
              key={word.id}
              className="absolute text-lg font-mono font-bold text-primary animate-pulse"
              style={{
                left: `${word.x}%`,
                top: `${word.y}%`,
                transform: 'translateX(-50%)',
              }}
            >
              {word.word}
            </div>
          ))}
        </div>

        {(gameState === 'playing' || gameState === 'paused') && (
          <div className="flex gap-4">
            <Input
              ref={inputRef}
              value={input}
              onChange={handleInput}
              placeholder="Type the words..."
              className="text-lg"
              disabled={gameState === 'paused'}
              autoFocus
            />
            <Button variant="outline" onClick={pauseGame}>
              {gameState === 'paused' ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WordRainGame;

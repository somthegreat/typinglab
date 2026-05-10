import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play, RotateCcw, Shield, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { commonWords } from '@/data/words';
import { useSound } from '@/contexts/SoundContext';
import PersonalBestBadge from './PersonalBestBadge';
import ScorePopup, { useScorePopups } from './ScorePopup';
import DifficultySelector, { Difficulty, DIFFICULTY_CONFIGS } from './DifficultySelector';

interface Enemy {
  id: string;
  word: string;
  x: number;
  y: number;
  health: number;
  speed: number;
}

interface TypingDefenseGameProps {
  onBack: () => void;
}

const TypingDefenseGame: React.FC<TypingDefenseGameProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { playKeySound, playSuccessSound, playErrorSound } = useSound();
  const { popups, addPopup } = useScorePopups();
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [baseHealth, setBaseHealth] = useState(100);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [input, setInput] = useState('');
  const [wordsTyped, setWordsTyped] = useState(0);
  const [enemiesDefeated, setEnemiesDefeated] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const animationRef = useRef<number>();
  const lastSpawnRef = useRef(0);
  const waveEnemiesRef = useRef(0);

  const config = DIFFICULTY_CONFIGS[difficulty];

  const getRandomWord = useCallback(() => {
    const maxIndex = Math.min(commonWords.length, config.wordMaxIndex + wave * 20);
    return commonWords[Math.floor(Math.random() * maxIndex)];
  }, [wave, config.wordMaxIndex]);

  const spawnEnemy = useCallback(() => {
    const newEnemy: Enemy = {
      id: Math.random().toString(36).substr(2, 9),
      word: getRandomWord(),
      x: 100,
      y: Math.random() * 70 + 15,
      health: 1,
      speed: (0.15 + wave * 0.03) * config.speed,
    };
    setEnemies(prev => [...prev, newEnemy]);
    waveEnemiesRef.current++;
  }, [getRandomWord, wave, config.speed]);

  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;
    const now = Date.now();
    const spawnInterval = Math.max(1000, (3000 - wave * 200) * config.spawnRate);
    const maxEnemiesPerWave = 5 + wave * 2;

    if (now - lastSpawnRef.current > spawnInterval && waveEnemiesRef.current < maxEnemiesPerWave) {
      spawnEnemy();
      lastSpawnRef.current = now;
    }

    setEnemies(prev => {
      const updated = prev.map(enemy => ({ ...enemy, x: enemy.x - enemy.speed }));
      const reached = updated.filter(e => e.x <= 10);
      if (reached.length > 0) {
        const damage = reached.reduce((acc, e) => acc + e.word.length * 5, 0);
        playErrorSound();
        setBaseHealth(h => {
          const newHealth = h - damage;
          if (newHealth <= 0) setGameState('gameover');
          return Math.max(0, newHealth);
        });
      }
      return updated.filter(e => e.x > 10);
    });

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, wave, spawnEnemy, config.spawnRate]);

  useEffect(() => {
    if (gameState === 'playing') {
      animationRef.current = requestAnimationFrame(gameLoop);
      inputRef.current?.focus();
    }
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [gameState, gameLoop]);

  useEffect(() => {
    const maxEnemiesPerWave = 5 + wave * 2;
    if (gameState === 'playing' && waveEnemiesRef.current >= maxEnemiesPerWave && enemies.length === 0) {
      setWave(prev => prev + 1);
      waveEnemiesRef.current = 0;
      setBaseHealth(prev => Math.min(prev + 20, 100));
      addPopup(`🛡️ Wave ${wave + 1}! +20 HP`, 'bonus');
    }
  }, [enemies, wave, gameState]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setInput(value);
    const matchedEnemy = enemies.find(enemy => enemy.word.toLowerCase() === value);
    if (matchedEnemy) {
      const points = matchedEnemy.word.length * 10 * wave;
      setEnemies(prev => prev.filter(e => e.id !== matchedEnemy.id));
      setScore(prev => prev + points);
      setWordsTyped(prev => prev + 1);
      setEnemiesDefeated(prev => prev + 1);
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
    setWave(1);
    setBaseHealth(100);
    setEnemies([]);
    setWordsTyped(0);
    setEnemiesDefeated(0);
    waveEnemiesRef.current = 0;
    lastSpawnRef.current = Date.now();
  };

  const saveScore = async () => {
    if (!user) return;
    try {
      const { data: profile } = await supabase.from('profiles').select('username').eq('user_id', user.id).single();
      await supabase.rpc('submit_game_score', { p_game_type: 'typing_defense', p_score: score, p_level_reached: wave, p_words_typed: wordsTyped });
      await supabase.rpc('update_user_xp', { p_xp_amount: Math.floor(score / 10) });
      toast.success('Score saved!');
    } catch (error) { console.error('Failed to save score:', error); }
  };

  useEffect(() => { if (gameState === 'gameover' && user) saveScore(); }, [gameState]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
          <div className="flex items-center gap-4">
            <div className="text-sm"><span className="text-muted-foreground">Score:</span> <span className="font-bold text-primary">{score}</span></div>
            <div className="text-sm"><span className="text-muted-foreground">Wave:</span> <span className="font-bold text-neon-yellow">{wave}</span></div>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-4">
          <Shield className="w-6 h-6 text-neon-blue" />
          <Progress value={baseHealth} className="flex-1 h-4" />
          <div className="flex items-center gap-1">
            <Heart className={`w-5 h-5 ${baseHealth < 30 ? 'text-destructive animate-pulse' : 'text-destructive/80'}`} />
            <span className="font-bold">{baseHealth}%</span>
          </div>
        </div>

        <div className="relative bg-gradient-to-r from-neon-blue/10 to-transparent border rounded-lg h-[300px] overflow-hidden mb-4">
          <ScorePopup popups={popups} />
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-neon-blue/20 border-r border-neon-blue flex items-center justify-center">
            <Shield className="w-8 h-8 text-neon-blue" />
          </div>

          {gameState === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <h2 className="text-2xl font-bold mb-2">Typing Defense</h2>
              <p className="text-muted-foreground mb-2">Defend your base by typing the enemy words!</p>
              <PersonalBestBadge gameType="typing_defense" />
              <DifficultySelector selected={difficulty} onChange={setDifficulty} />
              <Button size="lg" onClick={startGame}><Play className="w-5 h-5 mr-2" /> Start Game</Button>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
              <h2 className="text-3xl font-bold text-destructive mb-4">Base Destroyed!</h2>
              <p className="text-xl mb-2">Final Score: <span className="text-primary font-bold">{score}</span></p>
              <p className="text-muted-foreground mb-6">You survived {wave} waves and defeated {enemiesDefeated} enemies</p>
              <Button size="lg" onClick={startGame}><RotateCcw className="w-5 h-5 mr-2" /> Play Again</Button>
            </div>
          )}

          {gameState === 'playing' && enemies.map((enemy) => (
            <div key={enemy.id} className="absolute flex items-center gap-2" style={{ left: `${enemy.x}%`, top: `${enemy.y}%`, transform: 'translateY(-50%)' }}>
              <span className="text-lg font-mono font-bold text-destructive/90 bg-destructive/20 px-2 py-1 rounded">{enemy.word}</span>
              <span className="text-2xl">👾</span>
            </div>
          ))}
        </div>

        {gameState === 'playing' && (
          <Input ref={inputRef} value={input} onChange={handleInput} placeholder="Type enemy words to destroy them..." className="text-lg" autoFocus />
        )}
      </div>
    </Layout>
  );
};

export default TypingDefenseGame;

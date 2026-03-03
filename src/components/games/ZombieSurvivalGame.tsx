import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Skull, Heart, Trophy, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ZombieSurvivalGameProps {
  onBack: () => void;
}

interface Zombie {
  id: number;
  word: string;
  position: number;
  speed: number;
  typed: string;
  lane: number; // 0-4 for vertical distribution
}

const ZOMBIE_WORDS = [
  'brain', 'flesh', 'crawl', 'groan', 'horde', 'virus', 'decay', 'risen',
  'crypt', 'grave', 'haunt', 'curse', 'dread', 'spawn', 'swarm', 'lurk',
  'fangs', 'claws', 'bones', 'skull', 'demon', 'ghost', 'shade', 'fiend',
  'nightmare', 'darkness', 'undead', 'infected', 'survive', 'outbreak',
  'apocalypse', 'barricade', 'fortress', 'ammunition', 'headshot',
  'quarantine', 'resistance', 'stronghold', 'devastation', 'extinction',
];

const NUM_LANES = 5;

const ZombieSurvivalGame: React.FC<ZombieSurvivalGameProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready');
  const [zombies, setZombies] = useState<Zombie[]>([]);
  const [lives, setLives] = useState(5);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [killCount, setKillCount] = useState(0);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const spawnTimerRef = useRef<number | null>(null);
  const zombieIdRef = useRef(0);
  const lastTimeRef = useRef(0);
  const waveRef = useRef(1);

  // Keep waveRef in sync
  useEffect(() => { waveRef.current = wave; }, [wave]);

  const getWordForWave = useCallback((currentWave: number) => {
    const maxLen = currentWave <= 3 ? 5 : currentWave <= 6 ? 7 : 12;
    const eligible = ZOMBIE_WORDS.filter(w => w.length <= maxLen);
    return eligible[Math.floor(Math.random() * eligible.length)];
  }, []);

  const findFreeLane = useCallback((currentZombies: Zombie[]) => {
    const usedLanes = new Set(currentZombies.map(z => z.lane));
    const freeLanes = Array.from({ length: NUM_LANES }, (_, i) => i).filter(l => !usedLanes.has(l));
    if (freeLanes.length > 0) return freeLanes[Math.floor(Math.random() * freeLanes.length)];
    return Math.floor(Math.random() * NUM_LANES);
  }, []);

  const startGame = () => {
    setGameState('playing');
    setZombies([]);
    setLives(5);
    setScore(0);
    setWave(1);
    setKillCount(0);
    setInput('');
    zombieIdRef.current = 0;
    lastTimeRef.current = performance.now();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Game loop using requestAnimationFrame with delta time
  useEffect(() => {
    if (gameState !== 'playing') return;

    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const delta = (now - lastTimeRef.current) / 1000; // seconds
      lastTimeRef.current = now;

      setZombies(prev => {
        const updated: Zombie[] = [];
        let livesLost = 0;

        for (const z of prev) {
          const newPos = z.position + z.speed * delta * 60; // normalize to ~60fps
          if (newPos >= 100) {
            livesLost++;
          } else {
            updated.push({ ...z, position: newPos });
          }
        }

        if (livesLost > 0) {
          setLives(l => {
            const newLives = l - livesLost;
            if (newLives <= 0) {
              setGameState('ended');
              toast.error('The zombies got you!');
            }
            return Math.max(0, newLives);
          });
        }

        return updated;
      });

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [gameState]);

  // Spawn timer - uses ref for wave to avoid re-creating interval on wave change
  useEffect(() => {
    if (gameState !== 'playing') return;

    const spawn = () => {
      const currentWave = waveRef.current;
      const word = getWordForWave(currentWave);
      const speed = 0.3 + currentWave * 0.08 + Math.random() * 0.15;
      const id = ++zombieIdRef.current;

      setZombies(prev => {
        if (prev.length >= 6) return prev;
        const lane = findFreeLane(prev);
        return [...prev, { id, word, position: 0, speed, typed: '', lane }];
      });
    };

    spawn();
    const getSpawnRate = () => Math.max(800, 3000 - waveRef.current * 250);
    
    // Use dynamic interval via setTimeout chain
    let timeoutId: number;
    const scheduleNext = () => {
      timeoutId = window.setTimeout(() => {
        spawn();
        scheduleNext();
      }, getSpawnRate());
    };
    scheduleNext();

    return () => { clearTimeout(timeoutId); };
  }, [gameState, getWordForWave, findFreeLane]);

  // Wave progression
  useEffect(() => {
    if (killCount > 0 && killCount % 8 === 0) {
      setWave(w => w + 1);
      toast.success(`Wave ${wave + 1}!`);
    }
  }, [killCount, wave]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setInput(value);

    if (!value) return;

    setZombies(prev => {
      const targetIdx = prev.findIndex(z => z.word.startsWith(value));
      if (targetIdx === -1) return prev;

      const newZombies = [...prev];
      newZombies[targetIdx] = { ...newZombies[targetIdx], typed: value };

      if (value === newZombies[targetIdx].word) {
        const points = newZombies[targetIdx].word.length * 5 + wave * 2;
        setScore(s => s + points);
        setKillCount(k => k + 1);
        setInput('');
        return newZombies.filter((_, i) => i !== targetIdx);
      }

      return newZombies;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setInput('');
      setZombies(prev => prev.map(z => ({ ...z, typed: '' })));
    }
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
        game_type: 'zombie_survival',
        score,
        level_reached: wave,
        words_typed: killCount,
      });

      await supabase.rpc('update_user_xp', { p_xp_amount: Math.floor(score / 10) });
      toast.success('Score saved!');
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  };

  useEffect(() => {
    if (gameState === 'ended' && user) {
      saveScore();
    }
  }, [gameState]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" onClick={onBack} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Games
        </Button>

        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Skull className="w-8 h-8 text-destructive" />
            <h1 className="text-3xl font-bold gradient-text">Zombie Survival</h1>
          </div>
          <p className="text-muted-foreground">Type the words to eliminate zombies before they reach your base!</p>
        </div>

        {gameState === 'ready' && (
          <Card className="glass-card text-center">
            <CardContent className="p-8">
              <Skull className="w-16 h-16 mx-auto mb-4 text-destructive" />
              <h2 className="text-2xl font-bold mb-2">Survive the Horde</h2>
              <p className="text-muted-foreground mb-6">Type zombie words to eliminate them. Each wave gets harder. You have 5 lives!</p>
              <Button size="lg" onClick={startGame} className="bg-destructive hover:bg-destructive/90">Start Survival</Button>
            </CardContent>
          </Card>
        )}

        {gameState === 'playing' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Heart key={i} className={`w-5 h-5 ${i < lives ? 'text-destructive fill-destructive' : 'text-muted-foreground/30'}`} />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="font-medium">Wave {wave}</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-neon-yellow" />
                <span className="font-bold">{score}</span>
              </div>
            </div>

            <Card className="glass-card mb-4 overflow-hidden">
              <CardContent className="p-0 h-80 relative">
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-destructive/50" />
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-destructive/5" />

                {zombies.map(zombie => (
                  <div
                    key={zombie.id}
                    className="absolute flex items-center gap-2"
                    style={{
                      left: `${zombie.position}%`,
                      top: `${zombie.lane * (80 / (NUM_LANES - 1)) + 10}%`,
                      transform: 'translateY(-50%)',
                    }}
                  >
                    <Skull className="w-5 h-5 text-destructive shrink-0" />
                    <span className="text-sm font-mono font-bold whitespace-nowrap">
                      {zombie.word.split('').map((char, i) => (
                        <span
                          key={i}
                          className={i < zombie.typed.length ? 'text-primary' : 'text-foreground'}
                        >
                          {char}
                        </span>
                      ))}
                    </span>
                  </div>
                ))}

                {zombies.length === 0 && (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Incoming zombies...
                  </div>
                )}
              </CardContent>
            </Card>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              className="w-full text-center text-xl bg-transparent border-b-2 border-primary/50 focus:border-primary outline-none pb-2 text-foreground font-mono"
              placeholder="Type to shoot..."
              autoFocus
            />
            <p className="text-xs text-muted-foreground text-center mt-2">Press Escape to clear</p>
          </>
        )}

        {gameState === 'ended' && (
          <Card className="glass-card text-center">
            <CardContent className="p-8">
              <Skull className="w-16 h-16 mx-auto mb-4 text-destructive" />
              <h2 className="text-3xl font-bold mb-2">{score} Points</h2>
              <p className="text-muted-foreground mb-2">You survived {wave} waves and eliminated {killCount} zombies!</p>
              {user && <p className="text-sm text-primary mb-4">Score saved!</p>}
              <div className="flex justify-center gap-4 mt-6">
                <Button onClick={startGame} className="bg-destructive hover:bg-destructive/90">Try Again</Button>
                <Button variant="outline" onClick={onBack}>Back to Games</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ZombieSurvivalGame;

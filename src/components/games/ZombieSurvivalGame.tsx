import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Skull, Heart, Zap, Trophy, Shield } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface ZombieSurvivalGameProps {
  onBack: () => void;
}

interface Zombie {
  id: number;
  word: string;
  health: number;
  position: number; // 0-100, 100 = reached base
  speed: number;
  typed: string;
}

const ZOMBIE_WORDS = [
  'brain', 'flesh', 'crawl', 'groan', 'horde', 'virus', 'decay', 'risen',
  'crypt', 'grave', 'haunt', 'curse', 'dread', 'spawn', 'swarm', 'lurk',
  'fangs', 'claws', 'bones', 'skull', 'demon', 'ghost', 'shade', 'fiend',
  'nightmare', 'darkness', 'undead', 'infected', 'survive', 'outbreak',
  'apocalypse', 'barricade', 'fortress', 'ammunition', 'headshot',
  'quarantine', 'resistance', 'stronghold', 'devastation', 'extinction',
];

const ZombieSurvivalGame: React.FC<ZombieSurvivalGameProps> = ({ onBack }) => {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready');
  const [zombies, setZombies] = useState<Zombie[]>([]);
  const [lives, setLives] = useState(5);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [killCount, setKillCount] = useState(0);
  const [input, setInput] = useState('');
  const [zombieIdCounter, setZombieIdCounter] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const spawnTimerRef = useRef<number | null>(null);

  const getWordForWave = useCallback((currentWave: number) => {
    const maxLen = currentWave <= 3 ? 5 : currentWave <= 6 ? 7 : 12;
    const eligible = ZOMBIE_WORDS.filter(w => w.length <= maxLen);
    return eligible[Math.floor(Math.random() * eligible.length)];
  }, []);

  const spawnZombie = useCallback(() => {
    setZombieIdCounter(prev => {
      const newId = prev + 1;
      setZombies(z => {
        if (z.length >= 6) return z;
        const word = getWordForWave(wave);
        const speed = 0.3 + wave * 0.08 + Math.random() * 0.15;
        return [...z, { id: newId, word, health: 1, position: 0, speed, typed: '' }];
      });
      return newId;
    });
  }, [wave, getWordForWave]);

  const startGame = () => {
    setGameState('playing');
    setZombies([]);
    setLives(5);
    setScore(0);
    setWave(1);
    setKillCount(0);
    setInput('');
    setZombieIdCounter(0);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    gameLoopRef.current = window.setInterval(() => {
      setZombies(prev => {
        const updated: Zombie[] = [];
        let livesLost = 0;

        for (const z of prev) {
          const newPos = z.position + z.speed;
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
    }, 50);

    return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
  }, [gameState]);

  // Spawn timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    const spawnRate = Math.max(800, 3000 - wave * 250);
    spawnZombie(); // spawn first immediately

    spawnTimerRef.current = window.setInterval(spawnZombie, spawnRate);
    return () => { if (spawnTimerRef.current) clearInterval(spawnTimerRef.current); };
  }, [gameState, wave, spawnZombie]);

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
      const newZombies = [...prev];
      // Find zombie whose word starts with current input
      const targetIdx = newZombies.findIndex(z => z.word.startsWith(value));

      if (targetIdx !== -1) {
        newZombies[targetIdx] = { ...newZombies[targetIdx], typed: value };

        if (value === newZombies[targetIdx].word) {
          // Zombie killed!
          const points = newZombies[targetIdx].word.length * 5 + wave * 2;
          setScore(s => s + points);
          setKillCount(k => k + 1);
          setInput('');
          return newZombies.filter((_, i) => i !== targetIdx);
        }
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
            {/* HUD */}
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

            {/* Game Field */}
            <Card className="glass-card mb-4 overflow-hidden">
              <CardContent className="p-0 h-80 relative">
                {/* Base line */}
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-destructive/50" />
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-destructive/5" />

                {zombies.map(zombie => (
                  <div
                    key={zombie.id}
                    className="absolute flex items-center gap-2 transition-none"
                    style={{
                      left: `${zombie.position}%`,
                      top: `${(zombie.id * 47) % 80 + 10}%`,
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

            {/* Input */}
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

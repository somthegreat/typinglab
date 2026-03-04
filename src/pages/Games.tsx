import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2, Zap, Shield, Trophy, Shuffle, Skull } from 'lucide-react';
import WordRainGame from '@/components/games/WordRainGame';
import SpeedChaseGame from '@/components/games/SpeedChaseGame';
import TypingDefenseGame from '@/components/games/TypingDefenseGame';
import WordScrambleGame from '@/components/games/WordScrambleGame';
import ZombieSurvivalGame from '@/components/games/ZombieSurvivalGame';
import GameLeaderboard from '@/components/games/GameLeaderboard';

type GameType = 'menu' | 'word_rain' | 'speed_chase' | 'typing_defense' | 'word_scramble' | 'zombie_survival';

const Games: React.FC = () => {
  const [activeGame, setActiveGame] = useState<GameType>('menu');

  const games = [
    {
      id: 'word_rain' as GameType,
      title: 'Word Rain',
      description: 'Type falling words before they hit the ground!',
      icon: Zap,
      color: 'text-neon-blue',
      bgColor: 'bg-neon-blue/10',
    },
    {
      id: 'speed_chase' as GameType,
      title: 'Speed Chase',
      description: 'Race against time to type as many words as possible!',
      icon: Trophy,
      color: 'text-neon-yellow',
      bgColor: 'bg-neon-yellow/10',
    },
    {
      id: 'typing_defense' as GameType,
      title: 'Typing Defense',
      description: 'Defend your base by typing incoming enemy words!',
      icon: Shield,
      color: 'text-neon-green',
      bgColor: 'bg-neon-green/10',
    },
    {
      id: 'word_scramble' as GameType,
      title: 'Word Scramble',
      description: 'Unscramble letters to form words as fast as you can!',
      icon: Shuffle,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      id: 'zombie_survival' as GameType,
      title: 'Zombie Survival',
      description: 'Type words to fight off waves of zombies!',
      icon: Skull,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  if (activeGame === 'word_rain') return <WordRainGame onBack={() => setActiveGame('menu')} />;
  if (activeGame === 'speed_chase') return <SpeedChaseGame onBack={() => setActiveGame('menu')} />;
  if (activeGame === 'typing_defense') return <TypingDefenseGame onBack={() => setActiveGame('menu')} />;
  if (activeGame === 'word_scramble') return <WordScrambleGame onBack={() => setActiveGame('menu')} />;
  if (activeGame === 'zombie_survival') return <ZombieSurvivalGame onBack={() => setActiveGame('menu')} />;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Gamepad2 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold gradient-text">Typing Games</h1>
          </div>
          <p className="text-muted-foreground">Have fun while improving your typing skills!</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {games.map((game) => (
            <Card 
              key={game.id} 
              className="glass-card hover:border-primary/50 transition-all cursor-pointer group"
              onClick={() => setActiveGame(game.id)}
            >
              <CardHeader className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-full ${game.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <game.icon className={`w-8 h-8 ${game.color}`} />
                </div>
                <CardTitle className="text-xl">{game.title}</CardTitle>
                <CardDescription>{game.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full">Play Now</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <GameLeaderboard />
      </div>
    </Layout>
  );
};

export default Games;

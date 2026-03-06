import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Shuffle, Trophy, Clock, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSound } from '@/contexts/SoundContext';
import PersonalBestBadge from './PersonalBestBadge';
import ScorePopup, { useScorePopups } from './ScorePopup';

interface WordScrambleGameProps {
  onBack: () => void;
}

const WORDS = [
  'keyboard', 'practice', 'accuracy', 'champion', 'challenge',
  'strength', 'program', 'develop', 'function', 'variable',
  'network', 'browser', 'digital', 'creative', 'solution',
  'problem', 'project', 'feature', 'element', 'process',
  'content', 'pattern', 'trigger', 'session', 'profile',
  'achieve', 'balance', 'chapter', 'defense', 'explore',
  'genuine', 'harmony', 'inspire', 'journey', 'kitchen',
  'library', 'machine', 'natural', 'operate', 'present',
];

const scrambleWord = (word: string): string => {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const scrambled = arr.join('');
  return scrambled === word ? scrambleWord(word) : scrambled;
};

const WordScrambleGame: React.FC<WordScrambleGameProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { playKeySound, playSuccessSound } = useSound();
  const { popups, addPopup } = useScorePopups();
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready');
  const [currentWord, setCurrentWord] = useState('');
  const [scrambled, setScrambled] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  const nextWord = useCallback(() => {
    const available = WORDS.filter(w => !usedWords.has(w));
    if (available.length === 0) {
      setUsedWords(new Set());
      const word = WORDS[Math.floor(Math.random() * WORDS.length)];
      setCurrentWord(word);
      setScrambled(scrambleWord(word));
    } else {
      const word = available[Math.floor(Math.random() * available.length)];
      setCurrentWord(word);
      setScrambled(scrambleWord(word));
      setUsedWords(prev => new Set(prev).add(word));
    }
    setUserInput('');
  }, [usedWords]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setWordsCompleted(0);
    setTimeLeft(60);
    setUsedWords(new Set());
    nextWord();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  useEffect(() => {
    if (gameState !== 'playing') return;
    if (timeLeft <= 0) {
      setGameState('ended');
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setUserInput(value);

    if (value === currentWord) {
      const points = 10 + streak * 2;
      setScore(s => s + points);
      setStreak(s => {
        const newStreak = s + 1;
        setBestStreak(b => Math.max(b, newStreak));
        if (newStreak % 5 === 0) addPopup(`🔥 ${newStreak} Streak!`, 'streak');
        return newStreak;
      });
      setWordsCompleted(w => w + 1);
      nextWord();
      playSuccessSound();
      addPopup(`+${points}`, 'score');
    } else {
      playKeySound();
    }
  };

  const handleSkip = () => {
    setStreak(0);
    nextWord();
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
        game_type: 'word_scramble',
        score,
        level_reached: bestStreak,
        words_typed: wordsCompleted,
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
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" onClick={onBack} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Games
        </Button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Shuffle className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold gradient-text">Word Scramble</h1>
          </div>
          <p className="text-muted-foreground">Unscramble the letters to form the correct word!</p>
        </div>

        {gameState === 'ready' && (
          <Card className="glass-card text-center">
            <CardContent className="p-8">
              <Shuffle className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2">Ready to Scramble?</h2>
              <p className="text-muted-foreground mb-4">You have 60 seconds to unscramble as many words as possible. Build streaks for bonus points!</p>
              <PersonalBestBadge gameType="word_scramble" />
              <Button size="lg" onClick={startGame} className="mt-4">Start Game</Button>
            </CardContent>
          </Card>
        )}

        {gameState === 'playing' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-destructive animate-pulse' : ''}`}>{timeLeft}s</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">{score}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-neon-yellow" />
                <span className="text-lg font-medium">x{streak}</span>
              </div>
            </div>

            <Card className="glass-card mb-6 relative overflow-hidden">
              <CardContent className="p-8 text-center">
                <ScorePopup popups={popups} />
                <p className="text-sm text-muted-foreground mb-4">Unscramble this word:</p>
                <div className="flex justify-center gap-2 mb-8">
                  {scrambled.split('').map((char, i) => (
                    <span
                      key={i}
                      className="w-12 h-12 flex items-center justify-center text-2xl font-bold rounded-lg bg-primary/10 border border-primary/30 text-primary uppercase"
                    >
                      {char}
                    </span>
                  ))}
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={handleInputChange}
                  className="w-full max-w-md mx-auto block text-center text-2xl bg-transparent border-b-2 border-primary/50 focus:border-primary outline-none pb-2 text-foreground"
                  placeholder="Type your answer..."
                  autoFocus
                />
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button variant="ghost" onClick={handleSkip}>Skip Word</Button>
            </div>
          </>
        )}

        {gameState === 'ended' && (
          <Card className="glass-card text-center">
            <CardContent className="p-8">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-neon-yellow" />
              <h2 className="text-3xl font-bold mb-2">{score} Points</h2>
              <p className="text-muted-foreground mb-2">
                You unscrambled {wordsCompleted} words with a best streak of {bestStreak}!
              </p>
              {user && <p className="text-sm text-primary mb-4">Score saved!</p>}
              <div className="flex justify-center gap-4">
                <Button onClick={startGame}>Play Again</Button>
                <Button variant="outline" onClick={onBack}>Back to Games</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default WordScrambleGame;

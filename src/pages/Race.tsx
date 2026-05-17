import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useActiveRaces, useRace, useCreateRace, useJoinRace, useStartRace, useUpdateProgress, useFinishRace } from '@/hooks/useRaces';
import { useSound } from '@/contexts/SoundContext';
import { Link } from 'react-router-dom';
import { Users, Play, Trophy, Zap, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import SEO from "@/components/SEO";

const Race: React.FC = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: activeRaces, isLoading } = useActiveRaces();
  const createRace = useCreateRace();
  const joinRace = useJoinRace();
  const startRace = useStartRace();
  const updateProgress = useUpdateProgress();
  const finishRace = useFinishRace();
  const { playCountdownSound, playRaceStartSound, playKeySound, playSuccessSound } = useSound();

  const [currentRaceId, setCurrentRaceId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState<Set<number>>(new Set());
  const [startTime, setStartTime] = useState<number | null>(null);
  const [hasFinished, setHasFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { race, participants } = useRace(currentRaceId);

  // Handle countdown
  useEffect(() => {
    if (race?.status === 'countdown' && countdown === null) {
      setCountdown(3);
    }
  }, [race?.status]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      playCountdownSound();
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      playRaceStartSound();
      setStartTime(Date.now());
      inputRef.current?.focus();
    }
  }, [countdown]);

  // Calculate stats
  const calculateStats = () => {
    if (!startTime || !race) return { wpm: 0, accuracy: 0 };
    
    const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
    const correctChars = currentIndex - errors.size;
    const wpm = Math.round((correctChars / 5) / Math.max(timeElapsed, 0.01));
    const accuracy = currentIndex > 0 ? Math.round((correctChars / currentIndex) * 100) : 100;
    
    return { wpm, accuracy };
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!race || race.status !== 'racing' || hasFinished) return;

    const targetText = race.text_content;

    if (e.key === 'Backspace') {
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
        setErrors(prev => {
          const newErrors = new Set(prev);
          newErrors.delete(currentIndex - 1);
          return newErrors;
        });
      }
      return;
    }

    if (e.key.length === 1) {
      playKeySound();
      const expectedChar = targetText[currentIndex];
      
      if (e.key !== expectedChar) {
        setErrors(prev => new Set(prev).add(currentIndex));
      }
      
      setCurrentIndex(prev => prev + 1);

      // Update progress
      const progress = Math.round(((currentIndex + 1) / targetText.length) * 100);
      const { wpm, accuracy } = calculateStats();
      updateProgress.mutate({ raceId: race.id, progress, wpm, accuracy });

      // Check if finished
      if (currentIndex + 1 >= targetText.length) {
        const finishedCount = participants.filter(p => p.finished_at).length;
        finishRace.mutate({ 
          raceId: race.id, 
          wpm, 
          accuracy, 
          position: finishedCount + 1 
        });
        setHasFinished(true);
        playSuccessSound();
      }
    }
  };

  const handleCreateRace = async () => {
    const newRace = await createRace.mutateAsync();
    setCurrentRaceId(newRace.id);
    await joinRace.mutateAsync({ 
      raceId: newRace.id, 
      username: profile?.username || 'Anonymous' 
    });
  };

  const handleJoinRace = async (raceId: string) => {
    setCurrentRaceId(raceId);
    await joinRace.mutateAsync({ 
      raceId, 
      username: profile?.username || 'Anonymous' 
    });
  };

  const handleStartRace = () => {
    if (currentRaceId && race?.host_id) {
      startRace.mutate({ raceId: currentRaceId, hostId: race.host_id });
    }
  };

  const isHost = race?.host_id === user?.id;
  const myParticipant = participants.find(p => p.user_id === user?.id);

  if (!user) {
    return (
      <>
        <SEO title="Multiplayer Typing Race | TypingLab" description="Compete in real-time multiplayer typing races. Challenge friends or random typists and race to the finish line." path="/race" />
        <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Sign in to race</h2>
          <p className="text-muted-foreground mb-6">Create an account to compete against other typists in real-time!</p>
          <Link to="/auth">
            <Button size="lg" className="neon-glow">Sign In</Button>
          </Link>
        </div>
      </Layout>
      </>
  );
  }

  // Race lobby view
  if (!currentRaceId || !race) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Multiplayer Racing</h1>
          <p className="text-muted-foreground mb-8">Compete against others in real-time typing races!</p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                Create a Race
              </h2>
              <p className="text-muted-foreground mb-4">Start a new race and invite others to join!</p>
              <Button 
                onClick={handleCreateRace} 
                className="w-full neon-glow"
                disabled={createRace.isPending}
              >
                {createRace.isPending ? 'Creating...' : 'Create Race'}
              </Button>
            </div>

            <div className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                Join a Race
              </h2>
              {isLoading ? (
                <p className="text-muted-foreground">Loading races...</p>
              ) : activeRaces && activeRaces.length > 0 ? (
                <div className="space-y-2">
                  {activeRaces.map(race => (
                    <Button
                      key={race.id}
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => handleJoinRace(race.id)}
                    >
                      <span>Race #{race.id.slice(0, 8)}</span>
                      <span className="text-muted-foreground text-sm">
                        {race.status === 'waiting' ? 'Waiting...' : 'Starting...'}
                      </span>
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No active races. Create one!</p>
              )}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Waiting room
  if (race.status === 'waiting') {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="glass-card rounded-xl p-8 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Waiting for Players</h2>
            <p className="text-muted-foreground mb-6">
              Share this race ID with friends: <code className="bg-secondary px-2 py-1 rounded">{race.id.slice(0, 8)}</code>
            </p>

            <div className="space-y-2 mb-6">
              <h3 className="font-semibold">Players ({participants.length}/4)</h3>
              {participants.map(p => (
                <div key={p.id} className="flex items-center justify-center gap-2 text-muted-foreground">
                  <span>{p.username || 'Anonymous'}</span>
                  {p.user_id === race.host_id && <span className="text-xs text-primary">(Host)</span>}
                </div>
              ))}
            </div>

            {isHost && participants.length >= 1 && (
              <Button 
                onClick={handleStartRace} 
                size="lg" 
                className="neon-glow"
              >
                Start Race
              </Button>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // Countdown
  if (race.status === 'countdown' || countdown !== null) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-9xl font-bold text-primary animate-pulse">
              {countdown || 'GO!'}
            </div>
            <p className="text-muted-foreground mt-4">Get ready to type!</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Racing
  const { wpm, accuracy } = calculateStats();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Participants progress */}
        <div className="glass-card rounded-xl p-4 mb-6">
          <div className="space-y-3">
            {participants.map((p, idx) => (
              <div key={p.id} className="flex items-center gap-4">
                <div className="w-24 text-sm truncate">
                  {p.username || 'Anonymous'}
                  {p.position && <Trophy className="w-3 h-3 inline ml-1 text-neon-yellow" />}
                </div>
                <div className="flex-1">
                  <Progress value={p.progress || 0} className="h-3" />
                </div>
                <div className="w-16 text-right text-sm">
                  <span className="text-primary font-semibold">{p.wpm || 0}</span>
                  <span className="text-muted-foreground"> wpm</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{wpm}</div>
            <div className="text-sm text-muted-foreground">WPM</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-correct">{accuracy}%</div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </div>
        </div>

        {/* Typing area */}
        <div 
          className="glass-card rounded-2xl p-8 cursor-text relative"
          onClick={() => inputRef.current?.focus()}
        >
          <input
            ref={inputRef}
            type="text"
            className="absolute opacity-0 pointer-events-none"
            onKeyDown={handleKeyDown}
            disabled={hasFinished}
            autoFocus
          />
          
          <div className="typing-text leading-loose">
            {race.text_content.split('').map((char, index) => {
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

          {hasFinished && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl">
              <div className="text-center">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-neon-yellow" />
                <h3 className="text-2xl font-bold mb-2">
                  {myParticipant?.position === 1 ? 'You Won!' : `Finished #${myParticipant?.position}`}
                </h3>
                <p className="text-muted-foreground mb-4">{wpm} WPM • {accuracy}% Accuracy</p>
                <Button onClick={() => { setCurrentRaceId(null); setHasFinished(false); setCurrentIndex(0); setErrors(new Set()); }}>
                  Back to Lobby
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Race;
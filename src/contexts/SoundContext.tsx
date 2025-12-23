import React, { createContext, useContext, useState, useCallback } from 'react';

interface SoundContextType {
  soundEnabled: boolean;
  volume: number;
  toggleSound: () => void;
  setVolume: (volume: number) => void;
  playKeySound: () => void;
  playErrorSound: () => void;
  playSuccessSound: () => void;
  playCountdownSound: () => void;
  playRaceStartSound: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

// Simple oscillator-based sounds
const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) => {
  if (!audioContext) return;
  
  // Resume audio context if it's suspended (autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = type;
  gainNode.gain.value = volume;
  
  oscillator.start();
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
  oscillator.stop(audioContext.currentTime + duration);
};

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('typing-sound');
    return saved !== 'false';
  });
  
  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem('typing-volume');
    return saved ? parseFloat(saved) : 0.5;
  });

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('typing-sound', String(newValue));
      return newValue;
    });
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
    localStorage.setItem('typing-volume', String(newVolume));
  };

  const playKeySound = useCallback(() => {
    if (!soundEnabled) return;
    playTone(800, 0.05, 'square', 0.05 * volume);
  }, [soundEnabled, volume]);

  const playErrorSound = useCallback(() => {
    if (!soundEnabled) return;
    playTone(200, 0.15, 'sawtooth', 0.08 * volume);
  }, [soundEnabled, volume]);

  const playSuccessSound = useCallback(() => {
    if (!soundEnabled) return;
    playTone(523, 0.1, 'sine', 0.1 * volume);
    setTimeout(() => playTone(659, 0.1, 'sine', 0.1 * volume), 100);
    setTimeout(() => playTone(784, 0.2, 'sine', 0.1 * volume), 200);
  }, [soundEnabled, volume]);

  const playCountdownSound = useCallback(() => {
    if (!soundEnabled) return;
    playTone(440, 0.15, 'sine', 0.15 * volume);
  }, [soundEnabled, volume]);

  const playRaceStartSound = useCallback(() => {
    if (!soundEnabled) return;
    playTone(880, 0.3, 'sine', 0.2 * volume);
  }, [soundEnabled, volume]);

  return (
    <SoundContext.Provider value={{ 
      soundEnabled, 
      volume, 
      toggleSound, 
      setVolume, 
      playKeySound, 
      playErrorSound, 
      playSuccessSound,
      playCountdownSound,
      playRaceStartSound
    }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};

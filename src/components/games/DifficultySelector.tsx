import React from 'react';
import { Button } from '@/components/ui/button';
import { Zap, Flame, Skull } from 'lucide-react';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface DifficultyConfig {
  spawnRate: number;
  wordMaxIndex: number;
  speed: number;
  timer: number;
  lives: number;
  label: string;
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: { spawnRate: 1.5, wordMaxIndex: 50, speed: 0.7, timer: 90, lives: 5, label: 'Easy' },
  medium: { spawnRate: 1.0, wordMaxIndex: 150, speed: 1.0, timer: 60, lives: 3, label: 'Medium' },
  hard: { spawnRate: 0.6, wordMaxIndex: 300, speed: 1.4, timer: 45, lives: 2, label: 'Hard' },
};

interface DifficultySelectorProps {
  selected: Difficulty;
  onChange: (d: Difficulty) => void;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ selected, onChange }) => {
  const options: { value: Difficulty; icon: React.ReactNode; color: string }[] = [
    { value: 'easy', icon: <Zap className="w-4 h-4" />, color: 'text-neon-green' },
    { value: 'medium', icon: <Flame className="w-4 h-4" />, color: 'text-neon-yellow' },
    { value: 'hard', icon: <Skull className="w-4 h-4" />, color: 'text-destructive' },
  ];

  return (
    <div className="flex items-center justify-center gap-2 my-4">
      {options.map(({ value, icon, color }) => (
        <Button
          key={value}
          size="sm"
          variant={selected === value ? 'default' : 'outline'}
          className={`gap-1.5 ${selected === value ? '' : color}`}
          onClick={() => onChange(value)}
        >
          {icon}
          {DIFFICULTY_CONFIGS[value].label}
        </Button>
      ))}
    </div>
  );
};

export default DifficultySelector;

import React from 'react';
import { cn } from '@/lib/utils';

interface VirtualKeyboardProps {
  currentKey: string;
  pressedKey: string | null;
  errors: Set<number>;
  targetText: string;
  currentIndex: number;
}

const keyboardLayout = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
  [' '],
];

// Finger assignment: 0=pinky, 1=ring, 2=middle, 3=index (left), 4=index (right), 5=middle, 6=ring, 7=pinky
const fingerColors: Record<number, string> = {
  0: 'bg-neon-pink/20 border-neon-pink/40',
  1: 'bg-neon-orange/20 border-neon-orange/40',
  2: 'bg-neon-yellow/20 border-neon-yellow/40',
  3: 'bg-neon-green/20 border-neon-green/40',
  4: 'bg-neon-cyan/20 border-neon-cyan/40',
  5: 'bg-neon-purple/20 border-neon-purple/40',
};

const keyToFinger: Record<string, number> = {
  '`': 0, '1': 0, 'q': 0, 'a': 0, 'z': 0,
  '2': 1, 'w': 1, 's': 1, 'x': 1,
  '3': 2, 'e': 2, 'd': 2, 'c': 2,
  '4': 3, '5': 3, 'r': 3, 't': 3, 'f': 3, 'g': 3, 'v': 3, 'b': 3,
  '6': 4, '7': 4, 'y': 4, 'u': 4, 'h': 4, 'j': 4, 'n': 4, 'm': 4,
  '8': 5, 'i': 5, 'k': 5, ',': 5,
  '9': 6, 'o': 6, 'l': 6, '.': 6,
  '0': 7, '-': 7, '=': 7, 'p': 7, ';': 7, "'": 7, '[': 7, ']': 7, '\\': 7, '/': 7,
  ' ': 3, // Thumbs for space
};

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ 
  currentKey, 
  pressedKey, 
  errors, 
  targetText, 
  currentIndex 
}) => {
  const expectedChar = targetText[currentIndex]?.toLowerCase() || '';
  const lastTypedCorrect = currentIndex > 0 && !errors.has(currentIndex - 1);
  const lastTypedIncorrect = currentIndex > 0 && errors.has(currentIndex - 1);
  
  const getKeyClass = (key: string) => {
    const normalizedKey = key.toLowerCase();
    const isCurrentKey = expectedChar === normalizedKey || (expectedChar === ' ' && key === ' ');
    const isPressed = pressedKey?.toLowerCase() === normalizedKey;
    const finger = keyToFinger[normalizedKey] ?? 0;
    
    if (isPressed && lastTypedIncorrect) {
      return 'bg-destructive text-destructive-foreground scale-95 shadow-lg';
    }
    if (isPressed && lastTypedCorrect) {
      return 'bg-correct text-primary-foreground scale-95 shadow-lg';
    }
    if (isCurrentKey) {
      return `${fingerColors[finger]} border-2 animate-pulse scale-105`;
    }
    return 'bg-secondary text-secondary-foreground border border-border';
  };

  const getKeyWidth = (key: string) => {
    if (key === ' ') return 'w-64';
    if (key === '\\') return 'w-14';
    return 'w-10 md:w-12';
  };

  return (
    <div className="flex flex-col items-center gap-1.5 p-4 glass-card rounded-xl">
      {keyboardLayout.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1.5 justify-center">
          {row.map((key) => (
            <div
              key={key}
              className={cn(
                'flex items-center justify-center h-10 md:h-12 rounded-lg',
                'font-mono text-sm font-medium transition-all duration-100',
                'shadow-md',
                getKeyWidth(key),
                getKeyClass(key)
              )}
            >
              {key === ' ' ? 'SPACE' : key.toUpperCase()}
            </div>
          ))}
        </div>
      ))}
      
      {/* Finger placement guide */}
      <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-neon-pink/40" />
          <span>Pinky</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-neon-orange/40" />
          <span>Ring</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-neon-yellow/40" />
          <span>Middle</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-neon-green/40" />
          <span>Index (L)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-neon-cyan/40" />
          <span>Index (R)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-neon-purple/40" />
          <span>Middle+</span>
        </div>
      </div>
    </div>
  );
};

export default VirtualKeyboard;

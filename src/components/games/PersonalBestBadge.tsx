import React from 'react';
import { Trophy } from 'lucide-react';
import { usePersonalBest } from '@/hooks/useGameScores';

interface PersonalBestBadgeProps {
  gameType: string;
}

const PersonalBestBadge: React.FC<PersonalBestBadgeProps> = ({ gameType }) => {
  const { data: best } = usePersonalBest(gameType);

  if (!best) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3 justify-center">
      <Trophy className="w-4 h-4 text-neon-yellow" />
      <span>Personal Best: <span className="font-bold text-foreground">{best.score}</span> pts</span>
      {best.level_reached && (
        <span className="text-xs">(Lv {best.level_reached})</span>
      )}
    </div>
  );
};

export default PersonalBestBadge;

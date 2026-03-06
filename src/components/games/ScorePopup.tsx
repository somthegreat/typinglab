import React, { useEffect, useState } from 'react';

interface PopupItem {
  id: number;
  text: string;
  x: number;
  y: number;
  type: 'score' | 'streak' | 'bonus';
}

let popupId = 0;

export function useScorePopups() {
  const [popups, setPopups] = useState<PopupItem[]>([]);

  const addPopup = (text: string, type: PopupItem['type'] = 'score') => {
    const id = ++popupId;
    const x = 40 + Math.random() * 20;
    const y = 30 + Math.random() * 20;
    setPopups(prev => [...prev, { id, text, x, y, type }]);
    setTimeout(() => {
      setPopups(prev => prev.filter(p => p.id !== id));
    }, 1200);
  };

  return { popups, addPopup };
}

const ScorePopup: React.FC<{ popups: PopupItem[] }> = ({ popups }) => {
  return (
    <>
      {popups.map(popup => (
        <div
          key={popup.id}
          className="absolute pointer-events-none z-50 animate-score-popup"
          style={{ left: `${popup.x}%`, top: `${popup.y}%` }}
        >
          <span
            className={`font-bold text-lg whitespace-nowrap drop-shadow-lg ${
              popup.type === 'score'
                ? 'text-primary'
                : popup.type === 'streak'
                ? 'text-neon-yellow text-xl'
                : 'text-neon-green text-xl'
            }`}
          >
            {popup.text}
          </span>
        </div>
      ))}
    </>
  );
};

export default ScorePopup;

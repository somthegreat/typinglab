import React from 'react';
import { cn } from '@/lib/utils';

interface HandsGuideProps {
  /** Active finger id: 0=L-pinky, 1=L-ring, 2=L-middle, 3=L-index, 4=R-index, 5=R-middle, 6=R-ring, 7=R-pinky, 8=thumb (space) */
  activeFinger: number | null;
}

const fingerColorVar: Record<number, string> = {
  0: 'hsl(var(--neon-pink, 330 90% 60%))',
  1: 'hsl(var(--neon-orange, 25 95% 60%))',
  2: 'hsl(var(--neon-yellow, 50 95% 55%))',
  3: 'hsl(var(--neon-green, 140 70% 55%))',
  4: 'hsl(var(--neon-cyan, 190 90% 55%))',
  5: 'hsl(var(--neon-purple, 270 80% 65%))',
  6: 'hsl(var(--neon-orange, 25 95% 60%))',
  7: 'hsl(var(--neon-pink, 330 90% 60%))',
  8: 'hsl(var(--primary))',
};

/**
 * A single stylized hand. `side` decides mirroring. Fingers are indexed
 * 0..3 = pinky..index for the LEFT hand, and 0..3 = index..pinky for the
 * RIGHT hand (i.e. always outermost finger first in render order on the
 * left, but we still map externally by the global finger id).
 */
const Hand: React.FC<{
  side: 'left' | 'right';
  activeIndex: number | null; // 0..3 finger within this hand, or 4 for thumb
}> = ({ side, activeIndex }) => {
  // Finger geometry: x position + base length. Hand is drawn in a 120x140 box.
  // We render LEFT hand and mirror for RIGHT via transform.
  const fingers = [
    { id: 0, x: 18, len: 48, label: 'Pinky' },
    { id: 1, x: 40, len: 64, label: 'Ring' },
    { id: 2, x: 62, len: 70, label: 'Middle' },
    { id: 3, x: 84, len: 60, label: 'Index' },
  ];

  return (
    <svg
      viewBox="0 0 120 150"
      className={cn('w-24 h-28 md:w-28 md:h-32', side === 'right' && 'scale-x-[-1]')}
      aria-hidden
    >
      {/* Palm */}
      <rect
        x="8"
        y="78"
        width="100"
        height="60"
        rx="22"
        fill="hsl(var(--muted))"
        stroke="hsl(var(--border))"
        strokeWidth="1.5"
      />
      {/* Thumb */}
      {(() => {
        const isActive = activeIndex === 4;
        const color = isActive ? fingerColorVar[8] : 'hsl(var(--muted))';
        return (
          <g
            style={{
              transform: isActive ? 'translateY(-4px) rotate(-4deg)' : 'none',
              transformOrigin: '12px 110px',
              transition: 'transform 200ms ease',
            }}
          >
            <rect
              x="0"
              y="92"
              width="24"
              height="46"
              rx="12"
              fill={color}
              stroke="hsl(var(--border))"
              strokeWidth="1.5"
              opacity={isActive ? 0.95 : 1}
            />
          </g>
        );
      })()}
      {/* 4 Fingers */}
      {fingers.map((f, i) => {
        const isActive = activeIndex === i;
        const color = isActive ? fingerColorVar[side === 'left' ? i : 7 - i] : 'hsl(var(--muted))';
        const lift = isActive ? 10 : 0;
        return (
          <g
            key={f.id}
            style={{
              transform: `translateY(${-lift}px)`,
              transition: 'transform 220ms cubic-bezier(.2,.8,.2,1)',
            }}
          >
            <rect
              x={f.x - 8}
              y={88 - f.len}
              width="16"
              height={f.len + 8}
              rx="8"
              fill={color}
              stroke="hsl(var(--border))"
              strokeWidth="1.5"
            />
            {isActive && (
              <circle
                cx={f.x}
                cy={88 - f.len + 4}
                r="10"
                fill={color}
                opacity="0.35"
              >
                <animate
                  attributeName="r"
                  values="8;14;8"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.5;0.15;0.5"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
          </g>
        );
      })}
    </svg>
  );
};

const HandsGuide: React.FC<HandsGuideProps> = ({ activeFinger }) => {
  // Map global finger id -> (side, indexWithinHand 0..4 where 4=thumb)
  let leftActive: number | null = null;
  let rightActive: number | null = null;
  if (activeFinger === 8) {
    // Space -> right thumb (most typists)
    rightActive = 4;
  } else if (activeFinger !== null) {
    if (activeFinger <= 3) leftActive = activeFinger; // 0..3 pinky..index L
    else if (activeFinger <= 7) rightActive = 7 - activeFinger; // 4..7 -> 3..0 (index..pinky on right rendered left-to-right after mirror)
  }

  return (
    <div className="flex items-end justify-center gap-6 mt-2 select-none">
      <Hand side="left" activeIndex={leftActive} />
      <Hand side="right" activeIndex={rightActive} />
    </div>
  );
};

export default HandsGuide;
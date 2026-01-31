import React from 'react';
import { useWeakKeys } from '@/hooks/useWeakKeys';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Flame } from 'lucide-react';

type KeyboardLayout = 'qwerty' | 'dvorak' | 'colemak' | 'azerty';

interface KeyboardHeatmapProps {
  layout?: KeyboardLayout;
}

const keyboardLayouts: Record<KeyboardLayout, string[][]> = {
  qwerty: [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
    [' '],
  ],
  dvorak: [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '[', ']'],
    ["'", ',', '.', 'p', 'y', 'f', 'g', 'c', 'r', 'l', '/', '=', '\\'],
    ['a', 'o', 'e', 'u', 'i', 'd', 'h', 't', 'n', 's', '-'],
    [';', 'q', 'j', 'k', 'x', 'b', 'm', 'w', 'v', 'z'],
    [' '],
  ],
  colemak: [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
    ['q', 'w', 'f', 'p', 'g', 'j', 'l', 'u', 'y', ';', '[', ']', '\\'],
    ['a', 'r', 's', 't', 'd', 'h', 'n', 'e', 'i', 'o', "'"],
    ['z', 'x', 'c', 'v', 'b', 'k', 'm', ',', '.', '/'],
    [' '],
  ],
  azerty: [
    ['²', '&', 'é', '"', "'", '(', '-', 'è', '_', 'ç', 'à', ')', '='],
    ['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '^', '$', '*'],
    ['q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'ù'],
    ['w', 'x', 'c', 'v', 'b', 'n', ',', ';', ':', '!'],
    [' '],
  ],
};

const getHeatColor = (errorRate: number, totalCount: number): string => {
  if (totalCount === 0) return 'bg-secondary border-border';
  
  // More errors = more red/hot
  if (errorRate > 25) return 'bg-red-500/80 border-red-400 text-white';
  if (errorRate > 15) return 'bg-orange-500/70 border-orange-400 text-white';
  if (errorRate > 10) return 'bg-yellow-500/60 border-yellow-500 text-black';
  if (errorRate > 5) return 'bg-yellow-300/50 border-yellow-400 text-black';
  if (errorRate > 2) return 'bg-green-400/40 border-green-500';
  return 'bg-green-500/60 border-green-400 text-white';
};

const KeyboardHeatmap: React.FC<KeyboardHeatmapProps> = ({ layout = 'qwerty' }) => {
  const { data: weakKeys, isLoading } = useWeakKeys();
  
  const keyMap = new Map<string, { errorRate: number; totalCount: number; errorCount: number }>();
  weakKeys?.forEach(k => {
    keyMap.set(k.key_char.toLowerCase(), {
      errorRate: k.error_rate,
      totalCount: k.total_count,
      errorCount: k.error_count,
    });
  });

  const keyboardLayout = keyboardLayouts[layout];

  const getKeyWidth = (key: string) => {
    if (key === ' ') return 'w-64';
    return 'w-10 md:w-12';
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="py-8">
          <div className="animate-pulse flex flex-col gap-2 items-center">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 w-full max-w-xl bg-secondary rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-neon-orange" />
          Keyboard Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-1.5 p-4">
          {keyboardLayout.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1.5 justify-center">
              {row.map((key, keyIndex) => {
                const keyData = keyMap.get(key.toLowerCase());
                const heatColor = keyData 
                  ? getHeatColor(keyData.errorRate, keyData.totalCount)
                  : 'bg-secondary border-border';
                
                return (
                  <div
                    key={`${rowIndex}-${keyIndex}`}
                    className={cn(
                      'flex flex-col items-center justify-center h-10 md:h-12 rounded-lg',
                      'font-mono text-sm font-medium transition-all duration-200',
                      'border shadow-md hover:scale-105 cursor-default',
                      getKeyWidth(key),
                      heatColor
                    )}
                    title={keyData ? `${keyData.errorCount} errors / ${keyData.totalCount} typed (${keyData.errorRate.toFixed(1)}%)` : 'No data'}
                  >
                    <span>{key === ' ' ? 'SPACE' : key.toUpperCase()}</span>
                    {keyData && keyData.totalCount > 0 && (
                      <span className="text-[10px] opacity-75">
                        {keyData.errorRate.toFixed(0)}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-green-500/60 border border-green-400" />
            <span>0-2%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-green-400/40 border border-green-500" />
            <span>2-5%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-yellow-300/50 border border-yellow-400" />
            <span>5-10%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-yellow-500/60 border border-yellow-500" />
            <span>10-15%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-orange-500/70 border border-orange-400" />
            <span>15-25%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-red-500/80 border border-red-400" />
            <span>25%+</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KeyboardHeatmap;

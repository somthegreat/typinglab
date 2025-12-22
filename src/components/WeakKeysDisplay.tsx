import React from 'react';
import { useWeakKeys } from '@/hooks/useWeakKeys';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const WeakKeysDisplay: React.FC = () => {
  const { data: weakKeys, isLoading } = useWeakKeys();

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="py-8">
          <div className="animate-pulse flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-8 bg-secondary rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const topWeakKeys = weakKeys?.slice(0, 8) || [];

  if (topWeakKeys.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-muted-foreground" />
            Weak Keys
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Complete more typing tests to identify your weak keys!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-neon-orange" />
          Weak Keys
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topWeakKeys.map((key) => (
          <div key={key.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span 
                  className={cn(
                    "w-10 h-10 flex items-center justify-center rounded-lg font-mono font-bold text-lg",
                    "bg-secondary border border-border"
                  )}
                >
                  {key.key_char.toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-medium">
                    {key.error_count} errors / {key.total_count} typed
                  </p>
                </div>
              </div>
              <span 
                className={cn(
                  "text-sm font-bold",
                  key.error_rate > 20 ? "text-destructive" : 
                  key.error_rate > 10 ? "text-neon-orange" : 
                  "text-neon-yellow"
                )}
              >
                {key.error_rate.toFixed(1)}% error
              </span>
            </div>
            <Progress 
              value={100 - key.error_rate} 
              className="h-2"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default WeakKeysDisplay;

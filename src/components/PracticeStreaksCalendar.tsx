import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { subDays, format, startOfDay, eachDayOfInterval, getDay } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const PracticeStreaksCalendar: React.FC = () => {
  const { user } = useAuth();

  const { data: sessionDays } = useQuery({
    queryKey: ['practice-calendar', user?.id],
    queryFn: async () => {
      const startDate = subDays(new Date(), 364);
      const { data, error } = await supabase
        .from('practice_sessions')
        .select('created_at, duration_seconds')
        .eq('user_id', user!.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at');
      if (error) throw error;

      // Also get test results as practice activity
      const { data: tests } = await supabase
        .from('test_results')
        .select('created_at, test_duration')
        .eq('user_id', user!.id)
        .gte('created_at', startDate.toISOString());

      // Aggregate by day
      const dayMap: Record<string, number> = {};

      data?.forEach(s => {
        const day = format(new Date(s.created_at), 'yyyy-MM-dd');
        dayMap[day] = (dayMap[day] || 0) + (s.duration_seconds || 0);
      });

      tests?.forEach(t => {
        const day = format(new Date(t.created_at!), 'yyyy-MM-dd');
        dayMap[day] = (dayMap[day] || 0) + (t.test_duration || 30);
      });

      return dayMap;
    },
    enabled: !!user,
  });

  const today = new Date();
  const startDate = subDays(today, 364);
  const allDays = eachDayOfInterval({ start: startDate, end: today });

  // Group by week (columns)
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  allDays.forEach((day, i) => {
    if (i === 0) {
      // Pad start of first week
      const dayOfWeek = getDay(day);
      for (let j = 0; j < dayOfWeek; j++) {
        currentWeek.push(null as any);
      }
    }
    currentWeek.push(day);
    if (getDay(day) === 6 || i === allDays.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const getIntensity = (dateStr: string): number => {
    const seconds = sessionDays?.[dateStr] || 0;
    if (seconds === 0) return 0;
    if (seconds < 120) return 1;
    if (seconds < 300) return 2;
    if (seconds < 600) return 3;
    return 4;
  };

  const intensityColors = [
    'bg-secondary/50',
    'bg-primary/20',
    'bg-primary/40',
    'bg-primary/60',
    'bg-primary/90',
  ];

  const totalDays = Object.keys(sessionDays || {}).length;
  const totalMinutes = Math.round(
    Object.values(sessionDays || {}).reduce((sum, s) => sum + s, 0) / 60
  );

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title mb-0">Practice Activity</h3>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span><strong className="text-foreground">{totalDays}</strong> active days</span>
          <span><strong className="text-foreground">{totalMinutes}</strong> total min</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-[3px] min-w-[720px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => {
                if (!day) return <div key={di} className="w-3 h-3" />;
                const dateStr = format(day, 'yyyy-MM-dd');
                const intensity = getIntensity(dateStr);
                const seconds = sessionDays?.[dateStr] || 0;
                const mins = Math.round(seconds / 60);
                return (
                  <Tooltip key={di}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'w-3 h-3 rounded-sm transition-colors',
                          intensityColors[intensity]
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        {format(day, 'MMM d, yyyy')}
                        {seconds > 0 ? ` — ${mins} min` : ' — No activity'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 justify-end text-xs text-muted-foreground">
        <span>Less</span>
        {intensityColors.map((c, i) => (
          <div key={i} className={cn('w-3 h-3 rounded-sm', c)} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
};

export default PracticeStreaksCalendar;

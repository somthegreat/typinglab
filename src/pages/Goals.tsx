import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Target, Plus, Trash2, Trophy, Zap, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Navigate, Link } from 'react-router-dom';
import { addDays, addWeeks, addMonths, format, isPast } from 'date-fns';
import SEO from "@/components/SEO";

interface TypingGoal {
  id: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  period: string;
  started_at: string;
  ends_at: string;
  completed: boolean;
}

const GOAL_TYPES = [
  { value: 'wpm', label: 'Reach WPM', unit: 'WPM', icon: Zap },
  { value: 'accuracy', label: 'Reach Accuracy', unit: '%', icon: Target },
  { value: 'sessions', label: 'Complete Sessions', unit: 'sessions', icon: CheckCircle },
  { value: 'minutes', label: 'Practice Minutes', unit: 'min', icon: Trophy },
];

const PERIODS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const Goals: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [goalType, setGoalType] = useState('wpm');
  const [targetValue, setTargetValue] = useState('60');
  const [period, setPeriod] = useState('weekly');

  const { data: goals, isLoading } = useQuery({
    queryKey: ['typing-goals', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('typing_goals')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as TypingGoal[];
    },
    enabled: !!user,
  });

  const createGoal = useMutation({
    mutationFn: async () => {
      const now = new Date();
      let endsAt: Date;
      if (period === 'daily') endsAt = addDays(now, 1);
      else if (period === 'weekly') endsAt = addWeeks(now, 1);
      else endsAt = addMonths(now, 1);

      const { error } = await supabase.from('typing_goals').insert({
        user_id: user!.id,
        goal_type: goalType,
        target_value: Number(targetValue),
        period,
        ends_at: endsAt.toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['typing-goals'] });
      toast.success('Goal created!');
    },
    onError: () => toast.error('Failed to create goal'),
  });

  const deleteGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('typing_goals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['typing-goals'] });
      toast.success('Goal removed');
    },
  });

  if (!user) return <Navigate to="/auth" replace />;

  const activeGoals = goals?.filter(g => !g.completed && !isPast(new Date(g.ends_at))) || [];
  const completedGoals = goals?.filter(g => g.completed) || [];
  const expiredGoals = goals?.filter(g => !g.completed && isPast(new Date(g.ends_at))) || [];

  const getGoalMeta = (type: string) => GOAL_TYPES.find(t => t.value === type) || GOAL_TYPES[0];

  return (
    <>
      <SEO title="Typing Goals | TypingLab" description="Set personalized typing goals for speed, accuracy, and practice time and track your progress over time." path="/goals" />
      <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Typing Goals</h1>
          <p className="text-muted-foreground">Set targets and track your progress</p>
        </div>

        {/* Create Goal */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" /> New Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Goal Type</label>
                <Select value={goalType} onValueChange={setGoalType}>
                  <SelectTrigger aria-label="Goal type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GOAL_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Target</label>
                <Input
                  type="number"
                  value={targetValue}
                  onChange={e => setTargetValue(e.target.value)}
                  min={1}
                  max={999}
                  aria-label="Goal target value"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Period</label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger aria-label="Goal period"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PERIODS.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={() => createGoal.mutate()}
              disabled={createGoal.isPending || !targetValue || Number(targetValue) <= 0}
              className="w-full"
            >
              Create Goal
            </Button>
          </CardContent>
        </Card>

        {/* Active Goals */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : activeGoals.length === 0 && completedGoals.length === 0 ? (
          <Card className="glass-card text-center py-12">
            <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No goals set yet. Create one above!</p>
            <Link to="/test">
              <Button variant="outline">Start Practicing</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {activeGoals.length > 0 && (
              <>
                <h3 className="text-lg font-semibold">Active Goals</h3>
                <div className="space-y-3">
                  {activeGoals.map(goal => {
                    const meta = getGoalMeta(goal.goal_type);
                    const Icon = meta.icon;
                    const progress = Math.min(100, (Number(goal.current_value) / Number(goal.target_value)) * 100);
                    return (
                      <Card key={goal.id} className="glass-card">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <Icon className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold">
                                  {meta.label}: {Number(goal.target_value)} {meta.unit}
                                </p>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {goal.period} • ends {format(new Date(goal.ends_at), 'MMM d')}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteGoal.mutate(goal.id)}
                              aria-label="Delete goal"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1 text-right">
                            {Number(goal.current_value)} / {Number(goal.target_value)} {meta.unit}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}

            {completedGoals.length > 0 && (
              <>
                <h3 className="text-lg font-semibold mt-8 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-neon-yellow" /> Completed
                </h3>
                <div className="space-y-2">
                  {completedGoals.slice(0, 5).map(goal => {
                    const meta = getGoalMeta(goal.goal_type);
                    return (
                      <div key={goal.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                        <CheckCircle className="w-4 h-4 text-correct" />
                        <span className="text-sm">
                          {meta.label}: {Number(goal.target_value)} {meta.unit}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto capitalize">{goal.period}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {expiredGoals.length > 0 && (
              <>
                <h3 className="text-lg font-semibold mt-8 text-muted-foreground">Expired</h3>
                <div className="space-y-2">
                  {expiredGoals.slice(0, 3).map(goal => {
                    const meta = getGoalMeta(goal.goal_type);
                    return (
                      <div key={goal.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 opacity-60">
                        <span className="text-sm">
                          {meta.label}: {Number(goal.current_value)}/{Number(goal.target_value)} {meta.unit}
                        </span>
                        <Button variant="ghost" size="icon" onClick={() => deleteGoal.mutate(goal.id)} aria-label="Delete expired goal">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
    </>
  );
};

export default Goals;

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Clock, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';

interface Reminder {
  id: string;
  reminder_time: string;
  enabled: boolean;
  days_of_week: number[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIMES = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return [`${hour}:00`, `${hour}:30`];
}).flat();

const Reminders: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const { data: reminders, isLoading } = useQuery({
    queryKey: ['practice-reminders', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('practice_reminders')
        .select('*')
        .eq('user_id', user!.id)
        .order('reminder_time');
      if (error) throw error;
      return data as Reminder[];
    },
    enabled: !!user,
  });

  const createReminder = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('practice_reminders').insert({
        user_id: user!.id,
        reminder_time: selectedTime,
        days_of_week: selectedDays,
        enabled: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-reminders'] });
      toast.success('Reminder created!');
    },
    onError: () => toast.error('Failed to create reminder'),
  });

  const toggleReminder = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('practice_reminders')
        .update({ enabled })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['practice-reminders'] }),
  });

  const deleteReminder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('practice_reminders').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-reminders'] });
      toast.success('Reminder deleted');
    },
  });

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Practice Reminders</h1>
          <p className="text-muted-foreground">Set reminders to maintain your typing streak</p>
        </div>

        {/* Create Reminder */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" /> New Reminder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Time</label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger aria-label="Reminder time">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {TIMES.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Days</label>
              <div className="flex gap-2 flex-wrap">
                {DAYS.map((day, i) => (
                  <Button
                    key={day}
                    variant={selectedDays.includes(i) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleDay(i)}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>

            <Button 
              onClick={() => createReminder.mutate()} 
              disabled={createReminder.isPending || selectedDays.length === 0}
              className="w-full"
            >
              Create Reminder
            </Button>
          </CardContent>
        </Card>

        {/* Existing Reminders */}
        <h3 className="text-lg font-semibold mb-4">Your Reminders</h3>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : reminders?.length === 0 ? (
          <Card className="glass-card text-center py-8">
            <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No reminders set yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {reminders?.map((reminder) => (
              <Card key={reminder.id} className="glass-card">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={reminder.enabled}
                      onCheckedChange={(enabled) => toggleReminder.mutate({ id: reminder.id, enabled })}
                    />
                    <div>
                      <p className="font-semibold">{reminder.reminder_time}</p>
                      <p className="text-sm text-muted-foreground">
                        {reminder.days_of_week.map(d => DAYS[d]).join(', ')}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteReminder.mutate(reminder.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <p className="text-sm text-muted-foreground text-center mt-8">
          Note: Browser notifications must be enabled for reminders to work.
        </p>
      </div>
    </Layout>
  );
};

export default Reminders;

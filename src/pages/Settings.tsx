import React from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon, Accessibility, Eye, Zap, Volume2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile-settings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('high_contrast, reduced_motion, screen_reader_mode, sound_enabled')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateSetting = useMutation({
    mutationFn: async (updates: Record<string, boolean>) => {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-settings'] });
      toast.success('Settings updated');
    },
    onError: () => toast.error('Failed to update settings'),
  });

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Settings</h1>
          <p className="text-muted-foreground">Customize your typing experience</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-6">
            {/* Accessibility Settings */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Accessibility className="w-5 h-5" /> Accessibility
                </CardTitle>
                <CardDescription>Make Typing Lab more accessible</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Eye className="w-4 h-4" /> High Contrast Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Increase contrast for better visibility
                    </p>
                  </div>
                  <Switch
                    checked={profile?.high_contrast || false}
                    onCheckedChange={(checked) => updateSetting.mutate({ high_contrast: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Reduced Motion
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Disable animations and transitions
                    </p>
                  </div>
                  <Switch
                    checked={profile?.reduced_motion || false}
                    onCheckedChange={(checked) => updateSetting.mutate({ reduced_motion: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <SettingsIcon className="w-4 h-4" /> Screen Reader Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Optimize for screen reader compatibility
                    </p>
                  </div>
                  <Switch
                    checked={profile?.screen_reader_mode || false}
                    onCheckedChange={(checked) => updateSetting.mutate({ screen_reader_mode: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sound Settings */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5" /> Sound
                </CardTitle>
                <CardDescription>Configure audio feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sound Effects</Label>
                    <p className="text-sm text-muted-foreground">
                      Play sounds for keystrokes and notifications
                    </p>
                  </div>
                  <Switch
                    checked={profile?.sound_enabled ?? true}
                    onCheckedChange={(checked) => updateSetting.mutate({ sound_enabled: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Account</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">Email: {user.email}</p>
                <p className="text-sm text-muted-foreground">
                  User ID: {user.id.slice(0, 8)}...
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Settings;

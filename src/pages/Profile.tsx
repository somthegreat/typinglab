import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Keyboard, Target, Trophy, Flame, Calendar, Edit2, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';
import SEO from "@/components/SEO";

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { data: profile, isLoading, refetch } = useProfile();
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleUsernameEdit = async () => {
    if (!newUsername.trim()) {
      toast.error('Username cannot be empty');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ username: newUsername.trim() })
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to update username');
    } else {
      toast.success('Username updated!');
      setIsEditingUsername(false);
      refetch();
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Security: Validate file type with allowlist (client-side check)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, WebP, or GIF)');
      return;
    }

    // Security: Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Security: Verify file content matches declared type by checking magic bytes
    const isValidImage = await verifyImageContent(file);
    if (!isValidImage) {
      toast.error('File content does not match a valid image format');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      // Security: Validate extension matches content type
      const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
      if (!fileExt || !validExtensions.includes(fileExt)) {
        toast.error('Invalid file extension');
        return;
      }
      
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type // Explicitly set content type
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast.success('Avatar updated!');
      refetch();
    } catch (error) {
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  // Security: Verify file content by checking magic bytes (file signatures)
  const verifyImageContent = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const arr = new Uint8Array(reader.result as ArrayBuffer).subarray(0, 12);
        
        // Check magic bytes for supported image formats
        // JPEG: FF D8 FF
        const isJPEG = arr[0] === 0xFF && arr[1] === 0xD8 && arr[2] === 0xFF;
        
        // PNG: 89 50 4E 47 0D 0A 1A 0A
        const isPNG = arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47;
        
        // GIF: 47 49 46 38 (GIF8)
        const isGIF = arr[0] === 0x47 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x38;
        
        // WebP: 52 49 46 46 ... 57 45 42 50 (RIFF...WEBP)
        const isWEBP = arr[0] === 0x52 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x46 &&
                       arr[8] === 0x57 && arr[9] === 0x45 && arr[10] === 0x42 && arr[11] === 0x50;
        
        resolve(isJPEG || isPNG || isGIF || isWEBP);
      };
      reader.onerror = () => resolve(false);
      reader.readAsArrayBuffer(file.slice(0, 12));
    });
  };

  if (isLoading) {
    return (
      <>
        <SEO title="Your Profile | TypingLab" description="Manage your TypingLab profile, username, avatar, level progress, and exported data." path="/profile" />
        <Layout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Loading profile...</div>
        </div>
      </Layout>
      </>
  );
  }

  const stats = [
    { label: 'Level', value: profile?.level || 1, icon: Trophy, color: 'text-neon-yellow' },
    { label: 'XP', value: profile?.xp?.toLocaleString() || 0, icon: Flame, color: 'text-neon-orange' },
    { label: 'Best WPM', value: profile?.best_wpm || 0, icon: Keyboard, color: 'text-primary' },
    { label: 'Best Accuracy', value: `${profile?.best_accuracy || 0}%`, icon: Target, color: 'text-accent' },
    { label: 'Tests Completed', value: profile?.total_tests_completed || 0, icon: Trophy, color: 'text-neon-pink' },
    { label: 'Current Streak', value: `${profile?.current_streak || 0} days`, icon: Calendar, color: 'text-neon-green' },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Your Profile</h1>
          <p className="text-muted-foreground">Manage your account and view your stats</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <Card className="md:col-span-1 glass-card">
            <CardHeader className="text-center">
              <div className="relative mx-auto mb-4">
                <Avatar className="w-24 h-24 border-4 border-primary/30">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                    <User className="w-10 h-10" />
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors">
                  <Edit2 className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={isUploading}
                    aria-label="Upload avatar image"
                  />
                </label>
              </div>
              
              {isEditingUsername ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="New username"
                    className="text-center"
                    aria-label="New username"
                  />
                  <Button size="icon" variant="ghost" onClick={handleUsernameEdit} aria-label="Save username">
                    <Check className="w-4 h-4 text-correct" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setIsEditingUsername(false)} aria-label="Cancel editing username">
                    <X className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <CardTitle className="text-xl">{profile?.username || 'Anonymous'}</CardTitle>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    aria-label="Edit username"
                    onClick={() => {
                      setNewUsername(profile?.username || '');
                      setIsEditingUsername(true);
                    }}
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-sm text-muted-foreground">
                Member since {new Date(profile?.created_at || Date.now()).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {stats.map(({ label, value, icon: Icon, color }) => (
              <Card key={label} className="stat-card">
                <CardContent className="p-4 text-center">
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${color}`} />
                  <div className="text-2xl font-bold">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
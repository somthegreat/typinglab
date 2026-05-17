import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, UserCheck, UserX, Search, MessageCircle, Swords } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';
import SEO from "@/components/SEO";

interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
  friend_profile?: {
    username: string;
    avatar_url: string;
    best_wpm: number;
    level: number;
    skill_tier: string;
  };
}

const Friends: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const queryClient = useQueryClient();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const { data: friendships = [], isLoading } = useQuery({
    queryKey: ['friendships', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .or(`user_id.eq.${user?.id},friend_id.eq.${user?.id}`);

      if (error) throw error;

      // Fetch profiles for each friendship
      const friendIds = data.map(f => f.user_id === user?.id ? f.friend_id : f.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, avatar_url, best_wpm, level, skill_tier')
        .in('user_id', friendIds);

      return data.map(f => ({
        ...f,
        friend_profile: profiles?.find(p => p.user_id === (f.user_id === user?.id ? f.friend_id : f.user_id))
      }));
    },
    enabled: !!user,
  });

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, username, avatar_url, best_wpm, level, skill_tier')
      .ilike('username', `%${searchQuery}%`)
      .neq('user_id', user.id)
      .limit(10);

    if (error) {
      toast.error('Search failed');
      return;
    }

    setSearchResults(data || []);
  };

  const sendFriendRequest = useMutation({
    mutationFn: async (friendId: string) => {
      const { error } = await supabase.from('friendships').insert({
        user_id: user.id,
        friend_id: friendId,
        status: 'pending',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Friend request sent!');
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
    },
    onError: () => {
      toast.error('Failed to send request');
    },
  });

  const acceptRequest = useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Friend request accepted!');
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
    },
  });

  const rejectRequest = useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Request removed');
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
    },
  });

  const friends = friendships.filter(f => f.status === 'accepted');
  const pendingReceived = friendships.filter(f => f.status === 'pending' && f.friend_id === user.id);
  const pendingSent = friendships.filter(f => f.status === 'pending' && f.user_id === user.id);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'diamond': return 'text-cyan-400';
      case 'gold': return 'text-yellow-400';
      case 'silver': return 'text-gray-400';
      default: return 'text-amber-600';
    }
  };

  return (
    <>
      <SEO title="Friends & Connections | TypingLab" description="Add friends, accept requests, and compare typing progress with your network on TypingLab." path="/friends" />
      <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold gradient-text">Friends</h1>
          </div>
          <p className="text-muted-foreground">Connect with other typists and compete together</p>
        </div>

        {/* Search Section */}
        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" /> Find Friends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username..."
                onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
                aria-label="Search users by username"
              />
              <Button onClick={searchUsers}>Search</Button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((profile) => (
                  <div key={profile.user_id} className="flex items-center justify-between p-3 bg-card rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={profile.avatar_url} />
                        <AvatarFallback>{profile.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{profile.username || 'Anonymous'}</div>
                        <div className="text-sm text-muted-foreground">
                          {profile.best_wpm} WPM • Level {profile.level || 1}
                          <span className={`ml-2 ${getTierColor(profile.skill_tier || 'bronze')}`}>
                            {profile.skill_tier || 'bronze'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => sendFriendRequest.mutate(profile.user_id)}
                      disabled={friendships.some(f => 
                        (f.user_id === profile.user_id || f.friend_id === profile.user_id)
                      )}
                    >
                      <UserPlus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="friends">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends">Friends ({friends.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingReceived.length})</TabsTrigger>
            <TabsTrigger value="sent">Sent ({pendingSent.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="mt-4">
            {friends.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="py-8 text-center text-muted-foreground">
                  No friends yet. Search for users to add them!
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {friends.map((f) => (
                  <Card key={f.id} className="glass-card">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={f.friend_profile?.avatar_url} />
                          <AvatarFallback>{f.friend_profile?.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{f.friend_profile?.username || 'Anonymous'}</div>
                          <div className="text-sm text-muted-foreground">
                            {f.friend_profile?.best_wpm || 0} WPM • Level {f.friend_profile?.level || 1}
                            <span className={`ml-2 ${getTierColor(f.friend_profile?.skill_tier || 'bronze')}`}>
                              {f.friend_profile?.skill_tier || 'bronze'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Swords className="w-4 h-4 mr-1" /> Race
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            {pendingReceived.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="py-8 text-center text-muted-foreground">
                  No pending friend requests
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {pendingReceived.map((f) => (
                  <Card key={f.id} className="glass-card">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={f.friend_profile?.avatar_url} />
                          <AvatarFallback>{f.friend_profile?.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{f.friend_profile?.username || 'Anonymous'}</div>
                          <div className="text-sm text-muted-foreground">wants to be your friend</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => acceptRequest.mutate(f.id)}>
                          <UserCheck className="w-4 h-4 mr-1" /> Accept
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => rejectRequest.mutate(f.id)}>
                          <UserX className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent" className="mt-4">
            {pendingSent.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="py-8 text-center text-muted-foreground">
                  No sent requests
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {pendingSent.map((f) => (
                  <Card key={f.id} className="glass-card">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={f.friend_profile?.avatar_url} />
                          <AvatarFallback>{f.friend_profile?.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{f.friend_profile?.username || 'Anonymous'}</div>
                          <div className="text-sm text-muted-foreground">Pending...</div>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => rejectRequest.mutate(f.id)}>
                        Cancel
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
    </>
  );
};

export default Friends;

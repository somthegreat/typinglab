import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import SEO from "@/components/SEO";

interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  message: string;
  created_at: string;
}

const Chat: React.FC = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['chat-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      return data as ChatMessage[];
    },
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('user_id', user?.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  // Subscribe to new messages
  useEffect(() => {
    const channel = supabase
      .channel('chat-room')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          queryClient.setQueryData(['chat-messages'], (old: ChatMessage[] = []) => {
            return [...old, payload.new as ChatMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Track presence
  useEffect(() => {
    const channel = supabase.channel('online-users', {
      config: { presence: { key: user.id } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setOnlineCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: user.id, username: profile?.username });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id, profile?.username]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useMutation({
    mutationFn: async () => {
      if (!message.trim()) return;

      const { error } = await supabase.from('chat_messages').insert({
        user_id: user.id,
        username: profile?.username || 'Anonymous',
        message: message.trim(),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      setMessage('');
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage.mutate();
    }
  };

  return (
    <>
      <SEO title="Global Chat | TypingLab" description="Chat with typists from around the world in the TypingLab global chat room." path="/chat" />
      <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl h-[calc(100vh-200px)]">
        <Card className="glass-card h-full flex flex-col">
          <CardHeader className="flex-row items-center justify-between border-b">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Global Chat
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{onlineCount} online</span>
            </div>
          </CardHeader>

          <ScrollArea ref={scrollRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg) => {
                const isOwnMessage = msg.user_id === user.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {msg.username?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[70%] ${isOwnMessage ? 'text-right' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-medium ${isOwnMessage ? 'order-2' : ''}`}>
                          {msg.username || 'Anonymous'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(msg.created_at), 'HH:mm')}
                        </span>
                      </div>
                      <div
                        className={`rounded-lg px-3 py-2 ${
                          isOwnMessage
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <CardContent className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                maxLength={500}
                className="flex-1"
                aria-label="Chat message"
              />
              <Button type="submit" disabled={!message.trim() || sendMessage.isPending}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
    </>
  );
};

export default Chat;

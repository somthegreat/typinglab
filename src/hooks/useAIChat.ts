import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type Message = { role: 'user' | 'assistant'; content: string };

type UserContext = {
  username?: string;
  bestWpm?: number;
  bestAccuracy?: number;
  totalTests?: number;
  totalWords?: number;
  level?: number;
  xp?: number;
  streak?: number;
  skillTier?: string;
  weakKeys?: { key: string; errorRate: number }[];
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;

async function streamChat({
  messages,
  userContext,
  onDelta,
  onDone,
  onError,
}: {
  messages: Message[];
  userContext: UserContext | null;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const resp = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages, userContext }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    onError(data.error || 'Failed to connect to AI assistant.');
    return;
  }

  if (!resp.body) {
    onError('No response stream available.');
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = '';
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.startsWith(':') || line.trim() === '') continue;
      if (!line.startsWith('data: ')) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === '[DONE]') {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + '\n' + textBuffer;
        break;
      }
    }
  }

  // Final flush
  if (textBuffer.trim()) {
    for (let raw of textBuffer.split('\n')) {
      if (!raw) continue;
      if (raw.endsWith('\r')) raw = raw.slice(0, -1);
      if (raw.startsWith(':') || raw.trim() === '') continue;
      if (!raw.startsWith('data: ')) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === '[DONE]') continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        /* ignore */
      }
    }
  }

  onDone();
}

export function useAIChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userContextRef = useRef<UserContext | null>(null);

  // Fetch user stats once when user is available
  useEffect(() => {
    if (!user) {
      userContextRef.current = null;
      return;
    }

    const fetchContext = async () => {
      try {
        const [profileRes, weakKeysRes] = await Promise.all([
          supabase
            .from('profiles')
            .select('username, best_wpm, best_accuracy, total_tests_completed, total_words_typed, level, xp, current_streak, skill_tier')
            .eq('user_id', user.id)
            .single(),
          supabase
            .from('weak_keys')
            .select('key_char, error_count, total_count')
            .eq('user_id', user.id)
            .order('error_count', { ascending: false })
            .limit(5),
        ]);

        const p = profileRes.data;
        const weakKeys = (weakKeysRes.data || [])
          .filter((k) => (k.total_count ?? 0) > 0)
          .map((k) => ({
            key: k.key_char,
            errorRate: Math.round(((k.error_count ?? 0) / (k.total_count ?? 1)) * 100),
          }));

        userContextRef.current = {
          username: p?.username ?? undefined,
          bestWpm: p?.best_wpm ?? undefined,
          bestAccuracy: p?.best_accuracy != null ? Number(p.best_accuracy) : undefined,
          totalTests: p?.total_tests_completed ?? undefined,
          totalWords: p?.total_words_typed ?? undefined,
          level: p?.level ?? undefined,
          xp: p?.xp ?? undefined,
          streak: p?.current_streak ?? undefined,
          skillTier: p?.skill_tier ?? undefined,
          weakKeys: weakKeys.length > 0 ? weakKeys : undefined,
        };
      } catch (e) {
        console.error('Failed to fetch user context for AI:', e);
      }
    };

    fetchContext();
  }, [user]);

  const sendMessage = useCallback(
    async (input: string) => {
      const userMsg: Message = { role: 'user', content: input };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      setError(null);

      let assistantSoFar = '';
      const upsertAssistant = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant') {
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
            );
          }
          return [...prev, { role: 'assistant', content: assistantSoFar }];
        });
      };

      try {
        await streamChat({
          messages: [...messages, userMsg],
          userContext: userContextRef.current,
          onDelta: (chunk) => upsertAssistant(chunk),
          onDone: () => setIsLoading(false),
          onError: (err) => {
            setError(err);
            setIsLoading(false);
          },
        });
      } catch (e) {
        console.error('AI chat error:', e);
        setError('Something went wrong. Please try again.');
        setIsLoading(false);
      }
    },
    [messages]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, clearChat };
}

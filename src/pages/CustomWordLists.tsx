import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Play, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Link, Navigate } from 'react-router-dom';
import CustomTypingTest from '@/components/typing/CustomTypingTest';

interface WordList {
  id: string;
  name: string;
  words: string[];
  created_at: string;
}

const CustomWordLists: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newListName, setNewListName] = useState('');
  const [newWords, setNewWords] = useState('');
  const [practiceList, setPracticeList] = useState<WordList | null>(null);
  const [practiceCompleted, setPracticeCompleted] = useState(false);

  const { data: wordLists, isLoading } = useQuery({
    queryKey: ['custom-word-lists', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_word_lists')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as WordList[];
    },
    enabled: !!user,
  });

  const createList = useMutation({
    mutationFn: async () => {
      const words = newWords.split(/[\n,]+/).map(w => w.trim()).filter(Boolean);
      if (words.length < 5) throw new Error('Add at least 5 words');
      
      const { error } = await supabase.from('custom_word_lists').insert({
        user_id: user!.id,
        name: newListName.trim() || 'Untitled List',
        words,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-word-lists'] });
      setNewListName('');
      setNewWords('');
      toast.success('Word list created!');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteList = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('custom_word_lists').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-word-lists'] });
      toast.success('List deleted');
    },
  });

  if (!user) return <Navigate to="/auth" replace />;

  if (practiceList && !practiceCompleted) {
    const practiceText = practiceList.words.sort(() => Math.random() - 0.5).slice(0, 20).join(' ');
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => setPracticeList(null)} className="mb-4">
            ← Back to Lists
          </Button>
          <h2 className="text-2xl font-bold text-center mb-6">Practicing: {practiceList.name}</h2>
          <CustomTypingTest
            text={practiceText}
            onComplete={(stats) => {
              toast.success(`Completed! WPM: ${stats.wpm}, Accuracy: ${stats.accuracy}%`);
              setPracticeCompleted(true);
            }}
          />
        </div>
      </Layout>
    );
  }

  if (practiceCompleted) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Practice Complete!</h2>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => { setPracticeCompleted(false); }}>Practice Again</Button>
            <Button variant="outline" onClick={() => { setPracticeList(null); setPracticeCompleted(false); }}>
              Back to Lists
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Custom Word Lists</h1>
          <p className="text-muted-foreground">Create and practice with your own word collections</p>
        </div>

        {/* Create New List */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" /> Create New List
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="List name (e.g., Programming Terms)"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              aria-label="List name"
            />
            <Textarea
              placeholder="Enter words separated by commas or new lines..."
              value={newWords}
              onChange={(e) => setNewWords(e.target.value)}
              rows={5}
              aria-label="Words for the list"
            />
            <Button onClick={() => createList.mutate()} disabled={createList.isPending}>
              {createList.isPending ? 'Creating...' : 'Create List'}
            </Button>
          </CardContent>
        </Card>

        {/* Word Lists */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading lists...</div>
        ) : wordLists?.length === 0 ? (
          <Card className="glass-card text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No custom word lists yet. Create one above!</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {wordLists?.map((list) => (
              <Card key={list.id} className="glass-card">
                <CardHeader>
                  <CardTitle>{list.name}</CardTitle>
                  <CardDescription>{list.words.length} words</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 truncate">
                    {list.words.slice(0, 10).join(', ')}...
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setPracticeList(list)}>
                      <Play className="w-4 h-4 mr-1" /> Practice
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteList.mutate(list.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CustomWordLists;

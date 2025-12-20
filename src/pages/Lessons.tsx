import React from 'react';
import Layout from '@/components/layout/Layout';
import { BookOpen, Lock } from 'lucide-react';

const Lessons: React.FC = () => {
  const lessons = [
    { title: 'Home Row Basics', category: 'home_row', difficulty: 1, unlocked: true },
    { title: 'Home Row Practice', category: 'home_row', difficulty: 1, unlocked: true },
    { title: 'Home Row Advanced', category: 'home_row', difficulty: 2, unlocked: false },
    { title: 'Top Row Introduction', category: 'top_row', difficulty: 2, unlocked: false },
    { title: 'Top Row Words', category: 'top_row', difficulty: 2, unlocked: false },
    { title: 'Bottom Row Basics', category: 'bottom_row', difficulty: 2, unlocked: false },
    { title: 'Full Keyboard Easy', category: 'full_keyboard', difficulty: 3, unlocked: false },
    { title: 'Full Keyboard Advanced', category: 'full_keyboard', difficulty: 5, unlocked: false },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Typing Lessons</h1>
        <p className="text-muted-foreground mb-8">Learn to type with structured lessons</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons.map((lesson, i) => (
            <div key={i} className={`stat-card ${!lesson.unlocked && 'opacity-60'}`}>
              <div className="flex items-start justify-between mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
                {!lesson.unlocked && <Lock className="w-5 h-5 text-muted-foreground" />}
              </div>
              <h3 className="font-semibold mb-1">{lesson.title}</h3>
              <p className="text-sm text-muted-foreground capitalize">{lesson.category.replace('_', ' ')}</p>
              <div className="flex gap-1 mt-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className={`w-2 h-2 rounded-full ${j < lesson.difficulty ? 'bg-primary' : 'bg-muted'}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Lessons;

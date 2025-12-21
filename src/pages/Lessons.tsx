import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { BookOpen, Lock, CheckCircle, Play, Trophy } from 'lucide-react';
import { useLessons, useLessonProgress, useUpdateLessonProgress, Lesson } from '@/hooks/useLessons';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import LessonPractice from '@/components/lessons/LessonPractice';

const Lessons: React.FC = () => {
  const { user } = useAuth();
  const { data: lessons, isLoading: lessonsLoading } = useLessons();
  const { data: progress, isLoading: progressLoading } = useLessonProgress();
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Sign in to access lessons</h2>
          <p className="text-muted-foreground mb-6">Create an account to unlock structured typing lessons and track your progress.</p>
          <Link to="/auth">
            <Button size="lg" className="neon-glow">Sign In</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const isLoading = lessonsLoading || progressLoading;

  const getProgressForLesson = (lessonId: string) => {
    return progress?.find(p => p.lesson_id === lessonId);
  };

  const isLessonUnlocked = (lesson: Lesson, index: number) => {
    if (index === 0) return true;
    const prog = getProgressForLesson(lesson.id);
    if (prog?.unlocked) return true;
    
    // Check if previous lesson is completed
    const prevLesson = lessons?.[index - 1];
    if (prevLesson) {
      const prevProg = getProgressForLesson(prevLesson.id);
      return prevProg?.completed || false;
    }
    return false;
  };

  if (activeLesson) {
    return (
      <LessonPractice 
        lesson={activeLesson} 
        onBack={() => setActiveLesson(null)} 
      />
    );
  }

  // Group lessons by category
  const categories = lessons?.reduce((acc, lesson) => {
    if (!acc[lesson.category]) {
      acc[lesson.category] = [];
    }
    acc[lesson.category].push(lesson);
    return acc;
  }, {} as Record<string, Lesson[]>) || {};

  const categoryLabels: Record<string, string> = {
    home_row: '🏠 Home Row',
    top_row: '⬆️ Top Row',
    bottom_row: '⬇️ Bottom Row',
    full_keyboard: '⌨️ Full Keyboard',
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Typing Lessons</h1>
        <p className="text-muted-foreground mb-8">Learn to type with structured lessons. Complete lessons to unlock new ones!</p>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading lessons...</div>
        ) : (
          <div className="space-y-8">
            {Object.entries(categories).map(([category, categoryLessons]) => (
              <div key={category}>
                <h2 className="text-xl font-semibold mb-4">{categoryLabels[category] || category}</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryLessons.map((lesson) => {
                    const lessonIndex = lessons?.findIndex(l => l.id === lesson.id) || 0;
                    const unlocked = isLessonUnlocked(lesson, lessonIndex);
                    const prog = getProgressForLesson(lesson.id);
                    const completed = prog?.completed;

                    return (
                      <div 
                        key={lesson.id} 
                        className={`stat-card relative overflow-hidden ${!unlocked && 'opacity-60 cursor-not-allowed'}`}
                      >
                        {completed && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="w-5 h-5 text-correct" />
                          </div>
                        )}
                        
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${completed ? 'bg-correct/20' : 'bg-primary/20'}`}>
                            {unlocked ? (
                              <BookOpen className={`w-6 h-6 ${completed ? 'text-correct' : 'text-primary'}`} />
                            ) : (
                              <Lock className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                        
                        <h3 className="font-semibold mb-1">{lesson.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{lesson.description}</p>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, j) => (
                              <div 
                                key={j} 
                                className={`w-2 h-2 rounded-full ${j < (lesson.difficulty || 1) ? 'bg-primary' : 'bg-muted'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Difficulty {lesson.difficulty || 1}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-4">
                          {lesson.keys_focus.slice(0, 6).map(key => (
                            <span 
                              key={key} 
                              className="px-2 py-1 text-xs bg-muted rounded font-mono uppercase"
                            >
                              {key}
                            </span>
                          ))}
                          {lesson.keys_focus.length > 6 && (
                            <span className="px-2 py-1 text-xs text-muted-foreground">
                              +{lesson.keys_focus.length - 6} more
                            </span>
                          )}
                        </div>

                        {prog && (prog.best_wpm || 0) > 0 && (
                          <div className="flex gap-4 text-sm mb-4">
                            <div>
                              <span className="text-muted-foreground">Best: </span>
                              <span className="font-semibold text-primary">{prog.best_wpm} WPM</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Acc: </span>
                              <span className="font-semibold text-accent">{Number(prog.best_accuracy).toFixed(0)}%</span>
                            </div>
                          </div>
                        )}

                        <Button 
                          size="sm" 
                          className="w-full gap-2"
                          disabled={!unlocked}
                          onClick={() => unlocked && setActiveLesson(lesson)}
                        >
                          {completed ? (
                            <>
                              <Trophy className="w-4 h-4" />
                              Practice Again
                            </>
                          ) : unlocked ? (
                            <>
                              <Play className="w-4 h-4" />
                              Start Lesson
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4" />
                              Locked
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Lessons;

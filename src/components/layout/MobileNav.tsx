import React, { forwardRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Keyboard, BookOpen, BarChart3, Users, Target, MoreHorizontal, X, Swords, Trophy, Gamepad2, Medal, Award, MessageCircle, ListChecks, ScrollText, Focus, Crosshair, Bell, Settings as SettingsIcon, Brain, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const MobileNav = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>((props, ref) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const mainLinks = [
    { to: '/learn', label: 'Learn', icon: Brain },
    { to: '/test', label: 'Type', icon: Keyboard },
    { to: '/race', label: 'Race', icon: Swords },
    { to: '/stats', label: 'Stats', icon: BarChart3 },
  ];

  const moreCategories = [
    {
      title: 'Adaptive',
      links: [
        { to: '/learn/session', label: 'Adaptive Drill', icon: Zap },
        { to: '/learn/coach', label: 'AI Coach', icon: Sparkles },
        { to: '/learn/analytics', label: 'Analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'Practice',
      links: [
        { to: '/lessons', label: 'Lessons', icon: BookOpen },
        { to: '/practice', label: 'Focused Practice', icon: Crosshair },
        { to: '/focus', label: 'Focus Mode', icon: Focus },
        { to: '/challenge', label: 'Daily Challenge', icon: Target },
        { to: '/word-lists', label: 'Custom Word Lists', icon: ListChecks },
      ],
    },
    {
      title: 'Compete',
      links: [
        { to: '/tournaments', label: 'Tournaments', icon: Trophy },
        { to: '/leaderboard', label: 'Leaderboard', icon: Medal },
        { to: '/games', label: 'Games', icon: Gamepad2 },
        { to: '/friends', label: 'Friends', icon: Users },
        { to: '/chat', label: 'Chat', icon: MessageCircle },
      ],
    },
    {
      title: 'Progress',
      links: [
        { to: '/goals', label: 'Goals', icon: Target },
        { to: '/achievements', label: 'Achievements', icon: Award },
        { to: '/certificates', label: 'Certificates', icon: ScrollText },
      ],
    },
    {
      title: 'Account',
      links: [
        { to: '/reminders', label: 'Reminders', icon: Bell },
        { to: '/settings', label: 'Settings', icon: SettingsIcon },
      ],
    },
  ];

  return (
    <nav ref={ref} className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-sm border-t border-border" {...props}>
      <div className="flex items-center justify-around h-16 px-2">
        {mainLinks.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all",
              location.pathname === to
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        ))}

        {/* More button with Sheet */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-all">
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-xs font-medium">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl bg-background z-[60]">
            <div className="overflow-y-auto h-full pb-8">
              <h2 className="text-lg font-semibold mb-4">All Features</h2>
              {moreCategories.map((category) => (
                <div key={category.title} className="mb-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                    {category.title}
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {category.links.map(({ to, label, icon: Icon }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all text-center",
                          location.pathname === to
                            ? "bg-primary/10 text-primary"
                            : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-medium leading-tight">{label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
});

MobileNav.displayName = 'MobileNav';

export default MobileNav;

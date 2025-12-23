import React, { forwardRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Keyboard, BookOpen, BarChart3, Users, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

const MobileNav = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>((props, ref) => {
  const location = useLocation();

  const navLinks = [
    { to: '/test', label: 'Type', icon: Keyboard },
    { to: '/race', label: 'Race', icon: Users },
    { to: '/practice', label: 'Practice', icon: Target },
    { to: '/lessons', label: 'Learn', icon: BookOpen },
    { to: '/stats', label: 'Stats', icon: BarChart3 },
  ];

  return (
    <nav ref={ref} className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-card border-t border-border/50" {...props}>
      <div className="flex items-center justify-around h-16 px-2">
        {navLinks.map(({ to, label, icon: Icon }) => (
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
            <Icon className={cn("w-5 h-5", location.pathname === to && "neon-glow")} />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
});

MobileNav.displayName = 'MobileNav';

export default MobileNav;

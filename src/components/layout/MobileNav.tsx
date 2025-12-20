import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Keyboard, BookOpen, BarChart3, Trophy, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const MobileNav: React.FC = () => {
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/test', label: 'Type', icon: Keyboard },
    { to: '/lessons', label: 'Learn', icon: BookOpen },
    { to: '/stats', label: 'Stats', icon: BarChart3 },
    { to: '/achievements', label: 'Awards', icon: Trophy },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-card border-t border-border/50">
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
};

export default MobileNav;

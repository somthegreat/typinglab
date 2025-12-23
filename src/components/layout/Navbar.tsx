import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Keyboard, User, BarChart3, Trophy, BookOpen, LogOut, Crown, Users, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import ThemeSelector from '@/components/ThemeSelector';
import SoundSettings from '@/components/SoundSettings';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const navLinks = [
    { to: '/test', label: 'Type', icon: Keyboard },
    { to: '/race', label: 'Race', icon: Users },
    { to: '/practice', label: 'Practice', icon: Target },
    { to: '/lessons', label: 'Learn', icon: BookOpen },
    { to: '/stats', label: 'Stats', icon: BarChart3 },
    { to: '/leaderboard', label: 'Ranks', icon: Crown },
    { to: '/achievements', label: 'Awards', icon: Trophy },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center neon-glow group-hover:scale-105 transition-transform">
              <Keyboard className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">TypingMaster</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-1.5 transition-all",
                    location.pathname === to && "bg-primary/10 text-primary"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <SoundSettings />
            <ThemeSelector />

            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="w-5 h-5" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={signOut}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="default" className="neon-glow">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

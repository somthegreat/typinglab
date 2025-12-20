import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Keyboard, User, BarChart3, Trophy, BookOpen, Moon, Sun, Volume2, VolumeX, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSound } from '@/contexts/SoundContext';
import { cn } from '@/lib/utils';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { soundEnabled, toggleSound } = useSound();

  const navLinks = [
    { to: '/test', label: 'Type', icon: Keyboard },
    { to: '/lessons', label: 'Learn', icon: BookOpen },
    { to: '/stats', label: 'Stats', icon: BarChart3 },
    { to: '/achievements', label: 'Achievements', icon: Trophy },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center neon-glow group-hover:scale-105 transition-transform">
              <Keyboard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">TypingMaster</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}>
                <Button
                  variant="ghost"
                  className={cn(
                    "gap-2 transition-all",
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
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSound}
              className="text-muted-foreground hover:text-foreground"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

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

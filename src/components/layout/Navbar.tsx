import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Keyboard, User, BarChart3, BookOpen, LogOut, Calendar, Users, Target, ChevronDown, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import ThemeSelector from '@/components/ThemeSelector';
import SoundSettings from '@/components/SoundSettings';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const mainNavLinks = [
    { to: '/test', label: 'Practice' },
    { to: '/lessons', label: 'Lessons' },
    { to: '/challenge', label: 'Daily' },
    { to: '/race', label: 'Race' },
  ];

  const moreLinks = [
    { to: '/games', label: 'Games' },
    { to: '/tournaments', label: 'Tournaments' },
    { to: '/practice', label: 'Focused Practice' },
    { to: '/focus', label: 'Focus Mode' },
    { to: '/goals', label: 'Goals' },
    { to: '/stats', label: 'Statistics' },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/achievements', label: 'Achievements' },
    { to: '/friends', label: 'Friends' },
    { to: '/chat', label: 'Chat' },
    { to: '/word-lists', label: 'Word Lists' },
    { to: '/certificates', label: 'Certificates' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold hidden sm:block">TypeMaster</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {mainNavLinks.map(({ to, label }) => (
              <Link key={to} to={to}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-9 px-4 font-medium",
                    location.pathname === to 
                      ? "bg-secondary text-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {label}
                </Button>
              </Link>
            ))}

            {/* More dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 px-4 font-medium text-muted-foreground hover:text-foreground gap-1">
                  More
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                {moreLinks.map(({ to, label }) => (
                  <DropdownMenuItem key={to} asChild>
                    <Link to={to} className="w-full cursor-pointer">{label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <SoundSettings />
            <ThemeSelector />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="w-full cursor-pointer">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/stats" className="w-full cursor-pointer">My Statistics</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/achievements" className="w-full cursor-pointer">Achievements</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/reminders" className="w-full cursor-pointer">Reminders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/goals" className="w-full cursor-pointer">Goals</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="w-full cursor-pointer">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="h-9 px-4">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

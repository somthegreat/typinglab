import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Keyboard, User, BarChart3, BookOpen, LogOut, Calendar, Users, Target, Settings } from 'lucide-react';
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
    { to: '/test', label: 'Type', icon: Keyboard },
    { to: '/challenge', label: 'Daily', icon: Calendar },
    { to: '/race', label: 'Race', icon: Users },
    { to: '/lessons', label: 'Learn', icon: BookOpen },
  ];

  const moreLinks = [
    { to: '/games', label: 'Games' },
    { to: '/tournaments', label: 'Tournaments' },
    { to: '/practice', label: 'Practice', icon: Target },
    { to: '/stats', label: 'Stats', icon: BarChart3 },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/achievements', label: 'Achievements' },
    { to: '/friends', label: 'Friends' },
    { to: '/chat', label: 'Chat' },
    { to: '/word-lists', label: 'Word Lists' },
    { to: '/certificates', label: 'Certificates' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-105 transition-transform">
              <Keyboard className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold gradient-text hidden sm:block">TypeMaster</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {mainNavLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-1.5 h-9 px-3",
                    location.pathname === to && "bg-primary/10 text-primary"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Button>
              </Link>
            ))}

            {/* More dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 h-9 px-3">
                  <Settings className="w-4 h-4" />
                  More
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                {moreLinks.map(({ to, label }) => (
                  <DropdownMenuItem key={to} asChild>
                    <Link to={to} className="w-full">{label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-1">
            <SoundSettings />
            <ThemeSelector />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <User className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="w-full">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/stats" className="w-full">My Stats</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/achievements" className="w-full">Achievements</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/reminders" className="w-full">Reminders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="w-full">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="h-9">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
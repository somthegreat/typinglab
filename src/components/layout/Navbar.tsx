import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Keyboard, User, LogOut, ChevronDown, Target, Swords, TrendingUp, Gamepad2, Trophy, Focus, Crosshair, BarChart3, Award, Medal, Users, MessageCircle, ListChecks, ScrollText, Settings, Bell } from 'lucide-react';
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
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const practiceLinks = [
    { to: '/test', label: 'Typing Test', icon: Keyboard },
    { to: '/practice', label: 'Focused Practice', icon: Crosshair },
    { to: '/focus', label: 'Focus Mode', icon: Focus },
    { to: '/lessons', label: 'Lessons', icon: ScrollText },
    { to: '/challenge', label: 'Daily Challenge', icon: Target },
    { to: '/word-lists', label: 'Custom Word Lists', icon: ListChecks },
  ];

  const competeLinks = [
    { to: '/race', label: 'Race', icon: Swords },
    { to: '/tournaments', label: 'Tournaments', icon: Trophy },
    { to: '/leaderboard', label: 'Leaderboard', icon: Medal },
    { to: '/games', label: 'Games', icon: Gamepad2 },
    { to: '/friends', label: 'Friends', icon: Users },
    { to: '/chat', label: 'Chat', icon: MessageCircle },
  ];

  const progressLinks = [
    { to: '/stats', label: 'Statistics', icon: BarChart3 },
    { to: '/goals', label: 'Goals', icon: Target },
    { to: '/achievements', label: 'Achievements', icon: Award },
    { to: '/certificates', label: 'Certificates', icon: ScrollText },
  ];

  const isInCategory = (links: typeof practiceLinks) =>
    links.some(l => location.pathname === l.to);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold hidden sm:block">Typing Lab</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {/* Practice dropdown */}
            <NavDropdown
              label="Practice"
              links={practiceLinks}
              isActive={isInCategory(practiceLinks)}
            />

            {/* Compete dropdown */}
            <NavDropdown
              label="Compete"
              links={competeLinks}
              isActive={isInCategory(competeLinks)}
            />

            {/* Progress dropdown */}
            <NavDropdown
              label="Progress"
              links={progressLinks}
              isActive={isInCategory(progressLinks)}
            />
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <SoundSettings />
            <ThemeSelector />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Open user menu">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-popover z-50">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="w-full cursor-pointer">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/reminders" className="w-full cursor-pointer">Reminders</Link>
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

interface NavDropdownProps {
  label: string;
  links: { to: string; label: string; icon: React.ElementType }[];
  isActive: boolean;
}

const NavDropdown: React.FC<NavDropdownProps> = ({ label, links, isActive }) => {
  const location = useLocation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-9 px-4 font-medium gap-1",
            isActive
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {label}
          <ChevronDown className="w-3.5 h-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-52 bg-popover z-50">
        {links.map(({ to, label, icon: Icon }) => (
          <DropdownMenuItem key={to} asChild>
            <Link
              to={to}
              className={cn(
                "w-full cursor-pointer flex items-center gap-2",
                location.pathname === to && "text-primary font-medium"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Navbar;

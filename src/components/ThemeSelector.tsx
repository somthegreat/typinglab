import React from 'react';
import { useTheme, ColorTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Palette, Sun, Moon, Leaf, Waves, Sunset, Sparkles } from 'lucide-react';

const themeOptions: { value: ColorTheme; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" />, color: 'text-yellow-500' },
  { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" />, color: 'text-purple-500' },
  { value: 'matrix', label: 'Matrix', icon: <Leaf className="w-4 h-4" />, color: 'text-green-500' },
  { value: 'ocean', label: 'Ocean', icon: <Waves className="w-4 h-4" />, color: 'text-blue-500' },
  { value: 'sunset', label: 'Sunset', icon: <Sunset className="w-4 h-4" />, color: 'text-orange-500' },
  { value: 'retro', label: 'Retro', icon: <Sparkles className="w-4 h-4" />, color: 'text-pink-500' },
];

const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const currentTheme = themeOptions.find(t => t.value === theme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Palette className="h-5 w-5" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {themeOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={`flex items-center gap-2 ${theme === option.value ? 'bg-accent' : ''}`}
          >
            <span className={option.color}>{option.icon}</span>
            <span>{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;

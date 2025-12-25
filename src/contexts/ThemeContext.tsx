import React, { createContext, useContext, useEffect, useState } from 'react';

export type ColorTheme = 'light' | 'dark' | 'matrix' | 'ocean' | 'sunset' | 'retro' | 'nord' | 'dracula' | 'monokai';

interface ThemeContextType {
  theme: ColorTheme;
  toggleTheme: () => void;
  setTheme: (theme: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themeClasses: ColorTheme[] = ['light', 'dark', 'matrix', 'ocean', 'sunset', 'retro', 'nord', 'dracula', 'monokai'];

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ColorTheme>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('typing-theme') as ColorTheme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setThemeState(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (newTheme: ColorTheme) => {
    // Remove all theme classes
    themeClasses.forEach(t => document.documentElement.classList.remove(t));
    // Add the new theme class
    document.documentElement.classList.add(newTheme);
  };

  const setTheme = (newTheme: ColorTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('typing-theme', newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const currentIndex = themeClasses.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeClasses.length;
    setTheme(themeClasses[nextIndex]);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

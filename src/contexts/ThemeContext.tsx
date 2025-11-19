import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ColorScheme = 'blue' | 'emerald' | 'rose' | 'violet' | 'orange' | 'default';

interface ThemeContextType {
  theme: Theme;
  colorScheme: ColorScheme;
  setTheme: (theme: Theme) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const COLOR_SCHEME_KEY = 'color-scheme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'system';
    }
    return 'system';
  });
  
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(COLOR_SCHEME_KEY) as ColorScheme) || 'default';
    }
    return 'default';
  });
  
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Update the resolved theme based on system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    if (theme === 'system') {
      setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
    } else {
      setResolvedTheme(theme);
    }

    // Apply theme class to document element
    const root = window.document.documentElement;
    
    // Remove all theme and color scheme classes
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    
    // Remove all color scheme classes
    const colorSchemes: ColorScheme[] = ['blue', 'emerald', 'rose', 'violet', 'orange', 'default'];
    root.classList.remove(...colorSchemes.map(scheme => `theme-${scheme}`));
    
    // Apply current color scheme if not default
    if (colorScheme !== 'default') {
      root.classList.add(`theme-${colorScheme}`);
    }

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, resolvedTheme, colorScheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
  };

  const setColorScheme = (newScheme: ColorScheme) => {
    setColorSchemeState(newScheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(COLOR_SCHEME_KEY, newScheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      colorScheme,
      setTheme, 
      setColorScheme,
      resolvedTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

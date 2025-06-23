import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes, Theme } from '@/constants/themes';

interface ThemeContextType {
  theme: Theme;
  setTheme: (themeKey: string) => void;
  currentThemeKey: string;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: themes.pinkLove,
  setTheme: () => {},
  currentThemeKey: 'pinkLove',
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentThemeKey, setCurrentThemeKey] = useState('pinkLove');
  const [theme, setCurrentTheme] = useState(themes.pinkLove);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('selectedTheme');
      if (savedTheme && themes[savedTheme]) {
        setCurrentThemeKey(savedTheme);
        setCurrentTheme(themes[savedTheme]);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const setTheme = async (themeKey: string) => {
    try {
      if (themes[themeKey]) {
        setCurrentThemeKey(themeKey);
        setCurrentTheme(themes[themeKey]);
        await AsyncStorage.setItem('selectedTheme', themeKey);
      }
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, currentThemeKey }}>
      {children}
    </ThemeContext.Provider>
  );
};
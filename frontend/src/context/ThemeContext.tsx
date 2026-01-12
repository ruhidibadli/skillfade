import React, { createContext, useContext, useEffect } from 'react';

interface ThemeContextType {
  theme: 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always dark mode
  const theme = 'dark' as const;

  useEffect(() => {
    // Always apply dark mode
    document.documentElement.classList.add('dark');
    // Remove any saved theme preference to ensure dark mode
    localStorage.removeItem('theme');
  }, []);

  const toggleTheme = () => {
    // No-op - dark mode only
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
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

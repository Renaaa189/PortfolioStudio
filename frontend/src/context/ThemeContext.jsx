import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

const readInitial = () => document.documentElement.dataset.theme || 'dark';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readInitial);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#08040f' : '#fbf8ff');
    try {
      localStorage.setItem('ps_theme', theme);
    } catch {
      /* sin almacenamiento */
    }
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

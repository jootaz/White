import { createContext, useContext, useState, type ReactNode, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { theme as baseTheme } from '../theme';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function CustomThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  const theme = useMemo(() =>
    createTheme({
      ...baseTheme,
      palette: {
        ...baseTheme.palette,
        mode: darkMode ? 'dark' : 'light',
        background: {
          default: darkMode ? '#101624' : '#f4f7fb',
          paper: darkMode ? '#181f2a' : '#fff',
        },
        primary: {
          main: '#4f8cff',
        },
        secondary: {
          main: darkMode ? '#598effff' : '#598effff',
        },
        text: {
          primary: darkMode ? '#fff' : '#1a1a1a',
          secondary: darkMode ? '#b0b8c1' : '#4f4f4f',
        },
        divider: darkMode ? 'rgba(255,255,255,0.08)' : '#e3e6ed',
      },
      typography: {
        fontFamily: 'Lato, Arial, sans-serif',
      },
      components: {
        MuiPaper: {
          styleOverrides: {
            root: {
              background: darkMode ? '#181f2a' : '#fff',
              boxShadow: darkMode
                ? '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
                : '0 2px 8px 0 #e3e6ed',
              border: darkMode ? '1px solid #2a3756' : '1px solid #e3e6ed',
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              fontWeight: 600,
            },
          },
        },
        MuiInputBase: {
          styleOverrides: {
            root: {
              background: darkMode ? '#232b3b' : '#f4f7fb',
              color: darkMode ? '#fff' : '#1a1a1a',
              borderRadius: 8,
            },
            input: {
              color: darkMode ? '#fff' : '#1a1a1a',
            },
          },
        },
      },
    }),
    [darkMode]
  );

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, sidebarCollapsed, toggleSidebar }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useCustomTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useCustomTheme deve ser usado dentro de CustomThemeProvider');
  return ctx;
} 
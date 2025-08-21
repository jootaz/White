import React from 'react';
import ReactDOM from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import { GlobalStyle } from './styles/global';
import { CustomThemeProvider } from './contexts/ThemeContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CustomThemeProvider>
      <CssBaseline />
      <GlobalStyle />
      <App />
    </CustomThemeProvider>
  </React.StrictMode>
);

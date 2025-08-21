import { Box, CssBaseline, IconButton, AppBar, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Sidebar } from '../components/Sidebar';
import type { ReactNode } from 'react';
import { useCustomTheme } from '../contexts/ThemeContext';
import { useState } from 'react';
import Logo from '../assets/Union.svg';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { sidebarCollapsed, toggleSidebar } = useCustomTheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      toggleSidebar();
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* AppBar para dispositivos móveis */}
      <AppBar 
        position="fixed" 
        sx={{ 
          display: { xs: 'block', md: 'none' },
          bgcolor: '#101624',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ minHeight: '64px' }}>
          <IconButton
            color="inherit"
            aria-label="abrir menu"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img src={Logo} alt="Logo" width={40} height={22} style={{ marginRight: '8px' }} />
            <Typography variant="h6" noWrap component="div" fontWeight={700}>
              White
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar adaptada para responsivo */}
      <Sidebar 
        collapsed={!isMobile && sidebarCollapsed} 
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onDrawerClose={() => setMobileOpen(false)} 
      />

      {/* Conteúdo principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 2, md: 3 },
          width: '100%',
          transition: 'all 0.3s',
          mt: isMobile ? '64px' : 0, // Adiciona margem top para dispositivos móveis
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
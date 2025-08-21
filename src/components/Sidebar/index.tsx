import {
  AppBar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Toolbar,
  Typography,
  styled,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import type { ReactElement } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCustomTheme } from '../../contexts/ThemeContext';
import { NotificacoesModal } from '../NotificacoesModal';
import { useApi } from '../../hooks/useApi';
import type { NotificationData } from '../../types/api';

import DashboardIcon from '@mui/icons-material/Dashboard';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

import Logo from '../../assets/Union.svg';
import { Padding } from '@mui/icons-material';

const drawerWidth = 260;

const LogoBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  cursor: 'pointer',
  userSelect: 'none',
  transition: 'transform 0.3s ease, filter 0.3s ease', 
  '&:hover': {
    transform: 'scale(1.05)',
    filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.4))', 
  },
});

const LogoText = styled(Typography)({
  color: 'transparent',
  fontWeight: 600,
  letterSpacing: 6,
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  textTransform: 'uppercase',
  background: 'linear-gradient(90deg, #ffffff, #cfd9df, #ffffff)',
  backgroundSize: '200% auto',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  animation: 'shine 2.5s linear infinite',
  userSelect: 'none',
  '@keyframes shine': {
    '0%': {
      backgroundPosition: '200% center',
    },
    '100%': {
      backgroundPosition: '-200% center',
    },
  },
});

const StyledListItem = styled(ListItem)<{ selected?: boolean }>(({ selected }) => ({
  borderRadius: 10,
  padding: '6px 12px',
  background: selected ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
  transition: 'background-color 0.3s ease', 
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.12)',
  },
  minWidth: 'fit-content',
  flexShrink: 0,
  justifyContent: 'center',
}));

const NotificationBox = styled(Box)({ 
  padding: '6px 14px',
  background: 'rgba(255, 255, 255, 0.06)',
  borderRadius: 10,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  cursor: 'pointer',
  position: 'relative',
  transition: 'background-color 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.1)',
  },
  userSelect: 'none',
});

const ThemeSwitchBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  cursor: 'pointer',
  userSelect: 'none',
});

interface MenuItem {
  text: string;
  icon: ReactElement; 
  path: string;
}

interface SidebarProps {
  collapsed: boolean;
  isMobile?: boolean;
  mobileOpen?: boolean; 
  onDrawerClose?: () => void;
}

export function Sidebar({ collapsed, isMobile = false, mobileOpen = false, onDrawerClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  useAuth();
  const { darkMode, toggleDarkMode } = useCustomTheme();
  const { listNotifications } = useApi();

  const [openNotif, setOpenNotif] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await listNotifications(true);
      if (response.data) setNotifications(response.data);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  }, [listNotifications]);

  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 30000);
    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.read).length);
  }, [notifications]);

  const theme = useTheme();
  const isMdDown = useMediaQuery(theme.breakpoints.down('md'));
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const showMenuText = !isMdDown;
  const showLogoText = !isSmDown;
  const showNotifText = !isSmDown;

  const menuItems: MenuItem[] = [
    { text: 'Dashboard', icon: <DashboardIcon fontSize="small" />, path: '/' },
    { text: 'Gastos', icon: <MonetizationOnIcon fontSize="small" />, path: '/gastos' },
    { text: 'Bots', icon: <SmartToyIcon fontSize="small" />, path: '/bots' },
  ];

  return (
    <>
      <NotificacoesModal
        open={openNotif}
        onClose={() => setOpenNotif(false)}
        notifications={notifications}
        onMarkAsRead={(id: string) => setNotifications((prev) => prev.filter((n) => n._id !== id))}
        onNotificationUpdate={fetchNotifications}
      />

      <AppBar
        position="fixed"
        elevation={0}
        sx={{ 
          bgcolor: 'rgba(18,18,18,0.95)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          height: 60,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          px: { xs: 1, sm: 2, md: 3 },
          boxShadow: 'none',
          backdropFilter: 'saturate(180%) blur(10px)',
          display: 'flex',
          justifyContent: 'center', 
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            width: '100%',
            maxWidth: 1900,
            justifyContent: 'space-between',
            px: 0,
            gap: { xs: 0.5, sm: 1, md: 2 },
          }}
        >
          {/* Logo fixo à esquerda */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            <LogoBox onClick={() => navigate('/')}>
              <img src={Logo} alt="Logo" width={40} height={26} style={{ flexShrink: 0 }} />
              {showLogoText && <LogoText variant="subtitle1">White</LogoText>}
            </LogoBox>
          </Box>

          {/* Menu centralizado */}
          <List
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: { xs: 1, sm: 2, md: 3 },
              p: 0,
              m: 0,
              flexGrow: 1,
              justifyContent: 'center',
            }}
          >
            {menuItems.map((item) => (
              <StyledListItem
                key={item.text}
                selected={location.pathname === item.path}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile && onDrawerClose) onDrawerClose?.();
                }}
                sx={{ px: { xs: 1, sm: 2, md: 3 }, maxWidth: 140 }}
                disableGutters
                dense
              >
                <ListItemIcon
                  sx={{
                    minWidth: 'auto',
                    mr: showMenuText ? 1 : 0,
                    justifyContent: 'center',
                    color:
                      location.pathname === item.path ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {showMenuText && (
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      sx: {
                        fontWeight: 300,
                        fontSize: '0.9rem',
                        whiteSpace: 'nowrap',
                        textAlign: 'center',
                      },
                    }}
                  />
                )}
              </StyledListItem>
            ))}
          </List>

          {/* Lado direito: notificações e tema */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2, md: 3 }, whiteSpace: 'nowrap' }}>
            <NotificationBox
              onClick={() => {
                setOpenNotif(true);
                if (isMobile && onDrawerClose) onDrawerClose?.();
              }}
            >
              <NotificationsNoneIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.7)' }} />
              {showNotifText && (
                <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 300, fontSize: '0.9rem' }}>
                  Notificações
                </Typography>
              )}
              {unreadCount > 0 && (
                <Box
                  sx={{
                    ml: 1,
                    background: '#c72c41',
                    borderRadius: '50%',
                    width: 18,
                    height: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    color: '#fff',
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    fontWeight: 600,
                  }}
                >
                  {unreadCount}
                </Box>
              )}
            </NotificationBox>

            <ThemeSwitchBox onClick={collapsed && !isMobile ? toggleDarkMode : undefined}>
              {collapsed && !isMobile ? (
                darkMode ? (
                  <DarkModeIcon sx={{ color: 'rgba(255,255,255,0.6)' }} fontSize="small" />
                ) : (
                  <LightModeIcon sx={{ color: 'rgba(255,255,255,0.6)' }} fontSize="small" />
                )
              ) : (
                <>
                  <DarkModeIcon fontSize="small" sx={{ opacity: darkMode ? 0.7 : 1 }} />
                  <Switch
                    checked={darkMode}
                    onChange={toggleDarkMode}
                    color="default"
                    size="small"
                    sx={{ '& .MuiSwitch-thumb': { boxShadow: 'none' }, p: 0 }}
                  />
                  <LightModeIcon fontSize="small" sx={{ opacity: !darkMode ? 0.7 : 1 }} />
                </>
              )}
            </ThemeSwitchBox>
          </Box>
        </Toolbar>
      </AppBar>

      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onDrawerClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              background: 'linear-gradient(180deg, #101624 0%, #181f2a 100%)',
              color: '#fff',
              borderRight: 'none',
              overflowX: 'hidden',
            },
            '& .MuiBackdrop-root': {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            },
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2, gap: 3 }}>
            <LogoBox onClick={() => navigate('/')}>
              <img src={Logo} alt="Logo" width={50} height={28} />
              <Typography
                variant="subtitle1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontWeight: 300,
                  letterSpacing: 2,
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  textTransform: 'uppercase',
                }}
              >
                White
              </Typography>
            </LogoBox>

            <List>
              {menuItems.map((item) => (
                <StyledListItem
                  key={item.text}
                  selected={location.pathname === item.path}
                  onClick={() => {
                    navigate(item.path);
                    if (onDrawerClose) onDrawerClose();
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </StyledListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      )}
    </>
  );
}

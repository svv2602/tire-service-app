import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  Container,
  useTheme,
  IconButton,
  Tooltip,
  Avatar,
  alpha,
  ButtonProps,
  useMediaQuery
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CalendarMonth as CalendarIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Menu as MenuIcon,
  CarRepair as CarRepairIcon
} from '@mui/icons-material';
import useScrollPosition from '../../hooks/useScrollPosition';
import UserMenu from '../auth/UserMenu';
import ThemeSwitch from '../ui/ThemeSwitch';

// Компонент кнопки с эффектом наведения (без зависимости framer-motion)
const AnimatedButton: React.FC<ButtonProps> = ({ children, sx, ...props }) => (
  <Button 
    {...props}
    sx={{
      transition: 'transform 0.2s ease',
      '&:hover': {
        transform: 'scale(1.05)',
      },
      '&:active': {
        transform: 'scale(0.95)',
      },
      ...(sx as any)
    }}
  >
    {children}
  </Button>
);

interface HeaderProps {
  toggleDrawer: () => void;
  title: string;
  toggleThemeMode?: () => void;
  isDarkMode?: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleDrawer, title, toggleThemeMode, isDarkMode }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const scrollPosition = useScrollPosition();
  const isScrolled = scrollPosition > 10;
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleBookingClick = () => {
    navigate('/booking');
  };

  return (
    <AppBar 
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        boxShadow: '0 1px 8px rgba(0,0,0,0.1)',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(90deg, rgba(31,41,55,0.95) 0%, rgba(17,24,39,0.97) 100%)' 
          : 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={toggleDrawer}
          sx={{
            mr: 2,
            display: { sm: 'none' },
          }}
        >
          <MenuIcon />
        </IconButton>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ 
            flexGrow: 1,
            fontWeight: 600,
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(90deg, #4C9FFF 0%, #3F8CFF 100%)' 
              : 'linear-gradient(90deg, #006EE6 0%, #0055B8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Переключатель темы */}
          {toggleThemeMode && (
            <Box sx={{ display: { xs: isMobile ? 'none' : 'flex' }, mr: 1 }}>
              <ThemeSwitch
                isDarkMode={!!isDarkMode}
                toggleThemeMode={toggleThemeMode}
              />
            </Box>
          )}
          
          {/* Меню пользователя */}
          <UserMenu toggleThemeMode={toggleThemeMode} isDarkMode={isDarkMode} />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 
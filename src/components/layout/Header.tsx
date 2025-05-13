import React from 'react';
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
  ButtonProps
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
  toggleThemeMode?: () => void;
  isDarkMode?: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleThemeMode, isDarkMode = false }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const scrollPosition = useScrollPosition();
  const isScrolled = scrollPosition > 10;

  const handleBookingClick = () => {
    navigate('/booking');
  };

  return (
    <AppBar 
      position="fixed"
      elevation={isScrolled ? 4 : 0}
      sx={{
        background: isScrolled 
          ? theme.palette.background.default
          : 'transparent',
        transition: 'all 0.3s ease',
        backdropFilter: isScrolled ? 'blur(10px)' : 'none',
        color: isScrolled ? theme.palette.text.primary : '#fff'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ py: 1 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              flexGrow: 1, 
              cursor: 'pointer' 
            }}
            onClick={() => navigate('/')}
          >
            <Avatar 
              sx={{ 
                bgcolor: theme.palette.primary.main,
                mr: 1,
                width: 40,
                height: 40,
                boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.6)}`
              }}
            >
              <CarRepairIcon />
            </Avatar>
            <Typography 
              variant="h6" 
              component="div"
              sx={{ 
                fontWeight: 700,
                backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                color: 'transparent',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Шиномонтаж
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {toggleThemeMode && (
              <Tooltip title={isDarkMode ? "Светлая тема" : "Темная тема"}>
                <IconButton 
                  color="inherit" 
                  onClick={toggleThemeMode}
                  sx={{
                    borderRadius: '12px',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    }
                  }}
                >
                  {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>
            )}
            
            <AnimatedButton 
              variant="contained"
              color="primary"
              startIcon={<CalendarIcon />}
              onClick={handleBookingClick}
              sx={{
                borderRadius: '12px',
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                '&:hover': {
                  background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                },
                px: 3,
                py: 1
              }}
            >
              Записаться
            </AnimatedButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header; 
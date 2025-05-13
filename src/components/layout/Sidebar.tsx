import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  List, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Box,
  Typography,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Dashboard, 
  Schedule, 
  People, 
  Store as StoreIcon, 
  BugReport, 
  Handyman as HandymanIcon, 
  Api as ApiIcon,
  Settings
} from '@mui/icons-material';
import { ListItemButton } from '../ui/ListComponents';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const menuItems = [
    { text: 'Панель управления', icon: <Dashboard />, path: '/admin' },
    { text: 'Записи', icon: <Schedule />, path: '/admin/bookings' },
    { text: 'Партнеры', icon: <People />, path: '/admin/partners' },
    { text: 'Точки обслуживания', icon: <StoreIcon />, path: '/admin/service-points' },
    { text: 'Услуги', icon: <HandymanIcon />, path: '/admin/services' },
    { text: 'Диагностика услуг', icon: <BugReport />, path: '/admin/services-diagnostic' },
    { text: 'API Тестер', icon: <ApiIcon />, path: '/admin/test-api' },
  ];

  const handleMenuItemClick = (path: string) => {
    navigate(path);
  };

  return (
    <Box sx={{ overflowY: 'auto', height: '100%' }}>
      <Toolbar sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        py: 2
      }}>
        <Typography 
          variant="h6"
          sx={{ 
            fontWeight: 700,
            fontSize: '1.3rem',
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(90deg, #4C9FFF 0%, #3F8CFF 100%)' 
              : 'linear-gradient(90deg, #006EE6 0%, #0055B8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          ШИНОМОНТАЖ
        </Typography>
      </Toolbar>
      
      <Divider sx={{ mb: 2 }} />
      
      <List component="nav" sx={{ px: 2 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          
          return (
            <ListItemButton
              key={item.text}
              onClick={() => handleMenuItemClick(item.path)}
              selected={isSelected}
              sx={{
                mb: 0.5,
                borderRadius: '8px',
                color: isSelected 
                  ? theme.palette.primary.main 
                  : theme.palette.text.primary,
                backgroundColor: isSelected 
                  ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.08)
                  : 'transparent',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.1 : 0.05),
                },
              }}
            >
              <ListItemIcon 
                sx={{ 
                  minWidth: 40,
                  color: isSelected ? theme.palette.primary.main : 'inherit'
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontSize: '1rem',
                  fontWeight: isSelected ? 600 : 400 
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      <List component="nav" sx={{ px: 2 }}>
        <ListItemButton
          onClick={() => handleMenuItemClick('/admin/settings')}
          selected={location.pathname === '/admin/settings'}
          sx={{
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.1 : 0.05),
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Settings />
          </ListItemIcon>
          <ListItemText 
            primary="Настройки" 
            primaryTypographyProps={{ 
              fontSize: '1rem' 
            }}
          />
        </ListItemButton>
      </List>
    </Box>
  );
};

export default Sidebar; 
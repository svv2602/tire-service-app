import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Tooltip,
  Divider,
  useTheme,
  Box,
} from '@mui/material';
import {
  AccountCircle,
  ExitToApp as Logout,
  Settings,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import ThemeToggle from '../ui/ThemeToggle';

interface UserMenuProps {
  toggleThemeMode?: () => void;
  isDarkMode?: boolean;
}

const UserMenu: React.FC<UserMenuProps> = ({ toggleThemeMode, isDarkMode }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };
  
  const handleSettings = () => {
    navigate('/admin/settings');
    handleClose();
  };
  
  const handleThemeToggle = () => {
    if (toggleThemeMode) {
      toggleThemeMode();
    }
    handleClose();
  };
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {/* Кнопка переключения темы */}
      {toggleThemeMode && (
        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
          <ThemeToggle 
            isDarkMode={!!isDarkMode} 
            toggleThemeMode={toggleThemeMode} 
          />
        </Box>
      )}
      
      {/* Кнопка пользователя */}
      <IconButton
        size="large"
        onClick={handleMenu}
        color="inherit"
        sx={{
          ml: 1,
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            transform: 'scale(1.05)',
          }
        }}
      >
        <Avatar 
          sx={{ 
            width: 32, 
            height: 32,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: `0 0 8px ${theme.palette.primary.main}`,
            }
          }}
        >
          <AccountCircle />
        </Avatar>
      </IconButton>
      
      {/* Меню пользователя */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            borderRadius: 2,
            minWidth: 200,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
      >
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <AccountCircle fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary={user?.email || 'Профиль'} 
            primaryTypographyProps={{ fontWeight: 'medium' }}
          />
        </MenuItem>
        
        <MenuItem onClick={handleSettings}>
          <ListItemIcon>
            <Settings fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary="Настройки" />
        </MenuItem>
        
        {/* Пункт переключения темы для мобильных устройств */}
        {toggleThemeMode && (
          <MenuItem onClick={handleThemeToggle}>
            <ListItemIcon>
              {isDarkMode ? 
                <Brightness7 fontSize="small" color="primary" /> : 
                <Brightness4 fontSize="small" color="primary" />
              }
            </ListItemIcon>
            <ListItemText primary={isDarkMode ? "Светлая тема" : "Тёмная тема"} />
          </MenuItem>
        )}
        
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: theme.palette.error.main }}>
          <ListItemIcon>
            <Logout fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Выйти" />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserMenu;
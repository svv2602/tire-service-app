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
    <>
      {/* Кнопка переключения темы */}
      {toggleThemeMode && (
        <Tooltip title={isDarkMode ? "Светлая тема" : "Тёмная тема"}>
          <IconButton 
            onClick={toggleThemeMode}
            color="inherit"
            sx={{ 
              ml: 1,
              display: { xs: 'none', md: 'flex' } // Скрыть на мобильных
            }}
          >
            {isDarkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Tooltip>
      )}
      
      {/* Кнопка пользователя */}
      <IconButton
        size="large"
        onClick={handleMenu}
        color="inherit"
      >
        <Avatar sx={{ width: 32, height: 32 }}>
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
      >
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={user?.email || 'Профиль'} />
        </MenuItem>
        
        <MenuItem onClick={handleSettings}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Настройки" />
        </MenuItem>
        
        {/* Пункт переключения темы для мобильных устройств */}
        {toggleThemeMode && (
          <MenuItem onClick={handleThemeToggle}>
            <ListItemIcon>
              {isDarkMode ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
            </ListItemIcon>
            <ListItemText primary={isDarkMode ? "Светлая тема" : "Тёмная тема"} />
          </MenuItem>
        )}
        
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Выйти" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserMenu;
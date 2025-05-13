import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItemIcon, ListItemText, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { Menu as MenuIcon, Dashboard, Schedule, People, Store as StoreIcon, BugReport, Handyman as HandymanIcon, Api as ApiIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import UserMenu from '../auth/UserMenu';
import { ListItemButton } from '../ui/ListComponents';

// Уменьшим ширину бокового меню для большего пространства контента
const drawerWidth = 240;

const Root = styled('div')({
  display: 'flex',
  height: '100vh', // Используем всю высоту экрана
  overflow: 'hidden', // Предотвращаем прокрутку всего макета
});

const AppBarStyled = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  boxShadow: `0 1px 3px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)'}`,
}));

const DrawerStyled = styled(Drawer)({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    borderRight: '0px',
    boxShadow: '0 0 5px rgba(0,0,0,0.05)',
  },
});

// Компонент для содержимого с вертикальной прокруткой
const ContentWrapper = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto', // Вертикальная прокрутка только для контента
  height: '100%', // Занимаем всю доступную высоту
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    width: `calc(100% - ${drawerWidth}px)`
  },
  backgroundColor: theme.palette.mode === 'dark' 
    ? theme.palette.background.default 
    : theme.palette.grey[50],
}));

interface AdminLayoutProps {
  children: React.ReactNode;
  toggleThemeMode?: () => void;
  isDarkMode?: boolean;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, toggleThemeMode, isDarkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Дашборд', icon: <Dashboard />, path: '/admin' },
    { text: 'Записи', icon: <Schedule />, path: '/admin/bookings' },
    { text: 'Партнеры', icon: <People />, path: '/admin/partners' },
    { text: 'Точки обслуживания', icon: <StoreIcon />, path: '/admin/service-points' },
    { text: 'Услуги', icon: <HandymanIcon />, path: '/admin/services' },
    { text: 'API Тестер', icon: <ApiIcon />, path: '/admin/test-api' },
  ];

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <>
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            onClick={() => handleMenuItemClick(item.path)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </>
  );

  return (
    <Root>
      <AppBarStyled position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Панель администратора
          </Typography>
          <UserMenu />
        </Toolbar>
      </AppBarStyled>

      {/* Мобильный drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Лучшая производительность на мобильных устройствах
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>

      {/* Десктопный drawer */}
      <DrawerStyled
        variant="permanent"
        sx={{ display: { xs: 'none', sm: 'block' } }}
      >
        {drawer}
      </DrawerStyled>

      {/* Используем кастомный ContentWrapper вместо обычного Box */}
      <ContentWrapper>
        <Toolbar /> {/* Для отступа от аппбара */}
        <Box
          component="main"
          sx={{
            p: { xs: 1, sm: 2, md: 3 },
            maxWidth: '100%', // Используем 100% ширины
            overflowX: 'auto', // Добавляем горизонтальную прокрутку только если необходимо
          }}
        >
          {children}
        </Box>
      </ContentWrapper>
    </Root>
  );
};

export default AdminLayout;
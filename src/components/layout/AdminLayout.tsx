import React, { useState, ReactNode } from 'react';
import { Box, CssBaseline, Drawer, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';

interface AdminLayoutProps {
  children: ReactNode;
  toggleThemeMode?: () => void;
  isDarkMode?: boolean;
}

const drawerWidth = 280;

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, toggleThemeMode, isDarkMode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Header 
        toggleDrawer={handleDrawerToggle} 
        title="Панель управления"
        toggleThemeMode={toggleThemeMode}
        isDarkMode={isDarkMode}
      />
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Мобильный выдвижной сайдбар */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Для лучшей производительности на мобильных
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          <Sidebar />
        </Drawer>
        
        {/* Постоянный сайдбар на десктопе */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
              boxShadow: 'none'
            },
          }}
          open
        >
          <Sidebar />
        </Drawer>
      </Box>
      
      {/* Основное содержимое */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh'
        }}
      >
        <Toolbar /> {/* Пространство под фиксированным хедером */}
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;
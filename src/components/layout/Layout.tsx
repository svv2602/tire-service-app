import React, { useState } from 'react';
import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

interface LayoutProps {
  children?: React.ReactNode;
  toggleThemeMode?: () => void;
  isDarkMode?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, toggleThemeMode, isDarkMode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header 
        toggleDrawer={handleDrawerToggle} 
        title="Шиномонтаж"
        toggleThemeMode={toggleThemeMode} 
        isDarkMode={isDarkMode} 
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8, // Увеличенный отступ для лучшего визуального разделения
          mt: 8 // Отступ для фиксированного хедера
        }}
      >
        <Container maxWidth="lg">
          {children || <Outlet />}
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout; 
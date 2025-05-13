import React from 'react';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';

interface ThemeToggleProps {
  isDarkMode: boolean;
  toggleThemeMode: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDarkMode, toggleThemeMode }) => {
  const theme = useTheme();

  return (
    <Tooltip title={isDarkMode ? "Переключить на светлую тему" : "Переключить на тёмную тему"}>
      <IconButton
        onClick={toggleThemeMode}
        color="inherit"
        aria-label="переключить тему"
        sx={{
          transition: 'all 0.3s ease',
          transform: isDarkMode ? 'rotate(180deg)' : 'rotate(0deg)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            transform: isDarkMode 
              ? 'rotate(180deg) scale(1.1)' 
              : 'rotate(0deg) scale(1.1)',
          },
        }}
      >
        {isDarkMode ? (
          <Brightness7 
            sx={{ 
              color: theme.palette.primary.light,
              transition: 'all 0.3s ease',
            }} 
          />
        ) : (
          <Brightness4 
            sx={{ 
              color: theme.palette.mode === 'dark' 
                ? theme.palette.primary.light 
                : theme.palette.primary.main,
              transition: 'all 0.3s ease',
            }} 
          />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle; 
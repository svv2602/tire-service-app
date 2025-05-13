import React from 'react';
import { Box, useTheme, Typography, alpha } from '@mui/material';
import { keyframes } from '@mui/system';

interface PageLoaderProps {
  message?: string;
  fullScreen?: boolean;
  transparent?: boolean;
}

// Define keyframes for animations
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const PageLoader: React.FC<PageLoaderProps> = ({ 
  message = 'Загрузка...', 
  fullScreen = false,
  transparent = false
}) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        position: fullScreen ? 'fixed' : 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: fullScreen ? '100vh' : '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: transparent 
          ? 'transparent' 
          : alpha(theme.palette.background.default, 0.8),
        backdropFilter: transparent ? 'none' : 'blur(8px)',
        zIndex: theme.zIndex.modal + 1,
        animation: `${fadeIn} 0.3s ease-in-out`,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: 56,
          height: 56,
          mb: 2,
        }}
      >
        {/* Outer spinning circle */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            borderTopColor: theme.palette.primary.main,
            animation: `${spin} 1s linear infinite`,
          }}
        />
        
        {/* Inner spinning circle (opposite direction) */}
        <Box
          sx={{
            position: 'absolute',
            top: '15%',
            left: '15%',
            width: '70%',
            height: '70%',
            borderRadius: '50%',
            border: `3px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
            borderBottomColor: theme.palette.secondary.main,
            animation: `${spin} 0.8s linear infinite reverse`,
          }}
        />
        
        {/* Center dot */}
        <Box
          sx={{
            position: 'absolute',
            top: '35%',
            left: '35%',
            width: '30%',
            height: '30%',
            borderRadius: '50%',
            backgroundColor: theme.palette.primary.main,
            boxShadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.5)}`,
            animation: `${pulse} 1.5s ease-in-out infinite`,
          }}
        />
      </Box>
      
      {message && (
        <Typography
          variant="body1"
          sx={{
            fontWeight: 500,
            color: theme.palette.text.primary,
            textAlign: 'center',
            opacity: 0.9,
            animation: `${pulse} 2s ease-in-out infinite`,
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default PageLoader; 
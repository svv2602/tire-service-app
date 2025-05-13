import React from 'react';
import { Box, BoxProps } from '@mui/material';

interface GridContainerProps extends BoxProps {
  spacing?: number;
  children: React.ReactNode;
}

interface GridItemProps extends BoxProps {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  children: React.ReactNode;
}

export const GridContainer: React.FC<GridContainerProps> = ({ 
  spacing = 2, 
  children, 
  sx = {}, 
  ...props 
}) => {
  return (
    <Box
      sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        margin: spacing ? -spacing / 2 : 0,
        ...sx 
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export const GridItem: React.FC<GridItemProps> = ({ 
  xs, 
  sm, 
  md, 
  lg, 
  xl, 
  children, 
  sx = {}, 
  ...props 
}) => {
  // Calculate width based on breakpoints
  const getWidth = (columns?: number) => {
    return columns ? `${(columns / 12) * 100}%` : undefined;
  };

  return (
    <Box
      sx={{
        padding: 1,
        boxSizing: 'border-box',
        width: getWidth(xs),
        '@media (min-width: 600px)': {
          width: getWidth(sm),
        },
        '@media (min-width: 960px)': {
          width: getWidth(md),
        },
        '@media (min-width: 1280px)': {
          width: getWidth(lg),
        },
        '@media (min-width: 1920px)': {
          width: getWidth(xl),
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}; 
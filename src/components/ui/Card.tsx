import React, { useState } from 'react';
import { 
  Card as MuiCard, 
  CardProps as MuiCardProps, 
  CardContent, 
  CardHeader, 
  CardActions,
  Typography,
  Box,
  useTheme,
  alpha,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Define custom variant type that doesn't conflict with MUI's variant
type CardVariant = 'default' | 'outlined' | 'elevated';

// Define extended props for our custom Card
export interface EnhancedCardProps extends Omit<MuiCardProps, 'variant'> {
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  hoverEffect?: boolean;
  cardVariant?: CardVariant;
}

// Create a styled version of MUI Card with hover effects
const StyledCard = styled(MuiCard, {
  shouldForwardProp: (prop) => prop !== 'hoverEffect' && prop !== 'cardVariant'
})<{ hoverEffect?: boolean; cardVariant?: CardVariant }>(
  ({ theme, hoverEffect, cardVariant }) => ({
    borderRadius: '16px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    
    ...(cardVariant === 'elevated' && {
      boxShadow: `0 8px 24px ${alpha(theme.palette.mode === 'dark' ? '#000' : '#757575', 0.12)}`,
      backgroundColor: theme.palette.mode === 'dark' 
        ? alpha(theme.palette.background.paper, 0.8)
        : theme.palette.background.paper,
    }),
    
    ...(cardVariant === 'outlined' && {
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: 'none',
      backgroundColor: 'transparent',
    }),
    
    ...(cardVariant === 'default' && {
      backgroundColor: theme.palette.mode === 'dark' 
        ? alpha(theme.palette.background.paper, 0.6)
        : theme.palette.background.paper,
      boxShadow: `0 2px 14px ${alpha(theme.palette.mode === 'dark' ? '#000' : '#757575', 0.08)}`,
    }),
    
    ...(hoverEffect && {
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: `0 12px 28px ${alpha(theme.palette.mode === 'dark' ? '#000' : '#757575', 0.2)}`,
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'transparent',
        zIndex: 0,
        transition: 'all 0.3s ease',
      },
      '&:hover::before': {
        background: theme.palette.mode === 'dark' 
          ? `linear-gradient(130deg, ${alpha(theme.palette.primary.dark, 0.12)} 0%, transparent 50%)`
          : `linear-gradient(130deg, ${alpha(theme.palette.primary.light, 0.08)} 0%, transparent 50%)`,
      },
    }),
  })
);

const Card: React.FC<EnhancedCardProps> = ({
  title,
  subtitle,
  headerAction,
  children,
  footer,
  hoverEffect = false,
  cardVariant = 'default',
  ...props
}) => {
  const theme = useTheme();
  const [elevation, setElevation] = useState(props.elevation || 1);
  
  // Convert our custom variant to MUI variant if needed
  const muiVariant = cardVariant === 'outlined' ? 'outlined' : undefined;
  
  return (
    <StyledCard 
      {...props} 
      variant={muiVariant}
      hoverEffect={hoverEffect}
      cardVariant={cardVariant}
      elevation={elevation}
      onMouseEnter={() => hoverEffect && setElevation(3)}
      onMouseLeave={() => hoverEffect && setElevation(props.elevation || 1)}
    >
      {(title || subtitle) && (
        <CardHeader
          title={title && (
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          )}
          subheader={subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
          action={headerAction}
          sx={{ pb: subtitle ? 1 : 0 }}
        />
      )}
      
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        {children}
      </CardContent>
      
      {footer && (
        <CardActions sx={{ padding: 2, pt: 0 }}>
          {footer}
        </CardActions>
      )}
    </StyledCard>
  );
};

export default Card; 
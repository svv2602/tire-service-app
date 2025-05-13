import React from 'react';
import { 
  Button as MuiButton, 
  ButtonProps as MuiButtonProps,
  alpha,
  useTheme,
  CircularProgress,
  Box
} from '@mui/material';
import { styled } from '@mui/material/styles';

type ButtonVariant = 'primary' | 'secondary' | 'gradient' | 'text' | 'outlined';
type ButtonSize = 'small' | 'medium' | 'large';

export interface EnhancedButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  rounded?: boolean;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

// Create the styled button with enhanced visual effects
const StyledButton = styled(MuiButton, {
  shouldForwardProp: (prop) => 
    !['loading', 'rounded', 'buttonVariant'].includes(prop as string)
})<{ 
  loading?: boolean; 
  rounded?: boolean; 
  buttonVariant?: ButtonVariant; 
  buttonSize?: ButtonSize;
}>(({ theme, loading, rounded, buttonVariant, buttonSize }) => ({
  position: 'relative',
  fontWeight: 600,
  letterSpacing: '0.02em',
  textTransform: 'none',
  borderRadius: rounded ? '50px' : '10px',
  padding: buttonSize === 'large' 
    ? '12px 26px' 
    : buttonSize === 'small'
      ? '6px 16px'
      : '10px 22px',
  fontSize: buttonSize === 'large' 
    ? '1rem' 
    : buttonSize === 'small'
      ? '0.75rem'
      : '0.875rem',
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: 'none',
  
  // Gradient background for the gradient variant
  ...(buttonVariant === 'gradient' && {
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    color: theme.palette.primary.contrastText,
    border: 'none',
    boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
    '&:hover': {
      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
      boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`,
    },
  }),
  
  // Primary button styles
  ...(buttonVariant === 'primary' && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
      boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
      transform: 'translateY(-2px)',
    },
  }),
  
  // Secondary button styles
  ...(buttonVariant === 'secondary' && {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark,
      boxShadow: `0 6px 20px ${alpha(theme.palette.secondary.main, 0.4)}`,
      transform: 'translateY(-2px)',
    },
  }),
  
  // Outlined button styles with improved hover states
  ...(buttonVariant === 'outlined' && {
    backgroundColor: 'transparent',
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
      borderColor: theme.palette.primary.main,
      transform: 'translateY(-2px)',
    },
  }),
  
  // Text button styles
  ...(buttonVariant === 'text' && {
    backgroundColor: 'transparent',
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
    },
  }),
  
  // Common hover and focus states
  '&:active': {
    transform: 'scale(0.98)',
  },
  
  // Disabled state
  '&.Mui-disabled': {
    backgroundColor: buttonVariant === 'text' || buttonVariant === 'outlined'
      ? 'transparent'
      : theme.palette.action.disabledBackground,
    color: theme.palette.text.disabled,
    boxShadow: 'none',
  },
  
  // Loading state
  ...(loading && {
    '& .MuiButton-startIcon, & .MuiButton-endIcon': {
      opacity: 0,
    },
    '& .buttonText': {
      visibility: 'hidden',
    },
  }),
}));

const Button: React.FC<EnhancedButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  rounded = false,
  startIcon,
  endIcon,
  disabled,
  ...rest
}) => {
  const theme = useTheme();
  
  // Map our custom variants to MUI variants
  const getMuiVariant = (variant: ButtonVariant): MuiButtonProps['variant'] => {
    switch (variant) {
      case 'outlined':
        return 'outlined';
      case 'text':
        return 'text';
      default:
        return 'contained';
    }
  };

  return (
    <StyledButton
      {...rest}
      disabled={disabled || loading}
      variant={getMuiVariant(variant)}
      buttonVariant={variant}
      buttonSize={size}
      loading={loading}
      rounded={rounded}
      startIcon={loading ? null : startIcon}
      endIcon={loading ? null : endIcon}
      disableElevation
    >
      <span className="buttonText">{children}</span>
      
      {loading && (
        <CircularProgress
          size={24}
          thickness={4}
          sx={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            marginLeft: '-12px',
            marginTop: '-12px',
            color: variant === 'outlined' ? theme.palette.primary.main : 'inherit',
          }}
        />
      )}
    </StyledButton>
  );
};

export default Button; 
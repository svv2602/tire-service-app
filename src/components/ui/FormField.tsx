import React from 'react';
import { 
  TextField, 
  TextFieldProps, 
  FormControl, 
  InputLabel, 
  FormHelperText,
  Box,
  Typography,
  alpha,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Стилизованный TextField с улучшенным дизайном
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    transition: 'all 0.2s',
    backgroundColor: theme.palette.mode === 'light' 
      ? alpha(theme.palette.background.paper, 0.8) 
      : alpha(theme.palette.background.paper, 0.1),
    backdropFilter: 'blur(8px)',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'light' 
        ? alpha(theme.palette.background.paper, 0.95) 
        : alpha(theme.palette.background.paper, 0.2),
    },
    '&.Mui-focused': {
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: alpha(theme.palette.divider, 0.8),
  },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
    borderWidth: '1px',
  },
}));

// Интерфейс для пропсов FormField, расширяет TextFieldProps
export interface FormFieldProps extends Omit<TextFieldProps, 'label'> {
  label?: string;
  helperText?: string;
  errorText?: string;
  subtitle?: string;
  fullWidth?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  helperText,
  errorText,
  error,
  subtitle,
  fullWidth = true,
  ...rest
}) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ mb: 3, width: fullWidth ? '100%' : 'auto' }}>
      {(label || subtitle) && (
        <Box sx={{ mb: 0.5, display: 'flex', flexDirection: 'column' }}>
          {label && (
            <Typography 
              variant="subtitle1" 
              component="label" 
              htmlFor={rest.id} 
              sx={{ 
                fontWeight: 600,
                color: error ? theme.palette.error.main : theme.palette.text.primary
              }}
            >
              {label}
            </Typography>
          )}
          
          {subtitle && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: theme.palette.text.secondary,
                mb: 0.5
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      )}
      
      <StyledTextField
        error={error}
        fullWidth={fullWidth}
        {...rest}
      />
      
      {(helperText || errorText) && (
        <FormHelperText 
          error={error}
          sx={{ 
            mt: 0.5, 
            ml: 1.5,
            fontSize: '0.75rem',
            color: error ? theme.palette.error.main : theme.palette.text.secondary 
          }}
        >
          {error ? errorText : helperText}
        </FormHelperText>
      )}
    </Box>
  );
};

export default FormField; 
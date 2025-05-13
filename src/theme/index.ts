import { createTheme, ThemeOptions } from '@mui/material/styles';
import { alpha, TypographyVariantsOptions } from '@mui/material';

// Современная цветовая палитра 2025 с учетом требований контрастности WCAG AA
const basePalette = {
  primary: {
    main: '#006EE6', // Более современный синий
    light: '#4C9FFF',
    dark: '#0047B3',
    contrastText: '#FFFFFF'
  },
  secondary: {
    main: '#36B37E', // Зеленый для акцентов
    light: '#79F2C0',
    dark: '#008656',
    contrastText: '#FFFFFF'
  },
  error: {
    main: '#E53935',
    light: '#FF6B67',
    dark: '#AB000D',
    contrastText: '#FFFFFF'
  },
  warning: {
    main: '#FF9800',
    light: '#FFB547',
    dark: '#C77700',
    contrastText: '#000000'
  },
  success: {
    main: '#2E7D32',
    light: '#60AD5E',
    dark: '#005005',
    contrastText: '#FFFFFF'
  },
  info: {
    main: '#0288D1',
    light: '#5EB8FF',
    dark: '#005B9F',
    contrastText: '#FFFFFF'
  },
};

// Настройки типографики с Inter в качестве основного шрифта
const baseTypography: TypographyVariantsOptions = {
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
  fontSize: 16,
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,
  h1: {
    fontSize: '2.8rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
  },
  h2: {
    fontSize: '2.2rem',
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '1.9rem',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h4: {
    fontSize: '1.6rem',
    fontWeight: 600,
    lineHeight: 1.35,
  },
  h5: {
    fontSize: '1.35rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h6: {
    fontSize: '1.2rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  subtitle1: {
    fontSize: '1.1rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  subtitle2: {
    fontSize: '0.95rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: '1.05rem',
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.95rem',
    lineHeight: 1.5,
  },
  button: {
    fontSize: '0.95rem',
    fontWeight: 600,
    textTransform: 'none',
    letterSpacing: '0.02em',
  },
};

// Светлая тема
export const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    ...basePalette,
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#212B36',
      secondary: '#637381'
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
  typography: baseTypography,
  shape: {
    borderRadius: 10,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.05)',
    '0px 4px 8px rgba(0, 0, 0, 0.08)',
    '0px 6px 12px rgba(0, 0, 0, 0.1)',
    ...Array(21).fill(''),
  ].slice(0, 25) as any,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          padding: '10px 18px',
          borderRadius: '8px',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08)',
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: basePalette.primary.main,
            },
            '& .MuiInputBase-input': {
              fontSize: '1.05rem',
            },
          },
          '& .MuiInputLabel-root': {
            fontSize: '1.05rem',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: '0 12px 12px 0',
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            padding: '16px',
            fontSize: '1rem',
          },
          '& .MuiTableRow-root:hover': {
            backgroundColor: 'rgba(0, 110, 230, 0.04)',
          },
        },
      },
    },
  },
};

// Усовершенствованная тёмная тема для 2025
export const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#3F8CFF',
      light: '#6DABFF',
      dark: '#0065D2',
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#4ADE80',
      light: '#7EEEA8',
      dark: '#00A94F',
      contrastText: '#121212'
    },
    error: {
      main: '#FF5252',
      light: '#FF8A80',
      dark: '#C50E29',
      contrastText: '#FFFFFF'
    },
    warning: {
      main: '#FFB74D',
      light: '#FFE97D',
      dark: '#C87D20',
      contrastText: '#121212'
    },
    success: {
      main: '#4CAF50',
      light: '#80E27E',
      dark: '#087F23',
      contrastText: '#FFFFFF'
    },
    info: {
      main: '#29B6F6',
      light: '#73E8FF',
      dark: '#0086C3',
      contrastText: '#121212'
    },
    background: {
      default: '#111827',
      paper: '#1F2937'
    },
    text: {
      primary: '#F3F4F6',
      secondary: '#D1D5DB'
    },
    action: {
      active: '#F3F4F6',
      hover: 'rgba(255, 255, 255, 0.08)',
      selected: 'rgba(255, 255, 255, 0.16)',
      disabled: 'rgba(255, 255, 255, 0.3)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)'
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: baseTypography,
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 6px rgba(0, 0, 0, 0.3)',
    '0px 4px 12px rgba(0, 0, 0, 0.4)',
    '0px 8px 16px rgba(0, 0, 0, 0.5)',
    '0px 12px 24px rgba(0, 0, 0, 0.6)',
    ...Array(20).fill(''),
  ].slice(0, 25) as any,
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#1F2937',
          borderRadius: 12,
          '&.MuiAppBar-root': {
            backgroundColor: '#111827',
            backgroundImage: 'none',
          },
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.5)',
        },
        elevation2: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.5)',
        }
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1F2937',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.5)',
          borderRadius: 12,
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.7)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          textTransform: 'none',
          padding: '10px 18px',
          transition: 'all 0.2s ease',
          fontSize: '0.95rem',
        },
        contained: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
          '&:hover': {
            boxShadow: '0px 6px 16px rgba(61, 140, 255, 0.4)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.12)',
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.3)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            transform: 'scale(1.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#3F8CFF',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#3F8CFF',
              borderWidth: 2,
            },
            '& .MuiInputBase-input': {
              fontSize: '1.05rem',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#D1D5DB',
            fontSize: '1.05rem',
          },
          '& .MuiInputBase-input': {
            color: '#F3F4F6',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3F8CFF',
          },
        },
        notchedOutline: {
          borderColor: 'rgba(255, 255, 255, 0.12)',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 42,
          height: 26,
          padding: 0,
          '& .MuiSwitch-switchBase': {
            padding: 1,
            '&.Mui-checked': {
              transform: 'translateX(16px)',
              color: '#fff',
              '& + .MuiSwitch-track': {
                backgroundColor: '#3F8CFF',
                opacity: 1,
                border: 'none',
              },
            },
          },
          '& .MuiSwitch-thumb': {
            width: 24,
            height: 24,
          },
          '& .MuiSwitch-track': {
            borderRadius: 26 / 2,
            backgroundColor: '#424242',
            opacity: 1,
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: 'rgba(255, 255, 255, 0.7)',
          '&.Mui-checked': {
            color: '#3F8CFF',
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: 'rgba(255, 255, 255, 0.7)',
          '&.Mui-checked': {
            color: '#3F8CFF',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '1rem',
        },
        head: {
          color: '#F3F4F6',
          fontWeight: 600,
          fontSize: '1.05rem',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontSize: '1rem',
        },
        standardSuccess: {
          backgroundColor: 'rgba(76, 175, 80, 0.12)',
          color: '#4CAF50',
        },
        standardInfo: {
          backgroundColor: 'rgba(41, 182, 246, 0.12)',
          color: '#29B6F6',
        },
        standardWarning: {
          backgroundColor: 'rgba(255, 183, 77, 0.12)',
          color: '#FFB74D',
        },
        standardError: {
          backgroundColor: 'rgba(255, 82, 82, 0.12)',
          color: '#FF5252',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontSize: '0.95rem',
        },
        filled: {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.12)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#111827',
          borderRight: 'none',
          boxShadow: '4px 0 8px rgba(0, 0, 0, 0.3)',
          borderRadius: '0 12px 12px 0',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#111827',
          boxShadow: '0 1px 8px rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(8px)',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          backgroundColor: '#1F2937',
          fontSize: '1.05rem',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: '#111827',
          fontSize: '1.2rem',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1F2937',
          boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.6)',
          borderRadius: 8,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '1rem',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(63, 140, 255, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(63, 140, 255, 0.2)',
            },
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#111827',
          color: '#F3F4F6',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.6)',
          fontSize: '0.875rem',
          borderRadius: 4,
          border: '1px solid rgba(255, 255, 255, 0.05)',
        },
        arrow: {
          color: '#111827',
        },
      },
    },
  },
};

// Создаем светлую тему по умолчанию
const theme = createTheme(lightThemeOptions);

export default theme;
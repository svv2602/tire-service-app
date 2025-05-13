import { createTheme, ThemeOptions } from '@mui/material/styles';

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

// Светлая тема
export const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    ...basePalette,
    background: {
      default: '#F8F9FA', // Светлый фон с оттенком
      paper: '#FFFFFF'
    },
    text: {
      primary: '#212B36', // Темно-синий для лучшей читаемости
      secondary: '#637381'
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.35,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 10,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.05)',
    '0px 4px 8px rgba(0, 0, 0, 0.08)',
    '0px 6px 12px rgba(0, 0, 0, 0.1)',
    // ... остальные тени (можно оставить стандартные)
    ...Array(21).fill(''),
  ].slice(0, 25) as any,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          padding: '8px 16px',
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
          },
          '& .MuiTableRow-root:hover': {
            backgroundColor: 'rgba(0, 110, 230, 0.04)',
          },
        },
      },
    },
  },
};

// Темная тема
export const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    ...basePalette,
    background: {
      default: '#161C24', // Темный фон
      paper: '#212B36'    // Немного светлее для карточек
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B9C4'
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: lightThemeOptions.typography,
  shape: lightThemeOptions.shape,
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.2)',
    '0px 4px 8px rgba(0, 0, 0, 0.25)',
    '0px 6px 12px rgba(0, 0, 0, 0.3)',
    // ... остальные тени (можно оставить стандартные)
    ...Array(21).fill(''),
  ].slice(0, 25) as any,
  components: {
    ...lightThemeOptions.components,
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
};

// Создаем светлую тему по умолчанию
const theme = createTheme(lightThemeOptions);

export default theme;
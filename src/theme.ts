// Опции темы для светлого и темного режимов
import { ThemeOptions } from '@mui/material/styles';

// Общие настройки для обеих тем
const commonOptions: Partial<ThemeOptions> = {
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h2: {
      fontSize: '2rem',
      '@media (max-width:600px)': {
        fontSize: '1.8rem',
      },
    },
    h3: {
      fontSize: '1.75rem',
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h4: {
      fontSize: '1.5rem',
      '@media (max-width:600px)': {
        fontSize: '1.3rem',
      },
    },
    h5: {
      fontSize: '1.25rem',
      '@media (max-width:600px)': {
        fontSize: '1.1rem',
      },
    },
    h6: {
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none', // Отключаем автоматические заглавные буквы для кнопок
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '8px 16px',
          fontWeight: 500,
          '@media (max-width:600px)': {
            padding: '6px 12px',
            fontSize: '0.875rem',
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
        startIcon: {
          '@media (max-width:600px)': {
            marginRight: '4px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          '@media (max-width:600px)': {
            borderRadius: '8px',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          marginBottom: '16px',
          '@media (max-width:600px)': {
            marginBottom: '12px',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          paddingTop: 0,
          transition: 'width 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          paddingLeft: '16px',
          paddingRight: '16px',
          '@media (max-width:600px)': {
            paddingLeft: '8px',
            paddingRight: '8px',
            fontSize: '0.8125rem',
          },
        },
        head: {
          fontWeight: 600,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
        sizeSmall: {
          padding: '6px 16px',
          '@media (max-width:600px)': {
            padding: '4px 8px',
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            overflowX: 'auto',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            paddingLeft: '8px',
            paddingRight: '8px',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            padding: '8px',
          },
        },
        sizeSmall: {
          '@media (max-width:600px)': {
            padding: '4px',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            height: '24px',
            fontSize: '0.75rem',
          },
        },
        sizeSmall: {
          '@media (max-width:600px)': {
            height: '20px',
            fontSize: '0.6875rem',
          },
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            padding: '4px 0',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            backgroundImage: 'none',
          },
        },
      },
    },
  },
};

// Светлая тема
export const lightThemeOptions: ThemeOptions = {
  ...commonOptions,
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#fff',
    },
    secondary: {
      main: '#FF5722',
      light: '#FF8A65',
      dark: '#E64A19',
      contrastText: '#fff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
    },
  },
};

// Темная тема
export const darkThemeOptions: ThemeOptions = {
  ...commonOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
      light: '#e3f2fd',
      dark: '#42a5f5',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    secondary: {
      main: '#FF8A65',
      light: '#FFAB91',
      dark: '#E64A19',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#fff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  components: {
    ...commonOptions.components,
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1e1e1e',
        },
      },
    },
  },
};

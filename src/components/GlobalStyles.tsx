import { GlobalStyles as MuiGlobalStyles } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * Глобальные стили для улучшения адаптивности приложения
 */
const GlobalStyles = () => {
  const theme = useTheme();

  return (
    <MuiGlobalStyles
      styles={{        // Общие стили для всего приложения
        '*': {
          boxSizing: 'border-box',
          margin: 0,
          padding: 0,
        },
        html: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          height: '100%',
          width: '100%',
          fontSize: '16px', // Базовый размер шрифта
          [theme.breakpoints.down('sm')]: {
            fontSize: '14px', // Уменьшаем базовый размер шрифта на мобильных устройствах
          },
          overflowX: 'hidden', // Убираем горизонтальную прокрутку для всего документа
        },
        body: {
          height: '100%',
          width: '100%',
          backgroundColor: theme.palette.background.default,
          overflowX: 'hidden', // Убираем горизонтальную прокрутку
        },
        '#root': {
          height: '100%',
          width: '100%',
          maxWidth: '100vw', // Ограничиваем максимальную ширину
          overflowX: 'hidden', // Убираем горизонтальную прокрутку
        },
        // Убираем синее выделение при тапе на мобильных устройствах
        'button, a': {
          WebkitTapHighlightColor: 'transparent',
        },        // Стилизация скроллбара
        '::-webkit-scrollbar': {
          width: '6px',
          height: '6px', // Уменьшаем размер горизонтального скроллбара
        },
        '::-webkit-scrollbar-track': {
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(0, 0, 0, 0.05)',
          borderRadius: '6px',
        },
        '::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.2)' 
            : 'rgba(0, 0, 0, 0.2)',
          borderRadius: '6px',
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.3)' 
              : 'rgba(0, 0, 0, 0.3)',
          },
        },        // Скрываем горизонтальный скролл там, где он не нужен
        '.hide-horizontal-scroll': {
          overflowX: 'hidden !important',
        },
        // Показываем горизонтальный скролл только при необходимости
        '.auto-horizontal-scroll': {
          overflowX: 'auto !important',
          WebkitOverflowScrolling: 'touch',
        },
        // Улучшенные стили для таблиц
        '.MuiTable-root': {
          borderCollapse: 'separate',
          borderSpacing: 0,
          width: '100%',
          tableLayout: 'auto',
          [theme.breakpoints.down('sm')]: {
            tableLayout: 'fixed', // Фиксированный layout для маленьких экранов
            fontSize: '0.9rem',
          },
        },
        '.MuiTableCell-root': {
          [theme.breakpoints.down('sm')]: {
            padding: '6px 8px', // Меньше отступов на маленьких экранах
          },
        },
        // Дополнительные адаптивные настройки
        '.mobile-hidden': {
          [theme.breakpoints.down('sm')]: {
            display: 'none !important',
          },
        },
        '.mobile-only': {
          [theme.breakpoints.up('sm')]: {
            display: 'none !important',
          },
        },
        '.tablet-hidden': {
          [theme.breakpoints.down('md')]: {
            display: 'none !important',
          },
        },
        '.tablet-only': {
          [theme.breakpoints.up('lg')]: {
            display: 'none !important',
          },
          [theme.breakpoints.down('sm')]: {
            display: 'none !important',
          },
        },
        // Адаптивные стили для контейнеров в приложении
        '.responsive-container': {
          padding: theme.spacing(3),
          [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(1.5),
          },
        },
        // Адаптивные шрифты для текста в приложении
        '.responsive-text': {
          fontSize: '1rem',
          [theme.breakpoints.down('sm')]: {
            fontSize: '0.875rem',
          },
        },
        '.responsive-heading': {
          fontSize: '1.5rem',
          lineHeight: 1.33,
          fontWeight: 600,
          [theme.breakpoints.down('sm')]: {
            fontSize: '1.25rem',
            lineHeight: 1.4,
          },
        },
      }}
    />
  );
};

export default GlobalStyles;

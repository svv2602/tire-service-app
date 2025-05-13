import { useMediaQuery, useTheme } from '@mui/material';

/**
 * Хук для проверки размеров экрана
 * Возвращает объект с булевыми значениями для разных размеров экрана
 */
export const useScreenSize = () => {
  const theme = useTheme();
  
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isMd = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isLg = useMediaQuery(theme.breakpoints.between('lg', 'xl'));
  const isXl = useMediaQuery(theme.breakpoints.up('xl'));
  
  const isMobile = isXs;
  const isTablet = isSm || isMd;
  const isDesktop = isLg || isXl;
  
  return {
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    isMobile,
    isTablet,
    isDesktop,
    // Для простоты использования в компонентах
    screenSize: isXs ? 'xs' : isSm ? 'sm' : isMd ? 'md' : isLg ? 'lg' : 'xl',
    // Для определения размеров компонентов
    tableSize: isMobile ? 'small' : 'medium',
    buttonSize: isMobile ? 'small' : 'medium',
    iconSize: isMobile ? 'small' : 'medium',
  };
};

/**
 * Утилита для преобразования размеров в относительные единицы
 * @param size - размер в пикселях
 * @returns строку с относительным размером в rem
 */
export const toRem = (size: number): string => {
  return `${size / 16}rem`;
};

/**
 * Утилиты для адаптивных отступов и размеров
 */
export const spacing = {
  // Отступы для контейнеров и секций
  container: {
    xs: '1rem',
    sm: '1.5rem',
    md: '2rem',
    lg: '3rem',
    xl: '4rem',
  },
  
  // Отступы для элементов интерфейса
  element: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  
  // Отступы для горизонтальных списков и карточек
  listGap: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.25rem',
    xl: '1.5rem',
  },
};

/**
 * Константы для анимаций - можно использовать в компонентах
 */
export const transitions = {
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195,
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
};

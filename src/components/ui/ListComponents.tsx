import React from 'react';
import { styled } from '@mui/material/styles';
import MuiListItemButton from '@mui/material/ListItemButton';
import MuiListItemIcon from '@mui/material/ListItemIcon';
import MuiListItemText from '@mui/material/ListItemText';

interface CustomListItemProps {
  button?: boolean;
  key?: string;
  onClick?: () => void;
  selected?: boolean;
  children?: React.ReactNode;
  [key: string]: any;
}

// Стилизованная кнопка для пунктов меню с анимацией и современным дизайном
export const ListItemButton = styled(MuiListItemButton)(({ theme }) => ({
  padding: '10px 12px',
  borderRadius: '8px',
  margin: '2px 0',
  transition: 'all 0.2s ease-in-out',
  position: 'relative',
  '&.Mui-selected': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(63, 140, 255, 0.15)'
      : 'rgba(0, 110, 230, 0.08)',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark'
        ? 'rgba(63, 140, 255, 0.25)'
        : 'rgba(0, 110, 230, 0.12)',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      width: '4px',
      height: '70%',
      backgroundColor: theme.palette.primary.main,
      borderRadius: '0 4px 4px 0',
    },
  },
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.04)',
  },
}));

export const ListItemIcon = styled(MuiListItemIcon)(({ theme }) => ({
  color: theme.palette.text.secondary,
  minWidth: '42px',
  '.Mui-selected &': {
    color: theme.palette.primary.main,
  },
}));

export const ListItemText = styled(MuiListItemText)(({ theme }) => ({
  '.Mui-selected &': {
    '& .MuiTypography-root': {
      fontWeight: 600,
      color: theme.palette.primary.main,
    },
  },
}));

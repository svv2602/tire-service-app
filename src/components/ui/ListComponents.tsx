import React from 'react';
import { ListItem as MuiListItem } from '@mui/material';

interface CustomListItemProps {
  button?: boolean;
  key?: string;
  onClick?: () => void;
  selected?: boolean;
  children?: React.ReactNode;
  [key: string]: any;
}

export const ListItemButton: React.FC<CustomListItemProps> = ({ children, button, ...rest }) => {
  // Прокидываем button только если он явно задан
  // @ts-ignore - Игнорируем ошибки типизации, т.к. MUI имеет сложную типизацию
  return (
    <MuiListItem {...(button !== undefined ? { button } : {})} {...rest}>
      {children}
    </MuiListItem>
  );
};

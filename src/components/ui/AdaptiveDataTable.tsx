import React from 'react';
import { 
  Box, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, useMediaQuery, useTheme, Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Стилизованный контейнер для таблицы с улучшенной адаптивностью
const ResponsiveContainer = styled(Box)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  overflowX: 'auto',
  width: '100%',
  '& .MuiTable-root': {
    // Улучшаем компактность для мобильных устройств
    [theme.breakpoints.down('sm')]: {
      tableLayout: 'fixed',
      '& .MuiTableCell-root': {
        padding: theme.spacing(1),
      }
    }
  }
}));

const CardRow = styled(Box)(({ theme }) => ({
  display: 'none',
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1.5),
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  [theme.breakpoints.down('sm')]: {
    display: 'block',
  },
}));

const CardRowHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));

const CardRowContent = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  columnGap: theme.spacing(2),
  rowGap: theme.spacing(1),
}));

const CardRowLabel = styled(Typography)({
  fontWeight: 500,
  opacity: 0.8,
});

const CardRowValue = styled(Typography)({
  wordBreak: 'break-word',
});

const CardRowActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1.5),
  paddingTop: theme.spacing(1.5),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

interface DataTableProps {
  columns: {
    id: string;
    label: string;
    width?: string | number;
    hidden?: boolean; // Позволяет скрывать колонки на мобильных устройствах
    mobileLabel?: string; // Альтернативная метка для мобильного вида
    cellRenderer?: (value: any, row: any) => React.ReactNode; // Функция для рендеринга ячейки
  }[];
  data: any[];
  emptyMessage?: string;
  isLoading?: boolean;
  error?: string | null;
  primaryKeyField?: string;
  actionComponent?: (row: any) => React.ReactNode; // Компонент с действиями для строки
  stickyHeader?: boolean;
  size?: 'small' | 'medium';
  maxHeight?: number | string;
}

/**
 * Адаптивная таблица данных, которая автоматически переключается на карточный вид на мобильных устройствах
 */
const AdaptiveDataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  emptyMessage = 'Нет данных',
  isLoading,
  error,
  primaryKeyField = 'id',
  actionComponent,
  stickyHeader = false,
  size = 'medium',
  maxHeight,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Определяем видимые столбцы для мобильной версии (без hidden)
  const visibleColumns = columns.filter(col => !col.hidden || !isMobile);
  
  // Получаем заголовок для карточки (обычно первый элемент в строке)
  const getCardHeader = (row: any) => {
    const titleColumn = columns[0]; // Используем первую колонку как заголовок по умолчанию
    const value = row[titleColumn.id];
    return titleColumn.cellRenderer ? titleColumn.cellRenderer(value, row) : value;
  };

  // Рендер карточки для мобильных устройств
  const renderMobileCard = (row: any) => {
    return (
      <CardRow key={row[primaryKeyField]}>
        <CardRowHeader>
          <Typography variant="subtitle1" fontWeight="bold">
            {getCardHeader(row)}
          </Typography>
        </CardRowHeader>
        <CardRowContent>
          {visibleColumns.slice(1).map((column) => {
            const value = row[column.id];
            return (
              !column.hidden && (
                <React.Fragment key={column.id}>
                  <CardRowLabel variant="body2">
                    {column.mobileLabel || column.label}:
                  </CardRowLabel>
                  <CardRowValue variant="body2">
                    {column.cellRenderer ? column.cellRenderer(value, row) : value}
                  </CardRowValue>
                </React.Fragment>
              )
            );
          })}
        </CardRowContent>
        {actionComponent && (
          <CardRowActions>
            {actionComponent(row)}
          </CardRowActions>
        )}
      </CardRow>
    );
  };
  // Если загрузка или ошибка, возвращаем пустой каркас
  if (isLoading || error) return null;

  // Для мобильной версии рендерим карточки
  if (isMobile) {
    return (
      <Box>
        {data.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography>{emptyMessage}</Typography>
          </Box>
        ) : (
          data.map(renderMobileCard)
        )}
      </Box>
    );
  }  
    // Для десктопной версии рендерим обычную таблицу
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <ResponsiveContainer sx={{ maxHeight }}>
        <Table stickyHeader={stickyHeader} size={size}>
          <TableHead>
            <TableRow>
              {visibleColumns.map((column) => (
                <TableCell 
                  key={column.id} 
                  width={column.width}
                >
                  {column.label}
                </TableCell>
              ))}
              {actionComponent && (
                <TableCell align="right" width="120px">
                  Действия
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + (actionComponent ? 1 : 0)} align="center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row[primaryKeyField]} hover>
                  {visibleColumns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id}>
                        {column.cellRenderer ? column.cellRenderer(value, row) : value}
                      </TableCell>
                    );
                  })}
                  {actionComponent && (
                    <TableCell align="right">
                      {actionComponent(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ResponsiveContainer>
    </Paper>
  );
};

export default AdaptiveDataTable;

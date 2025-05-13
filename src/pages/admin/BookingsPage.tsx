import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Button,
  TablePagination,
  TextField,
  InputAdornment,
  CircularProgress,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  CheckCircle as CompletedIcon,
} from '@mui/icons-material';
import { format, parseISO, isValid } from 'date-fns';
import { ru } from 'date-fns/locale';
import { RootState } from '../../store';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { fetchBookings, updateBookingStatus } from '../../store/slices/bookingsSlice';
import BookingDetailsDialog from '../../components/bookings/BookingDetailsDialog';
import BookingEditDialog from '../../components/bookings/BookingEditDialog';

// Helper functions
const formatDate = (dateStr: string): string => {
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return 'Некорректная дата';
    return format(date, 'dd.MM.yyyy', { locale: ru });
  } catch (error) {
    return 'Некорректная дата';
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'Завершено';
    case 'confirmed':
      return 'Подтверждено';
    case 'pending':
      return 'Ожидает';
    case 'cancelled':
      return 'Отменено';
    default:
      return status;
  }
};

const getStatusColor = (status: string): "success" | "warning" | "error" | "default" | "primary" | "secondary" | "info" => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'confirmed':
      return 'primary';
    case 'pending':
      return 'warning';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const BookingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: bookings, isLoading, error } = useSelector((state: RootState) => state.bookings);
  
  // State for search and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // State for dialogs
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  // Load bookings data on component mount
  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  // Handle refresh of bookings data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(fetchBookings()).unwrap();
    } catch (error) {
      console.error('Error refreshing bookings:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await dispatch(updateBookingStatus({ id, status: newStatus })).unwrap();
      // Refresh the list to ensure we have the latest data
      dispatch(fetchBookings());
    } catch (error) {
      console.error('Failed to update booking status:', error);
      alert('Не удалось изменить статус записи. Попробуйте еще раз.');
    }
  };

  // Open dialogs
  const handleOpenDetailsDialog = (bookingId: number) => {
    setSelectedBookingId(bookingId);
    setDetailsDialogOpen(true);
  };

  const handleOpenEditDialog = (booking: any) => {
    setSelectedBooking(booking);
    setEditDialogOpen(true);
  };

  // Close dialogs
  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false);
    setSelectedBookingId(null);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedBooking(null);
  };

  // Handle booking update
  const handleSaveBooking = async (updatedBooking: any) => {
    try {
      // The bookingSlice updateBooking thunk will handle the API call
      await dispatch(updateBookingStatus({ 
        id: updatedBooking.id,
        status: updatedBooking.status
      })).unwrap();
      
      // Refresh the list to ensure we have the latest data
      dispatch(fetchBookings());
      handleCloseEditDialog();
    } catch (error) {
      console.error('Failed to update booking:', error);
      alert('Не удалось обновить запись. Попробуйте еще раз.');
    }
  };

  // Handle search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0); // Reset to first page when searching
  };

  // Handle pagination
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter bookings by search term
  const filteredBookings = bookings.filter((booking) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      booking.clientName?.toLowerCase().includes(searchLower) ||
      booking.phone?.toLowerCase().includes(searchLower) ||
      booking.carNumber?.toLowerCase().includes(searchLower) ||
      booking.vehicleBrand?.toLowerCase().includes(searchLower) ||
      booking.status?.toLowerCase().includes(searchLower)
    );
  });

  // Calculate pagination
  const paginatedBookings = filteredBookings.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Show loading state if data is still loading
  if (isLoading && bookings.length === 0) {
    return (
      <Box sx={{ padding: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h5" gutterBottom>
            Управление записями
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
          <Typography align="center">
            Загрузка данных...
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Show error state if there was an error
  if (error) {
    return (
      <Box sx={{ padding: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h5" gutterBottom>
            Управление записями
          </Typography>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />} 
            onClick={handleRefresh}
          >
            Попробовать снова
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Управление записями
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Обновление...' : 'Обновить'}
          </Button>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Поиск по имени клиента, телефону, номеру авто..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            size="small"
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Клиент</TableCell>
                <TableCell>Телефон</TableCell>
                <TableCell>Дата</TableCell>
                <TableCell>Время</TableCell>
                <TableCell>Номер авто</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    {searchTerm ? 'Нет результатов, соответствующих поиску' : 'Нет записей'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.id}</TableCell>
                    <TableCell>{booking.clientName}</TableCell>
                    <TableCell>{booking.phone}</TableCell>
                    <TableCell>{formatDate(booking.date)}</TableCell>
                    <TableCell>{booking.time}</TableCell>
                    <TableCell>{booking.carNumber}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(booking.status)} 
                        color={getStatusColor(booking.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Просмотр деталей">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleOpenDetailsDialog(booking.id)}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Редактировать">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleOpenEditDialog(booking)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        {booking.status === 'pending' && (
                          <Tooltip title="Подтвердить">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleStatusChange(booking.id, 'confirmed')}
                            >
                              <CheckIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                          <Tooltip title="Завершить">
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => handleStatusChange(booking.id, 'completed')}
                            >
                              <CompletedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {booking.status !== 'cancelled' && (
                          <Tooltip title="Отменить">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleStatusChange(booking.id, 'cancelled')}
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredBookings.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Строк на странице:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count}`}
        />
      </Paper>

      {/* Details Dialog */}
      {selectedBookingId && (
        <BookingDetailsDialog
          bookingId={selectedBookingId}
          open={detailsDialogOpen}
          onClose={handleCloseDetailsDialog}
        />
      )}

      {/* Edit Dialog */}
      {selectedBooking && (
        <BookingEditDialog
          booking={selectedBooking}
          open={editDialogOpen}
          onClose={handleCloseEditDialog}
          onSave={handleSaveBooking}
          servicePoints={[]} // You might want to load service points from the Redux store
        />
      )}
    </Box>
  );
};

export default BookingsPage;

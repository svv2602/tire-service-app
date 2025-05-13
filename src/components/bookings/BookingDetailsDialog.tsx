import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
  Divider,
  CircularProgress,
  Box,
} from '@mui/material';
import { format, isValid, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { RootState } from '../../store';
import { fetchBookingDetails } from '../../store/slices/bookingsSlice';
import BookingStatusHistory from './BookingStatusHistory';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { GridContainer, GridItem } from '../ui/GridComponents';

interface BookingDetailsDialogProps {
  bookingId: number;
  open: boolean;
  onClose: () => void;
}

// A safe date formatter that handles invalid dates
const safeFormatDate = (dateStr: string, timeStr: string | undefined): string => {
  try {
    // If dateStr is already a valid ISO string, use it directly
    let date: Date;
    
    if (timeStr) {
      // Try to create a valid date-time string
      date = new Date(`${dateStr}T${timeStr}`);
    } else {
      date = parseISO(dateStr);
    }
    
    // Validate the date is valid
    if (!isValid(date)) {
      return 'Некорректная дата';
    }
    
    return format(date, 'PPp', { locale: ru });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Некорректная дата';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Завершено';
    case 'pending':
      return 'Ожидает';
    case 'cancelled':
      return 'Отменено';
    default:
      return status;
  }
};

const getVehicleTypeLabel = (type: string) => {
  switch (type) {
    case 'passenger':
      return 'Легковой';
    case 'light_truck':
      return 'Легкогрузовой';
    case 'suv':
      return 'SUV';
    case 'off_road':
      return 'Внедорожник';
    default:
      return 'Неизвестный тип';
  }
};

const BookingDetailsDialog: React.FC<BookingDetailsDialogProps> = ({
  bookingId,
  open,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const { selectedBooking: booking, isLoading } = useSelector((state: RootState) => state.bookings);

  useEffect(() => {
    if (open && bookingId) {
      dispatch(fetchBookingDetails(bookingId));
    }
  }, [dispatch, open, bookingId]);

  if (!booking || isLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Детали записи #{booking.id}
        <Chip
          label={getStatusText(booking.status)}
          color={getStatusColor(booking.status) as any}
          size="small"
          sx={{ ml: 2 }}
        />
      </DialogTitle>
      <DialogContent>
        <GridContainer spacing={2}>
          <GridItem xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Дата и время
            </Typography>
            <Typography variant="body1">
              {safeFormatDate(booking.date, booking.time)}
            </Typography>
          </GridItem>
          <GridItem xs={12}>
            <Divider />
          </GridItem>
          <GridItem xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Клиент
            </Typography>
            <Typography variant="body1">{booking.clientName}</Typography>
          </GridItem>
          <GridItem xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Телефон
            </Typography>
            <Typography variant="body1">{booking.phone}</Typography>
          </GridItem>
          <GridItem xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Номер автомобиля
            </Typography>
            <Typography variant="body1">{booking.carNumber}</Typography>
          </GridItem>
          <GridItem xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Марка автомобиля
            </Typography>
            <Typography variant="body1">{booking.vehicleBrand || 'Не указано'}</Typography>
          </GridItem>
          <GridItem xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Тип автомобиля
            </Typography>
            <Typography variant="body1">{booking.vehicleType ? getVehicleTypeLabel(booking.vehicleType) : 'Не указано'}</Typography>
          </GridItem>
          <GridItem xs={12}>
            <Divider />
          </GridItem>
          <GridItem xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              История изменений
            </Typography>
            {booking.statusHistory && booking.statusHistory.length > 0 ? (
              <BookingStatusHistory history={booking.statusHistory} />
            ) : (
              <Typography variant="body2" color="text.secondary">
                История изменений отсутствует
              </Typography>
            )}
          </GridItem>
        </GridContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingDetailsDialog;
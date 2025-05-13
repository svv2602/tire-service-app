import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress, 
  Box, 
  IconButton,
  styled,
  Alert
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { TimeSlot, ServicePoint } from '../../types';
import { getServicePoint, getAvailableTimeSlots } from '../../services/api';
import BookingStepIndicator, { BookingStep } from '../../components/bookings/BookingStepIndicator';

// Вспомогательная функция для получения параметров URL
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// Стилизованные компоненты
const TimeButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0.5),
  minWidth: '100px',
  padding: theme.spacing(1, 2),
}));

const TimeSlotContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: theme.spacing(1)
}));

const TimeSelectionPage = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [servicePoint, setServicePoint] = useState<ServicePoint | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const query = useQuery();
  const servicePointId = query.get('servicePointId');
  const date = query.get('date');

  useEffect(() => {
    const fetchData = async () => {
      if (!servicePointId || !date) {
        setError('Необходимо указать сервисный центр и дату');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Получаем данные сервисного центра и доступные временные слоты параллельно
        const [spData, timeData] = await Promise.all([
          getServicePoint(Number(servicePointId)),
          getAvailableTimeSlots(Number(servicePointId), date)
        ]);
        
        setServicePoint(spData);
        setTimeSlots(timeData);
        
        // Если есть доступные временные слоты, выбираем первый доступный по умолчанию
        const availableSlot = timeData.find(slot => slot.is_available);
        if (availableSlot) {
          setSelectedTime(availableSlot.time);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Не удалось загрузить доступные временные слоты');
        setLoading(false);
      }
    };

    fetchData();
  }, [servicePointId, date]);

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleContinue = () => {
    if (selectedTime && servicePointId && date) {
      navigate(`/booking/appointment-form?servicePointId=${servicePointId}&date=${date}&time=${selectedTime}`);
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <>
        <BookingStepIndicator activeStep={BookingStep.TIME_SELECTION} />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <BookingStepIndicator activeStep={BookingStep.TIME_SELECTION} />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Typography color="error" align="center">
            {error}
          </Typography>
          <Box mt={2} display="flex" justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(-1)}
            >
              Вернуться к выбору даты
            </Button>
          </Box>
        </Container>
      </>
    );
  }

  return (
    <>
      <BookingStepIndicator activeStep={BookingStep.TIME_SELECTION} />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Выбор времени
          </Typography>
        </Box>

        {servicePoint && (
          <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {servicePoint.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {servicePoint.address}
            </Typography>
            <Typography variant="body2" mt={1}>
              Дата: {formatDate(date)}
            </Typography>
          </Paper>
        )}

        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom align="center">
            Доступное время
          </Typography>
          
          {timeSlots.length === 0 ? (
            <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
              Нет доступных временных слотов на выбранную дату. Пожалуйста, выберите другую дату.
            </Alert>
          ) : (
            <TimeSlotContainer>
              {timeSlots.map((slot) => (
                <TimeButton
                  key={slot.time}
                  variant={selectedTime === slot.time ? 'contained' : 'outlined'}
                  color={selectedTime === slot.time ? 'primary' : 'inherit'}
                  onClick={() => handleTimeSelect(slot.time)}
                  disabled={!slot.is_available}
                >
                  {slot.time}
                </TimeButton>
              ))}
            </TimeSlotContainer>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              disabled={!selectedTime}
              onClick={handleContinue}
            >
              Продолжить
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default TimeSelectionPage; 
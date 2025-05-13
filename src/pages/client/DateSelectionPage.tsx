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
import { AvailableDay, ServicePoint } from '../../types';
import { getAvailableDays, getServicePoint } from '../../services/api';
import BookingStepIndicator, { BookingStep } from '../../components/bookings/BookingStepIndicator';

// Вспомогательная функция для получения параметров URL
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// Стилизованные компоненты
const CalendarContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center'
}));

const DayButton = styled(Button)(({ theme }) => ({
  minWidth: '60px',
  minHeight: '60px',
  margin: theme.spacing(0.5),
  flexDirection: 'column',
  borderRadius: '8px',
}));

const DayNumber = styled(Typography)(({ theme }) => ({
  fontSize: '1.2rem',
  fontWeight: 'bold',
}));

const MonthName = styled(Typography)(({ theme }) => ({
  fontSize: '0.8rem',
}));

const DateSelectionPage = () => {
  const [availableDays, setAvailableDays] = useState<AvailableDay[]>([]);
  const [servicePoint, setServicePoint] = useState<ServicePoint | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const query = useQuery();
  const servicePointId = query.get('servicePointId');

  useEffect(() => {
    const fetchData = async () => {
      if (!servicePointId) {
        setError('Сервисный центр не указан');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Получаем данные сервисного центра и доступные даты параллельно
        const [spData, daysData] = await Promise.all([
          getServicePoint(Number(servicePointId)),
          getAvailableDays(Number(servicePointId))
        ]);
        
        setServicePoint(spData);
        setAvailableDays(daysData);
        
        // Если есть доступные даты, выбираем первую по умолчанию
        if (daysData.length > 0) {
          setSelectedDate(daysData[0].date);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Не удалось загрузить доступные даты');
        setLoading(false);
      }
    };

    fetchData();
  }, [servicePointId]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleContinue = () => {
    if (selectedDate && servicePointId) {
      navigate(`/booking/time-selection?servicePointId=${servicePointId}&date=${selectedDate}`);
    }
  };

  // Группировка дней по месяцам
  const daysByMonth = availableDays.reduce((acc, day) => {
    const key = `${day.month_name} ${day.year}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(day);
    return acc;
  }, {} as Record<string, AvailableDay[]>);

  if (loading) {
    return (
      <>
        <BookingStepIndicator activeStep={BookingStep.DATE_SELECTION} />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <BookingStepIndicator activeStep={BookingStep.DATE_SELECTION} />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Typography color="error" align="center">
            {error}
          </Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <BookingStepIndicator activeStep={BookingStep.DATE_SELECTION} />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Выбор даты
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
          </Paper>
        )}

        <Alert severity="info" sx={{ mb: 3 }}>
          Запись на шиномонтаж доступна начиная с даты через 2 недели от текущего дня
        </Alert>

        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom align="center">
            Доступные даты
          </Typography>
          
          {Object.keys(daysByMonth).length === 0 ? (
            <Typography align="center" sx={{ mt: 2 }}>
              Нет доступных дат для записи
            </Typography>
          ) : (
            Object.entries(daysByMonth).map(([monthYear, days]) => (
              <Box key={monthYear} mb={3}>
                <Typography variant="subtitle1" gutterBottom>
                  {monthYear}
                </Typography>
                <CalendarContainer>
                  {days.map((day) => (
                    <DayButton
                      key={day.date}
                      variant={selectedDate === day.date ? 'contained' : 'outlined'}
                      color={selectedDate === day.date ? 'primary' : 'inherit'}
                      onClick={() => handleDateSelect(day.date)}
                    >
                      <DayNumber>{day.day_number}</DayNumber>
                      <MonthName>{day.day_name}</MonthName>
                    </DayButton>
                  ))}
                </CalendarContainer>
              </Box>
            ))
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              disabled={!selectedDate}
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

export default DateSelectionPage; 
import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions,
  Button, 
  CircularProgress, 
  Chip,
  Divider,
  IconButton,
  Stack
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { ServicePoint } from '../../types';
import { getServicePointsByCity } from '../../services/api';
import BookingStepIndicator, { BookingStep } from '../../components/bookings/BookingStepIndicator';

// Вспомогательная функция для получения параметров URL
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ServicePointSelectionPage = () => {
  const [servicePoints, setServicePoints] = useState<ServicePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const query = useQuery();
  const city = query.get('city');

  useEffect(() => {
    const fetchServicePoints = async () => {
      if (!city) {
        setError('Город не указан');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getServicePointsByCity(city);
        setServicePoints(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching service points:', err);
        setError('Не удалось загрузить список сервисных центров');
        setLoading(false);
      }
    };

    fetchServicePoints();
  }, [city]);

  const handleServicePointSelect = (servicePoint: ServicePoint) => {
    navigate(`/booking/date-selection?servicePointId=${servicePoint.id}`);
  };

  const formatWorkingHours = (workingHours: any) => {
    if (!workingHours) return 'Нет информации';
    
    try {
      // Работаем с понедельником как примером
      const monday = workingHours.monday;
      if (monday === 'closed') return 'Пн-Пт: уточняйте часы работы';
      
      if (typeof monday === 'object' && monday.open && monday.close) {
        return `Пн-Пт: ${monday.open} - ${monday.close}`;
      }
      
      return 'Уточняйте часы работы';
    } catch (e) {
      return 'Уточняйте часы работы';
    }
  };

  if (loading) {
    return (
      <>
        <BookingStepIndicator activeStep={BookingStep.SERVICE_POINT_SELECTION} />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <BookingStepIndicator activeStep={BookingStep.SERVICE_POINT_SELECTION} />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography color="error" align="center">
            {error}
          </Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <BookingStepIndicator activeStep={BookingStep.SERVICE_POINT_SELECTION} />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={() => navigate('/booking')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Выбор сервисного центра
          </Typography>
        </Box>

        <Chip label={`г. ${city}`} color="primary" sx={{ mb: 3 }} />
        
        {servicePoints.length === 0 ? (
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography>
              В данном городе не найдено сервисных центров
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
            gap: 3 
          }}>
            {servicePoints.map((point) => (
              <Card key={point.id} elevation={3}>
                <CardMedia
                  component="div"
                  sx={{
                    height: 200,
                    bgcolor: 'grey.200',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="h6" color="text.secondary" align="center">
                    Шинный центр
                  </Typography>
                </CardMedia>
                <CardContent>
                  <Typography variant="h5" component="div" gutterBottom>
                    {point.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {point.address}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Часы работы: {formatWorkingHours(point.working_hours)}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    onClick={() => handleServicePointSelect(point)}
                  >
                    Выбрать
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </>
  );
};

export default ServicePointSelectionPage;
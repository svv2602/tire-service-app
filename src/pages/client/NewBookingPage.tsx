import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { 
  Container, 
  Paper, 
  Typography,
  Button, 
  TextField,
  Box,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import ServicePointsMap from '../../components/map/ServicePointsMap';
import { RootState } from '../../store';
import { fetchServicePoints } from '../../store/slices/servicePointsSlice';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { GridContainer, GridItem } from '../../components/ui/GridComponents';
import { ServicePoint } from '../../types/servicePoint';

const NewBookingPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: servicePoints, isLoading, error } = useSelector(
    (state: RootState) => state.servicePoints
  );
  
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [description, setDescription] = useState('');

  useEffect(() => {
    dispatch(fetchServicePoints());
    // Debug log moved here from JSX
    console.log('Service Points:', servicePoints);
  }, [dispatch, servicePoints]);

  // Transform API service points to map format
  const mapServicePoints = useMemo((): ServicePoint[] => {
    if (!servicePoints || !Array.isArray(servicePoints)) {
      console.log('No service points available or invalid format');
      return [];
    }
    
    return servicePoints
      .filter(point => 
        point && 
        point.lat != null && 
        point.lng != null &&
        !isNaN(Number(point.lat)) && 
        !isNaN(Number(point.lng))
      )
      .map(point => ({
        id: point.id,
        name: point.name || 'Без названия',
        address: point.address || 'Адрес не указан',
        lat: Number(point.lat),
        lng: Number(point.lng),
        region: point.region,
        city: point.city,
        partner_id: point.partner_id,
        phone: point.contact_info || 'Не указан',
        description: point.description || `Партнер #${point.partner_id}`,
        working_hours: point.working_hours,
        num_posts: point.num_posts
      }));
  }, [servicePoints]);

  // Log the count of points
  useEffect(() => {
    if (Array.isArray(servicePoints)) {
      const totalPoints = servicePoints.length;
      console.log(`Service points: ${totalPoints} total`);
      console.log(`Filtered for map: ${mapServicePoints.length} points`);
    }
  }, [servicePoints, mapServicePoints]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Добавить логику отправки формы
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Создание новой записи
      </Typography>
      
      {/* Debug information removed to fix TypeScript error */}
      
      <GridContainer spacing={3}>
        <GridItem xs={12} md={8}>
          <Paper sx={{ height: 400, mb: 3 }}>
            <ServicePointsMap
              servicePoints={mapServicePoints}
              selectedPoint={selectedPoint}
              onPointSelect={setSelectedPoint}
            />
          </Paper>
        </GridItem>
        
        <GridItem xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <Typography variant="h6" gutterBottom>
                Детали записи
              </Typography>
              
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                <DatePicker
                  label="Выберите дату"
                  value={selectedDate}
                  onChange={(newValue) => setSelectedDate(newValue)}
                  sx={{ mb: 2, width: '100%' }}
                />
                
                <TimePicker
                  label="Выберите время"
                  value={selectedTime}
                  onChange={(newValue) => setSelectedTime(newValue)}
                  sx={{ mb: 2, width: '100%' }}
                />
              </LocalizationProvider>
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Описание проблемы"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={!selectedPoint || !selectedDate || !selectedTime}
              >
                Создать запись
              </Button>
            </form>
          </Paper>
        </GridItem>
      </GridContainer>
    </Container>
  );
};

export default NewBookingPage;
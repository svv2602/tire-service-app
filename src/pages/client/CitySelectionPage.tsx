import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  CircularProgress, 
  Box 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getCities } from '../../services/api';
import BookingStepIndicator, { BookingStep } from '../../components/bookings/BookingStepIndicator';

const CitySelectionPage = () => {
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        const citiesData = await getCities();
        setCities(citiesData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching cities:', err);
        setError('Не удалось загрузить список городов');
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  const handleCitySelect = (city: string) => {
    navigate(`/booking/service-points?city=${encodeURIComponent(city)}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <>
      <BookingStepIndicator activeStep={BookingStep.CITY_SELECTION} />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Выберите город
          </Typography>
          
          {cities.length === 0 ? (
            <Typography align="center" sx={{ mt: 2 }}>
              Города не найдены
            </Typography>
          ) : (
            <List>
              {cities.map((city) => (
                <ListItem key={city} disablePadding divider>
                  <ListItemButton onClick={() => handleCitySelect(city)}>
                    <ListItemText primary={city} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Container>
    </>
  );
};

export default CitySelectionPage; 
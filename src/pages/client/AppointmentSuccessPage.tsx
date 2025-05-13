import React from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Button, 
  Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { green } from '@mui/material/colors';
import { CheckCircleOutline as CheckCircleOutlineIcon } from '@mui/icons-material';
import BookingStepIndicator, { BookingStep } from '../../components/bookings/BookingStepIndicator';

const AppointmentSuccessPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleNewBooking = () => {
    navigate('/booking');
  };

  return (
    <>
      <BookingStepIndicator activeStep={BookingStep.SUCCESS} />
      <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <CheckCircleOutlineIcon 
              sx={{ fontSize: 80, color: green[500], mb: 2 }} 
            />
            
            <Typography variant="h4" component="h1" gutterBottom>
              Ваша запись успешно оформлена!
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              Спасибо за ваше обращение. Данные о вашей записи отправлены на указанный номер телефона.
            </Typography>
            
            <Typography variant="body2" paragraph>
              Если у вас возникнут вопросы, пожалуйста, обратитесь в выбранный вами шиномонтажный центр.
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              onClick={handleNewBooking}
            >
              Сделать еще одну запись
            </Button>
            
            <Button 
              variant="outlined" 
              color="primary" 
              size="large"
              onClick={handleGoHome}
            >
              Вернуться на главную
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default AppointmentSuccessPage;
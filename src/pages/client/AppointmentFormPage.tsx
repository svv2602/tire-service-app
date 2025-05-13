import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  CircularProgress, 
  Box, 
  IconButton,
  Stack,
  FormControl,
  FormHelperText,
  Snackbar,
  Alert,
  MenuItem,
  InputAdornment
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { ServicePoint, ServiceData, vehicleTypeOptions, VehicleType } from '../../types';
import { getServicePoint, getServicesByServicePoint, createAppointment } from '../../services/api';
import BookingStepIndicator, { BookingStep } from '../../components/bookings/BookingStepIndicator';

// Вспомогательная функция для получения параметров URL
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// Интерфейс для формы
interface FormData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicleNumber: string;
  vehicleBrand: string;
  vehicleType: string;
  serviceId: string;
  comment: string;
}

const AppointmentFormPage = () => {
  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    vehicleNumber: '',
    vehicleBrand: '',
    vehicleType: '',
    serviceId: '',
    comment: ''
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [servicePoint, setServicePoint] = useState<ServicePoint | null>(null);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const query = useQuery();
  const servicePointId = query.get('servicePointId');
  const date = query.get('date');
  const time = query.get('time');

  useEffect(() => {
    const fetchData = async () => {
      if (!servicePointId || !date || !time) {
        setError('Необходимо указать сервисный центр, дату и время');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [spData, servicesData] = await Promise.all([
          getServicePoint(Number(servicePointId)),
          getServicesByServicePoint(Number(servicePointId))
        ]);
        
        setServicePoint(spData);
        setServices(servicesData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Не удалось загрузить данные');
        setLoading(false);
      }
    };

    fetchData();
  }, [servicePointId, date, time]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Очищаем ошибку при изменении поля
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Имя обязательно';
    }
    
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Телефон обязателен';
    } else if (!/^\+?380\d{9}$/.test(formData.customerPhone.replace(/\D/g, ''))) {
      newErrors.customerPhone = 'Неверный формат телефона. Используйте формат +380XXXXXXXXX';
    }
    
    if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Неверный формат email';
    }
    
    if (!formData.vehicleNumber.trim()) {
      newErrors.vehicleNumber = 'Номер автомобиля обязателен';
    }

    if (!formData.vehicleBrand.trim()) {
      newErrors.vehicleBrand = 'Марка автомобиля обязательна';
    }

    if (!formData.vehicleType) {
      newErrors.vehicleType = 'Тип автомобиля обязателен';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!servicePointId || !date || !time) {
      setError('Отсутствуют необходимые данные для бронирования');
      return;
    }
    
    try {
      setSubmitting(true);
      
      await createAppointment({
        service_point_id: Number(servicePointId),
        customer_name: formData.customerName,
        customer_phone: formData.customerPhone,
        customer_email: formData.customerEmail || undefined,
        appointment_date: date,
        appointment_time: time,
        service_id: formData.serviceId ? Number(formData.serviceId) : undefined,
        vehicle_brand: formData.vehicleBrand,
        vehicle_type: formData.vehicleType as VehicleType,
        comment: `${formData.vehicleNumber}${formData.comment ? ` - ${formData.comment}` : ''}`
      });
      
      setSuccess(true);
      
      // Переход на страницу успешной записи через 2 секунды
      setTimeout(() => {
        navigate('/booking/success');
      }, 2000);
      
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError('Не удалось создать запись. Пожалуйста, попробуйте еще раз.');
    } finally {
      setSubmitting(false);
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
        <BookingStepIndicator activeStep={BookingStep.APPOINTMENT_FORM} />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (error && !success) {
    return (
      <>
        <BookingStepIndicator activeStep={BookingStep.APPOINTMENT_FORM} />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error" align="center" gutterBottom>
              {error}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate(-1)}
              sx={{ mt: 2 }}
            >
              Вернуться к выбору времени
            </Button>
          </Paper>
        </Container>
      </>
    );
  }

  return (
    <>
      <BookingStepIndicator activeStep={BookingStep.APPOINTMENT_FORM} />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Оформление записи
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
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="body2">
                Дата: {formatDate(date)}
              </Typography>
              <Typography variant="body2">
                Время: {time}
              </Typography>
            </Box>
          </Paper>
        )}

        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom align="center">
            Данные для записи
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <FormControl fullWidth error={!!errors.customerName}>
                <TextField
                  label="Имя *"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.customerName}
                />
                {errors.customerName && (
                  <FormHelperText>{errors.customerName}</FormHelperText>
                )}
              </FormControl>

              <FormControl fullWidth error={!!errors.customerPhone}>
                <TextField
                  label="Телефон *"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  fullWidth
                  placeholder="+380"
                  InputProps={{
                    startAdornment: formData.customerPhone ? null : (
                      <InputAdornment position="start">+380</InputAdornment>
                    ),
                  }}
                  error={!!errors.customerPhone}
                />
                {errors.customerPhone && (
                  <FormHelperText>{errors.customerPhone}</FormHelperText>
                )}
              </FormControl>

              <FormControl fullWidth error={!!errors.customerEmail}>
                <TextField
                  label="Email"
                  name="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.customerEmail}
                />
                {errors.customerEmail && (
                  <FormHelperText>{errors.customerEmail}</FormHelperText>
                )}
              </FormControl>

              <FormControl fullWidth error={!!errors.vehicleNumber}>
                <TextField
                  label="Номер автомобиля *"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.vehicleNumber}
                />
                {errors.vehicleNumber && (
                  <FormHelperText>{errors.vehicleNumber}</FormHelperText>
                )}
              </FormControl>

              <FormControl fullWidth error={!!errors.vehicleBrand}>
                <TextField
                  label="Марка автомобиля *"
                  name="vehicleBrand"
                  value={formData.vehicleBrand}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.vehicleBrand}
                />
                {errors.vehicleBrand && (
                  <FormHelperText>{errors.vehicleBrand}</FormHelperText>
                )}
              </FormControl>

              <FormControl fullWidth error={!!errors.vehicleType}>
                <TextField
                  select
                  label="Тип автомобиля *"
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.vehicleType}
                >
                  <MenuItem value="">
                    <em>Выберите тип автомобиля</em>
                  </MenuItem>
                  {vehicleTypeOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                {errors.vehicleType && (
                  <FormHelperText>{errors.vehicleType}</FormHelperText>
                )}
              </FormControl>

              {services.length > 0 && (
                <FormControl fullWidth>
                  <TextField
                    select
                    label="Услуга"
                    name="serviceId"
                    value={formData.serviceId}
                    onChange={handleChange}
                    fullWidth
                  >
                    <MenuItem value="">
                      <em>Выберите услугу</em>
                    </MenuItem>
                    {services.map((service) => (
                      <MenuItem key={service.id} value={service.id.toString()}>
                        {service.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </FormControl>
              )}

              <TextField
                label="Комментарий"
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={submitting}
              >
                {submitting ? <CircularProgress size={24} /> : 'Записаться'}
              </Button>
            </Stack>
          </form>
        </Paper>

        <Snackbar 
          open={success} 
          autoHideDuration={6000} 
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" sx={{ width: '100%' }}>
            Запись успешно создана! Перенаправление...
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default AppointmentFormPage; 
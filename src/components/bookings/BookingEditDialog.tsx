import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  CircularProgress,
  FormHelperText,
  Typography,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  OutlinedInput,
  InputAdornment,
  Paper,
  IconButton
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { ru } from 'date-fns/locale';
import { format, parse, isValid } from 'date-fns';
import { vehicleTypeOptions } from '../../types';
import { getAvailableTimeSlots, updateBooking } from '../../services/api';
import { TimeSlot, ServicePoint } from '../../types';
import { AccessTime as AccessTimeIcon, Place as PlaceIcon, Store as StoreIcon, Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';
import { getServicePoint } from '../../services/api';

interface BookingEditDialogProps {
  booking: any;
  open: boolean;
  onClose: () => void;
  onSave: (booking: any) => void;
  existingBookings?: any[]; // Add existing bookings for the currently selected day
  servicePoints?: any[]; // Add service points for fallback
}

interface FormDataType {
  id: number;
  clientName: string;
  phone: string;
  carNumber: string;
  vehicleBrand: string;
  vehicleType: string;
  date: Date;
  time: string;
  status: string;
  servicePointId: number;
}

interface ErrorsType {
  clientName?: string;
  phone?: string;
  carNumber?: string;
  vehicleBrand?: string;
  vehicleType?: string;
  date?: string;
  time?: string;
  servicePointId?: string;
}

const BookingEditDialog: React.FC<BookingEditDialogProps> = ({
  booking,
  open,
  onClose,
  onSave,
  existingBookings = [],
  servicePoints = []
}) => {
  // Add status normalization function at the beginning of the component
  const normalizeStatus = (status: string | undefined): string => {
    if (!status) return 'pending';
    
    // Normalize status values between backend and frontend
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'подтверждено':
        return 'confirmed';
      case 'completed':
      case 'завершено':
        return 'completed';
      case 'cancelled':
      case 'отменено':
        return 'cancelled';
      case 'pending':
      case 'ожидает':
      default:
        return 'pending';
    }
  };

  const [formData, setFormData] = useState<FormDataType>({
    id: booking?.id || 0,
    clientName: booking?.clientName || '',
    phone: booking?.phone || '',
    carNumber: booking?.carNumber || '',
    vehicleBrand: booking?.vehicleBrand || '',
    vehicleType: booking?.vehicleType || '',
    date: booking?.date ? new Date(booking.date) : new Date(),
    time: booking?.time || '',
    status: normalizeStatus(booking?.status),
    servicePointId: booking?.servicePointId || 0
  });
  const [errors, setErrors] = useState<ErrorsType>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
  const [servicePoint, setServicePoint] = useState<ServicePoint | null>(null);
  const [isLoadingServicePoint, setIsLoadingServicePoint] = useState(false);
  const [isUsingDefaultSlots, setIsUsingDefaultSlots] = useState(false);
  
  // Add a state to track the total number of service posts at the service point
  const [totalServicePosts, setTotalServicePosts] = useState<number>(4); // Default to 4 posts
  // Add a state to track bookings by time slot for calculation
  const [bookingsByTimeSlot, setBookingsByTimeSlot] = useState<Record<string, number>>({});

  // Add a new state to track if time slots should be visible
  const [showTimeSlots, setShowTimeSlots] = useState(false);

  // Add a new state to track save error
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch service point details when dialog opens
  useEffect(() => {
    const fetchServicePointDetails = async () => {
      // Проверяем, что servicePointId существует и не undefined
      if (booking?.servicePointId === undefined) {
        console.error('Booking has no servicePointId:', booking);
        return;
      }
      
      try {
        setIsLoadingServicePoint(true);
        console.log('Fetching service point details for ID:', booking.servicePointId);
        
        // Важно: точка обслуживания должна всегда существовать для записи
        // Удаляем специальную обработку для ID=0
        const spData = await getServicePoint(booking.servicePointId);
        
        if (!spData) {
          console.error('Failed to fetch service point data. Response was empty or null.');
          // Создаем резервные данные в случае ошибки
          const fallbackServicePoint = {
            id: booking.servicePointId,
            name: `Точка обслуживания ${booking.servicePointId}`,
            address: '',
            city: '',
            total_posts: 4,
          } as unknown as ServicePoint; // Используем двойное приведение типов
          setServicePoint(fallbackServicePoint);
          setTotalServicePosts(4);
          return;
        }
        
        console.log('Successfully fetched service point data:', spData);
        setServicePoint(spData);
        
        // Set the total number of service posts
        setTotalServicePosts(spData.total_posts || 4);
      } catch (error) {
        console.error('Error fetching service point details:', error);
        // В случае ошибки создаем резервные данные
        const errorServicePoint = {
          id: booking.servicePointId,
          name: `Точка ${booking.servicePointId} (данные недоступны)`,
          address: '',
          city: '',
          total_posts: 4,
        } as unknown as ServicePoint; // Используем двойное приведение типов
        setServicePoint(errorServicePoint);
        setTotalServicePosts(4);
      } finally {
        setIsLoadingServicePoint(false);
      }
    };
    
    if (open && booking?.servicePointId !== undefined) {
      console.log('Dialog opened with booking:', booking);
      fetchServicePointDetails();
    }
  }, [booking?.servicePointId, open]);

  // Calculate bookings by time slot
  useEffect(() => {
    if (existingBookings && existingBookings.length > 0 && formData.date) {
      const formattedDate = format(formData.date, 'yyyy-MM-dd');
      
      // Count bookings for each time slot on the selected date and for the selected service point
      const bookingCounts: Record<string, number> = {};
      
      existingBookings.forEach(booking => {
        // Skip the current booking being edited to avoid counting it twice
        if (booking.id === formData.id) return;
        
        // Only count bookings for the current date AND the current service point
        if (booking.date === formattedDate && booking.servicePointId === formData.servicePointId) {
          const time = booking.time;
          bookingCounts[time] = (bookingCounts[time] || 0) + 1;
        }
      });
      
      console.log('Calculated bookings by time slot for service point', formData.servicePointId, ':', bookingCounts);
      setBookingsByTimeSlot(bookingCounts);
    } else {
      setBookingsByTimeSlot({});
    }
  }, [existingBookings, formData.date, formData.id, formData.servicePointId]);

  useEffect(() => {
    if (booking) {
      console.log('BookingEditDialog: Обновляем данные формы из пропсов:', booking);
      
      // Убедимся, что все поля правильно заполнены и глубоко копируем объект
      const updatedFormData = {
        id: booking.id || 0,
        clientName: booking.clientName || '',
        phone: booking.phone || '',
        carNumber: booking.carNumber || '',
        vehicleBrand: booking.vehicleBrand || '',
        vehicleType: booking.vehicleType || '',
        date: booking.date ? new Date(booking.date) : new Date(),
        time: booking.time || '',
        status: normalizeStatus(booking.status),
        // В любом случае используем реальный ID сервисной точки, 0 недопустим
        servicePointId: booking.servicePointId !== undefined && booking.servicePointId > 0 
          ? booking.servicePointId 
          : (servicePoints && servicePoints.length > 0 ? servicePoints[0].id : 1)
      };
      
      console.log('BookingEditDialog: Данные формы после обновления:', updatedFormData);
      setFormData(updatedFormData);
      
      setErrors({});
      
      // Fetch time slots for the current booking date when dialog opens
      if ((updatedFormData.servicePointId !== undefined) && booking.date) {
        const fetchInitialTimeSlots = async () => {
          try {
            setIsLoadingTimeSlots(true);
            const slots = await getAvailableTimeSlots(updatedFormData.servicePointId, booking.date);
            
            // Add the current booking time as available if it's not in the list
            // This ensures the current time is always selectable
            const currentTimeExists = slots.some(slot => slot.time === booking.time);
            if (!currentTimeExists && booking.time) {
              slots.push({
                time: booking.time,
                is_available: true,
                available_posts: 1
              });
              // Sort slots by time
              slots.sort((a, b) => a.time.localeCompare(b.time));
            }
            
            setTimeSlots(slots);
          } catch (error) {
            console.error("Error fetching initial time slots:", error);
          } finally {
            setIsLoadingTimeSlots(false);
          }
        };
        
        fetchInitialTimeSlots();
      }
    }
  }, [booking]);

  // Fetch available time slots when date changes
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!formData.servicePointId || !isValid(formData.date)) {
        console.log('Skipping time slots fetch: invalid servicePointId or date', { 
          servicePointId: formData.servicePointId, 
          date: formData.date 
        });
        // Set default time slots even when skipping fetch
        setTimeSlots(generateDefaultTimeSlots());
        return;
      }

      try {
        setIsLoadingTimeSlots(true);
        const formattedDate = format(formData.date, 'yyyy-MM-dd');
        console.log('Fetching time slots for', { 
          servicePointId: formData.servicePointId, 
          date: formattedDate 
        });
        
        // Add a small delay to ensure UI feedback
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const slots = await getAvailableTimeSlots(formData.servicePointId, formattedDate);
        console.log('Received time slots:', slots);
        
        if (!slots || !Array.isArray(slots) || slots.length === 0) {
          console.log('No slots returned or invalid response, using defaults');
          setTimeSlots(generateDefaultTimeSlots());
          return;
        }
        
        // Add the current booking time as available if it's not in the list and it's selected
        const currentTimeExists = slots.some(slot => slot.time === formData.time);
        if (!currentTimeExists && formData.time) {
          console.log('Adding current time to available slots:', formData.time);
          slots.push({
            time: formData.time,
            is_available: true,
            available_posts: 1
          });
          // Sort slots by time
          slots.sort((a, b) => a.time.localeCompare(b.time));
        }
        
        setIsUsingDefaultSlots(false);
        setTimeSlots(slots);
      } catch (error) {
        console.error("Error fetching time slots:", error);
        // In case of error, create some default time slots to prevent "no available time"
        setTimeSlots(generateDefaultTimeSlots());
      } finally {
        setIsLoadingTimeSlots(false);
      }
    };

    fetchTimeSlots();
  }, [formData.date, formData.servicePointId, formData.time]);

  // Generate default time slots if API fails
  const generateDefaultTimeSlots = (): TimeSlot[] => {
    console.log('Generating default time slots');
    setIsUsingDefaultSlots(true);
    const slots: TimeSlot[] = [];
    
    // Get current total service posts
    const totalPosts = totalServicePosts || 4;
    console.log('Total service posts for default slots:', totalPosts);
    
    // Generate time slots from 9:00 to 18:00 with 30-minute intervals
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute of [0, 30]) {
        // Skip 18:30
        if (hour === 18 && minute === 30) continue;
        
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Get actual bookings count for this time
        const bookingsCount = bookingsByTimeSlot[time] || 0;
        
        // Calculate available posts by subtracting bookings from total posts
        const availablePosts = Math.max(0, totalPosts - bookingsCount);
        
        // A slot is available if there are posts available
        const isAvailable = availablePosts > 0;
        
        slots.push({
          time,
          is_available: isAvailable,
          available_posts: availablePosts
        });
      }
    }
    
    // Sort by time
    slots.sort((a, b) => a.time.localeCompare(b.time));
    
    // If there's a current time selected, make sure it's always available for the current booking
    if (formData.time && !slots.some(slot => slot.time === formData.time && slot.is_available)) {
      const existingSlot = slots.find(slot => slot.time === formData.time);
      
      if (existingSlot) {
        // Update the existing slot to be available for the current booking
        existingSlot.is_available = true;
        // Fix the TypeScript error by providing a default value of 0 for available_posts if it's undefined
        existingSlot.available_posts = Math.max(1, existingSlot.available_posts || 0);
      } else {
        // Add a new slot if the current time doesn't exist
        slots.push({
          time: formData.time,
          is_available: true,
          available_posts: 1
        });
        // Sort again after adding the new slot
        slots.sort((a, b) => a.time.localeCompare(b.time));
      }
    }
    
    console.log('Generated default time slots with calculated availability:', slots);
    return slots;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    console.log(`BookingEditDialog: Изменено поле ${name}, новое значение:`, value);
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is updated
    if (errors[name as keyof ErrorsType]) {
      setErrors((prev: ErrorsType) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleDateChange = (newDate: Date | null) => {
    if (newDate) {
      setFormData(prev => ({ ...prev, date: newDate, time: '' })); // Reset time when date changes
      if (errors.date) {
        setErrors((prev: ErrorsType) => ({ ...prev, date: undefined }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: ErrorsType = {};
    
    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Имя клиента обязательно';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Телефон обязателен';
    } else if (!/^\+?\d{10,13}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Неверный формат телефона';
    }
    
    if (!formData.carNumber.trim()) {
      newErrors.carNumber = 'Номер автомобиля обязателен';
    }

    if (!formData.time) {
      newErrors.time = 'Время записи обязательно';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Validate required fields
    const newErrors: ErrorsType = {};
    
    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Имя клиента обязательно';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Телефон обязателен';
    } else if (!/^\+?\d{10,13}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Неверный формат телефона';
    }
    
    if (!formData.carNumber.trim()) {
      newErrors.carNumber = 'Номер автомобиля обязателен';
    }
    
    if (!formData.time) {
      newErrors.time = 'Время обязательно';
    }
    
    if (!isValid(formData.date)) {
      newErrors.date = 'Дата обязательна';
    }
    
    if (!formData.servicePointId) {
      newErrors.servicePointId = 'Точка обслуживания обязательна';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.error("Validation errors:", newErrors);
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Преобразование даты в формат YYYY-MM-DD для API
      const formattedDate = formData.date instanceof Date
        ? format(formData.date, 'yyyy-MM-dd')
        : typeof formData.date === 'string'
          ? formData.date
          : format(new Date(), 'yyyy-MM-dd');
      
      // Создаем полный объект бронирования с дублирующимися полями для совместимости 
      // с обоими форматами данных (фронтенд и бэкенд)
      const bookingData = {
        // ID записи должен быть числом
        id: Number(formData.id),
        
        // Поля в формате фронтенда
        clientName: formData.clientName.trim(),
        phone: formData.phone.trim(),
        carNumber: formData.carNumber.trim(),
        vehicleBrand: formData.vehicleBrand || '',
        vehicleType: formData.vehicleType || '',
        date: formattedDate,
        time: formData.time,
        status: formData.status || 'pending',
        servicePointId: Number(formData.servicePointId),
        
        // Дублирующие поля в формате бэкенда для совместимости
        full_name: formData.clientName.trim(),
        car_number: formData.carNumber.trim(),
        service_point_id: Number(formData.servicePointId),
        vehicle_brand: formData.vehicleBrand || '',
        vehicle_type: formData.vehicleType || '',
        appointment_date: formattedDate,
        appointment_time: formData.time,
        booking_status: formData.status || 'pending'
      };
      
      console.log("Данные для обновления записи:", JSON.stringify(bookingData, null, 2));
      
      // Отправляем сохранение в родительский компонент
      onSave(bookingData);
      
      setIsSubmitting(false);
      
      // Закрываем диалог после успешного сохранения
      onClose();
    } catch (error) {
      console.error("Error saving booking:", error);
      setIsSubmitting(false);
      setSaveError("Не удалось сохранить запись. Попробуйте еще раз.");
    }
  };

  // Calculate available posts for each time slot
  const getCalculatedAvailablePosts = (slot: TimeSlot): number => {
    // If the slot is not available, return 0
    if (!slot.is_available) return 0;
    
    // Get the bookings count for this time slot
    const bookingsCount = bookingsByTimeSlot[slot.time] || 0;
    
    // If it's the current booking time, we don't count it against the total
    const isCurrentBookingTime = formData.time === slot.time;
    
    // Use a default of 4 if totalServicePosts is somehow undefined
    const defaultTotalPosts = 4;
    
    // Start with either the slot's available posts from API or use the totalServicePosts with a default
    const baseAvailablePosts = (slot.available_posts !== undefined) 
      ? slot.available_posts 
      : (totalServicePosts ?? defaultTotalPosts);
    
    // If this is the current booking's time, ensure there's at least 1 post available
    if (isCurrentBookingTime) {
      return Math.max(1, baseAvailablePosts);
    }
    
    // Return the calculated available posts (never less than 0)
    return Math.max(0, baseAvailablePosts);
  };

  // Calculate available posts for each time
  const getAvailablePostsInfo = (slot: TimeSlot) => {
    if (!slot.is_available) return "Нет свободных постов";
    
    const availablePosts = getCalculatedAvailablePosts(slot);
    
    if (availablePosts <= 0 && formData.time !== slot.time) {
      return "Нет свободных постов";
    } else if (availablePosts <= 0 && formData.time === slot.time) {
      return "Текущая запись";
    }
    
    return `Свободно постов: ${availablePosts}`;
  };

  // Add a handler for directly selecting a time from the list
  const handleTimeSelect = (time: string) => {
    if (isLoadingTimeSlots) return;
    
    // Find the slot to check if it's available
    const slot = timeSlots.find(s => s.time === time);
    
    if (!slot) return;
    
    const calculatedPosts = getCalculatedAvailablePosts(slot);
    
    // Check if this time slot is actually available or if it's the current booking time
    const isAvailable = 
      (calculatedPosts > 0 || formData.time === time) && 
      slot.is_available;
    
    if (isAvailable) {
      setFormData(prev => ({ ...prev, time }));
      if (errors.time) {
        setErrors(prev => ({ ...prev, time: undefined }));
      }
      setShowTimeSlots(false); // Hide time slots after selection
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box>
          <Typography variant="h6" component="div" gutterBottom>
            Редактирование записи #{booking?.id}
          </Typography>
          
          {isLoadingServicePoint ? (
            <Box display="flex" alignItems="center" my={1}>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Загрузка данных точки обслуживания...
              </Typography>
            </Box>
          ) : servicePoint ? (
            <Paper variant="outlined" sx={{ p: 1.5, mt: 1, mb: 0.5, bgcolor: 'background.default' }}>
              <Box display="flex" alignItems="flex-start">
                <StoreIcon color="primary" sx={{ mr: 1, mt: 0.3 }} fontSize="small" />
                <Box>
                  <Typography variant="subtitle1" component="div" fontWeight="medium" color="primary.main">
                    {servicePoint.name}
                  </Typography>
                  {servicePoint.address && (
                    <Box display="flex" alignItems="center" mt={0.5}>
                      <PlaceIcon color="action" fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {servicePoint.address}
                      </Typography>
                    </Box>
                  )}
                  {servicePoint.total_posts && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Количество постов: {servicePoint.total_posts}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          ) : (
            <Paper variant="outlined" sx={{ p: 1.5, mt: 1, mb: 0.5, bgcolor: 'error.light' }}>
              <Box display="flex" alignItems="center">
                <StoreIcon color="error" sx={{ mr: 1 }} fontSize="small" />
                <Typography variant="body2" color="error">
                  Не удалось загрузить данные точки обслуживания
                </Typography>
              </Box>
            </Paper>
          )}
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                <FormControl fullWidth error={!!errors.clientName}>
                  <TextField
                    label="Имя клиента *"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.clientName}
                  />
                  {errors.clientName && (
                    <FormHelperText>{errors.clientName}</FormHelperText>
                  )}
                </FormControl>
              </Box>
              
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                <FormControl fullWidth error={!!errors.phone}>
                  <TextField
                    label="Телефон *"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.phone}
                  />
                  {errors.phone && (
                    <FormHelperText>{errors.phone}</FormHelperText>
                  )}
                </FormControl>
              </Box>
              
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                <FormControl fullWidth error={!!errors.carNumber}>
                  <TextField
                    label="Номер автомобиля *"
                    name="carNumber"
                    value={formData.carNumber}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.carNumber}
                  />
                  {errors.carNumber && (
                    <FormHelperText>{errors.carNumber}</FormHelperText>
                  )}
                </FormControl>
              </Box>
              
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                <FormControl fullWidth>
                  <TextField
                    label="Марка автомобиля"
                    name="vehicleBrand"
                    value={formData.vehicleBrand || ''}
                    onChange={handleChange}
                    fullWidth
                    placeholder="Введите марку автомобиля"
                  />
                </FormControl>
              </Box>
              
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                <FormControl fullWidth>
                  <InputLabel id="vehicle-type-label">Тип автомобиля</InputLabel>
                  <Select
                    labelId="vehicle-type-label"
                    name="vehicleType"
                    value={formData.vehicleType || ''}
                    onChange={handleChange as any}
                    label="Тип автомобиля"
                  >
                    <MenuItem value="">
                      <em>Не указано</em>
                    </MenuItem>
                    {vehicleTypeOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Статус</InputLabel>
                  <Select
                    labelId="status-label"
                    name="status"
                    value={formData.status}
                    onChange={handleChange as any}
                    label="Статус"
                  >
                    {/* Map confirmed status to pending when displaying in dropdown */}
                    <MenuItem value="pending">Ожидает</MenuItem>
                    <MenuItem value="confirmed">Подтверждено</MenuItem>
                    <MenuItem value="completed">Завершено</MenuItem>
                    <MenuItem value="cancelled">Отменено</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                <DatePicker
                  label="Дата записи"
                  value={formData.date}
                  onChange={(newDate) => {
                    handleDateChange(newDate);
                    setShowTimeSlots(true); // Show time slots when date changes
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.date,
                      onClick: () => setShowTimeSlots(true), // Show time slots when clicking the text field
                    },
                    // Add a prop for the day button to show time slots when a date is selected
                    day: {
                      onClick: () => setShowTimeSlots(true),
                    }
                  }}
                />
                {errors.date && (
                  <FormHelperText error>{errors.date}</FormHelperText>
                )}
              </Box>
              
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                <FormControl fullWidth error={!!errors.time}>
                  <TextField
                    label="Выбранное время *"
                    value={formData.time || 'Время не выбрано'}
                    InputProps={{
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccessTimeIcon color={formData.time ? "primary" : "disabled"} />
                        </InputAdornment>
                      ),
                    }}
                    fullWidth
                    error={!!errors.time}
                    helperText={errors.time || "Выберите время из доступных слотов ниже"}
                    onClick={() => setShowTimeSlots(true)} // Show time slots when clicked
                  />
                </FormControl>
              </Box>
              
              {/* Visual time slot selector for clicking directly */}
              {showTimeSlots && (
                <Box sx={{ flex: '1 1 100%', mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                      Выберите время
                    </Typography>
                    <IconButton size="small" onClick={() => setShowTimeSlots(false)}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  {isUsingDefaultSlots && (
                    <Typography color="warning.main" variant="caption" sx={{ display: 'block', mb: 1 }}>
                      Используются примерные данные о доступном времени
                    </Typography>
                  )}
                  {isLoadingTimeSlots ? (
                    <Box display="flex" alignItems="center" justifyContent="center" py={3} border="1px dashed #e0e0e0" borderRadius={1}>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      <Typography variant="body2">Загрузка доступного времени...</Typography>
                    </Box>
                  ) : (
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 1,
                        maxHeight: '300px',
                        overflowY: 'auto',
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        p: 1,
                      }}
                    >
                      {timeSlots.map(slot => {
                        // Calculate actual available posts for this slot
                        const calculatedPosts = getCalculatedAvailablePosts(slot);
                        
                        // A slot is only available if it has at least one post available
                        // or if it's the current booking's time slot
                        const isActuallyAvailable = 
                          (calculatedPosts > 0 || formData.time === slot.time) && 
                          slot.is_available;
                        
                        // Determine the color based on availability and current selection
                        const chipColor = !isActuallyAvailable ? "error" : 
                                         (formData.time === slot.time) ? "primary" : 
                                         (calculatedPosts === 0) ? "warning" : "success";
                        
                        // Background color when selected
                        const bgColor = formData.time === slot.time ? '#e3f2fd' : 'transparent';
                        
                        return (
                          <Box 
                            key={slot.time}
                            onClick={() => handleTimeSelect(slot.time)}
                            sx={{
                              width: 'calc(20% - 8px)',
                              minWidth: '100px',
                              bgcolor: bgColor,
                              border: formData.time === slot.time ? '2px solid #2196f3' : '1px solid #e0e0e0',
                              borderRadius: 1,
                              p: 1,
                              cursor: isActuallyAvailable ? 'pointer' : 'not-allowed',
                              opacity: isActuallyAvailable ? 1 : 0.6,
                              transition: 'all 0.2s',
                              '&:hover': {
                                boxShadow: isActuallyAvailable ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                bgcolor: isActuallyAvailable ? (formData.time === slot.time ? '#bbdefb' : '#f5f5f5') : bgColor
                              }
                            }}
                          >
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                textAlign: 'center',
                                fontWeight: formData.time === slot.time ? 'bold' : 'normal'
                              }}
                            >
                              {slot.time}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                              <Chip 
                                label={getAvailablePostsInfo(slot)}
                                color={chipColor}
                                size="small"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                  {!isLoadingTimeSlots && timeSlots.length === 0 && (
                    <Typography color="error">Ошибка загрузки времени</Typography>
                  )}
                </Box>
              )}
            </Box>
          </LocalizationProvider>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Отмена
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary" 
          disabled={isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'Сохранить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingEditDialog; 
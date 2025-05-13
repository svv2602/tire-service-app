import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Box, 
  Chip, 
  FormControl, 
  InputLabel, 
  MenuItem, 
  OutlinedInput, 
  Select, 
  SelectChangeEvent,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  TextField,
  IconButton,
  Paper,
  Divider,
  Tooltip,
  Button
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon, Comment as CommentIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { RootState } from '../../store';
import { fetchServices, Service } from '../../store/slices/servicesSlice';
import { useAppDispatch } from '../../hooks/useAppDispatch';

export interface ServiceWithComment {
  service_id: number;
  comment?: string;
}

interface ServiceSelectorProps {
  selectedServices: ServiceWithComment[];
  onChange: (services: ServiceWithComment[]) => void;
  disabled?: boolean;
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({ 
  selectedServices = [],
  onChange,
  disabled = false
}) => {
  const dispatch = useAppDispatch();
  const { items: services, isLoading, error } = useSelector((state: RootState) => state.services);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [commentMode, setCommentMode] = useState<{serviceId: number, comment: string, isNew: boolean} | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);

  // Safeguard to handle undefined selectedServices
  const safeSelectedServices = Array.isArray(selectedServices) ? selectedServices : [];

  // Debugging - log whenever props change
  useEffect(() => {
    console.log('ServiceSelector received selectedServices:', safeSelectedServices);
  }, [selectedServices]);

  // Load services when component mounts
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoadingStatus('Загрузка услуг...');
        console.log('Loading services in ServiceSelector...');
        
        // Force reload services every time to ensure we have the latest data
        await dispatch(fetchServices()).unwrap();
        setLoadingStatus(null);
        
        console.log('Services loaded successfully:', services.length, 'services');
      } catch (error) {
        console.error('Failed to load services:', error);
        setLoadingStatus('Ошибка загрузки услуг. Попробуйте обновить страницу.');
      }
    };
    
    loadServices();
  }, [dispatch]);

  const handleRefreshServices = async () => {
    try {
      setLoadingStatus('Обновление списка услуг...');
      await dispatch(fetchServices()).unwrap();
      setLoadingStatus(null);
    } catch (error) {
      console.error('Failed to refresh services:', error);
      setLoadingStatus('Ошибка обновления списка услуг');
    }
  };

  const handleServiceSelect = (event: SelectChangeEvent<string>) => {
    const serviceId = Number(event.target.value);
    if (serviceId && !safeSelectedServices.some(s => s.service_id === serviceId)) {
      setSelectedServiceId('');
      const newServices = [...safeSelectedServices, { service_id: serviceId }];
      console.log('Adding service:', serviceId, 'New services list:', newServices);
      
      // Debug output to track data BEFORE setting it
      console.log('Current services before update:', safeSelectedServices);
      console.log('Service being added:', {
        service_id: serviceId,
        service_details: services.find(s => s.id === serviceId)
      });
      console.log('New services array after addition:', newServices);
      
      // Generate a valid service_comments array
      const validServiceComments = newServices.map(s => ({
        service_id: s.service_id,
        comment: s.comment || undefined
      }));
      
      console.log('Generated valid service_comments:', validServiceComments);
      onChange(validServiceComments);
      
      // Debug log - This will help identify if the change is being detected
      console.log('onChange was called with updated services');
    } else {
      console.log('Service select ignored - either invalid ID or already selected:', serviceId);
      
      if (serviceId) {
        const alreadyExists = safeSelectedServices.some(s => s.service_id === serviceId);
        console.log('Service already exists?', alreadyExists);
        console.log('Current selected services:', safeSelectedServices);
      }
    }
  };

  const handleRemoveService = (serviceId: number) => {
    const newServices = safeSelectedServices.filter(s => s.service_id !== serviceId);
    console.log('Removing service:', serviceId, 'New services list:', newServices);
    onChange(newServices);
  };

  const handleAddComment = (serviceId: number) => {
    const service = safeSelectedServices.find(s => s.service_id === serviceId);
    console.log('Opening comment editor for service:', serviceId, 'Current comment:', service?.comment);
    setCommentMode({
      serviceId,
      comment: service?.comment || '',
      isNew: !service?.comment
    });
  };

  const handleSaveComment = () => {
    if (commentMode) {
      console.log('Saving comment:', commentMode);
      
      const updatedServices = safeSelectedServices.map(s => 
        s.service_id === commentMode.serviceId 
          ? { ...s, comment: commentMode.comment || undefined } 
          : s
      );
      
      console.log('Updated services with comment:', updatedServices);
      onChange(updatedServices);
      setCommentMode(null);
    }
  };

  const handleCancelComment = () => {
    setCommentMode(null);
  };

  if (isLoading && services.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 2 }}>
        <CircularProgress size={24} sx={{ mr: 1 }} />
        <Typography>{loadingStatus || 'Загрузка услуг...'}</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2, mb: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Ошибка загрузки услуг: {error}
        </Alert>
        <Button 
          startIcon={<RefreshIcon />} 
          variant="contained" 
          onClick={handleRefreshServices}
        >
          Попробовать снова
        </Button>
      </Box>
    );
  }

  // Filter out services that are already selected
  const availableServices = services
    .filter(service => !safeSelectedServices.some(s => s.service_id === service.id));

  // Get service names for display
  const getServiceName = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.name : 'Неизвестная услуга';
  };

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">
          Услуги
        </Typography>
        <Button 
          startIcon={<RefreshIcon />} 
          size="small" 
          onClick={handleRefreshServices}
          disabled={isLoading}
        >
          Обновить
        </Button>
      </Stack>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Выберите услуги, которые предоставляются в данной точке обслуживания
      </Typography>

      {loadingStatus && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {loadingStatus}
        </Alert>
      )}

      {/* Service selector dropdown */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <FormControl fullWidth disabled={disabled || isLoading}>
          <InputLabel id="add-service-label">Добавить услугу</InputLabel>
          <Select
            labelId="add-service-label"
            id="add-service"
            value={selectedServiceId}
            onChange={handleServiceSelect}
            input={<OutlinedInput label="Добавить услугу" />}
          >
            {availableServices.length === 0 ? (
              <MenuItem disabled>
                {services.length === 0 
                  ? 'Нет доступных услуг. Создайте услуги на странице "Услуги"' 
                  : 'Все услуги уже добавлены'}
              </MenuItem>
            ) : (
              availableServices.map((service) => (
                <MenuItem key={service.id} value={service.id.toString()}>
                  {service.name}
                  {service.description && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      ({service.description})
                    </Typography>
                  )}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
      </Stack>

      {/* Comment editor dialog */}
      {commentMode && (
        <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            {commentMode.isNew ? 'Добавить комментарий' : 'Редактировать комментарий'}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Услуга: {getServiceName(commentMode.serviceId)}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Введите комментарий к услуге..."
            value={commentMode.comment}
            onChange={(e) => setCommentMode({ ...commentMode, comment: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <IconButton color="inherit" onClick={handleCancelComment}>
              <DeleteIcon />
            </IconButton>
            <IconButton color="primary" onClick={handleSaveComment}>
              <AddIcon />
            </IconButton>
          </Stack>
        </Paper>
      )}

      {/* Selected services list */}
      {safeSelectedServices.length > 0 ? (
        <Stack spacing={1}>
          {safeSelectedServices.map((serviceItem) => {
            const service = services.find(s => s.id === serviceItem.service_id);
            return (
              <Paper key={serviceItem.service_id} variant="outlined" sx={{ p: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body1">
                      {service ? service.name : `Услуга #${serviceItem.service_id}`}
                    </Typography>
                    {serviceItem.comment && (
                      <Typography variant="body2" color="text.secondary">
                        {serviceItem.comment}
                      </Typography>
                    )}
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title={serviceItem.comment ? "Редактировать комментарий" : "Добавить комментарий"}>
                      <IconButton 
                        size="small" 
                        color={serviceItem.comment ? "primary" : "default"} 
                        onClick={() => handleAddComment(serviceItem.service_id)}
                      >
                        <CommentIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить услугу">
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleRemoveService(serviceItem.service_id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          Не выбрано ни одной услуги
        </Typography>
      )}
    </Box>
  );
};

export default ServiceSelector; 
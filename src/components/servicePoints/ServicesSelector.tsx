import React, { useState, useEffect } from 'react';
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Typography,
  Paper,
  TextField
} from '@mui/material';
import axios from 'axios';

interface Service {
  id: number;
  name: string;
  description?: string;
}

interface ServiceWithComment {
  service_id: number;
  comment?: string;
}

interface ServicesComments {
  [key: number]: string;
}

interface ServicesSelectorProps {
  selectedServiceIds: number[];
  serviceComments?: ServiceWithComment[];
  onChange: (services: number[], serviceWithComments: ServiceWithComment[]) => void;
}

const ServicesSelector: React.FC<ServicesSelectorProps> = ({
  selectedServiceIds,
  serviceComments = [],
  onChange
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<ServicesComments>({});
  
  // Initialize comments from props
  useEffect(() => {
    const initialComments: ServicesComments = {};
    
    if (serviceComments && serviceComments.length > 0) {
      serviceComments.forEach(sc => {
        if (sc.service_id && sc.comment) {
          initialComments[sc.service_id] = sc.comment;
        }
      });
    }
    
    setComments(initialComments);
  }, [serviceComments]);

  // Fetch available services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/services');
        if (response.data && Array.isArray(response.data)) {
          setServices(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          setServices(response.data.data);
        } else {
          setError('Unexpected API response format');
        }
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleServiceToggle = (serviceId: number) => {
    let updatedServices: number[];
    
    if (selectedServiceIds.includes(serviceId)) {
      // Remove from selection
      updatedServices = selectedServiceIds.filter(id => id !== serviceId);
      
      // Also remove any comment
      const updatedComments = { ...comments };
      delete updatedComments[serviceId];
      setComments(updatedComments);
    } else {
      // Add to selection
      updatedServices = [...selectedServiceIds, serviceId];
    }
    
    // Create service_comments array
    const updatedServiceComments = updatedServices.map(id => ({
      service_id: id,
      comment: comments[id] || ''
    }));
    
    onChange(updatedServices, updatedServiceComments);
  };

  const handleCommentChange = (serviceId: number, comment: string) => {
    const updatedComments = {
      ...comments,
      [serviceId]: comment
    };
    setComments(updatedComments);
    
    // Create updated service_comments
    const updatedServiceComments = selectedServiceIds.map(id => ({
      service_id: id,
      comment: updatedComments[id] || ''
    }));
    
    onChange(selectedServiceIds, updatedServiceComments);
  };

  if (loading) {
    return <Typography>Загрузка услуг...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Доступные услуги:
      </Typography>
      <FormControl component="fieldset" fullWidth>
        <FormGroup>
          {services.map(service => (
            <Paper 
              key={service.id} 
              variant="outlined" 
              sx={{ mb: 1, p: 1 }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedServiceIds.includes(service.id)}
                    onChange={() => handleServiceToggle(service.id)}
                  />
                }
                label={service.name}
              />
              
              {service.description && (
                <FormHelperText sx={{ ml: 4 }}>
                  {service.description}
                </FormHelperText>
              )}
              
              {selectedServiceIds.includes(service.id) && (
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  label="Комментарий к услуге"
                  value={comments[service.id] || ''}
                  onChange={(e) => handleCommentChange(service.id, e.target.value)}
                  sx={{ ml: 4, width: 'calc(100% - 2rem)' }}
                />
              )}
            </Paper>
          ))}
        </FormGroup>
      </FormControl>
    </Box>
  );
};

export default ServicesSelector;
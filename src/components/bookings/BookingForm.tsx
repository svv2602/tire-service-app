import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  FormHelperText,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { ru } from 'date-fns/locale';
import { format } from 'date-fns';
import { GridContainer, GridItem } from '../ui/GridComponents';

interface BookingFormData {
  clientName: string;
  phone: string;
  carNumber: string;
  date: Date | null;
  time: Date | null;
  servicePointId: number | null;
}

// Создаем отдельный интерфейс для ошибок
interface BookingFormErrors {
  clientName?: string;
  phone?: string;
  carNumber?: string;
  date?: string;
  time?: string;
  servicePointId?: string;
}

interface BookingFormProps {
  onSubmit: (data: BookingFormData) => void;
  selectedServicePoint: {
    id: number;
    name: string;
    address: string;
  } | null;
  isLoading?: boolean;
}

const initialFormData: BookingFormData = {
  clientName: '',
  phone: '',
  carNumber: '',
  date: null,
  time: null,
  servicePointId: null,
};

const BookingForm: React.FC<BookingFormProps> = ({
  onSubmit,
  selectedServicePoint,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<BookingFormData>(initialFormData);
  const [errors, setErrors] = useState<BookingFormErrors>({});

  const validateForm = () => {
    const newErrors: BookingFormErrors = {};

    if (!formData.clientName) {
      newErrors.clientName = 'Введите ваше имя';
    }

    if (!formData.phone) {
      newErrors.phone = 'Введите номер телефона';
    } else if (!/^\+?[0-9]{10,12}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Неверный формат номера телефона';
    }

    if (!formData.carNumber) {
      newErrors.carNumber = 'Введите номер автомобиля';
    }

    if (!formData.date) {
      newErrors.date = 'Выберите дату';
    }

    if (!formData.time) {
      newErrors.time = 'Выберите время';
    }

    if (!selectedServicePoint) {
      newErrors.servicePointId = 'Выберите пункт обслуживания на карте';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit({
        ...formData,
        servicePointId: selectedServicePoint?.id || null,
        date: formData.date,
        time: formData.time,
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Создание записи
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <GridContainer spacing={2}>
            <GridItem xs={12}>
              <TextField
                fullWidth
                label="Ваше имя"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                error={!!errors.clientName}
                helperText={errors.clientName}
                disabled={isLoading}
              />
            </GridItem>

            <GridItem xs={12} sm={6}>
              <TextField
                fullWidth
                label="Номер телефона"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone}
                disabled={isLoading}
                placeholder="+7XXXXXXXXXX"
              />
            </GridItem>

            <GridItem xs={12} sm={6}>
              <TextField
                fullWidth
                label="Номер автомобиля"
                name="carNumber"
                value={formData.carNumber}
                onChange={handleChange}
                error={!!errors.carNumber}
                helperText={errors.carNumber}
                disabled={isLoading}
              />
            </GridItem>

            <GridItem xs={12} sm={6}>
              <DatePicker
                label="Дата"
                value={formData.date}
                onChange={(newValue) => {
                  setFormData((prev) => ({ ...prev, date: newValue }));
                  setErrors((prev) => ({ ...prev, date: '' }));
                }}
                disablePast
                disabled={isLoading}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.date,
                    helperText: errors.date,
                  },
                }}
              />
            </GridItem>

            <GridItem xs={12} sm={6}>
              <TimePicker
                label="Время"
                value={formData.time}
                onChange={(newValue) => {
                  setFormData((prev) => ({ ...prev, time: newValue }));
                  setErrors((prev) => ({ ...prev, time: '' }));
                }}
                disabled={isLoading}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.time,
                    helperText: errors.time,
                  },
                }}
              />
            </GridItem>

            <GridItem xs={12}>
              {selectedServicePoint ? (
                <Typography variant="body1">
                  Выбранный пункт: {selectedServicePoint.name}
                  <br />
                  Адрес: {selectedServicePoint.address}
                </Typography>
              ) : (
                <FormHelperText error>
                  {errors.servicePointId}
                </FormHelperText>
              )}
            </GridItem>

            <GridItem xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isLoading}
              >
                {isLoading ? 'Создание записи...' : 'Создать запись'}
              </Button>
            </GridItem>
          </GridContainer>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

export default BookingForm;
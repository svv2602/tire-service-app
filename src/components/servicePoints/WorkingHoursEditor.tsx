import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { GridContainer, GridItem } from '../../components/ui/GridComponents';

interface WorkingHoursType {
  [key: string]: string;
}

interface WorkingHoursEditorProps {
  workingHours: WorkingHoursType;
  onChange: (workingHours: WorkingHoursType) => void;
}

const daysOfWeek = [
  { id: 'monday', label: 'Понедельник' },
  { id: 'tuesday', label: 'Вторник' },
  { id: 'wednesday', label: 'Среда' },
  { id: 'thursday', label: 'Четверг' },
  { id: 'friday', label: 'Пятница' },
  { id: 'saturday', label: 'Суббота' },
  { id: 'sunday', label: 'Воскресенье' }
];

const predefinedSchedules = [
  {
    id: 'regular',
    label: 'Обычный график (9:00-18:00, Сб: 10:00-16:00, Вс: выходной)',
    hours: {
      monday: '09:00-18:00',
      tuesday: '09:00-18:00',
      wednesday: '09:00-18:00',
      thursday: '09:00-18:00',
      friday: '09:00-18:00',
      saturday: '10:00-16:00',
      sunday: 'выходной'
    }
  },
  {
    id: 'everyday',
    label: 'Ежедневно (9:00-21:00)',
    hours: {
      monday: '09:00-21:00',
      tuesday: '09:00-21:00',
      wednesday: '09:00-21:00',
      thursday: '09:00-21:00',
      friday: '09:00-21:00',
      saturday: '09:00-21:00',
      sunday: '09:00-21:00'
    }
  }
];

const WorkingHoursEditor: React.FC<WorkingHoursEditorProps> = ({ workingHours, onChange }) => {
  const [hours, setHours] = useState<WorkingHoursType>(workingHours || {});

  useEffect(() => {
    // Initialize default values if needed
    const initialHours: WorkingHoursType = { ...hours };
    daysOfWeek.forEach(day => {
      if (!initialHours[day.id]) {
        initialHours[day.id] = '09:00-18:00';
      }
    });
    setHours(initialHours);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleHourChange = (day: string, value: string) => {
    const updatedHours = {
      ...hours,
      [day]: value
    };
    setHours(updatedHours);
    onChange(updatedHours);
  };

  const applyPredefinedSchedule = (scheduleId: string) => {
    const schedule = predefinedSchedules.find(s => s.id === scheduleId);
    if (schedule) {
      setHours(schedule.hours);
      onChange(schedule.hours);
    }
  };

  return (
    <Box>
      <Box mb={2}>
        <Typography variant="subtitle1" gutterBottom>
          Предустановленные графики:
        </Typography>
        <GridContainer spacing={1}>
          {predefinedSchedules.map(schedule => (
            <GridItem xs={6} sm={6} md={6} key={schedule.id}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => applyPredefinedSchedule(schedule.id)}
              >
                {schedule.label}
              </Button>
            </GridItem>
          ))}
        </GridContainer>
      </Box>

      <Typography variant="subtitle1" gutterBottom>
        Настройка рабочих часов:
      </Typography>
      <GridContainer spacing={2}>
        {daysOfWeek.map(day => (
          <GridItem key={day.id} xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel id={`${day.id}-label`}>{day.label}</InputLabel>
              <Select
                labelId={`${day.id}-label`}
                value={hours[day.id] || '09:00-18:00'}
                label={day.label}
                onChange={(e) => handleHourChange(day.id, e.target.value)}
              >
                <MenuItem value="09:00-18:00">09:00-18:00</MenuItem>
                <MenuItem value="08:00-17:00">08:00-17:00</MenuItem>
                <MenuItem value="10:00-19:00">10:00-19:00</MenuItem>
                <MenuItem value="09:00-21:00">09:00-21:00</MenuItem>
                <MenuItem value="10:00-16:00">10:00-16:00</MenuItem>
                <MenuItem value="выходной">Выходной</MenuItem>
                <MenuItem value="closed">Закрыто</MenuItem>
                <MenuItem value="custom">
                  <TextField
                    size="small"
                    placeholder="Например: 10:00-20:00"
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleHourChange(day.id, e.target.value);
                    }}
                  />
                </MenuItem>
              </Select>
            </FormControl>
          </GridItem>
        ))}
      </GridContainer>
    </Box>
  );
};

export default WorkingHoursEditor;
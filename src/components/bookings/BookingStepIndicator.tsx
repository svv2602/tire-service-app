import React from 'react';
import { 
  Box, 
  Stepper, 
  Step, 
  StepLabel, 
  Paper, 
  useTheme,
  useMediaQuery
} from '@mui/material';

export enum BookingStep {
  CITY_SELECTION = 0,
  SERVICE_POINT_SELECTION = 1,
  DATE_SELECTION = 2,
  TIME_SELECTION = 3,
  APPOINTMENT_FORM = 4,
  SUCCESS = 5
}

interface BookingStepIndicatorProps {
  activeStep: BookingStep;
}

const steps = [
  'Выбор города',
  'Выбор сервиса',
  'Выбор даты',
  'Выбор времени',
  'Ваши данные',
  'Готово'
];

const BookingStepIndicator: React.FC<BookingStepIndicatorProps> = ({ activeStep }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        mb: 3, 
        backgroundColor: theme.palette.background.default,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}
    >
      <Box sx={{ width: '100%' }}>
        <Stepper activeStep={activeStep} alternativeLabel={isMobile}>
          {steps.map((label, index) => {
            // На мобильных устройствах показываем только текущий шаг и два соседних
            if (isMobile && (index < activeStep - 1 || index > activeStep + 1) && index !== 0 && index !== steps.length - 1) {
              return null;
            }
            
            return (
              <Step key={label}>
                <StepLabel>{isMobile && index !== activeStep ? '' : label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </Box>
    </Paper>
  );
};

export default BookingStepIndicator; 
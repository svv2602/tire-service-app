import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Typography,
  Stack
} from '@mui/material';
import { ApiParam } from '../../../data/apiEndpoints';

interface RequestParamsProps {
  parameters: ApiParam[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

const RequestParams: React.FC<RequestParamsProps> = ({ parameters, values, onChange }) => {
  const getHelperText = (param: ApiParam) => {
    let text = param.description || '';
    
    if (param.required) {
      text = `${text} (обязательно)`;
    }
    
    if (param.example !== undefined) {
      text = `${text} (Пример: ${JSON.stringify(param.example)})`;
    }
    
    return text;
  };

  const renderParamInput = (param: ApiParam) => {
    const value = values[param.name] || '';
    
    switch (param.type) {
      case 'boolean':
        return (
          <FormControl fullWidth margin="dense" key={param.name}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={value === 'true'}
                  onChange={(e) => onChange(param.name, e.target.checked ? 'true' : 'false')}
                />
              }
              label={
                <Box>
                  <Typography variant="body1">{param.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {getHelperText(param)}
                  </Typography>
                </Box>
              }
            />
          </FormControl>
        );
      case 'number':
        return (
          <TextField
            key={param.name}
            fullWidth
            margin="dense"
            label={param.name}
            type="number"
            value={value}
            onChange={(e) => onChange(param.name, e.target.value)}
            helperText={getHelperText(param)}
            required={param.required}
            InputProps={{
              endAdornment: param.required && (
                <InputAdornment position="end">
                  <Typography color="error">*</Typography>
                </InputAdornment>
              )
            }}
          />
        );
      case 'array':
        return (
          <TextField
            key={param.name}
            fullWidth
            margin="dense"
            label={param.name}
            value={value}
            onChange={(e) => onChange(param.name, e.target.value)}
            helperText={`${getHelperText(param)} (формат: значение1,значение2,значение3)`}
            required={param.required}
            InputProps={{
              endAdornment: param.required && (
                <InputAdornment position="end">
                  <Typography color="error">*</Typography>
                </InputAdornment>
              )
            }}
          />
        );
      default: // string и остальные типы
        return (
          <TextField
            key={param.name}
            fullWidth
            margin="dense"
            label={param.name}
            value={value}
            onChange={(e) => onChange(param.name, e.target.value)}
            helperText={getHelperText(param)}
            required={param.required}
            InputProps={{
              endAdornment: param.required && (
                <InputAdornment position="end">
                  <Typography color="error">*</Typography>
                </InputAdornment>
              )
            }}
          />
        );
    }
  };

  return (
    <Stack spacing={1}>
      {parameters.map(param => renderParamInput(param))}
    </Stack>
  );
};

export default RequestParams;
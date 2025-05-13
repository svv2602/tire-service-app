import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { GridContainer, GridItem } from '../ui/GridComponents';

interface ServicePointsTesterProps {
  onRequest: (method: string, url: string, response: any) => void;
}

export default function ServicePointsTester({ onRequest }: ServicePointsTesterProps) {
  const [method, setMethod] = useState('GET');
  const [endpoint, setEndpoint] = useState('/api/service-points');
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (method !== 'GET' && requestBody) {
        options.body = requestBody;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, options);
      const data = await response.json();

      setResponse(data);
      onRequest(method, endpoint, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при выполнении запроса');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <GridContainer spacing={2}>
        <GridItem xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Метод</InputLabel>
            <Select
              value={method}
              label="Метод"
              onChange={(e) => setMethod(e.target.value)}
            >
              <MenuItem value="GET">GET</MenuItem>
              <MenuItem value="POST">POST</MenuItem>
              <MenuItem value="PUT">PUT</MenuItem>
              <MenuItem value="DELETE">DELETE</MenuItem>
              <MenuItem value="PATCH">PATCH</MenuItem>
            </Select>
          </FormControl>
        </GridItem>
        
        <GridItem xs={12} md={9}>
          <TextField
            fullWidth
            label="Endpoint"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
          />
        </GridItem>

        <GridItem xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Тело запроса (JSON)"
            value={requestBody}
            onChange={(e) => setRequestBody(e.target.value)}
            disabled={method === 'GET'}
          />
        </GridItem>

        <GridItem xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
          >
            Отправить запрос
          </Button>
        </GridItem>

        {error && (
          <GridItem xs={12}>
            <Alert severity="error">{error}</Alert>
          </GridItem>
        )}

        {response && (
          <GridItem xs={12}>
            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Ответ:
              </Typography>
              <pre style={{ 
                overflow: 'auto', 
                maxHeight: '400px',
                backgroundColor: '#f5f5f5',
                padding: '1rem',
                borderRadius: '4px'
              }}>
                {JSON.stringify(response, null, 2)}
              </pre>
            </Paper>
          </GridItem>
        )}
      </GridContainer>
    </Box>
  );
}
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ApiEndpoint, ApiParam } from '../../../data/apiEndpoints';

interface DocumentationProps {
  endpoint: ApiEndpoint;
}

const Documentation: React.FC<DocumentationProps> = ({ endpoint }) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Документация
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Описание
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {endpoint.description}
        </Typography>
      </Box>

      {endpoint.parameters && endpoint.parameters.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Параметры
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Тип</TableCell>
                <TableCell>Обязательный</TableCell>
                <TableCell>Описание</TableCell>
                <TableCell>Пример</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {endpoint.parameters.map((param: ApiParam) => (
                <TableRow key={param.name}>
                  <TableCell>{param.name}</TableCell>
                  <TableCell>
                    <Chip 
                      label={param.type} 
                      size="small" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {param.required ? (
                      <Chip 
                        label="Да" 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    ) : (
                      <Chip 
                        label="Нет" 
                        size="small" 
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                  <TableCell>{param.description}</TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {JSON.stringify(param.example, null, 2)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {endpoint.responseExample && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Пример ответа</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <pre
              style={{
                backgroundColor: '#f5f5f5',
                padding: '1rem',
                borderRadius: '4px',
                overflow: 'auto'
              }}
            >
              {JSON.stringify(endpoint.responseExample, null, 2)}
            </pre>
          </AccordionDetails>
        </Accordion>
      )}
    </Paper>
  );
};

export default Documentation;
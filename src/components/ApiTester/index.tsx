import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../utils/axios';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Stack,
  Alert,
  Divider,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  FormControlLabel,
  Switch,
  IconButton,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Code as CodeIcon,
  Upload as UploadIcon,
  PlayArrow as RunIcon,
} from '@mui/icons-material';
import History from './components/History';
import Documentation from './components/Documentation';
import EndpointSelector from './components/EndpointSelector';
import RequestParams from './components/RequestParams';
import ParamsEditor from './components/ParamsEditor';
import { apiEndpoints, getGroupedEndpoints, ApiEndpoint, ApiParam } from '../../data/apiEndpoints';

interface HistoryItem {
  id: string;
  method: string;
  endpoint: string;
  requestBody?: string;
  response: any;
  timestamp: string;
  status: number;
  duration: number;
}

const ApiTester: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [endpoint, setEndpoint] = useState('');
  const [requestBody, setRequestBody] = useState('');
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [useFormData, setUseFormData] = useState(false);
  const [showRawResponse, setShowRawResponse] = useState(false);
  const [files, setFiles] = useState<Record<string, File | null>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('apiTesterHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Ошибка при загрузке истории:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('apiTesterHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (selectedEndpoint) {
      setEndpoint(selectedEndpoint.path);
      
      // Reset files when endpoint changes
      setFiles({});
      
      // Automatically switch to FormData mode for file uploads
      const hasFileParams = selectedEndpoint.parameters?.some(
        param => param.name.includes('[]') || param.example === 'Files'
      );
      setUseFormData(hasFileParams || false);
      
      if (selectedEndpoint.method === 'GET') {
        setRequestBody('');
      } else if (selectedEndpoint.parameters) {
        const template: Record<string, any> = {};
        selectedEndpoint.parameters.forEach(param => {
          // Skip file params in JSON body template
          if (param.name.includes('[]') || param.example === 'Files') return;
          
          if (param.example !== undefined) {
            template[param.name] = param.example;
          }
        });
        setRequestBody(JSON.stringify(template, null, 2));
      }
      
      // Reset query params
      setQueryParams({});
    }
  }, [selectedEndpoint]);

  const splitParams = (params: ApiParam[] | undefined) => {
    if (!params) return { pathParams: [], queryParams: [], fileParams: [] };
    
    return {
      pathParams: params.filter(p => endpoint.includes(`{${p.name}}`)),
      queryParams: params.filter(p => !endpoint.includes(`{${p.name}`) && !p.name.includes('[]') && p.example !== 'Files'),
      fileParams: params.filter(p => p.name.includes('[]') || p.example === 'Files')
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResponse(null);
    setIsLoading(true);

    // Валидация обязательных параметров
    if (selectedEndpoint?.parameters) {
      const { pathParams } = splitParams(selectedEndpoint.parameters);
      const missingParams = pathParams
        .filter(param => param.required && !queryParams[param.name])
        .map(param => param.name);

      if (missingParams.length > 0) {
        setError(`Отсутствуют обязательные параметры пути: ${missingParams.join(', ')}`);
        setIsLoading(false);
        return;
      }
    }

    const startTime = performance.now();

    try {
      let finalEndpoint = endpoint;
      
      if (selectedEndpoint?.parameters) {
        const { pathParams, queryParams: nonPathParams } = splitParams(selectedEndpoint.parameters);
        const queryParamsArray: string[] = [];
        
        // Replace path parameters
        pathParams.forEach(param => {
          const value = queryParams[param.name];
          if (value) {
            finalEndpoint = finalEndpoint.replace(`{${param.name}}`, encodeURIComponent(value));
          }
        });
        
        // Add query parameters for GET requests
        if (selectedEndpoint.method === 'GET') {
          nonPathParams.forEach(param => {
            const value = queryParams[param.name];
            if (value) {
              queryParamsArray.push(`${param.name}=${encodeURIComponent(value)}`);
            }
          });

          if (queryParamsArray.length > 0) {
            finalEndpoint += `?${queryParamsArray.join('&')}`;
          }
        }
      }

      const options: any = {
        method: selectedEndpoint?.method || 'GET',
        headers: {},
      };
      
      // Handle different request body formats
      if (selectedEndpoint?.method !== 'GET') {
        if (useFormData) {
          // Use FormData for multipart/form-data requests (file uploads)
          const formData = new FormData();
          
          // Add text fields from query params
          Object.entries(queryParams).forEach(([key, value]) => {
            if (value) formData.append(key, value);
          });
          
          // Add JSON fields from request body if present
          if (requestBody) {
            try {
              const jsonData = JSON.parse(requestBody);
              Object.entries(jsonData).forEach(([key, value]) => {
                if (typeof value === 'object') {
                  formData.append(key, JSON.stringify(value));
                } else if (value !== undefined && value !== null) {
                  formData.append(key, String(value));
                }
              });
            } catch (e) {
              console.warn('Could not parse JSON body for FormData:', e);
            }
          }
          
          // Add files
          Object.entries(files).forEach(([key, file]) => {
            if (file) formData.append(key, file);
          });
          
          options.data = formData;
          options.headers['Content-Type'] = 'multipart/form-data';
        } else {
          // Use JSON for regular requests
          try {
            options.data = requestBody ? JSON.parse(requestBody) : {};
            options.headers['Content-Type'] = 'application/json';
          } catch (e) {
            setError('Ошибка в формате JSON тела запроса');
            setIsLoading(false);
            return;
          }
        }
      }

      // Log request details to console
      console.log('API Request:', {
        url: finalEndpoint,
        method: options.method,
        headers: options.headers,
        data: options.data
      });

      // Send the request
      const result = await axiosInstance(finalEndpoint, options);
      const endTime = performance.now();
      
      setResponse(result.data);

      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        method: options.method,
        endpoint: finalEndpoint,
        requestBody: requestBody || undefined,
        response: result.data,
        timestamp: new Date().toLocaleTimeString(),
        status: result.status,
        duration: Math.round(endTime - startTime)
      };

      setHistory(prev => [historyItem, ...prev].slice(0, 50));

    } catch (err: any) {
      const endTime = performance.now();
      setError(err.message);
      
      // Enhanced error logging
      console.error('API request failed:', {
        url: endpoint,
        method: selectedEndpoint?.method || 'GET',
        error: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        responseData: err.response?.data,
        responseHeaders: err.response?.headers
      });
      
      if (err.response) {
        setResponse(err.response.data);
        
        const historyItem: HistoryItem = {
          id: Date.now().toString(),
          method: selectedEndpoint?.method || 'GET',
          endpoint,
          requestBody: requestBody || undefined,
          response: err.response.data,
          timestamp: new Date().toLocaleTimeString(),
          status: err.response.status,
          duration: Math.round(endTime - startTime)
        };

        setHistory(prev => [historyItem, ...prev].slice(0, 50));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleParamChange = (name: string, value: string) => {
    setQueryParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (paramName: string, file: File | null) => {
    setFiles(prev => ({
      ...prev,
      [paramName]: file
    }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, paramName: string) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      handleFileChange(paramName, file);
    }
  };

  const handleRestoreRequest = (item: HistoryItem) => {
    const endpoint = apiEndpoints.find((e: ApiEndpoint) => 
      item.endpoint.startsWith(e.path.split('{')[0])
    );
    
    if (endpoint) {
      setSelectedEndpoint(endpoint);
    }
    
    setEndpoint(item.endpoint);
    setRequestBody(item.requestBody || '');
    setResponse(null);
    setError(null);
  };

  const handleCopyRequest = (item: HistoryItem) => {
    const requestData = {
      method: item.method,
      endpoint: item.endpoint,
      body: item.requestBody
    };
    navigator.clipboard.writeText(JSON.stringify(requestData, null, 2));
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleClearHistory = () => {
    setHistory([]);
  };
  
  const handleCopyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    }
  };
  
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  const getParameterSections = () => {
    if (!selectedEndpoint?.parameters) return null;
    
    const { pathParams, queryParams: regularParams, fileParams } = splitParams(selectedEndpoint.parameters);
    
    return (
      <>
        {pathParams.length > 0 && (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Параметры пути
            </Typography>
            <Stack spacing={1}>
              {pathParams.map(param => (
                <TextField
                  key={param.name}
                  label={`${param.name}${param.required ? ' *' : ''}`}
                  size="small"
                  fullWidth
                  value={queryParams[param.name] || ''}
                  onChange={e => handleParamChange(param.name, e.target.value)}
                  helperText={param.description}
                  error={param.required && !queryParams[param.name]}
                />
              ))}
            </Stack>
          </Box>
        )}
        
        {regularParams.length > 0 && selectedEndpoint.method === 'GET' && (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Параметры запроса
            </Typography>
            <Stack spacing={1}>
              {regularParams.map(param => (
                <TextField
                  key={param.name}
                  label={`${param.name}${param.required ? ' *' : ''}`}
                  size="small"
                  fullWidth
                  value={queryParams[param.name] || ''}
                  onChange={e => handleParamChange(param.name, e.target.value)}
                  helperText={param.description}
                />
              ))}
            </Stack>
          </Box>
        )}
        
        {fileParams.length > 0 && useFormData && (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Файлы
            </Typography>
            <Stack spacing={1}>
              {fileParams.map(param => (
                <Box key={param.name}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<UploadIcon />}
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      Выбрать файл
                      <input
                        type="file"
                        hidden
                        onChange={(e) => handleFileSelect(e, param.name)}
                        ref={fileInputRef}
                      />
                    </Button>
                    
                    {files[param.name] ? (
                      <Box display="flex" alignItems="center">
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {files[param.name]?.name} ({Math.round(files[param.name]?.size || 0 / 1024)} KB)
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => handleFileChange(param.name, null)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Файл не выбран
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {param.description}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
        
        {selectedEndpoint.method !== 'GET' && !useFormData && (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Тело запроса (JSON)
            </Typography>
            <TextField
              multiline
              fullWidth
              minRows={5}
              maxRows={15}
              value={requestBody}
              onChange={e => setRequestBody(e.target.value)}
              InputProps={{
                sx: { fontFamily: 'monospace', fontSize: '0.9rem' }
              }}
            />
          </Box>
        )}
      </>
    );
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">
          Тестирование API
        </Typography>
        <Box>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSubmit}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={24} /> : <RunIcon />}
          >
            Выполнить запрос
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
        <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 3' } }}>
          <Paper sx={{ p: 2 }}>
            <EndpointSelector
              groupedEndpoints={getGroupedEndpoints()}
              onSelect={setSelectedEndpoint}
              selectedEndpoint={selectedEndpoint}
            />
          </Paper>
        </Box>

        <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 9' } }}>
          <Stack spacing={2}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Paper sx={{ p: 2 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="api tester tabs">
                  <Tab label="Запрос" id="tab-request" />
                  <Tab label="Ответ" id="tab-response" disabled={!response} />
                  <Tab label="История" id="tab-history" disabled={history.length === 0} />
                </Tabs>
              </Box>
              
              {/* Запрос */}
              {activeTab === 0 && (
                <Stack spacing={2} component="form" onSubmit={handleSubmit}>
                  {selectedEndpoint && (
                    <Box mb={2}>
                      <Typography variant="h6">{selectedEndpoint.description}</Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        <Chip 
                          label={selectedEndpoint.method} 
                          color={
                            selectedEndpoint.method === 'GET' ? 'info' : 
                            selectedEndpoint.method === 'POST' ? 'success' : 
                            selectedEndpoint.method === 'PUT' ? 'warning' : 
                            selectedEndpoint.method === 'PATCH' ? 'warning' : 
                            'error'
                          }
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" fontFamily="monospace" sx={{ flex: 1 }}>
                          {selectedEndpoint.path}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  
                  <TextField
                    fullWidth
                    label="Endpoint"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    InputProps={{
                      sx: { fontFamily: 'monospace' }
                    }}
                  />
                  
                  {selectedEndpoint && selectedEndpoint.method !== 'GET' && (
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={useFormData} 
                          onChange={(e) => setUseFormData(e.target.checked)}
                        />
                      }
                      label="Использовать FormData (для загрузки файлов)"
                    />
                  )}
                  
                  {getParameterSections()}
                  
                  <Box mt={2} display="flex" justifyContent="flex-end">
                    <Button 
                      variant="contained" 
                      color="primary" 
                      type="submit" 
                      disabled={isLoading}
                      startIcon={isLoading ? <CircularProgress size={24} /> : <RunIcon />}
                    >
                      Выполнить запрос
                    </Button>
                  </Box>
                </Stack>
              )}
              
              {/* Ответ */}
              {activeTab === 1 && response && (
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Ответ сервера
                      </Typography>
                      {history.length > 0 && history[0].status && (
                        <Chip 
                          label={`Status: ${history[0].status}`} 
                          color={history[0].status >= 200 && history[0].status < 300 ? 'success' : 'error'}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                      )}
                      {history.length > 0 && (
                        <Chip 
                          label={`${history[0].duration} ms`} 
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </Box>
                    <Box>
                      <Tooltip title="Копировать ответ">
                        <IconButton onClick={handleCopyResponse}>
                          <CopyIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={showRawResponse ? "Показать форматированный ответ" : "Показать сырой ответ"}>
                        <IconButton onClick={() => setShowRawResponse(!showRawResponse)}>
                          <CodeIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      maxHeight: '500px', 
                      overflow: 'auto',
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      bgcolor: 'background.default'
                    }}
                  >
                    {showRawResponse ? (
                      <pre>{JSON.stringify(response, null, 2)}</pre>
                    ) : (
                      <pre>
                        {JSON.stringify(response, null, 2)
                          .replace(/"([^"]+)":/g, '<span style="color: #7a3e9d">$&</span>')
                          .replace(/:[ ]?"([^"]+)"/g, ': <span style="color: #2e7d32">$&</span>')
                          .replace(/:[ ]?(\d+)/g, ': <span style="color: #1976d2">$&</span>')
                          .replace(/:[ ]?(true|false|null)/g, ': <span style="color: #ed6c02">$&</span>')}
                      </pre>
                    )}
                  </Paper>
                </Stack>
              )}
              
              {/* История */}
              {activeTab === 2 && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1">
                      История запросов ({history.length})
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={<DeleteIcon />}
                      onClick={handleClearHistory}
                    >
                      Очистить историю
                    </Button>
                  </Box>
                  
                  <History 
                    history={history} 
                    onDelete={handleDeleteHistoryItem} 
                    onRestore={handleRestoreRequest}
                    onCopy={handleCopyRequest}
                  />
                </Box>
              )}
            </Paper>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default ApiTester;
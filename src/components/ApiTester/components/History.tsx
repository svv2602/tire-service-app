import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Tooltip,
  Divider,
  Typography,
  Collapse,
  Paper,
} from '@mui/material';
import {
  Refresh as RestoreIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';

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

interface HistoryProps {
  history: HistoryItem[];
  onDelete: (id: string) => void;
  onRestore: (item: HistoryItem) => void;
  onCopy: (item: HistoryItem) => void;
}

const History: React.FC<HistoryProps> = ({ history, onDelete, onRestore, onCopy }) => {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (history.length === 0) {
    return (
      <Box textAlign="center" p={3}>
        <Typography color="textSecondary">
          История запросов пуста
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ bgcolor: 'background.paper' }}>
      {history.map((item) => (
        <React.Fragment key={item.id}>
          <ListItem
            alignItems="flex-start"
            secondaryAction={
              <Box>
                <Tooltip title="Восстановить запрос">
                  <IconButton edge="end" onClick={() => onRestore(item)}>
                    <RestoreIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Копировать запрос">
                  <IconButton edge="end" onClick={() => onCopy(item)}>
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Удалить из истории">
                  <IconButton edge="end" onClick={() => onDelete(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            }
          >
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" flexWrap="wrap" gap={1} mb={1}>
                  <Chip 
                    label={item.method} 
                    color={
                      item.method === 'GET' ? 'info' : 
                      item.method === 'POST' ? 'success' : 
                      item.method === 'PUT' ? 'warning' : 
                      item.method === 'DELETE' ? 'error' : 
                      'default'
                    }
                    size="small"
                  />
                  <Typography 
                    variant="body2" 
                    fontFamily="monospace" 
                    sx={{ 
                      flexGrow: 1,
                      wordBreak: 'break-all',
                      cursor: 'pointer' 
                    }}
                    onClick={() => toggleExpand(item.id)}
                  >
                    {item.endpoint}
                  </Typography>
                  <Chip 
                    label={`${item.status}`} 
                    color={item.status >= 200 && item.status < 300 ? 'success' : 'error'}
                    size="small"
                  />
                  <Chip 
                    label={`${item.duration} ms`} 
                    variant="outlined"
                    size="small"
                  />
                  <Typography variant="caption" color="textSecondary">
                    {item.timestamp}
                  </Typography>
                  <IconButton size="small" onClick={() => toggleExpand(item.id)}>
                    {expandedId === item.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>
              }
            />
          </ListItem>

          <Collapse in={expandedId === item.id} timeout="auto" unmountOnExit>
            <Box sx={{ pl: 2, pr: 2, pb: 2 }}>
              {item.requestBody && (
                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Тело запроса:
                  </Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 1, 
                      maxHeight: '150px', 
                      overflow: 'auto',
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                    }}
                  >
                    <pre>{item.requestBody}</pre>
                  </Paper>
                </Box>
              )}
              
              <Typography variant="subtitle2" gutterBottom>
                Ответ:
              </Typography>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 1, 
                  maxHeight: '200px', 
                  overflow: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                }}
              >
                <pre>{JSON.stringify(item.response, null, 2)}</pre>
              </Paper>
            </Box>
          </Collapse>
          
          <Divider component="li" />
        </React.Fragment>
      ))}
    </List>
  );
};

export default History;
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Chip,
  Stack
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import styles from '../ApiTester.module.css';

interface ResponseViewerProps {
  response: any;
  status?: number;
  duration?: number;
  timestamp?: string;
}

const ResponseViewer: React.FC<ResponseViewerProps> = ({
  response,
  status = 200,
  duration,
  timestamp
}) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    setCopySuccess(true);
  };

  const getStatusColor = (status: number): "success" | "error" | "warning" | "default" => {
    if (status >= 200 && status < 300) return "success";
    if (status >= 400 && status < 500) return "error";
    if (status >= 500) return "error";
    return "default";
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">
          Ответ
        </Typography>
        <Chip
          label={status}
          color={getStatusColor(status)}
          variant="outlined"
          size="small"
        />
        {duration && (
          <Typography variant="caption" color="text.secondary">
            {duration}ms
          </Typography>
        )}
        {timestamp && (
          <Typography variant="caption" color="text.secondary">
            {timestamp}
          </Typography>
        )}
      </Stack>

      <Box className={styles.responseContainer}>
        <Tooltip title="Копировать">
          <IconButton
            onClick={handleCopy}
            className={styles.copyButton}
            size="small"
          >
            {copySuccess ? <CheckIcon /> : <CopyIcon />}
          </IconButton>
        </Tooltip>
        
        <pre className={styles.preContainer}>
          {JSON.stringify(response, null, 2)}
        </pre>
      </Box>

      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          Скопировано в буфер обмена
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ResponseViewer;
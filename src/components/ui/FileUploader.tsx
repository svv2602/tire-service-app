import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  Tooltip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Stack
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Description as FileIcon,
  Download as DownloadIcon,
  PictureAsPdf,
  TableView,
  InsertDriveFile
} from '@mui/icons-material';
import axios from 'axios';

interface FileInfo {
  path: string;
  url?: string;
  name?: string;
  file?: File;
  id?: string | number;
  original_name?: string;
}

interface Props {
  files: FileInfo[];
  maxFiles: number;
  accept: string;
  maxSizeMB: number;
  disabled?: boolean;
  onFilesChange: (files: FileInfo[]) => void;
  onRemoveFile: (path: string) => void;
  title: string;
  buttonText: string;
}

const FileUploader: React.FC<Props> = ({
  files,
  maxFiles,
  accept,
  maxSizeMB,
  disabled = false,
  onFilesChange,
  onRemoveFile,
  title,
  buttonText
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add useEffect to log when files change
  useEffect(() => {
    console.log('FileUploader received files:', files);
  }, [files]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files.length) return;
    
    setError(null);
    setSuccessMessage(null);
    
    const selectedFiles = Array.from(event.target.files);
    
    // Log the selected files for debugging
    console.log("Selected files:", selectedFiles.map(f => ({
      name: f.name,
      type: f.type,
      size: f.size,
      extension: f.name.split('.').pop()?.toLowerCase()
    })));
    
    // Check file types
    const invalidFiles = selectedFiles.filter(file => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      // For Excel files check both MIME type and extension
      if (file.type.includes('excel') || file.type.includes('spreadsheetml') || 
          file.type.includes('ms-excel') || 
          extension === 'xls' || extension === 'xlsx') {
        return false; // file is valid
      }
      // For PDF check MIME type
      if (file.type === 'application/pdf' || 
          file.type === 'application/x-pdf' ||
          extension === 'pdf') {
        return false; // file is valid
      }
      return true; // file is invalid
    });
    
    if (invalidFiles.length > 0) {
      const invalidNames = invalidFiles.map(f => f.name).join(", ");
      setError(`Недопустимый тип файла: ${invalidNames}. Разрешены только PDF и Excel файлы (XLS, XLSX)`);
      return;
    }
    
    // Check file sizes
    const oversizedFiles = selectedFiles.filter(file => file.size > maxSizeMB * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      const oversizedNames = oversizedFiles.map(f => f.name).join(", ");
      setError(`Файлы превышают допустимый размер (${maxSizeMB} MB): ${oversizedNames}`);
      return;
    }
    
    // Check total files limit
    if (files.length + selectedFiles.length > maxFiles) {
      setError(`Максимальное количество файлов: ${maxFiles}`);
      return;
    }
    
    // Convert File objects to FileInfo and add to existing files
    const newFilesInfo: FileInfo[] = selectedFiles.map((file, index) => ({
      path: URL.createObjectURL(file),
      name: file.name,
      original_name: file.name,
      file: file as unknown as File, // Store the actual File object
      id: `new-file-${Date.now()}-${index}`, // Add a unique ID for React keys
    }));
    
    console.log("New files added:", newFilesInfo);
    onFilesChange([...files, ...newFilesInfo]);
    setSuccessMessage(`${newFilesInfo.length} файл(ов) добавлено`);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Improved getFileName function to handle different file formats better
  const getFileName = (path: string): string => {
    if (!path) return 'Файл без имени';
    
    // For blob URLs, extract from the file object if available
    if (path.startsWith('blob:')) {
      return 'Новый файл';
    }
    
    // Remove query parameters if they exist
    const pathWithoutQuery = path.split('?')[0];
    
    // For server paths, get the last part after the slash
    const urlParts = pathWithoutQuery.split('/');
    const rawFileName = urlParts[urlParts.length - 1];
    
    // Clean up URL encoding if present
    try {
      return decodeURIComponent(rawFileName);
    } catch (e) {
      console.warn('Error decoding filename:', e);
      return rawFileName;
    }
  };

  const handleDownload = async (file: FileInfo) => {
    try {
      if (!file.url && !file.path) {
        console.error('No URL or path available for download');
        setError('Невозможно скачать файл: отсутствует URL');
        return;
      }
      
      // Используем оригинальное имя файла, если оно доступно, иначе используем текущее имя или имя из пути
      const downloadName = file.original_name || file.name || getFileName(file.path || '');
      
      console.log('Downloading file:', {
        url: file.url,
        path: file.path,
        originalName: downloadName
      });
      
      // Если это локальный blob-url (для только что загруженных файлов)
      if (file.url?.startsWith('blob:') && file.file instanceof File) {
        const a = document.createElement('a');
        a.href = file.url;
        a.download = downloadName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }
      
      // Извлекаем только имя файла без пути
      let fileName: string | undefined;
      
      // Если есть путь к файлу, извлекаем имя файла из него
      if (file.path) {
        fileName = file.path.split('/').pop();
      } 
      // Если нет пути, но есть имя, используем его
      else if (file.name) {
        fileName = file.name;
      } 
      // Если нет ни пути, ни имени, но есть URL, извлекаем имя из URL
      else if (file.url) {
        fileName = file.url.split('/').pop();
      }
      
      if (!fileName) {
        throw new Error('Не удалось определить имя файла');
      }
      
      console.log('Extracted file name for download:', fileName);
      
      // Пробуем последовательно разные методы скачивания
      const downloadMethods = [
        // Метод 1: Через API endpoint
        async () => {
          console.log('Trying download method 1: API endpoint');
          // Извлекаем только имя файла без пути и декодированное
          const cleanFileName = decodeURIComponent(fileName?.split('/').pop() || '');
          const apiDownloadUrl = `/api/v2/download/price-list/${encodeURIComponent(cleanFileName)}`;
          console.log('Using API download URL:', apiDownloadUrl);
          
          try {
            const response = await axios.get(apiDownloadUrl, { 
              responseType: 'blob',
              headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0'
              }
            });
            return response;
          } catch (error) {
            console.error('API download failed:', error);
            throw error;
          }
        },
        
        // Метод 2: Через прямой URL для скачивания
        async () => {
          console.log('Trying download method 2: Direct download endpoint');
          // Извлекаем только имя файла без пути и декодированное
          const cleanFileName = decodeURIComponent(fileName?.split('/').pop() || '');
          const directDownloadUrl = `/direct-download/price-list/${encodeURIComponent(cleanFileName)}`;
          console.log('Using direct download URL:', directDownloadUrl);
          
          try {
            const response = await axios.get(directDownloadUrl, { 
              responseType: 'blob',
              headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0'
              }
            });
            return response;
          } catch (error) {
            console.error('Direct download failed:', error);
            throw error;
          }
        },
        
        // Метод 3: Через прямой доступ к файлу в storage
        async () => {
          console.log('Trying download method 3: Storage access');
          // Формируем правильный URL для скачивания
          let fileUrl = file.url || '';
          
          // Если URL отсутствует, но есть путь, формируем URL из пути
          if (!fileUrl && file.path) {
            if (file.path.startsWith('/')) {
              fileUrl = file.path;
            } else {
              fileUrl = `/storage/${file.path}`;
            }
          }
          
          console.log('Using storage URL:', fileUrl);
          try {
            const response = await axios.get(fileUrl, { 
              responseType: 'blob',
              headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0'
              }
            });
            return response;
          } catch (error) {
            console.error('Storage access failed:', error);
            throw error;
          }
        }
      ];
      
      let response = null;
      let error = null;
      
      // Получаем clean filename для использования в сообщениях об ошибках
      const cleanFileName = decodeURIComponent(fileName?.split('/').pop() || '');
      
      // Логируем детали для отладки
      console.log('Download attempt details:', {
        fileInfo: file,
        methods: [
          `/api/v2/download/price-list/${encodeURIComponent(cleanFileName)}`, 
          `/api/direct-download/price-list/${encodeURIComponent(cleanFileName)}`,
          file.url || ''
        ]
      });
      
      // Пробуем каждый метод по очереди
      for (let i = 0; i < downloadMethods.length; i++) {
        try {
          response = await downloadMethods[i]();
          if (response && response.status >= 200 && response.status < 300) {
            console.log(`Download method ${i+1} succeeded`);
            break;
          }
        } catch (err: any) {
          console.error(`Download method ${i+1} failed:`, err);
          error = err;
          
          // Если ошибка 404, пытаемся следующий метод
          if (err.response && err.response.status === 404) {
            console.log(`File not found with method ${i+1}, trying next method...`);
            continue;
          }
          
          // Анализируем детали ошибки для лучшего сообщения пользователю
          if (err.response) {
            console.error('Error response data:', err.response.data);
          }
        }
      }
      
      // Если все методы скачивания не сработали, показываем ошибку
      if (!response && error) {
        let errorMessage = 'Не удалось скачать файл';
        
        if (error.response) {
          if (error.response.status === 404) {
            errorMessage = `Файл "${cleanFileName}" не найден на сервере`;
          } else if (error.response.data && error.response.data.message) {
            errorMessage = `Ошибка: ${error.response.data.message}`;
          } else {
            errorMessage = `Ошибка сервера (${error.response.status})`;
          }
        } else if (error.message) {
          errorMessage = `Ошибка скачивания: ${error.message}`;
        }
        
        setError(errorMessage);
        return;
      }
      
      // Если у нас есть ответ, обрабатываем его
      if (response && response.data) {
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        
        // Создаем ссылку для скачивания
        const a = document.createElement('a');
        a.href = url;
        a.download = downloadName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Очищаем созданный URL
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      setError(`Ошибка при скачивании файла: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  // Вспомогательная функция для единообразной обработки путей файлов
  const normalizeFilePath = (file: FileInfo): string => {
    // Если это объект файла с путем, используем этот путь
    if (file.path) {
      // Если путь содержит полный путь с директориями, берем только имя файла
      const pathParts = file.path.split('/');
      return pathParts[pathParts.length - 1]; // Возвращаем только имя файла
    }
    
    // Если есть URL, но нет пути, извлекаем путь из URL
    if (file.url && !file.path) {
      // Извлекаем только имя файла из URL
      const urlParts = file.url.split('/');
      return urlParts[urlParts.length - 1]; // Возвращаем только имя файла
    }
    
    // В крайнем случае возвращаем строковое представление файла
    return String(file.id || file.name || 'unknown-file');
  };
  
  // Функция для удаления файла с нормализацией пути
  const handleRemoveFile = (file: FileInfo) => {
    const normalizedPath = normalizeFilePath(file);
    console.log('Removing file with normalized path:', normalizedPath);
    onRemoveFile(normalizedPath);
  };

  const FileDisplay: React.FC<{ file: FileInfo; onRemove: () => void; disabled: boolean }> = ({ file, onRemove, disabled }) => {
    // Determine file type for icon
    let fileType = 'unknown';
    let filePath = file.path || '';
    let fileName = file.name || getFileName(filePath);
    let fileUrl = file.url || filePath;
    
    console.log('FileDisplay rendering file:', { 
      file,
      name: fileName,
      path: filePath,
      url: fileUrl
    });
    
    if (filePath.match(/\.(pdf)$/i) || fileName.match(/\.(pdf)$/i)) {
      fileType = 'pdf';
    } else if (filePath.match(/\.(xls|xlsx)$/i) || fileName.match(/\.(xls|xlsx)$/i)) {
      fileType = 'excel';
    }
  
    return (
      <Box 
        display="flex" 
        alignItems="center" 
        p={1} 
        mb={1} 
        border="1px solid #e0e0e0" 
        borderRadius={1}
      >
        <Box mr={1}>
          {fileType === 'pdf' && <PictureAsPdf color="error" />}
          {fileType === 'excel' && <TableView color="success" />}
          {fileType === 'unknown' && <InsertDriveFile color="action" />}
        </Box>
        <Box flexGrow={1} overflow="hidden" textOverflow="ellipsis">
          <Tooltip title={fileName}>
            <Typography noWrap variant="body2">
              {fileName}
            </Typography>
          </Tooltip>
        </Box>
        <Box ml={1}>
          <Tooltip title="Скачать файл">
            <span>
              <IconButton 
                size="small"
                onClick={() => handleDownload(file)}
                disabled={!fileUrl}
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Удалить файл">
            <span>
              <IconButton 
                size="small" 
                onClick={() => handleRemoveFile(file)} 
                disabled={disabled}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={accept}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
        disabled={disabled || uploading}
      />

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1">
          {title} ({files.length}/{maxFiles})
        </Typography>
        <Tooltip title={files.length >= maxFiles ? `Достигнут лимит ${maxFiles} файлов` : buttonText}>
          <span>
            <Button
              variant="outlined"
              startIcon={uploading ? <CircularProgress size={16} /> : <UploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading || files.length >= maxFiles}
            >
              {uploading ? 'Загрузка...' : buttonText}
            </Button>
          </span>
        </Tooltip>
      </Box>

      {uploading && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Загрузка: {uploadProgress}%
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage(null)} sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <List>
        {files.map((file, index) => (
          <ListItem key={`file-${index}-${file.path}`}>
            <FileDisplay file={file} onRemove={() => onRemoveFile(file.path)} disabled={disabled} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default FileUploader;
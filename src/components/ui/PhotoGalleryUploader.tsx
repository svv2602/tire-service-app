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
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Dialog,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import api from '../../utils/axios';

interface Photo {
  id: number;
  path: string;
  url?: string;
  sort_order?: number;
}

interface Props {
  servicePointId: number;
  photos?: Photo[];
  maxPhotos?: number;
  disabled?: boolean;
  onPhotosChange?: (photos: Photo[]) => void;
}

const PhotoGalleryUploader: React.FC<Props> = ({
  servicePointId,
  photos: initialPhotos = [],
  maxPhotos = 10,
  disabled = false,
  onPhotosChange
}) => {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPhotos();
  }, [servicePointId]);

  const fetchPhotos = async () => {
    if (!servicePointId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/api/service-points/${servicePointId}/photos`);
      let photosData = response.data.data || [];
      
      // Sort photos by sort_order
      photosData.sort((a: Photo, b: Photo) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      
      setPhotos(photosData);
      if (onPhotosChange) {
        onPhotosChange(photosData);
      }
    } catch (err: any) {
      console.error('Failed to fetch photos:', err);
      setError(err.message || 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files.length || !servicePointId) return;
    
    setError(null);
    setSuccessMessage(null);
    
    const files = Array.from(event.target.files);
    
    // Check file types
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      setError('Можно загружать только изображения');
      return;
    }
    
    // Check file sizes (max 5MB per file)
    const maxSizeMB = 5;
    const oversizedFiles = files.filter(file => file.size > maxSizeMB * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError(`Размер каждого изображения не должен превышать ${maxSizeMB} MB`);
      return;
    }
    
    // Check if adding more photos would exceed the limit
    if (photos.length + files.length > maxPhotos) {
      setError(`Максимальное количество фотографий: ${maxPhotos}`);
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append('service_point_id', servicePointId.toString());
    
    files.forEach(file => {
      formData.append('photos[]', file);
    });
    
    try {
      const response = await api.post('/api/service-points/photos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      });

      const uploadedPhotos = response.data.data;
      const newPhotos = [...photos, ...uploadedPhotos];
      
      setPhotos(newPhotos);
      setSuccessMessage('Фото успешно загружены');
      
      if (onPhotosChange) {
        onPhotosChange(newPhotos);
      }
    } catch (err: any) {
      console.error('Failed to upload photos:', err);
      setError(err.message || 'Failed to upload photos');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (photoId: number) => {
    if (!servicePointId) return;
    
    try {
      await api.delete(`/api/service-points/${servicePointId}/photos/${photoId}`);
      const updatedPhotos = photos.filter(photo => photo.id !== photoId);
      setPhotos(updatedPhotos);
      setSuccessMessage('Фото успешно удалено');
      if (onPhotosChange) {
        onPhotosChange(updatedPhotos);
      }
    } catch (err: any) {
      console.error('Failed to delete photo:', err);
      setError(err.message || 'Failed to delete photo');
    }
  };

  const getFullImageUrl = (path: string) => {
    if (path.startsWith('http')) {
      return path;
    }
    return `${process.env.REACT_APP_API_URL}/storage/${path}`;
  };

  const closePhotoPreview = () => {
    setPreviewPhoto(null);
  };

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
        disabled={disabled || uploading}
      />

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1">
          Фотографии ({photos.length}/{maxPhotos})
        </Typography>
        <Tooltip title={photos.length >= maxPhotos ? `Достигнут лимит ${maxPhotos} фото` : "Добавить фото"}>
          <span>
            <Button
              variant="outlined"
              startIcon={uploading ? <CircularProgress size={16} /> : <UploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading || photos.length >= maxPhotos}
            >
              {uploading ? 'Загрузка...' : 'Добавить фото'}
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

      <ImageList cols={4} gap={16} sx={{ mt: 2 }}>
        {photos.map((photo) => (
          <ImageListItem 
            key={photo.id} 
            sx={{ 
              cursor: 'pointer',
              '&:hover': {
                '& .MuiImageListItemBar-root': {
                  opacity: 1
                },
                '& img': {
                  transform: 'scale(1.05)',
                  transition: 'transform 0.3s ease-in-out'
                }
              }
            }}
          >
            <img
              src={photo.url || getFullImageUrl(photo.path)}
              alt=""
              loading="lazy"
              onClick={() => setPreviewPhoto(photo)}
              style={{ 
                height: '200px',
                objectFit: 'cover',
                borderRadius: '8px',
                transition: 'transform 0.3s ease-in-out'
              }}
            />
            <ImageListItemBar
              position="top"
              sx={{
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                opacity: 0,
                transition: 'opacity 0.3s ease-in-out',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px'
              }}
              actionIcon={
                !disabled && (
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(photo.id);
                    }}
                    sx={{
                      color: 'white',
                      mr: 1,
                      mt: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.2)'
                      }
                    }}
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )
              }
            />
          </ImageListItem>
        ))}
      </ImageList>

      <Dialog 
        open={!!previewPhoto} 
        onClose={closePhotoPreview} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            boxShadow: 24,
            maxHeight: '90vh',
            maxWidth: '90vw !important'
          }
        }}
      >
        {previewPhoto && (
          <>
            <DialogContent sx={{ p: 0, position: 'relative' }}>
              <img
                src={previewPhoto.url || getFullImageUrl(previewPhoto.path)}
                alt=""
                style={{ 
                  width: '100%',
                  height: 'auto',
                  maxHeight: '80vh',
                  objectFit: 'contain'
                }}
              />
              <IconButton
                onClick={closePhotoPreview}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: 'white',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.7)'
                  }
                }}
              >
                <DeleteIcon />
              </IconButton>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default PhotoGalleryUploader;
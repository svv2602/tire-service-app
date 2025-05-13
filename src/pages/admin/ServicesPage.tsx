import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  DialogContentText,
  Stack,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { RootState } from '../../store';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { 
  fetchServices, 
  createService, 
  updateService, 
  deleteService,
  Service
} from '../../store/slices/servicesSlice';

interface ServiceFormData {
  name: string;
  description: string;
}

enum DialogType {
  NONE,
  CREATE,
  EDIT,
  DELETE,
}

const ServicesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: services, isLoading, error } = useSelector((state: RootState) => state.services);
  const [dialogType, setDialogType] = useState<DialogType>(DialogType.NONE);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: ''
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchServicesList();
  }, [dispatch]);

  const fetchServicesList = async () => {
    try {
      await dispatch(fetchServices()).unwrap();
    } catch (error) {
      console.error('Error fetching services:', error);
      // Error state is handled by the slice
    }
  };

  const handleOpenDialog = (type: DialogType, service?: Service) => {
    setDialogType(type);
    
    if (type === DialogType.EDIT && service) {
      setSelectedServiceId(service.id);
      setFormData({
        name: service.name,
        description: service.description || ''
      });
    } else if (type === DialogType.DELETE && service) {
      setSelectedServiceId(service.id);
    } else if (type === DialogType.CREATE) {
      setFormData({
        name: '',
        description: ''
      });
    }
  };

  const handleCloseDialog = () => {
    setDialogType(DialogType.NONE);
    setSelectedServiceId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await dispatch(createService(formData)).unwrap();
      
      handleCloseDialog();
      setSnackbar({
        open: true,
        message: 'Услуга успешно создана',
        severity: 'success',
      });
    } catch (err: any) {
      console.error('Failed to create service:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Не удалось создать услугу',
        severity: 'error',
      });
    }
  };

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedServiceId === null) return;
    
    try {
      await dispatch(updateService({
        id: selectedServiceId,
        data: formData
      })).unwrap();
      
      handleCloseDialog();
      setSnackbar({
        open: true,
        message: 'Услуга успешно обновлена',
        severity: 'success',
      });
    } catch (err: any) {
      console.error('Failed to update service:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Не удалось обновить услугу',
        severity: 'error',
      });
    }
  };

  const handleDeleteService = async () => {
    if (selectedServiceId === null) return;
    
    try {
      await dispatch(deleteService(selectedServiceId)).unwrap();
      
      handleCloseDialog();
      setSnackbar({
        open: true,
        message: 'Услуга успешно удалена',
        severity: 'success',
      });
    } catch (err: any) {
      console.error('Failed to delete service:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Не удалось удалить услугу',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center" marginBottom={3}>
        <Typography variant="h4" component="h1">
          Управление услугами
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog(DialogType.CREATE)}
        >
          Добавить услугу
        </Button>
        <Tooltip title="Обновить список">
          <IconButton onClick={fetchServicesList}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Название</TableCell>
                <TableCell>Описание</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Нет данных
                  </TableCell>
                </TableRow>
              ) : (
                services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>{service.id}</TableCell>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>{service.description}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(DialogType.EDIT, service)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDialog(DialogType.DELETE, service)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogType === DialogType.CREATE || dialogType === DialogType.EDIT} onClose={handleCloseDialog}>
        <DialogTitle>
          {dialogType === DialogType.CREATE ? 'Добавить услугу' : 'Редактировать услугу'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ pt: 1 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Название"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Описание"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
            />
            <Divider sx={{ my: 2 }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button
            onClick={dialogType === DialogType.CREATE ? handleCreateService : handleUpdateService}
            color="primary"
            variant="contained"
          >
            {dialogType === DialogType.CREATE ? 'Создать' : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={dialogType === DialogType.DELETE} onClose={handleCloseDialog}>
        <DialogTitle>Удаление услуги</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить эту услугу? Это действие нельзя отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleDeleteService} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ServicesPage; 
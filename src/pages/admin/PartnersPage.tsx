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
  Chip,
  IconButton,
  Tooltip,
  DialogContentText,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { RootState } from '../../store';
import {
  fetchPartners,
  createPartner,
  updatePartnerStatus,
  updatePartner,
  deletePartner,
} from '../../store/slices/partnersSlice';
import { fetchServicePoints, deleteServicePoint } from '../../store/slices/servicePointsSlice';
import { useAppDispatch } from '../../hooks/useAppDispatch';

interface PartnerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  status?: 'active' | 'inactive';
}

enum DialogType {
  NONE,
  CREATE,
  EDIT,
  DELETE,
}

const PartnersPage = () => {
  const dispatch = useAppDispatch();
  const { items: partners, isLoading, error } = useSelector((state: RootState) => state.partners);
  const { items: servicePoints } = useSelector((state: RootState) => state.servicePoints);
  const [dialogType, setDialogType] = useState<DialogType>(DialogType.NONE);
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingServicePoints, setDeletingServicePoints] = useState<boolean>(false);
  const [partnerServicePoints, setPartnerServicePoints] = useState<number[]>([]);
  const [formData, setFormData] = useState<PartnerFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    console.log('Initial data loading...');
    
    // Load service points and partners data
    dispatch(fetchServicePoints());
    dispatch(fetchPartners());
  }, [dispatch]);

  useEffect(() => {
    // When component is visible, check if we need to refresh service points
    if (dialogType === DialogType.DELETE) {
      console.log('Dialog shown, refreshing service point data');
      dispatch(fetchServicePoints());
    }
  }, [dialogType, dispatch]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await dispatch(fetchPartners());
    setIsRefreshing(false);
  };

  const handleStatusChange = async (id: number, newStatus: 'active' | 'inactive') => {
    try {
      // Show loading indicator by setting the refreshing state
      setIsRefreshing(true);
      
      console.log(`Updating partner ${id} status to ${newStatus}`);
      
      // Call the API to update status
      await dispatch(updatePartnerStatus({ id, status: newStatus })).unwrap();
      
      // Refresh the list to ensure we have the latest data
      await dispatch(fetchPartners()).unwrap();
      
      // Show success message
      alert(`Статус партнера успешно изменен на ${newStatus === 'active' ? 'активный' : 'неактивный'}`);
    } catch (error: any) {
      console.error('Failed to update partner status:', error);
      alert(`Не удалось изменить статус партнера. ${error.message || 'Попробуйте еще раз.'}`);
    } finally {
      // Hide loading indicator
      setIsRefreshing(false);
    }
  };

  const handleOpenDialog = (type: DialogType, partner?: any) => {
    setDialogType(type);
    
    if (type === DialogType.EDIT && partner) {
      setSelectedPartnerId(partner.id);
      setFormData({
        name: partner.name || partner.company_name || '',
        email: partner.email || '',
        phone: partner.phone || '',
        address: partner.address || '',
        status: partner.status || 'active',
      });
    } else if (type === DialogType.DELETE && partner) {
      setSelectedPartnerId(partner.id);
      
      // Find service points associated with this partner
      const associatedServicePoints = servicePoints.filter(sp => sp.partner_id === partner.id);
      console.log(`Found ${associatedServicePoints.length} service points for partner ${partner.id}`);
      
      setPartnerServicePoints(associatedServicePoints.map(sp => sp.id));
    } else if (type === DialogType.CREATE) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        status: 'active',
      });
    }
  };

  const handleCloseDialog = () => {
    setDialogType(DialogType.NONE);
    setSelectedPartnerId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Map frontend form data to backend expected structure
      const partnerData = {
        name: formData.name,
        email: formData.email,
        company_name: formData.name,
        contact_person: formData.name,
        phone: formData.phone,
        address: formData.address,
        status: 'active' as const
      };
      
      console.log('Creating partner with data:', partnerData);
      
      await dispatch(createPartner(partnerData)).unwrap();
      handleCloseDialog();
      // Refresh the list to ensure we have the latest data
      dispatch(fetchPartners());
    } catch (error) {
      console.error('Failed to create partner:', error);
      alert('Не удалось создать партнера. Проверьте введенные данные и попробуйте еще раз.');
    }
  };

  const handleUpdatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPartnerId) {
      try {
        // Map frontend form data to backend expected structure
        const partnerData = {
          name: formData.name,
          email: formData.email,
          company_name: formData.name,
          contact_person: formData.name,
          phone: formData.phone,
          address: formData.address,
          status: (formData.status || 'active') as 'active' | 'inactive'
        };
        
        console.log('Updating partner with data:', partnerData);
        
        await dispatch(updatePartner({
          id: selectedPartnerId,
          data: partnerData
        })).unwrap();
        handleCloseDialog();
        // Refresh the list to ensure we have the latest data
        dispatch(fetchPartners());
      } catch (error) {
        console.error('Failed to update partner:', error);
        alert('Не удалось обновить партнера. Проверьте введенные данные и попробуйте еще раз.');
      }
    }
  };

  const handleDeletePartner = async () => {
    if (selectedPartnerId) {
      try {
        setDeletingServicePoints(true);
        await dispatch(deletePartner(selectedPartnerId)).unwrap();
        setDeletingServicePoints(false);
        handleCloseDialog();
        dispatch(fetchPartners());
        dispatch(fetchServicePoints());
      } catch (error: any) {
        setDeletingServicePoints(false);
        // Новая логика: если ошибка содержит payload с partner/service_points, обновляем их вручную
        const msg = error?.message || error?.toString() || '';
        const payload = error?.partner || error?.service_points ? error : error?.payload;
        if (payload && (payload.partner || payload.service_points)) {
          // Обновляем партнёра в Redux
          if (payload.partner) {
            dispatch({ type: 'partners/updatePartnerStatus/fulfilled', payload: payload.partner });
          }
          // Обновляем точки в Redux
          if (payload.service_points && Array.isArray(payload.service_points)) {
            payload.service_points.forEach((sp: any) => {
              dispatch({ type: 'servicePoints/updateServicePoint/fulfilled', payload: sp });
            });
          }
          alert(msg);
        } else if (msg.includes('бронирования')) {
          alert(msg);
          dispatch(fetchPartners());
          dispatch(fetchServicePoints());
        } else {
          alert('Не удалось удалить партнера. Попробуйте еще раз.');
        }
      }
    }
  };

  if (isLoading && partners.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography color="error" gutterBottom>{error}</Typography>
        <Button variant="contained" onClick={handleRefresh} startIcon={<RefreshIcon />}>
          Попробовать снова
        </Button>
      </Box>
    );
  }

  const selectedPartner = selectedPartnerId ? partners.find(p => p.id === selectedPartnerId) : null;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Управление партнерами</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Обновление...' : 'Обновить'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog(DialogType.CREATE)}
          >
            Добавить партнера
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Телефон</TableCell>
              <TableCell>Адрес</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {partners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Нет данных</TableCell>
              </TableRow>
            ) : (
              partners.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell>{partner.name}</TableCell>
                  <TableCell>{partner.email}</TableCell>
                  <TableCell>{partner.phone}</TableCell>
                  <TableCell>{partner.address}</TableCell>
                  <TableCell>
                    <Chip
                      icon={partner.status === 'active' ? <ActiveIcon /> : <InactiveIcon />}
                      label={partner.status === 'active' ? 'Активен' : 'Неактивен'}
                      color={partner.status === 'active' ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Редактировать">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(DialogType.EDIT, partner)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDialog(DialogType.DELETE, partner)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={partner.status === 'active' ? 'Деактивировать' : 'Активировать'}>
                        <Button
                          size="small"
                          variant="outlined"
                          color={partner.status === 'active' ? 'error' : 'success'}
                          onClick={() => handleStatusChange(
                            partner.id,
                            partner.status === 'active' ? 'inactive' : 'active'
                          )}
                          startIcon={partner.status === 'active' ? <InactiveIcon /> : <ActiveIcon />}
                        >
                          {partner.status === 'active' ? 'Деактивировать' : 'Активировать'}
                        </Button>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Dialog */}
      <Dialog open={dialogType === DialogType.CREATE} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Добавить партнера</DialogTitle>
        <DialogContent>
          <Box component="form" id="create-form" onSubmit={handleCreatePartner} sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Название компании"
              name="name"
              value={formData.name}
              onChange={handleChange}
              helperText="Название компании партнера"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Телефон"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Адрес"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button 
            type="submit" 
            form="create-form"
            variant="contained" 
            color="primary"
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={dialogType === DialogType.EDIT} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Редактировать партнера</DialogTitle>
        <DialogContent>
          <Box component="form" id="edit-form" onSubmit={handleUpdatePartner} sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Название компании"
              name="name"
              value={formData.name}
              onChange={handleChange}
              helperText="Название компании партнера"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Телефон"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Адрес"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button 
            type="submit" 
            form="edit-form"
            variant="contained" 
            color="primary"
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={dialogType === DialogType.DELETE} onClose={handleCloseDialog}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <WarningIcon color="error" sx={{ mr: 1 }} /> Удалить партнера
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить партнера «{selectedPartner?.name || selectedPartner?.company_name || 'Без названия'}»?
          </DialogContentText>
          
          {partnerServicePoints.length > 0 ? (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Внимание!</strong> Вместе с партнером будут удалены {partnerServicePoints.length} связанных {
                  partnerServicePoints.length === 1 ? 'торговая точка' : 
                  partnerServicePoints.length > 1 && partnerServicePoints.length < 5 ? 'торговые точки' : 
                  'торговых точек'
                }.
              </Typography>
            </Alert>
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                У данного партнера нет связанных торговых точек.
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button 
            onClick={handleDeletePartner} 
            variant="contained" 
            color="error"
            disabled={deletingServicePoints}
            startIcon={deletingServicePoints ? <CircularProgress size={16} /> : null}
          >
            {deletingServicePoints ? 'Удаление...' : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PartnersPage;
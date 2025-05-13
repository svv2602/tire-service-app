import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '@mui/material/styles';
import { Snackbar, Alert, SnackbarCloseReason } from '@mui/material';
import { RootState } from '../../store';
import { clearNotification, Notification } from '../../store/slices/notificationsSlice';

const NotificationContainer = styled('div')(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: 9999,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

const Notifications: React.FC = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state: RootState) => state.notifications.notifications);

  const handleClose = (id: string) => (event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch(clearNotification(id));
  };

  // Автоматически закрываем уведомления по истечении их duration
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    notifications.forEach((notification) => {
      if (notification.duration) {
        const timer = setTimeout(() => {
          dispatch(clearNotification(notification.id || ''));
        }, notification.duration);
        timers.push(timer);
      }
    });
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [notifications, dispatch]);

  if (notifications.length === 0) return null;

  return (
    <NotificationContainer>
      {notifications.map((notification: Notification) => (
        <Snackbar
          key={notification.id}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={true}
          onClose={handleClose(notification.id || '')}
          autoHideDuration={notification.duration || 5000}
        >
          <Alert
            onClose={handleClose(notification.id || '')}
            severity={notification.type}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </NotificationContainer>
  );
};

export default Notifications; 
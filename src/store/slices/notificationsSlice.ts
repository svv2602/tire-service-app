import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  id?: string;
}

interface NotificationsState {
  notifications: Notification[];
}

const initialState: NotificationsState = {
  notifications: []
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotification: (state, action: PayloadAction<Notification>) => {
      const id = Date.now().toString();
      state.notifications.push({
        ...action.payload,
        id
      });
    },
    clearNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(notification => notification.id !== action.payload);
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    }
  }
});

export const { setNotification, clearNotification, clearAllNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer; 
import { createAsyncThunk } from '@reduxjs/toolkit';
import { NOTIFICATIONS_API, MARK_NOTIFICATION_READ_API } from '@/store/constants/api';
import api from '@/lib/api';
import { RootState } from '@/store/store';

export interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  priority: string;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
  metadata?: {
    subject?: string;
    recipient?: string;
    sent_email_id?: string;
  };
}

export interface NotificationsResponse {
  notifications: Notification[];
  total_unread: number;
}

export const fetchNotifications = createAsyncThunk<
  NotificationsResponse,
  void,
  { state: RootState }
>('notifications/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<NotificationsResponse>(NOTIFICATIONS_API);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
  }
});

export const markNotificationAsRead = createAsyncThunk<
  { id: string },
  string,
  { state: RootState }
>('notifications/markAsRead', async (notificationId, { rejectWithValue }) => {
  try {
    await api.post(MARK_NOTIFICATION_READ_API(notificationId));
    return { id: notificationId };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read');
  }
});

export const markAllNotificationsAsRead = createAsyncThunk<
  void,
  void,
  { state: RootState }
>('notifications/markAllAsRead', async (_, { getState, dispatch, rejectWithValue }) => {
  try {
    const { notifications } = getState().notifications;
    await Promise.all(
      notifications
        .filter(notif => !notif.is_read)
        .map(notif => dispatch(markNotificationAsRead(notif.id)))
    );
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to mark all notifications as read');
  }
});

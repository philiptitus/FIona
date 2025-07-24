import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { 
  fetchNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from "@/store/actions/notificationActions";

export interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  metadata?: {
    subject?: string;
    recipient?: string;
    [key: string]: any;
  };
}

export interface NotificationsState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  totalUnread: number;
  lastFetched: number | null;
}

const initialState: NotificationsState = {
  notifications: [],
  loading: false,
  error: null,
  totalUnread: 0,
  lastFetched: null,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification(state, action: PayloadAction<Notification>) {
      // Prevent duplicates
      if (!state.notifications.some(n => n.id === action.payload.id)) {
        state.notifications.unshift(action.payload);
        if (!action.payload.is_read) {
          state.totalUnread += 1;
        }
      }
    },
    clearNotifications(state) {
      state.notifications = [];
      state.totalUnread = 0;
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Notifications
    builder.addCase(fetchNotifications.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.loading = false;
      state.notifications = action.payload.notifications;
      state.totalUnread = action.payload.total_unread;
      state.lastFetched = Date.now();
    });
    builder.addCase(fetchNotifications.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Mark Notification as Read
    builder.addCase(markNotificationAsRead.fulfilled, (state, action) => {
      // Remove the notification from the list when marked as read
      state.notifications = state.notifications.filter(n => n.id !== action.payload.id);
      state.totalUnread = Math.max(0, state.totalUnread - 1);
    });
    
    // Handle rejection for mark as read
    builder.addCase(markNotificationAsRead.rejected, (state, action) => {
      console.error('Failed to mark notification as read:', action.payload);
    });

    // Mark All Notifications as Read
    builder.addCase(markAllNotificationsAsRead.fulfilled, (state) => {
      state.notifications = state.notifications.map(notification => ({
        ...notification,
        is_read: true,
      }));
      state.totalUnread = 0;
    });
  },
});

export const { addNotification, clearNotifications } = notificationsSlice.actions;

export const selectNotifications = (state: { notifications: NotificationsState }) => state.notifications.notifications;
export const selectUnreadCount = (state: { notifications: NotificationsState }) => state.notifications.totalUnread;
export const selectIsLoading = (state: { notifications: NotificationsState }) => state.notifications.loading;
export const selectError = (state: { notifications: NotificationsState }) => state.notifications.error;

export default notificationsSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface FirebaseNotification {
  id: string
  title: string
  message: string
  type: string
  timestamp: number
  read?: boolean
}

export interface FirebaseNotificationsState {
  notifications: FirebaseNotification[]
}

const initialState: FirebaseNotificationsState = {
  notifications: [],
}

const firebaseNotificationsSlice = createSlice({
  name: "firebaseNotifications",
  initialState,
  reducers: {
    addFirebaseNotification(state, action: PayloadAction<FirebaseNotification>) {
      // Prevent duplicates
      if (!state.notifications.some((n) => n.id === action.payload.id)) {
        state.notifications.unshift(action.payload)
      }
    },
    removeFirebaseNotification(state, action: PayloadAction<string>) {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload)
    },
    clearFirebaseNotifications(state) {
      state.notifications = []
    },
  },
})

export const { addFirebaseNotification, removeFirebaseNotification, clearFirebaseNotifications } =
  firebaseNotificationsSlice.actions
export default firebaseNotificationsSlice.reducer

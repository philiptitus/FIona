import {
  configureStore,
  type Middleware,
  type ThunkAction,
  type Action,
  type EnhancedStore,
  type ThunkMiddleware,
} from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import campaignReducer from "./slices/campaignSlice"
import emailReducer from "./slices/emailSlice"
import templateReducer from "./slices/templateSlice"
import contentReducer from "./slices/contentSlice"
import dispatchReducer from "./slices/dispatchSlice"
import settingsReducer from "./settingsSlice"
import metricsReducer from "./slices/metricsSlice"
import notificationsReducer from "./slices/notificationsSlice"
import tasksReducer from "./slices/tasksSlice"
import { authMiddleware } from "./middleware/authMiddleware"

const rootReducer = {
  auth: authReducer,
  campaigns: campaignReducer,
  emails: emailReducer,
  template: templateReducer,
  content: contentReducer,
  dispatch: dispatchReducer,
  settings: settingsReducer,
  metrics: metricsReducer,
  notifications: notificationsReducer,
  tasks: tasksReducer,
} as const

type StoreMiddleware = Middleware<{}, ReturnType<typeof store.getState>>

// Create store with proper typing
const store: EnhancedStore = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(authMiddleware as StoreMiddleware),
})

// Define types before exporting store
type RootState = ReturnType<typeof store.getState>
type AppDispatch = typeof store.dispatch
type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>

export type { RootState, AppDispatch, AppThunk }
export { store }

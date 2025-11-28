import { configureStore, type Middleware, type ThunkAction, type Action, type ThunkDispatch, type AnyAction, type ReducersMapObject } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import campaignReducer from "./slices/campaignSlice"
import emailReducer from "./slices/emailSlice"
import templateReducer from "./slices/templateSlice"
import contentReducer from "./slices/contentSlice"
import dispatchReducer from "./slices/dispatchSlice"
import settingsReducer from "./settingsSlice"
import metricsReducer from "./slices/metricsSlice"
import analyticsReducer from "./slices/analyticsSlice"
import notificationsReducer from "./slices/notificationsSlice"
import tasksReducer from "./slices/tasksSlice"
import sentEmailReducer from "./slices/sentEmailSlice"
import { authMiddleware } from "./middleware/authMiddleware"
import mailboxReducer from "./slices/mailboxSlice"
import contactListReducer from "./slices/contactListSlice"
import workflowReducer from "./slices/workflowSlice"
import linksReducer from "./slices/linksSlice"

// Define root state type
type RootState = {
  auth: ReturnType<typeof authReducer>
  campaigns: ReturnType<typeof campaignReducer>
  emails: ReturnType<typeof emailReducer>
  template: ReturnType<typeof templateReducer>
  content: ReturnType<typeof contentReducer>
  dispatch: ReturnType<typeof dispatchReducer>
  settings: ReturnType<typeof settingsReducer>
  metrics: ReturnType<typeof metricsReducer>
  analytics: ReturnType<typeof analyticsReducer>
  notifications: ReturnType<typeof notificationsReducer>
  tasks: ReturnType<typeof tasksReducer>
  mailbox: ReturnType<typeof mailboxReducer>
  sentEmail: ReturnType<typeof sentEmailReducer>
  contactList: ReturnType<typeof contactListReducer>
  workflows: ReturnType<typeof workflowReducer>
  links: ReturnType<typeof linksReducer>
}

// Create root reducer with proper typing
const rootReducer: ReducersMapObject<RootState> = {
  auth: authReducer,
  campaigns: campaignReducer,
  emails: emailReducer,
  template: templateReducer,
  content: contentReducer,
  dispatch: dispatchReducer,
  settings: settingsReducer,
  metrics: metricsReducer,
  analytics: analyticsReducer,
  notifications: notificationsReducer,
  tasks: tasksReducer,
  mailbox: mailboxReducer,
  sentEmail: sentEmailReducer,
  contactList: contactListReducer,
  workflows: workflowReducer,
  links: linksReducer,
}

// Define app dispatch type with thunk support
type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>

// Create store with proper typing
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: false,
    }).concat(authMiddleware as Middleware)
  },
})

// Export types
export type { RootState, AppDispatch }
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, AnyAction>

export { store }

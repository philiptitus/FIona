import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type Theme = 'light' | 'dark' | 'system'
export type FontSize = 'sm' | 'base' | 'lg'

export interface Notifications {
  email: boolean
  push: boolean
  sound: boolean
}

export interface SettingsState {
  theme: Theme
  fontSize: FontSize
  compactMode: boolean
  notifications: Notifications
  language: string
  timezone: string
}

const initialState: SettingsState = {
  theme: 'system',
  fontSize: 'base',
  compactMode: false,
  notifications: {
    email: true,
    push: true,
    sound: false,
  },
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload
    },
    setFontSize(state, action: PayloadAction<FontSize>) {
      state.fontSize = action.payload
    },
    setCompactMode(state, action: PayloadAction<boolean>) {
      state.compactMode = action.payload
    },
    setNotifications(state, action: PayloadAction<Notifications>) {
      state.notifications = action.payload
    },
    setLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload
    },
    setTimezone(state, action: PayloadAction<string>) {
      state.timezone = action.payload
    },
  },
})

export const {
  setTheme,
  setFontSize,
  setCompactMode,
  setNotifications,
  setLanguage,
  setTimezone,
} = settingsSlice.actions

export default settingsSlice.reducer

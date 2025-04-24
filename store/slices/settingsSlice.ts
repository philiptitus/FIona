import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export type Theme = "light" | "dark" | "system"
export type FontSize = "sm" | "base" | "lg"

export interface Notifications {
  email: boolean
  push: boolean
  sound: boolean
}

export interface SettingsState {
  theme: Theme
  fontSize: FontSize
  language: string
  notifications: Notifications
}

const initialState: SettingsState = {
  theme: "system",
  fontSize: "base",
  language: "en",
  notifications: {
    email: true,
    push: false,
    sound: true,
  },
}

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload
    },
    setFontSize(state, action: PayloadAction<FontSize>) {
      state.fontSize = action.payload
    },
    setLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload
    },
    setNotifications(state, action: PayloadAction<Notifications>) {
      state.notifications = action.payload
    },
  },
})

export const {
  setTheme,
  setFontSize,
  setLanguage,
  setNotifications,
} = settingsSlice.actions

export default settingsSlice.reducer

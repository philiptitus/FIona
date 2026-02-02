import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface User {
  id: number
  first_name: string
  username: string
  email: string
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isProfileLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  isProfileLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    fetchProfileStart: (state) => {
      state.isProfileLoading = true;
      state.error = null;
    },
    fetchProfileSuccess: (state, action: PayloadAction<User>) => {
      state.isProfileLoading = false;
      state.user = action.payload;
      state.error = null;
      state.error = null
    },
    fetchProfileFailure: (state, action: PayloadAction<string>) => {
      state.isProfileLoading = false
      state.error = action.payload
    },
    loginStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string; refreshToken: string; expiresAt?: number }>) => {
      state.isLoading = false
      state.isAuthenticated = true
      state.user = action.payload.user
      state.token = action.payload.token
      state.refreshToken = action.payload.refreshToken
      state.error = null
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.isAuthenticated = false
      state.user = null
      state.token = null
      state.refreshToken = null
      state.error = action.payload
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.token = null
      state.refreshToken = null
      state.error = null
    },
    registerStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    registerSuccess: (state) => {
      state.isLoading = false
      state.error = null
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    updateProfileStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    updateProfileSuccess: (state, action: PayloadAction<User>) => {
      state.isLoading = false
      state.user = action.payload
      state.error = null
    },
    updateProfileFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    passwordResetStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    passwordResetSuccess: (state) => {
      state.isLoading = false
      state.error = null
    },
    passwordResetFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
  },
})

// Export actions
export const authActions = {
  ...authSlice.actions
};

// Export individual actions for better autocompletion
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  registerStart,
  registerSuccess,
  registerFailure,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  passwordResetStart,
  passwordResetSuccess,
  passwordResetFailure,
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
} = authSlice.actions;

// Export the reducer as default
export default authSlice.reducer

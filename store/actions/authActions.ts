import { createAsyncThunk, type Action, type ThunkDispatch, type AnyAction } from "@reduxjs/toolkit"
import type { RootState } from "../store"
import {
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
} from "../slices/authSlice"
import api from "@/lib/api"
import { API_ENDPOINTS } from "@/lib/constants/api"
import { getErrorMessage } from "@/lib/utils/error"
import Cookies from "js-cookie"

// Type definitions
type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>

interface LoginResponse {
  id: number
  first_name: string
  username: string
  email: string
  access: string
  refresh: string
}

interface LoginCredentials {
  username: string
  password: string
}

interface RegisterCredentials {
  name: string
  email: string
  password: string
}

interface UpdateProfileData {
  name?: string
  email?: string
  password?: string
}

// Helper function to set auth cookies
const setAuthCookies = (token: string, refreshToken: string) => {
  // Set cookies with secure options
  Cookies.set("token", token, {
    expires: 1, // 1 day
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  })
  Cookies.set("refreshToken", refreshToken, {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  })
}

// Helper function to remove auth cookies
const removeAuthCookies = () => {
  Cookies.remove("token")
  Cookies.remove("refreshToken")
}

// Async thunks
export const loginUser = createAsyncThunk<LoginResponse, LoginCredentials>(
  "auth/login",
  async (credentials) => {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials)
    return response.data
  },
)

export const registerUser = createAsyncThunk<void, RegisterCredentials>(
  "auth/register",
  async (credentials) => {
    await api.post(API_ENDPOINTS.AUTH.REGISTER, credentials)
  },
)

export const updateProfile = createAsyncThunk<any, UpdateProfileData>(
  "auth/updateProfile",
  async (data) => {
    const response = await api.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, data)
    return response.data
  },
)

export const requestPasswordReset = createAsyncThunk<void, string>(
  "auth/requestPasswordReset",
  async (email) => {
    await api.post(API_ENDPOINTS.AUTH.PASSWORD_RESET, { email })
  },
)

// Action creators
export const handleLogin = createAsyncThunk<
  boolean,
  { email: string; password: string },
  { dispatch: AppDispatch }
>(
  "auth/handleLogin",
  async (credentials, { dispatch }) => {
    dispatch(loginStart())
    try {
      const resultAction = await dispatch(loginUser({ username: credentials.email, password: credentials.password }))
      if (loginUser.fulfilled.match(resultAction)) {
        const { access: token, refresh: refreshToken, ...user } = resultAction.payload
        dispatch(loginSuccess({ user, token, refreshToken }))
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`
        setAuthCookies(token, refreshToken)
        return true
      }
      dispatch(loginFailure("Login failed"))
      return false
    } catch (error) {
      dispatch(loginFailure(getErrorMessage(error)))
      return false
    }
  }
)

export const handleRegister = createAsyncThunk<
  boolean,
  RegisterCredentials,
  { dispatch: AppDispatch }
>(
  "auth/handleRegister",
  async (credentials, { dispatch }) => {
    dispatch(registerStart())
    try {
      await dispatch(registerUser(credentials))
      dispatch(registerSuccess())
      return true
    } catch (error) {
      dispatch(registerFailure(getErrorMessage(error)))
      return false
    }
  }
)

export const fetchUserProfile = createAsyncThunk<User, void, { dispatch: AppDispatch }>(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(API_ENDPOINTS.AUTH.PROFILE)
      return response.data
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const handleLogout = () => (dispatch: AppDispatch) => {
  removeAuthCookies()
  dispatch(logout())
  window.location.href = "/login"
}

export const handleUpdateProfile = createAsyncThunk<
  boolean,
  UpdateProfileData,
  { dispatch: AppDispatch }
>(
  "auth/handleUpdateProfile",
  async (data, { dispatch }) => {
    dispatch(updateProfileStart())
    try {
      const resultAction = await dispatch(updateProfile(data))
      if (updateProfile.fulfilled.match(resultAction)) {
        dispatch(updateProfileSuccess(resultAction.payload))
        return true
      }
      dispatch(updateProfileFailure("Profile update failed"))
      return false
    } catch (error) {
      dispatch(updateProfileFailure(getErrorMessage(error)))
      return false
    }
  }
)

export const handlePasswordReset = createAsyncThunk<
  boolean,
  string,
  { dispatch: AppDispatch }
>(
  "auth/handlePasswordReset",
  async (email, { dispatch }) => {
    dispatch(passwordResetStart())
    try {
      await dispatch(requestPasswordReset(email))
      dispatch(passwordResetSuccess())
      return true
    } catch (error) {
      dispatch(passwordResetFailure(getErrorMessage(error)))
      return false
    }
  }
)

export const deleteUserAccount =
  () =>
  async (dispatch: AppDispatch): Promise<boolean> => {
    try {
      await api.delete(API_ENDPOINTS.AUTH.DELETE_ACCOUNT)
      handleLogout()(dispatch)
      return true
    } catch (error) {
      throw getErrorMessage(error)
    }
  }

import { Middleware } from "@reduxjs/toolkit"
import { RootState } from "../store"
import { loginSuccess, logout } from "../slices/authSlice"

export const authMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  // Handle successful login
  if (loginSuccess.match(action)) {
    const { token, refreshToken, user } = action.payload
    localStorage.setItem("token", token)
    localStorage.setItem("refreshToken", refreshToken)
    localStorage.setItem("user", JSON.stringify(user))
    localStorage.setItem("tokenExpiry", String(Date.now() + 15 * 60 * 1000)) // 15 minutes
  }

  // Handle logout
  if (logout.match(action)) {
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
    localStorage.removeItem("tokenExpiry")
  }

  return next(action)
}

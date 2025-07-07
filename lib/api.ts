import axios from "axios"
import { getCookie } from "./utils"

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor for adding auth token and CSRF token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Add CSRF token for unsafe methods
    const method = config.method?.toUpperCase()
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method || "")) {
      const csrfToken = getCookie("csrftoken")
      if (csrfToken) {
        config.headers["X-CSRFToken"] = csrfToken
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // If the error is due to an expired token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Attempt to refresh the token
        const refreshToken = localStorage.getItem("refreshToken")
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/access/token/refresh/`,
          {
            refresh: refreshToken,
          },
        )

        // If successful, update the token and retry the original request
        const { access } = response.data
        localStorage.setItem("token", access)
        api.defaults.headers.common["Authorization"] = `Bearer ${access}`
        return api(originalRequest)
      } catch (refreshError) {
        // If refresh fails, clear tokens and reject error
        localStorage.removeItem("token")
        localStorage.removeItem("refreshToken")
        return Promise.reject(refreshError)
      }
    }

    // Handle 403 Forbidden (session expired or invalid)
    if (error.response?.status === 403) {
      // Clear entire localStorage to ensure all auth data is removed
      localStorage.clear()
      
      // Clear all cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      // Dynamically import toast to avoid circular dependency
      import("@/hooks/use-toast").then(({ toast }) => {
        toast({
          title: "Session expired",
          description: "Please sign in again.",
          variant: "destructive",
        })
      })
      // Note: Removed automatic redirect - let the app handle navigation
    }

    return Promise.reject(error)
  },
)

export default api

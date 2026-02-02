import axios from "axios"
import { getCookie } from "./utils"
import { lamdaurl } from "./route"

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor for adding auth token, CSRF token, and switching to Lambda URL if needed
api.interceptors.request.use(
  (config) => {
    // If useLambda is set, override baseURL for this request
    if ((config as any).useLambda) {
      config.baseURL = lamdaurl
    }
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

// Response interceptor for handling token refresh using Cognito signinSilent
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
        // Attempt to refresh the token using Cognito's signinSilent
        const { authManager } = await import("@/lib/authManager")
        const newToken = await authManager.refreshToken()

        if (newToken) {
          // If successful, update the header and retry the original request
          api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`
          return api(originalRequest)
        } else {
          // If refresh fails, clear tokens and redirect to login
          throw new Error("Token refresh failed")
        }
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem("token")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("tokenExpiry")
        localStorage.removeItem("user")
        
        // Clear cookies
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        window.location.href = "/auth/login"
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
        // Redirect to login page after showing toast
        window.location.href = "/auth/login";
      })
    }

    return Promise.reject(error)
  },
)

export default api

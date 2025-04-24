import axios from "axios"

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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

    return Promise.reject(error)
  },
)

export default api

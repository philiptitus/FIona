import { AxiosError } from "axios"

interface ApiError {
  detail?: string
  message?: string
  error?: string
  [key: string]: any
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError | undefined

    // Check for various error message formats
    if (data) {
      if (data.detail) return data.detail
      if (data.message) return data.message
      if (data.error) return data.error
      
      // Handle field-specific errors
      const fieldErrors = Object.entries(data)
        .filter(([key]) => !["detail", "message", "error"].includes(key))
        .map(([field, message]) => `${field}: ${message}`)
      
      if (fieldErrors.length > 0) {
        return fieldErrors.join(", ")
      }
    }

    // Fallback to status text or generic message
    if (error.response?.statusText) {
      return error.response.statusText
    }
  }

  // Handle non-Axios errors
  if (error instanceof Error) {
    return error.message
  }

  return "An unexpected error occurred"
}

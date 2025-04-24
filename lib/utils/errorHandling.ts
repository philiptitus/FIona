interface ErrorResponse {
  detail?: string;
  email?: string[];
  password?: string[];
  name?: string[];
  non_field_errors?: string[];
  [key: string]: any;
}

export const getErrorMessage = (error: any): string => {
  if (!error) return 'An unknown error occurred'

  // Handle network errors
  if (!error.response) {
    return 'Network error. Please check your connection and try again.'
  }

  const data = error.response?.data as ErrorResponse

  // Handle specific field errors
  if (data) {
    // Check for field-specific errors
    const fieldErrors = ['email', 'password', 'name', 'non_field_errors']
      .map(field => data[field]?.[0])
      .filter(Boolean)

    if (fieldErrors.length > 0) {
      return fieldErrors[0]
    }

    // Check for detail message
    if (data.detail) {
      return data.detail
    }
  }

  // Handle HTTP status code errors
  switch (error.response?.status) {
    case 400:
      return 'Invalid request. Please check your input.'
    case 401:
      return 'Authentication failed. Please log in again.'
    case 403:
      return 'You do not have permission to perform this action.'
    case 404:
      return 'The requested resource was not found.'
    case 429:
      return 'Too many attempts. Please try again later.'
    case 500:
      return 'Server error. Please try again later.'
    default:
      return 'An unexpected error occurred. Please try again.'
  }
}

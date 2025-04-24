export const validatePassword = (password: string, name: string = '', email: string = ''): { isValid: boolean; error: string } => {
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' }
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must include at least one uppercase letter' }
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must include at least one lowercase letter' }
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must include at least one number' }
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, error: 'Password must include at least one special character' }
  }

  const nameLower = name.toLowerCase()
  const emailLower = email.toLowerCase()
  const passwordLower = password.toLowerCase()

  if (nameLower && passwordLower.includes(nameLower)) {
    return { isValid: false, error: 'Password cannot contain your name' }
  }

  if (emailLower && passwordLower.includes(emailLower.split('@')[0])) {
    return { isValid: false, error: 'Password cannot contain your email' }
  }

  return { isValid: true, error: '' }
}

export const validateEmail = (email: string): { isValid: boolean; error: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' }
  }
  return { isValid: true, error: '' }
}

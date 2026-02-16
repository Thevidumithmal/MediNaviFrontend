// Validation utility functions

export const validateEmail = (email) => {
  if (!email) return 'Email is required'
  if (!email.includes('@')) return 'Email must contain @'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return 'Invalid email format'
  return ''
}

export const validatePhone = (phone) => {
  if (!phone) return '' // Phone is optional in most cases
  
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '')
  
  // Accept formats: 0714582468 or +94714582468
  const phoneRegex = /^(\+94|0)?[0-9]{9,10}$/
  
  if (!phoneRegex.test(cleaned)) {
    return 'Phone must be 10 digits (e.g., 0714582468 or +94714582468)'
  }
  
  return ''
}

export const validatePhoneRequired = (phone) => {
  if (!phone || !phone.trim()) return 'Phone number is required'
  
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '')
  
  // Accept formats: 0714582468 or +94714582468
  const phoneRegex = /^(\+94|0)?[0-9]{9,10}$/
  
  if (!phoneRegex.test(cleaned)) {
    return 'Phone must be 10 digits (e.g., 0714582468 or +94714582468)'
  }
  
  return ''
}

export const validatePassword = (password, minLength = 6) => {
  if (!password) return 'Password is required'
  if (password.length < minLength) return `Password must be at least ${minLength} characters`
  return ''
}

export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || !value.toString().trim()) return `${fieldName} is required`
  return ''
}

export const validateUsername = (username) => {
  if (!username) return 'Username is required'
  if (username.length < 3) return 'Username must be at least 3 characters'
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores'
  return ''
}

export const validateName = (name) => {
  if (!name || !name.trim()) return 'Name is required'
  if (name.trim().length < 2) return 'Name must be at least 2 characters'
  return ''
}

export const validateLatitude = (lat) => {
  if (lat === '' || lat === null || lat === undefined) return ''
  const num = Number(lat)
  if (isNaN(num)) return 'Latitude must be a number'
  if (num < -90 || num > 90) return 'Latitude must be between -90 and 90'
  return ''
}

export const validateLongitude = (lng) => {
  if (lng === '' || lng === null || lng === undefined) return ''
  const num = Number(lng)
  if (isNaN(num)) return 'Longitude must be a number'
  if (num < -180 || num > 180) return 'Longitude must be between -180 and 180'
  return ''
}

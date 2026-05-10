// Input validation utilities

// Sanitize name: remove special characters, allow letters, spaces, hyphens, apostrophes
export function sanitizeName(value) {
  return value.replace(/[^a-zA-ZÀ-ỹ\s\-']/g, '')
}

// Sanitize phone: only numbers, spaces, +, -, ()
export function sanitizePhone(value) {
  return value.replace(/[^0-9\s\+\-\(\)]/g, '')
}

// Validate email format
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Validate phone (at least 7 digits)
export function isValidPhone(phone) {
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 7
}

// Validate name (at least 2 characters, no special chars)
export function isValidName(name) {
  return name.trim().length >= 2 && /^[a-zA-ZÀ-ỹ\s\-']+$/.test(name.trim())
}

// Sanitize booking code: only alphanumeric uppercase
export function sanitizeBookingCode(value) {
  return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
}

// Validate slug: only lowercase letters, numbers, hyphens
export function sanitizeSlug(value) {
  return value.toLowerCase().replace(/[^a-z0-9\-]/g, '').replace(/--+/g, '-')
}

// Validate price: only numbers and decimal point
export function sanitizePrice(value) {
  return value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
}

// Validate URL format
export function isValidUrl(url) {
  if (!url) return true // optional field
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

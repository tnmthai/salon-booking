// Input validation utilities

function validateEmail(email) {
  if (!email || typeof email !== 'string') return 'Email is required';
  if (email.length > 300) return 'Email too long (max 300)';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';
  return null;
}

function validatePassword(password) {
  if (!password || typeof password !== 'string') return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (password.length > 128) return 'Password too long (max 128)';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
    return 'Password must include at least one special character (!@#$%^&*...)';
  }
  return null;
}

function validatePhone(phone) {
  if (!phone) return null; // optional in some contexts
  if (typeof phone !== 'string') return 'Invalid phone';
  if (phone.length > 20) return 'Phone too long (max 20)';
  if (!/^[\d\s\+\-\(\)]+$/.test(phone)) return 'Invalid phone format';
  return null;
}

function validateName(name, required = true) {
  if (!name || typeof name !== 'string') return required ? 'Name is required' : null;
  if (name.length > 200) return 'Name too long (max 200)';
  return null;
}

function validateSlug(slug) {
  if (!slug || typeof slug !== 'string') return 'Slug is required';
  if (slug.length > 100) return 'Slug too long (max 100)';
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return 'Slug must be lowercase alphanumeric with hyphens';
  return null;
}

function validateText(text, fieldName, maxLength = 5000, required = false) {
  if (!text || typeof text !== 'string') return required ? `${fieldName} is required` : null;
  if (text.length > maxLength) return `${fieldName} too long (max ${maxLength})`;
  return null;
}

function validatePositiveNumber(num, fieldName, required = true) {
  if (num === undefined || num === null) return required ? `${fieldName} is required` : null;
  const n = parseFloat(num);
  if (isNaN(n) || n < 0) return `${fieldName} must be a positive number`;
  return null;
}

function validateInt(num, fieldName, min = 0, max = 999999, required = true) {
  if (num === undefined || num === null) return required ? `${fieldName} is required` : null;
  const n = parseInt(num);
  if (isNaN(n) || n < min || n > max) return `${fieldName} must be an integer between ${min} and ${max}`;
  return null;
}

// Middleware: reject request body with fields exceeding limits
function validateRequestBody(body, maxKeys = 50, maxValueLength = 10000) {
  if (!body || typeof body !== 'object') return 'Invalid request body';
  const keys = Object.keys(body);
  if (keys.length > maxKeys) return 'Too many fields';
  for (const key of keys) {
    if (typeof body[key] === 'string' && body[key].length > maxValueLength) {
      return `Field '${key}' too long`;
    }
  }
  return null;
}

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone,
  validateName,
  validateSlug,
  validateText,
  validatePositiveNumber,
  validateInt,
  validateRequestBody,
};

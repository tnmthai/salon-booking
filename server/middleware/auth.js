const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET environment variable is not set!');
  process.exit(1);
}

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, salon_id, email, role }
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Optional auth — sets req.user if token present, but doesn't block
function optionalAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (_) {}
  }
  next();
}

const SUPER_ADMIN_EMAIL = 'admin@tnmthai.com';

function isSuperAdmin(email) {
  return email === SUPER_ADMIN_EMAIL;
}

function requireSuperAdmin(req, res, next) {
  if (!isSuperAdmin(req.user?.email)) return res.status(403).json({ error: 'Forbidden' });
  next();
}

module.exports = { authMiddleware, optionalAuth, JWT_SECRET, isSuperAdmin, requireSuperAdmin, SUPER_ADMIN_EMAIL };

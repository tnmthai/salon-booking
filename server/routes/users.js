const router = require('express').Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const { isSuperAdmin } = require('../middleware/auth');

// GET all users for the salon (admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query, params;
    if (isSuperAdmin(req.user.email)) {
      query = `SELECT u.id, u.email, u.name, u.role, u.created_at, u.is_active, s.name as salon_name, s.slug as salon_slug
        FROM users u LEFT JOIN salons s ON u.salon_id = s.id ORDER BY u.created_at`;
      params = [];
    } else {
      query = 'SELECT id, email, name, role, created_at, is_active FROM users WHERE salon_id = $1 AND role != \'super_admin\' ORDER BY created_at';
      params = [req.user.salon_id];
    }
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET all users (super admin — no salon filter)
router.get('/all', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });

  const jwt = require('jsonwebtoken');
  const { JWT_SECRET } = require('../middleware/auth');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!isSuperAdmin(decoded.email)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { rows } = await db.query(
      `SELECT u.id, u.email, u.name, u.role, u.created_at, u.is_active, s.name as salon_name, s.slug as salon_slug
       FROM users u JOIN salons s ON u.salon_id = s.id ORDER BY u.created_at`
    );
    res.json(rows);
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// POST create user (super admin only)
router.post('/', authMiddleware, async (req, res) => {
  const bcrypt = require('bcryptjs');
  const { email, password, name, role, salon_id } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    if (!isSuperAdmin(req.user.email)) return res.status(403).json({ error: 'Forbidden' });
    const password_hash = await bcrypt.hash(password, 10);
    const { rows } = await db.query(
      'INSERT INTO users (email, password_hash, name, role, salon_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role, salon_id',
      [email, password_hash, name || email.split('@')[0], role || 'staff', salon_id || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST bulk create staff users (super admin only)
router.post('/bulk-create-staff', authMiddleware, async (req, res) => {
  const bcrypt = require('bcryptjs');
  try {
    if (!isSuperAdmin(req.user.email)) return res.status(403).json({ error: 'Forbidden' });
    
    // Get all staff without user accounts
    const staff = await db.query(`
      SELECT s.id, s.name, s.email, s.role as staff_role
      FROM staff s
      LEFT JOIN users u ON u.id = s.user_id
      WHERE s.user_id IS NULL AND s.email IS NOT NULL
    `);
    
    const created = [];
    for (const s of staff.rows) {
      const email = s.email;
      const crypto = require('crypto');
      const password = crypto.randomBytes(12).toString('base64url');
      const password_hash = await bcrypt.hash(password, 10);
      
      try {
        const user = await db.query(
          'INSERT INTO users (email, password_hash, name, role, salon_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role',
          [email, password_hash, s.name, 'staff', req.body.salon_id || 7]
        );
        
        // Link staff to user
        await db.query('UPDATE staff SET user_id = $1 WHERE id = $2', [user.rows[0].id, s.id]);
        
        created.push({ staff: s.name, email, password, user_id: user.rows[0].id });
      } catch (e) {
        // Skip if email already exists
        created.push({ staff: s.name, email, error: e.message });
      }
    }
    
    res.json({ message: `Created ${created.filter(c => !c.error).length} users`, users: created });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update user (super admin can update anyone, owner can update their salon)
router.put('/:id', authMiddleware, async (req, res) => {
  const { name, email, role, is_active } = req.body;
  try {
    let query, params;
    if (isSuperAdmin(req.user.email)) {
      query = 'UPDATE users SET name=$1, email=$2, role=$3, is_active=$4 WHERE id=$5 RETURNING id, email, name, role, is_active';
      params = [name, email, role, is_active !== false, req.params.id];
    } else {
      query = 'UPDATE users SET name=$1, email=$2, role=$3, is_active=$4 WHERE id=$5 AND salon_id=$6 RETURNING id, email, name, role, is_active';
      params = [name, email, role, is_active !== false, req.params.id, req.user.salon_id];
    }
    const { rows } = await db.query(query, params);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT reset password (super admin only)
router.put('/:id/reset-password', authMiddleware, async (req, res) => {
  const bcrypt = require('bcryptjs');
  const { password } = req.body;
  if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  try {
    if (isSuperAdmin(req.user.email)) {
      // Super admin can reset anyone
      const password_hash = await bcrypt.hash(password, 10);
      const { rows } = await db.query('UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id, email, name', [password_hash, req.params.id]);
      if (!rows.length) return res.status(404).json({ error: 'User not found' });
      return res.json({ message: 'Password reset successfully', user: rows[0] });
    }
    // Owner can reset users in their salon (not super admin)
    const targetUser = await db.query('SELECT id, role FROM users WHERE id = $1 AND salon_id = $2', [req.params.id, req.user.salon_id]);
    if (!targetUser.rows.length) return res.status(404).json({ error: 'User not found' });
    if (targetUser.rows[0].role === 'super_admin') return res.status(403).json({ error: 'Cannot reset super admin password' });
    const password_hash = await bcrypt.hash(password, 10);
    const { rows } = await db.query('UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id, email, name', [password_hash, req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Password reset successfully', user: rows[0] });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE user (super admin can delete anyone)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (isSuperAdmin(req.user.email)) {
      await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    } else {
      await db.query('DELETE FROM users WHERE id = $1 AND salon_id = $2', [req.params.id, req.user.salon_id]);
    }
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

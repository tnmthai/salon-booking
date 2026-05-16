const router = require('express').Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const isSuperAdmin = (email) => email === 'admin@tnmthai.com';

// GET working hours for a staff member
router.get('/staff/:staffId', authMiddleware, async (req, res) => {
  try {
    // Verify access: super admin, owner of the salon, or the staff member themselves
    const staff = await db.query('SELECT * FROM staff WHERE id = $1', [req.params.staffId]);
    if (!staff.rows.length) return res.status(404).json({ error: 'Staff not found' });
    
    const s = staff.rows[0];
    if (!isSuperAdmin(req.user.email) && s.salon_id !== req.user.salon_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { rows } = await db.query(
      'SELECT * FROM working_hours WHERE staff_id = $1 ORDER BY day_of_week',
      [req.params.staffId]
    );
    res.json(rows);
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET all working hours for a salon
router.get('/salon/:salonId', authMiddleware, async (req, res) => {
  try {
    if (!isSuperAdmin(req.user.email) && parseInt(req.params.salonId) !== req.user.salon_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { rows } = await db.query(`
      SELECT wh.*, s.name as staff_name 
      FROM working_hours wh 
      JOIN staff s ON wh.staff_id = s.id 
      WHERE s.salon_id = $1 
      ORDER BY s.name, wh.day_of_week
    `, [req.params.salonId]);
    res.json(rows);
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST/PUT set working hours for a staff member (bulk update)
router.post('/staff/:staffId', authMiddleware, async (req, res) => {
  try {
    const staff = await db.query('SELECT * FROM staff WHERE id = $1', [req.params.staffId]);
    if (!staff.rows.length) return res.status(404).json({ error: 'Staff not found' });
    
    const s = staff.rows[0];
    if (!isSuperAdmin(req.user.email) && s.salon_id !== req.user.salon_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { schedule } = req.body; // Array of { day_of_week, start_time, end_time, is_active }
    
    // Delete existing and re-insert
    await db.query('DELETE FROM working_hours WHERE staff_id = $1', [req.params.staffId]);
    
    const results = [];
    for (const item of schedule) {
      if (item.is_active && item.start_time && item.end_time) {
        const { rows } = await db.query(
          'INSERT INTO working_hours (staff_id, day_of_week, start_time, end_time, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [req.params.staffId, item.day_of_week, item.start_time, item.end_time, true]
        );
        results.push(rows[0]);
      }
    }
    
    res.json(results);
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET public working hours for booking page
router.get('/public/:slug', async (req, res) => {
  try {
    const salon = await db.query('SELECT id FROM salons WHERE slug = $1', [req.params.slug]);
    if (!salon.rows.length) return res.status(404).json({ error: 'Salon not found' });

    const { rows } = await db.query(`
      SELECT wh.*, s.name as staff_name, s.id as staff_id
      FROM working_hours wh 
      JOIN staff s ON wh.staff_id = s.id 
      WHERE s.salon_id = $1 AND s.active = true AND wh.is_active = true
      ORDER BY s.name, wh.day_of_week
    `, [salon.rows[0].id]);
    res.json(rows);
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

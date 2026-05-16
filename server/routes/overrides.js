const router = require('express').Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const { isSuperAdmin } = require('../middleware/auth');

// GET overrides for a staff member (auth)
router.get('/staff/:staffId', authMiddleware, async (req, res) => {
  try {
    const staff = await db.query('SELECT * FROM staff WHERE id = $1', [req.params.staffId]);
    if (!staff.rows.length) return res.status(404).json({ error: 'Staff not found' });

    if (!isSuperAdmin(req.user.email) && staff.rows[0].salon_id !== req.user.salon_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { rows } = await db.query(
      'SELECT * FROM working_hours_overrides WHERE staff_id = $1 ORDER BY date DESC',
      [req.params.staffId]
    );
    res.json(rows);
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET overrides for a salon (auth — all staff)
router.get('/salon', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT o.*, s.name as staff_name
      FROM working_hours_overrides o
      JOIN staff s ON o.staff_id = s.id
      WHERE s.salon_id = $1
      ORDER BY o.date DESC
    `, [req.user.salon_id]);
    res.json(rows);
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create override (auth)
router.post('/', authMiddleware, async (req, res) => {
  const { staff_id, date, is_active, start_time, end_time, reason } = req.body;
  if (!staff_id || !date) return res.status(400).json({ error: 'staff_id and date required' });

  try {
    const staff = await db.query('SELECT * FROM staff WHERE id = $1', [staff_id]);
    if (!staff.rows.length) return res.status(404).json({ error: 'Staff not found' });

    if (!isSuperAdmin(req.user.email) && staff.rows[0].salon_id !== req.user.salon_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Upsert
    const { rows } = await db.query(`
      INSERT INTO working_hours_overrides (staff_id, date, is_active, start_time, end_time, reason)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (staff_id, date) DO UPDATE SET
        is_active = EXCLUDED.is_active,
        start_time = EXCLUDED.start_time,
        end_time = EXCLUDED.end_time,
        reason = EXCLUDED.reason
      RETURNING *
    `, [staff_id, date, is_active !== false, start_time || null, end_time || null, reason || null]);

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE override (auth)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(`
      DELETE FROM working_hours_overrides o
      USING staff s
      WHERE o.staff_id = s.id AND o.id = $1 AND s.salon_id = $2
      RETURNING o.id
    `, [req.params.id, req.user.salon_id]);

    if (!rows.length && !isSuperAdmin(req.user.email)) {
      return res.status(404).json({ error: 'Override not found' });
    }

    if (!rows.length) {
      const r = await db.query('DELETE FROM working_hours_overrides WHERE id = $1 RETURNING id', [req.params.id]);
      if (!r.rows.length) return res.status(404).json({ error: 'Override not found' });
    }

    res.json({ message: 'Override deleted' });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

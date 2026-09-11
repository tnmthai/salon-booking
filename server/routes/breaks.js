/**
 * Staff breaks (lunch, and anything else the owner blocks out).
 *
 * These used to live only in the browser's localStorage. The calendar drew a
 * lunch block, but the server knew nothing about it — so the booking page
 * happily offered those slots to customers, and the block vanished the moment
 * the owner opened the calendar on a different device.
 *
 * Now they are rows, and generateStaffSlots() excludes them.
 */
const router = require('express').Router();
const db = require('../db');
const { authMiddleware, isSuperAdmin } = require('../middleware/auth');

/** Minutes from midnight, salon-local. 0–1440. */
function validMinute(v) {
  return Number.isInteger(v) && v >= 0 && v <= 24 * 60;
}

/** Confirm the staff member belongs to the caller's salon. */
async function assertOwnsStaff(req, staffId) {
  const { rows } = await db.query('SELECT salon_id FROM staff WHERE id = $1', [staffId]);
  if (!rows.length) return null;
  if (!isSuperAdmin(req.user.email) && rows[0].salon_id !== req.user.salon_id) return null;
  return rows[0].salon_id;
}

// GET /api/breaks?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { from, to } = req.query;
    const params = [req.user.salon_id];
    let where = 'b.salon_id = $1';

    if (from && !isNaN(Date.parse(from))) {
      params.push(from);
      where += ` AND b.date >= $${params.length}`;
    }
    if (to && !isNaN(Date.parse(to))) {
      params.push(to);
      where += ` AND b.date <= $${params.length}`;
    }

    const { rows } = await db.query(
      `SELECT b.id, b.staff_id, b.date, b.start_min, b.end_min
         FROM staff_breaks b
        WHERE ${where}
        ORDER BY b.date, b.start_min`,
      params
    );
    // Dates come back as JS Dates; send plain YYYY-MM-DD so the client can key
    // on them without timezone surprises.
    res.json(rows.map(r => ({
      ...r,
      date: r.date instanceof Date ? r.date.toISOString().slice(0, 10) : String(r.date).slice(0, 10),
    })));
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/breaks — create or move a break for one staff member on one day
router.put('/', authMiddleware, async (req, res) => {
  try {
    const staffId = parseInt(req.body.staff_id, 10);
    const { date } = req.body;
    const startMin = parseInt(req.body.start_min, 10);
    const endMin = parseInt(req.body.end_min, 10);

    if (!Number.isInteger(staffId) || !date || isNaN(Date.parse(date))) {
      return res.status(400).json({ error: 'staff_id and date are required' });
    }
    if (!validMinute(startMin) || !validMinute(endMin) || endMin <= startMin) {
      return res.status(400).json({ error: 'Invalid break times' });
    }

    const salonId = await assertOwnsStaff(req, staffId);
    if (!salonId) return res.status(403).json({ error: 'Access denied' });

    const { rows } = await db.query(
      `INSERT INTO staff_breaks (salon_id, staff_id, date, start_min, end_min)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (staff_id, date)
       DO UPDATE SET start_min = EXCLUDED.start_min, end_min = EXCLUDED.end_min
       RETURNING id, staff_id, date, start_min, end_min`,
      [salonId, staffId, date, startMin, endMin]
    );

    const row = rows[0];
    res.json({
      ...row,
      date: row.date instanceof Date ? row.date.toISOString().slice(0, 10) : String(row.date).slice(0, 10),
    });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/breaks?staff_id=&date=
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const staffId = parseInt(req.query.staff_id, 10);
    const { date } = req.query;
    if (!Number.isInteger(staffId) || !date) {
      return res.status(400).json({ error: 'staff_id and date are required' });
    }

    const salonId = await assertOwnsStaff(req, staffId);
    if (!salonId) return res.status(403).json({ error: 'Access denied' });

    await db.query('DELETE FROM staff_breaks WHERE staff_id = $1 AND date = $2', [staffId, date]);
    res.json({ ok: true });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

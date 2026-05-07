const router = require('express').Router();
const db = require('../db');

// GET all active staff
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM staff WHERE active = true ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET staff with their services
router.get('/:id', async (req, res) => {
  try {
    const staff = await db.query('SELECT * FROM staff WHERE id = $1', [req.params.id]);
    if (!staff.rows.length) return res.status(404).json({ error: 'Staff not found' });

    const services = await db.query(
      `SELECT s.* FROM services s
       JOIN staff_services ss ON s.id = ss.service_id
       WHERE ss.staff_id = $1 AND s.active = true`,
      [req.params.id]
    );

    res.json({ ...staff.rows[0], services: services.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create staff
router.post('/', async (req, res) => {
  const { name, role, phone, email } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO staff (name, role, phone, email) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, role, phone, email]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update staff
router.put('/:id', async (req, res) => {
  const { name, role, phone, email, active } = req.body;
  try {
    const { rows } = await db.query(
      'UPDATE staff SET name=$1, role=$2, phone=$3, email=$4, active=$5 WHERE id=$6 RETURNING *',
      [name, role, phone, email, active, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Staff not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST assign service to staff
router.post('/:id/services', async (req, res) => {
  const { service_id } = req.body;
  try {
    await db.query(
      'INSERT INTO staff_services (staff_id, service_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.params.id, service_id]
    );
    res.json({ message: 'Service assigned' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE remove service from staff
router.delete('/:id/services/:serviceId', async (req, res) => {
  try {
    await db.query(
      'DELETE FROM staff_services WHERE staff_id = $1 AND service_id = $2',
      [req.params.id, req.params.serviceId]
    );
    res.json({ message: 'Service removed from staff' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

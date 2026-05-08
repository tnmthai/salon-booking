const router = require('express').Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const isSuperAdmin = (email) => email === 'admin@tnmthai.com';

// GET appointments (super admin: all shops, normal: own salon)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { date, status } = req.query;
    let where = [];
    let params = [];
    let idx = 1;

    if (!isSuperAdmin(req.user.email)) {
      where.push(`a.salon_id = $${idx++}`);
      params.push(req.user.salon_id);
    }
    if (date) {
      where.push(`DATE(a.start_time) = $${idx++}`);
      params.push(date);
    }
    if (status) {
      where.push(`a.status = $${idx++}`);
      params.push(status);
    }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const { rows } = await db.query(`
      SELECT a.*, 
        c.name as customer_name, c.phone as customer_phone, c.email as customer_email,
        s.name as service_name, s.price as service_price,
        st.name as staff_name,
        sal.name as salon_name
      FROM appointments a
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN services s ON a.service_id = s.id
      LEFT JOIN staff st ON a.staff_id = st.id
      LEFT JOIN salons sal ON a.salon_id = sal.id
      ${whereClause}
      ORDER BY a.start_time ASC
    `, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET appointments for a salon (by slug — public, for booking page)
router.get('/public/:slug', async (req, res) => {
  try {
    const salon = await db.query('SELECT id FROM salons WHERE slug = $1', [req.params.slug]);
    if (!salon.rows.length) return res.status(404).json({ error: 'Salon not found' });
    const { date, staff_id } = req.query;
    if (!date) return res.json([]);

    let query = `SELECT a.start_time, a.end_time, a.staff_id FROM appointments a WHERE a.salon_id = $1 AND DATE(a.start_time) = $2 AND a.status != 'cancelled'`;
    let params = [salon.rows[0].id, date];
    if (staff_id) { query += ' AND a.staff_id = $3'; params.push(staff_id); }
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create appointment (public — for booking page)
router.post('/public', async (req, res) => {
  const { salon_id, service_id, staff_id, customer_name, customer_phone, customer_email, start_time } = req.body;
  try {
    const svc = await db.query('SELECT duration_min, price FROM services WHERE id = $1', [service_id]);
    if (!svc.rows.length) return res.status(400).json({ error: 'Service not found' });
    const { duration_min, price } = svc.rows[0];
    const end_time = new Date(new Date(start_time).getTime() + duration_min * 60000).toISOString();

    let customer = await db.query('SELECT id FROM customers WHERE salon_id = $1 AND phone = $2', [salon_id, customer_phone]);
    if (!customer.rows.length) {
      customer = await db.query('INSERT INTO customers (salon_id, name, phone, email) VALUES ($1, $2, $3, $4) RETURNING id', [salon_id, customer_name, customer_phone, customer_email]);
    }
    const customer_id = customer.rows[0].id;

    const { rows } = await db.query(
      'INSERT INTO appointments (salon_id, service_id, staff_id, customer_id, start_time, end_time, price, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [salon_id, service_id, staff_id, customer_id, start_time, end_time, price, 'confirmed']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update appointment status
router.put('/:id', authMiddleware, async (req, res) => {
  const { status } = req.body;
  try {
    let query, params;
    if (isSuperAdmin(req.user.email)) {
      query = 'UPDATE appointments SET status=$1 WHERE id=$2 RETURNING *';
      params = [status, req.params.id];
    } else {
      query = 'UPDATE appointments SET status=$1 WHERE id=$2 AND salon_id=$3 RETURNING *';
      params = [status, req.params.id, req.user.salon_id];
    }
    const { rows } = await db.query(query, params);
    if (!rows.length) return res.status(404).json({ error: 'Appointment not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

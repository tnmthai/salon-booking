const router = require('express').Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const { isSuperAdmin } = require('../middleware/auth');

// GET /api/reports/stats — aggregated booking statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const { from, to, salon_id } = req.query;
    let where = [];
    let params = [];
    let idx = 1;

    // Salon filter: super admin can pass salon_id or see all
    if (isSuperAdmin(req.user.email)) {
      if (salon_id) {
        where.push(`a.salon_id = $${idx++}`);
        params.push(salon_id);
      }
    } else {
      where.push(`a.salon_id = $${idx++}`);
      params.push(req.user.salon_id);
    }

    if (from) {
      where.push(`a.start_time >= $${idx++}`);
      params.push(from);
    }
    if (to) {
      where.push(`a.start_time < $${idx++}`);
      params.push(to + 'T23:59:59');
    }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

    // 1. Summary stats
    const summaryResult = await db.query(`
      SELECT
        COUNT(*) as total_bookings,
        COUNT(*) FILTER (WHERE a.status = 'confirmed') as confirmed,
        COUNT(*) FILTER (WHERE a.status = 'completed') as completed,
        COUNT(*) FILTER (WHERE a.status = 'cancelled') as cancelled,
        COALESCE(SUM(CASE WHEN a.status IN ('confirmed', 'completed') THEN COALESCE(a.price, s.price) ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN a.status = 'completed' THEN COALESCE(a.price, s.price) ELSE 0 END), 0) as completed_revenue,
        COUNT(DISTINCT a.customer_id) as unique_customers
      FROM appointments a
      LEFT JOIN services s ON a.service_id = s.id
      ${whereClause}
    `, params);

    // 2. Bookings by day (for chart)
    const dailyResult = await db.query(`
      SELECT DATE(a.start_time) as date,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE a.status = 'confirmed') as confirmed,
        COUNT(*) FILTER (WHERE a.status = 'completed') as completed,
        COUNT(*) FILTER (WHERE a.status = 'cancelled') as cancelled,
        COALESCE(SUM(CASE WHEN a.status IN ('confirmed', 'completed') THEN COALESCE(a.price, s.price) ELSE 0 END), 0) as revenue
      FROM appointments a
      LEFT JOIN services s ON a.service_id = s.id
      ${whereClause}
      GROUP BY DATE(a.start_time)
      ORDER BY date ASC
    `, params);

    // 3. Top services
    const servicesResult = await db.query(`
      SELECT s.name as service_name, s.category,
        COUNT(*) as booking_count,
        COALESCE(SUM(CASE WHEN a.status IN ('confirmed', 'completed') THEN COALESCE(a.price, s.price) ELSE 0 END), 0) as revenue
      FROM appointments a
      LEFT JOIN services s ON a.service_id = s.id
      ${whereClause}
      GROUP BY s.id, s.name, s.category
      ORDER BY booking_count DESC
      LIMIT 10
    `, params);

    // 4. Staff performance
    const staffResult = await db.query(`
      SELECT st.name as staff_name,
        COUNT(*) as booking_count,
        COUNT(*) FILTER (WHERE a.status = 'completed') as completed_count,
        COUNT(*) FILTER (WHERE a.status = 'cancelled') as cancelled_count,
        COALESCE(SUM(CASE WHEN a.status IN ('confirmed', 'completed') THEN COALESCE(a.price, s.price) ELSE 0 END), 0) as revenue
      FROM appointments a
      LEFT JOIN staff st ON a.staff_id = st.id
      LEFT JOIN services s ON a.service_id = s.id
      ${whereClause}
      GROUP BY st.id, st.name
      ORDER BY booking_count DESC
      LIMIT 10
    `, params);

    // 5. Bookings by hour (peak hours)
    const hourlyResult = await db.query(`
      SELECT EXTRACT(HOUR FROM a.start_time)::int as hour,
        COUNT(*) as booking_count
      FROM appointments a
      ${whereClause}
      GROUP BY EXTRACT(HOUR FROM a.start_time)
      ORDER BY hour ASC
    `, params);

    res.json({
      summary: summaryResult.rows[0],
      daily: dailyResult.rows,
      services: servicesResult.rows,
      staff: staffResult.rows,
      hourly: hourlyResult.rows,
    });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

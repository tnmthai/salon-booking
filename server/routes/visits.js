const express = require('express');
const router = express.Router();
const pool = require('../db');
const { JWT_SECRET } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Track a page visit (public — no auth required)
router.post('/', async (req, res) => {
  try {
    const { salon_id, page, referrer } = req.body;
    if (!salon_id) return res.status(400).json({ error: 'salon_id required' });

    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '';
    const ua = req.headers['user-agent'] || '';

    // Geolocate IP (non-blocking) — validate IP first to prevent SSRF
    let city = '', country = '';
    const isValidIPv4 = /^\d{1,3}(\.\d{1,3}){3}$/.test(ip);
    const isValidIPv6 = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/.test(ip) || ip === '::1' || ip === '::ffff:127.0.0.1';
    if (isValidIPv4 || isValidIPv6) {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=city,country`, { signal: AbortSignal.timeout(2000) });
        if (geoRes.ok) {
          const geo = await geoRes.json();
          city = geo.city || '';
          country = geo.country || '';
        }
      } catch {}
    }

    await pool.query(
      `INSERT INTO page_visits (salon_id, page, ip_address, user_agent, referrer, city, country)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [salon_id, page || 'booking', ip, ua, referrer || '', city, country]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Public total visits (no auth, for landing page)
router.get('/public', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT COUNT(*) as total FROM page_visits');
    res.json({ total: parseInt(rows[0].total) });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get visit stats (owner / super_admin)
router.get('/stats', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const isSuperAdmin = decoded.email === 'admin@tnmthai.com';
    const salonId = decoded.salon_id;

    if (!isSuperAdmin && !salonId) {
      return res.status(403).json({ error: 'No salon' });
    }

    const whereClause = isSuperAdmin ? '' : 'WHERE salon_id = $1';
    const params = isSuperAdmin ? [] : [salonId];

    // Total visits
    const total = await pool.query(
      `SELECT COUNT(*) as total FROM page_visits ${whereClause}`,
      params
    );

    // Today
    const today = await pool.query(
      `SELECT COUNT(*) as today FROM page_visits ${whereClause ? whereClause + ' AND' : 'WHERE'} visited_at::date = CURRENT_DATE`,
      params
    );

    // This week
    const week = await pool.query(
      `SELECT COUNT(*) as week FROM page_visits ${whereClause ? whereClause + ' AND' : 'WHERE'} visited_at >= date_trunc('week', CURRENT_DATE)`,
      params
    );

    // This month
    const month = await pool.query(
      `SELECT COUNT(*) as month FROM page_visits ${whereClause ? whereClause + ' AND' : 'WHERE'} visited_at >= date_trunc('month', CURRENT_DATE)`,
      params
    );

    // Last 7 days (daily breakdown)
    const daily = await pool.query(
      `SELECT visited_at::date as day, COUNT(*) as count
       FROM page_visits
       ${whereClause ? whereClause + ' AND' : 'WHERE'} visited_at >= CURRENT_DATE - INTERVAL '6 days'
       GROUP BY visited_at::date
       ORDER BY day`,
      params
    );

    // Top referrers
    const referrers = await pool.query(
      `SELECT COALESCE(NULLIF(referrer, ''), 'Direct') as referrer, COUNT(*) as count
       FROM page_visits
       ${whereClause}
       GROUP BY referrer
       ORDER BY count DESC
       LIMIT 10`,
      params
    );

    // Top cities
    const cities = await pool.query(
      `SELECT COALESCE(NULLIF(city, ''), 'Unknown') as city, COALESCE(NULLIF(country, ''), '') as country, COUNT(*) as count
       FROM page_visits
       ${whereClause ? whereClause + ' AND' : 'WHERE'} city != ''
       GROUP BY city, country
       ORDER BY count DESC
       LIMIT 10`,
      params
    );

    res.json({
      total: parseInt(total.rows[0].total),
      today: parseInt(today.rows[0].today),
      week: parseInt(week.rows[0].week),
      month: parseInt(month.rows[0].month),
      daily: daily.rows,
      referrers: referrers.rows,
      cities: cities.rows,
    });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

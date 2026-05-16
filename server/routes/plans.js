const express = require('express');
const router = express.Router();
const db = require('../db');
const { JWT_SECRET } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Plan definitions
const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    maxStaff: 2,
    maxAppointmentsPerMonth: 40,
    features: ['online_booking', 'marketplace_listing', 'basic_reports', 'email_notifications'],
  },
  starter: {
    name: 'Starter',
    price: 11,
    maxStaff: 6,
    maxAppointmentsPerMonth: -1, // unlimited
    features: ['online_booking', 'marketplace_listing', 'basic_reports', 'email_notifications', 'staff_roster', 'loyalty_50', 'reviews_gallery'],
  },
  growth: {
    name: 'Growth',
    price: 29,
    maxStaff: -1, // unlimited
    maxAppointmentsPerMonth: -1,
    features: ['online_booking', 'marketplace_listing', 'advanced_reports', 'email_notifications', 'staff_roster', 'loyalty_unlimited', 'reviews_gallery', 'priority_marketplace', 'promotions'],
  },
};

// GET all plans (public)
router.get('/plans', (req, res) => {
  res.json(PLANS);
});

// GET current plan + usage for a salon (auth required)
router.get('/plan', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const isSuperAdmin = isSuperAdmin(decoded.email);
    const salonId = decoded.salon_id;

    if (!isSuperAdmin && !salonId) {
      return res.status(403).json({ error: 'No salon' });
    }

    // Get salon plan
    const salon = await db.query('SELECT id, name, plan, plan_started_at FROM salons WHERE id = $1', [salonId]);
    const currentPlan = salon.rows[0]?.plan || 'free';
    const planDef = PLANS[currentPlan] || PLANS.free;

    // Count active staff
    const staffCount = await db.query(
      'SELECT COUNT(*) as count FROM staff WHERE salon_id = $1 AND active = true',
      [salonId]
    );

    // Count appointments this month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const apptCount = await db.query(
      "SELECT COUNT(*) as count FROM appointments WHERE salon_id = $1 AND created_at >= $2",
      [salonId, monthStart]
    );

    res.json({
      plan: currentPlan,
      planDef,
      usage: {
        staff: parseInt(staffCount.rows[0].count),
        appointmentsThisMonth: parseInt(apptCount.rows[0].count),
      },
      limits: {
        maxStaff: planDef.maxStaff,
        maxAppointmentsPerMonth: planDef.maxAppointmentsPerMonth,
      },
    });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update plan (super admin only)
router.put('/plan/:salonId', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!isSuperAdmin(decoded.email)) return res.status(403).json({ error: 'Forbidden' });

    const { plan } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ error: 'Invalid plan' });

    const { rows } = await db.query(
      'UPDATE salons SET plan = $1, plan_started_at = NOW() WHERE id = $2 RETURNING id, name, plan',
      [plan, req.params.salonId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Salon not found' });
    res.json({ message: 'Plan updated', salon: rows[0] });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

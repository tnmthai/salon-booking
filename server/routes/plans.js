const express = require('express');
const router = express.Router();
const db = require('../db');
const { JWT_SECRET } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// ─── Plan definitions ────────────────────────────────────────
const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    annualPrice: 0,
    maxStaff: 2,
    maxAppointmentsPerMonth: 40,
    features: ['online_booking', 'marketplace_listing', 'basic_reports', 'email_notifications'],
  },
  starter: {
    name: 'Starter',
    price: 11,
    annualPrice: 8.80, // 20% off
    annualSaving: 26.40, // (11 - 8.80) * 12
    maxStaff: 6,
    maxAppointmentsPerMonth: -1,
    features: ['online_booking', 'marketplace_listing', 'basic_reports', 'email_notifications', 'staff_roster', 'loyalty_50', 'reviews_gallery'],
  },
  growth: {
    name: 'Growth',
    price: 29,
    annualPrice: 23.20, // 20% off
    annualSaving: 69.60, // (29 - 23.20) * 12
    maxStaff: -1,
    maxAppointmentsPerMonth: -1,
    features: ['online_booking', 'marketplace_listing', 'advanced_reports', 'email_notifications', 'staff_roster', 'loyalty_unlimited', 'reviews_gallery', 'priority_marketplace', 'promotions'],
  },
};

// ─── Helpers ──────────────────────────────────────────────────

function generateReferralCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase(); // 8-char code
}

function isSuperAdmin(email) {
  return email === 'admin@tnmthai.com';
}

// Get effective plan for a salon (checks trial, then actual plan)
async function getEffectivePlan(salonId) {
  const salon = await db.query(
    'SELECT plan, trial_ends_at, trial_plan, billing_cycle, plan_price, is_early_bird FROM salons WHERE id = $1',
    [salonId]
  );
  if (!salon.rows.length) return { plan: 'free', isTrial: false, billingCycle: 'monthly' };

  const s = salon.rows[0];
  const now = new Date();

  // Check if trial is active
  if (s.trial_ends_at && new Date(s.trial_ends_at) > now && s.trial_plan) {
    return {
      plan: s.trial_plan,
      isTrial: true,
      trialEndsAt: s.trial_ends_at,
      billingCycle: 'monthly', // trials are always monthly equivalent
      originalPlan: s.plan,
    };
  }

  // Trial expired — auto-downgrade if needed
  if (s.trial_ends_at && new Date(s.trial_ends_at) <= now && s.trial_plan) {
    await db.query(
      'UPDATE salons SET trial_plan = NULL, trial_ends_at = NULL WHERE id = $1',
      [salonId]
    );
  }

  // Check if early bird locked price
  let price = PLANS[s.plan]?.price || 0;
  if (s.is_early_bird && s.plan_price > 0) {
    price = s.plan_price;
  } else if (s.billing_cycle === 'annual' && PLANS[s.plan]) {
    price = PLANS[s.plan].annualPrice;
  }

  return {
    plan: s.plan,
    isTrial: false,
    billingCycle: s.billing_cycle || 'monthly',
    lockedPrice: s.is_early_bird ? s.plan_price : null,
    isEarlyBird: s.is_early_bird || false,
    currentPrice: price,
  };
}

// ─── GET all plans (public) ───────────────────────────────────
router.get('/plans', (req, res) => {
  res.json(PLANS);
});

// ─── GET current plan + usage (auth required) ─────────────────
router.get('/plan', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const salonId = decoded.salon_id;
    if (!salonId) return res.status(403).json({ error: 'No salon' });

    const effective = await getEffectivePlan(salonId);
    const planDef = PLANS[effective.plan] || PLANS.free;

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

    // Get referral code
    const referral = await db.query(
      'SELECT referral_code FROM referrals WHERE referrer_salon_id = $1 LIMIT 1',
      [salonId]
    );

    // Count successful referrals
    const referralCount = await db.query(
      "SELECT COUNT(*) as count FROM referrals WHERE referrer_salon_id = $1 AND status = 'completed'",
      [salonId]
    );

    // Check boost status
    const salon = await db.query(
      'SELECT boost_until, is_new_badge FROM salons WHERE id = $1',
      [salonId]
    );

    res.json({
      ...effective,
      planDef,
      usage: {
        staff: parseInt(staffCount.rows[0].count),
        appointmentsThisMonth: parseInt(apptCount.rows[0].count),
      },
      limits: {
        maxStaff: planDef.maxStaff,
        maxAppointmentsPerMonth: planDef.maxAppointmentsPerMonth,
      },
      referral: {
        code: referral.rows[0]?.referral_code || null,
        successfulReferrals: parseInt(referralCount.rows[0].count),
      },
      boost: {
        boostUntil: salon.rows[0]?.boost_until || null,
        isNewBadge: salon.rows[0]?.is_new_badge !== false,
      },
    });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Start trial ──────────────────────────────────────────────
router.post('/trial/start', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const salonId = decoded.salon_id;
    if (!salonId) return res.status(403).json({ error: 'No salon' });

    const { targetPlan } = req.body;

    if (!targetPlan || !['starter', 'growth'].includes(targetPlan)) {
      return res.status(400).json({ error: 'Invalid trial plan. Must be starter or growth.' });
    }

    // Check if already on trial
    const salon = await db.query('SELECT plan, trial_ends_at, trial_plan FROM salons WHERE id = $1', [salonId]);
    const s = salon.rows[0];

    if (s.trial_ends_at && new Date(s.trial_ends_at) > new Date()) {
      return res.status(400).json({ error: 'You already have an active trial.' });
    }

    // Free → Starter: 3 months (90 days)
    // Starter → Growth: 60 days
    let trialDays;
    if (s.plan === 'free' && targetPlan === 'starter') {
      trialDays = 90; // 3 months
    } else if (s.plan === 'starter' && targetPlan === 'growth') {
      trialDays = 60;
    } else if (s.plan === 'free' && targetPlan === 'growth') {
      trialDays = 90; // Free users get 90 days of Growth trial
    } else {
      return res.status(400).json({ error: 'Trial not available for this upgrade path.' });
    }

    const trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);

    await db.query(
      'UPDATE salons SET trial_plan = $1, trial_ends_at = $2 WHERE id = $3',
      [targetPlan, trialEndsAt.toISOString(), salonId]
    );

    res.json({
      message: `Trial started! You now have ${targetPlan} features for ${trialDays} days.`,
      trialPlan: targetPlan,
      trialEndsAt: trialEndsAt.toISOString(),
      trialDays,
    });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Switch billing cycle (monthly ↔ annual) ─────────────────
router.post('/billing/cycle', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const salonId = decoded.salon_id;
    if (!salonId) return res.status(403).json({ error: 'No salon' });

    const { cycle } = req.body; // 'monthly' or 'annual'
    if (!['monthly', 'annual'].includes(cycle)) {
      return res.status(400).json({ error: 'Invalid cycle. Must be monthly or annual.' });
    }

    const salon = await db.query('SELECT plan, is_early_bird FROM salons WHERE id = $1', [salonId]);
    const s = salon.rows[0];

    // Early bird users can't switch (they have locked price)
    if (s.is_early_bird) {
      return res.status(400).json({ error: 'Early bird members have a locked price. Billing cycle cannot be changed.' });
    }

    let newPrice = PLANS[s.plan]?.price || 0;
    if (cycle === 'annual') {
      newPrice = PLANS[s.plan]?.annualPrice || newPrice;
    }

    await db.query(
      'UPDATE salons SET billing_cycle = $1, plan_price = $2 WHERE id = $3',
      [cycle, newPrice, salonId]
    );

    const saving = cycle === 'annual' ? (PLANS[s.plan]?.price - PLANS[s.plan]?.annualPrice) * 12 : 0;

    res.json({
      message: `Billing cycle changed to ${cycle}.`,
      billingCycle: cycle,
      price: newPrice,
      annualSaving: Math.round(saving * 100) / 100,
    });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Early Bird: claim slot ───────────────────────────────────
router.post('/early-bird/claim', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const salonId = decoded.salon_id;
    if (!salonId) return res.status(403).json({ error: 'No salon' });

    // Check global slots
    const config = await db.query('SELECT * FROM early_bird_config WHERE id = 1');
    const cfg = config.rows[0];

    if (cfg.slots_taken >= cfg.total_slots) {
      return res.status(400).json({ error: 'All early bird slots have been claimed!' });
    }

    // Check if already claimed
    const salon = await db.query('SELECT is_early_bird FROM salons WHERE id = $1', [salonId]);
    if (salon.rows[0]?.is_early_bird) {
      return res.status(400).json({ error: 'You already have an early bird plan.' });
    }

    // Claim slot
    await db.query('UPDATE early_bird_config SET slots_taken = slots_taken + 1, updated_at = NOW() WHERE id = 1');
    await db.query(
      'UPDATE salons SET plan = $1, plan_price = $2, is_early_bird = true, billing_cycle = $3 WHERE id = $4',
      ['starter', cfg.starter_price, 'monthly', salonId]
    );

    const remaining = cfg.total_slots - cfg.slots_taken - 1;

    res.json({
      message: `🎉 Early bird claimed! Starter at $${cfg.starter_price}/mo forever.`,
      plan: 'starter',
      lockedPrice: cfg.starter_price,
      slotsRemaining: remaining,
      isEarlyBird: true,
    });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Early Bird: get status (public) ──────────────────────────
router.get('/early-bird/status', async (req, res) => {
  try {
    const config = await db.query('SELECT * FROM early_bird_config WHERE id = 1');
    const cfg = config.rows[0];
    res.json({
      totalSlots: cfg.total_slots,
      slotsTaken: cfg.slots_taken,
      slotsRemaining: cfg.total_slots - cfg.slots_taken,
      starterPrice: cfg.starter_price,
      soldOut: cfg.slots_taken >= cfg.total_slots,
    });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Referral: generate code ──────────────────────────────────
router.post('/referral/code', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const salonId = decoded.salon_id;
    if (!salonId) return res.status(403).json({ error: 'No salon' });

    // Check if already has a code
    const existing = await db.query(
      'SELECT referral_code FROM referrals WHERE referrer_salon_id = $1 AND referred_salon_id IS NULL LIMIT 1',
      [salonId]
    );
    if (existing.rows.length) {
      return res.json({ code: existing.rows[0].referral_code });
    }

    // Generate unique code
    let code;
    let attempts = 0;
    do {
      code = generateReferralCode();
      const check = await db.query('SELECT id FROM referrals WHERE referral_code = $1', [code]);
      if (!check.rows.length) break;
      attempts++;
    } while (attempts < 10);

    await db.query(
      'INSERT INTO referrals (referrer_salon_id, referral_code) VALUES ($1, $2)',
      [salonId, code]
    );

    res.json({ code, message: `Your referral code: ${code}` });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Referral: apply code during registration ─────────────────
router.post('/referral/apply', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const salonId = decoded.salon_id;
    if (!salonId) return res.status(403).json({ error: 'No salon' });

    const { code } = req.body;
    if (!code || typeof code !== 'string' || !/^[A-F0-9]{8}$/.test(code)) {
      return res.status(400).json({ error: 'Invalid referral code format' });
    }

    // Find the referral
    const referral = await db.query(
      'SELECT * FROM referrals WHERE referral_code = $1 AND referrer_salon_id != $2',
      [code.toUpperCase(), salonId]
    );
    if (!referral.rows.length) {
      return res.status(404).json({ error: 'Invalid referral code.' });
    }

    const r = referral.rows[0];
    if (r.referred_salon_id) {
      return res.status(400).json({ error: 'This referral code has already been used.' });
    }

    // Apply referral
    await db.query(
      `UPDATE referrals SET referred_salon_id = $1, status = 'completed', completed_at = NOW() WHERE id = $2`,
      [salonId, r.id]
    );

    // Give both parties a free month of Starter
    // Referred salon: upgrade to starter for 30 days if on free
    const referredSalon = await db.query('SELECT plan FROM salons WHERE id = $1', [salonId]);
    if (referredSalon.rows[0]?.plan === 'free') {
      const trialEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await db.query(
        'UPDATE salons SET trial_plan = $1, trial_ends_at = $2 WHERE id = $3',
        ['starter', trialEnd.toISOString(), salonId]
      );
    }

    // Referrer: check how many completed referrals
    const referrerReferrals = await db.query(
      "SELECT COUNT(*) as count FROM referrals WHERE referrer_salon_id = $1 AND status = 'completed'",
      [r.referrer_salon_id]
    );
    const count = parseInt(referrerReferrals.rows[0].count);

    // 1 referral = free Starter month, 3 referrals = free Growth month
    let rewardType = null;
    if (count >= 3) {
      rewardType = 'free_growth_month';
      const trialEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await db.query(
        'UPDATE salons SET trial_plan = $1, trial_ends_at = $2 WHERE id = $3',
        ['growth', trialEnd.toISOString(), r.referrer_salon_id]
      );
    } else if (count >= 1) {
      rewardType = 'free_starter_month';
      const trialEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await db.query(
        'UPDATE salons SET trial_plan = $1, trial_ends_at = $2 WHERE id = $3',
        ['starter', trialEnd.toISOString(), r.referrer_salon_id]
      );
    }

    await db.query(
      'UPDATE referrals SET reward_type = $1 WHERE id = $2',
      [rewardType, r.id]
    );

    res.json({
      message: 'Referral applied! Both you and your referrer get rewards.',
      yourReward: '30 days free Starter',
      referrerReward: rewardType === 'free_growth_month' ? '30 days free Growth' : rewardType ? '30 days free Starter' : null,
      totalReferralsByReferrer: count,
    });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Referral: get my stats ───────────────────────────────────
router.get('/referral/stats', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const salonId = decoded.salon_id;
    if (!salonId) return res.status(403).json({ error: 'No salon' });

    const code = await db.query(
      'SELECT referral_code FROM referrals WHERE referrer_salon_id = $1 AND referred_salon_id IS NULL LIMIT 1',
      [salonId]
    );

    const referrals = await db.query(
      `SELECT r.*, s.name as referred_salon_name 
       FROM referrals r 
       LEFT JOIN salons s ON r.referred_salon_id = s.id 
       WHERE r.referrer_salon_id = $1 
       ORDER BY r.created_at DESC`,
      [salonId]
    );

    const completed = referrals.rows.filter(r => r.status === 'completed').length;

    res.json({
      code: code.rows[0]?.referral_code || null,
      totalReferrals: referrals.rows.length,
      completedReferrals: completed,
      nextReward: completed < 3 ? `${3 - completed} more referral(s) for free Growth month` : 'You\'ve unlocked all referral rewards!',
      referrals: referrals.rows.map(r => ({
        code: r.referral_code,
        status: r.status,
        referredSalon: r.referred_salon_name || 'Pending',
        reward: r.reward_type,
        date: r.completed_at || r.created_at,
      })),
    });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Registration bonus: auto boost + trial on register ───────
// Called from auth.js register route via helper
async function applyRegistrationBonuses(salonId) {
  try {
    const now = new Date();
    const boostUntil = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 2 weeks
    const trialEnd = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 3 months

    await db.query(
      `UPDATE salons 
       SET boost_until = $1, 
           is_new_badge = true,
           trial_plan = 'starter',
           trial_ends_at = $2
       WHERE id = $3`,
      [boostUntil.toISOString(), trialEnd.toISOString(), salonId]
    );

    console.log(`[BONUS] Applied to salon ${salonId}: 14-day boost + 90-day Starter trial`);
  } catch (err) {
    console.error('[BONUS ERROR]', err.message);
  }
}

// ─── Super Admin: update plan ─────────────────────────────────
router.put('/plan/:salonId', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!isSuperAdmin(decoded.email)) return res.status(403).json({ error: 'Forbidden' });

    const { plan, billingCycle } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ error: 'Invalid plan' });

    let price = PLANS[plan].price;
    if (billingCycle === 'annual') {
      price = PLANS[plan].annualPrice;
    }

    const { rows } = await db.query(
      'UPDATE salons SET plan = $1, plan_started_at = NOW(), billing_cycle = $2, plan_price = $3 WHERE id = $4 RETURNING id, name, plan',
      [plan, billingCycle || 'monthly', price, req.params.salonId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Salon not found' });
    res.json({ message: 'Plan updated', salon: rows[0] });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = { router, PLANS, applyRegistrationBonuses, getEffectivePlan };

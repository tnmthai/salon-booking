const express = require('express');
const router = express.Router();
const db = require('../db');
const { JWT_SECRET } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Lazy-init Stripe to avoid build-time errors
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  const Stripe = require('stripe');
  return new Stripe(key, { apiVersion: '2026-04-22.dahlia' });
}

// Price mapping (cents NZD)
const PLAN_PRICES = {
  starter_monthly: { amount: 1100, label: 'Plus Monthly — $11 NZD/month', plan: 'starter', cycle: 'monthly' },
  starter_annual: { amount: 10560, label: 'Plus Annual — $105.60 NZD/year', plan: 'starter', cycle: 'annual' },
  growth_monthly: { amount: 2900, label: 'Growth Monthly — $29 NZD/month', plan: 'growth', cycle: 'monthly' },
  growth_annual: { amount: 27840, label: 'Growth Annual — $278.40 NZD/year', plan: 'growth', cycle: 'annual' },
};

// Create checkout session
async function checkoutHandler(req, res) {
  try {
    const stripe = getStripe();
    if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });

    // Verify auth
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token' });

    let decoded;
    try { decoded = jwt.verify(token, JWT_SECRET); } catch { return res.status(401).json({ error: 'Invalid token' }); }

    const { planKey } = req.body;
    const priceInfo = PLAN_PRICES[planKey];
    if (!priceInfo) return res.status(400).json({ error: 'Invalid plan key. Use: starter_monthly, starter_annual, growth_monthly, growth_annual' });

    const origin = req.headers.origin || 'https://www.timia.nz';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: decoded.email,
      line_items: [{
        price_data: {
          currency: 'nzd',
          product_data: {
            name: `Timia ${priceInfo.label}`,
            description: `${priceInfo.plan === 'growth' ? 'Growth' : 'Plus'} plan — ${priceInfo.cycle === 'annual' ? 'annual' : 'monthly'} billing`
          },
          unit_amount: priceInfo.amount
        },
        quantity: 1
      }],
      metadata: {
        salon_id: String(decoded.salon_id || decoded.id),
        email: decoded.email,
        plan: priceInfo.plan,
        cycle: priceInfo.cycle
      },
      success_url: `${origin}/admin/plan?subscribed=1`,
      cancel_url: `${origin}/admin/plan?subscribed=0`
    });

    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// Stripe webhook
async function webhookHandler(req, res) {
  try {
    const stripe = getStripe();
    if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });

    const sig = req.headers['stripe-signature'] || '';
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) return res.status(500).json({ error: 'Webhook secret not configured' });

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, secret);
    } catch (err) {
      return res.status(400).json({ error: `Webhook error: ${err.message}` });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { salon_id, plan, cycle } = session.metadata || {};

      if (salon_id && plan) {
        const now = new Date();
        let expiresAt;

        if (cycle === 'annual') {
          expiresAt = new Date(now.getTime() + 365 * 86400000);
        } else {
          expiresAt = new Date(now.getTime() + 30 * 86400000);
        }

        // Get plan price
        const priceMap = { starter: cycle === 'annual' ? 8.80 : 11, growth: cycle === 'annual' ? 23.20 : 29 };
        const planPrice = priceMap[plan] || 0;

        await db.query(
          'UPDATE salons SET plan = $1, billing_cycle = $2, plan_price = $3 WHERE id = $4',
          [plan, cycle, planPrice, salon_id]
        );

        // Try to set expires_at if column exists
        try {
          await db.query('ALTER TABLE salons ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ');
          await db.query('UPDATE salons SET plan_expires_at = $1 WHERE id = $2', [expiresAt.toISOString(), salon_id]);
        } catch {} // ignore if column doesn't exist

        console.log(`[Stripe] Salon ${salon_id} upgraded to ${plan} (${cycle})`);
      }
    }

    res.json({ received: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = router;
module.exports.checkoutHandler = checkoutHandler;
module.exports.webhookHandler = webhookHandler;

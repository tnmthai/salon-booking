import { useState, useEffect } from 'react'
import { api } from '../utils/api'

const PLAN_COLORS = {
  free: { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700', badge: 'bg-gray-200 text-gray-700' },
  starter: { bg: 'bg-pink-50', border: 'border-pink-400', text: 'text-pink-700', badge: 'bg-pink-100 text-pink-700' },
  growth: { bg: 'bg-purple-50', border: 'border-purple-400', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700' },
}

function daysLeft(dateStr) {
  if (!dateStr) return 0
  const diff = new Date(dateStr) - new Date()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default function PlanSettings() {
  const [planInfo, setPlanInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [referralCode, setReferralCode] = useState('')
  const [referralInput, setReferralInput] = useState('')
  const [referralMsg, setReferralMsg] = useState('')
  const [earlyBird, setEarlyBird] = useState(null)
  const [checkoutLoading, setCheckoutLoading] = useState(null)

  const handleStripeCheckout = async (planId) => {
    const cycle = billingCycle || 'monthly'
    const planKey = `${planId}_${cycle}`
    setCheckoutLoading(planKey)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ planKey })
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Failed to create checkout')
      }
    } catch (e) {
      alert('Network error: ' + e.message)
    } finally {
      setCheckoutLoading(null)
    }
  }

  const loadPlan = () => {
    setLoading(true)
    api.getPlan().then(data => {
      setPlanInfo(data)
      if (data.referral?.code) setReferralCode(data.referral.code)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => {
    loadPlan()
    api.getEarlyBirdStatus().then(setEarlyBird).catch(() => {})
  }, [])

  const handleTrial = async (targetPlan) => {
    if (!confirm(`Start ${targetPlan} trial?`)) return
    try {
      const res = await api.startTrial(targetPlan)
      alert(res.message)
      loadPlan()
    } catch (e) { alert(e.message) }
  }

  const handleBillingCycle = async (cycle) => {
    try {
      const res = await api.switchBillingCycle(cycle)
      alert(res.message)
      loadPlan()
    } catch (e) { alert(e.message) }
  }

  const handleEarlyBird = async () => {
    if (!confirm('Claim Early Bird? Starter at $7/mo forever!')) return
    try {
      const res = await api.claimEarlyBird()
      alert(res.message)
      loadPlan()
      api.getEarlyBirdStatus().then(setEarlyBird)
    } catch (e) { alert(e.message) }
  }

  const handleGetReferralCode = async () => {
    try {
      const res = await api.getReferralCode()
      setReferralCode(res.code)
    } catch (e) { alert(e.message) }
  }

  const handleApplyReferral = async () => {
    if (!referralInput.trim()) return
    try {
      const res = await api.applyReferralCode(referralInput.trim())
      setReferralMsg(res.message)
      loadPlan()
    } catch (e) { setReferralMsg(e.message) }
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>
  if (!planInfo) return <div className="text-center py-12 text-gray-400">Failed to load plan info</div>

  const { plan, planDef, usage, limits, isTrial, trialEndsAt, billingCycle, isEarlyBird, lockedPrice } = planInfo
  const effectivePlan = isTrial ? planInfo.trial_plan || plan : plan
  const pc = PLAN_COLORS[effectivePlan] || PLAN_COLORS.free
  const trialDays = daysLeft(trialEndsAt)

  const plans = [
    {
      id: 'free',
      name: 'Starter',
      price: 0,
      desc: 'Get started at no cost',
      features: ['Online booking page', 'Marketplace listing', 'Basic reports', 'Email notifications', '2 staff members', '40 appointments/month'],
    },
    {
      id: 'starter',
      name: 'Plus',
      price: billingCycle === 'annual' ? 8.80 : 11,
      desc: 'For growing teams',
      popular: true,
      features: ['Everything in Starter', 'Up to 6 staff', 'Unlimited appointments', 'Staff roster & schedule', 'Loyalty points (50 cards)', 'Reviews & Gallery'],
    },
    {
      id: 'growth',
      name: 'Growth',
      price: billingCycle === 'annual' ? 23.20 : 29,
      desc: 'For established businesses',
      features: ['Everything in Plus', 'Unlimited staff', 'Advanced reports', 'Unlimited loyalty system', 'Unlimited email automation', 'Priority marketplace ranking', 'Promotions & deals engine'],
    },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">📦 Subscription Plan</h1>
      <p className="text-gray-500 mb-6">Manage your plan and view usage</p>

      {/* Trial Banner */}
      {isTrial && trialDays > 0 && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🎁</span>
            <span className="font-bold">Free Trial Active</span>
          </div>
          <p className="text-green-100 text-sm">
            You're on <strong className="text-white">{planInfo.trial_plan?.charAt(0).toUpperCase() + planInfo.trial_plan?.slice(1)}</strong> trial — <strong className="text-white">{trialDays} days</strong> remaining.
            Auto-downgrades to {plan === 'free' ? 'Starter' : 'Plus'} when trial ends.
          </p>
        </div>
      )}

      {/* Early Bird Banner */}
      {isEarlyBird && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🔥</span>
            <span className="font-bold">Early Bird Member</span>
          </div>
          <p className="text-amber-100 text-sm">
            You have <strong className="text-white">Starter at ${lockedPrice}/mo forever</strong> — locked-in price!
          </p>
        </div>
      )}

      {/* Early Bird Available */}
      {earlyBird && !earlyBird.soldOut && !isEarlyBird && (
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🔥</span>
            <span className="font-bold">Early Bird Available!</span>
          </div>
          <p className="text-amber-100 text-sm mb-3">
            {earlyBird.slotsRemaining} slots left — Starter at <strong className="text-white">${earlyBird.starterPrice}/mo forever</strong>
          </p>
          <button onClick={handleEarlyBird} className="bg-white text-amber-600 px-4 py-2 rounded-full text-sm font-semibold hover:bg-amber-50 transition">
            Claim Early Bird →
          </button>
        </div>
      )}

      {/* Current Plan Summary */}
      <div className={`${pc.bg} border ${pc.border} rounded-2xl p-6 mb-6`}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${pc.badge}`}>
              {planDef?.name || effectivePlan} Plan
            </span>
            {isTrial && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Trial</span>}
            {isEarlyBird && <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Early Bird</span>}
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold">${isEarlyBird ? lockedPrice : (planDef?.price || 0)}</span>
            <span className="text-gray-400">/mo</span>
            {billingCycle === 'annual' && !isEarlyBird && <span className="ml-2 text-xs text-green-600 font-semibold">Annual (20% off)</span>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/60 rounded-xl p-4">
            <div className="text-2xl font-bold">{usage.staff} / {limits.maxStaff === -1 ? '∞' : limits.maxStaff}</div>
            <div className="text-sm text-gray-500">Staff members</div>
            {limits.maxStaff > 0 && (
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-pink-500 rounded-full" style={{ width: `${Math.min(100, (usage.staff / limits.maxStaff) * 100)}%` }} />
              </div>
            )}
          </div>
          <div className="bg-white/60 rounded-xl p-4">
            <div className="text-2xl font-bold">{usage.appointmentsThisMonth} / {limits.maxAppointmentsPerMonth === -1 ? '∞' : limits.maxAppointmentsPerMonth}</div>
            <div className="text-sm text-gray-500">Appointments this month</div>
            {limits.maxAppointmentsPerMonth > 0 && (
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(100, (usage.appointmentsThisMonth / limits.maxAppointmentsPerMonth) * 100)}%` }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Billing Toggle */}
      {!isEarlyBird && plan !== 'free' && (
        <div className="flex items-center gap-3 mb-6 justify-center">
          <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
          <button
            onClick={() => handleBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className={`relative w-14 h-7 rounded-full transition-colors ${billingCycle === 'annual' ? 'bg-pink-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${billingCycle === 'annual' ? 'translate-x-7' : ''}`} />
          </button>
          <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-gray-900' : 'text-gray-400'}`}>
            Annual
            {billingCycle === 'annual' && <span className="ml-1 text-green-600 text-xs font-bold">Save 20%</span>}
          </span>
        </div>
      )}

      {/* Plan Cards */}
      <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map(p => {
          const isActive = effectivePlan === p.id
          const pc2 = PLAN_COLORS[p.id]
          const canTrialFreeToStarter = plan === 'free' && p.id === 'starter' && !isTrial
          const canTrialStarterToGrowth = plan === 'starter' && p.id === 'growth' && !isTrial
          const canTrialFreeToGrowth = plan === 'free' && p.id === 'growth' && !isTrial
          const showTrial = canTrialFreeToStarter || canTrialStarterToGrowth || canTrialFreeToGrowth

          return (
            <div key={p.id} className={`rounded-2xl border-2 p-6 relative ${isActive ? `${pc2.border} ${pc2.bg}` : 'border-gray-200 bg-white'}`}>
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-pink-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              {isActive && !isTrial && (
                <div className="absolute -top-3 right-4 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Current Plan
                </div>
              )}
              {isActive && isTrial && (
                <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Trial Active
                </div>
              )}
              {showTrial && (
                <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  🆓 Free Trial
                </div>
              )}
              <h3 className="text-lg font-bold mt-1">{p.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{p.desc}</p>
              <div className="text-3xl font-bold mb-4">
                {p.price === 0 ? '$0' : `$${p.price}`}
                {p.price > 0 && <span className="text-base font-normal text-gray-400">/mo</span>}
              </div>
              <ul className="space-y-2 mb-6">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              {showTrial ? (
                <button
                  onClick={() => handleTrial(p.id)}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold bg-green-500 text-white hover:bg-green-600 transition"
                >
                  Start Free Trial
                </button>
              ) : !isActive ? (
                <button
                  onClick={() => {
                    if (p.price === 0) {
                      // Downgrade to free
                      if (!confirm(`Downgrade to Starter?`)) return
                      api.me().then(me => api.updatePlan(me.salon.id, 'free', 'monthly')).then(loadPlan).catch(e => alert(e.message))
                    } else {
                      // Paid plan — go through Stripe
                      handleStripeCheckout(p.id)
                    }
                  }}
                  disabled={checkoutLoading !== null}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition ${
                    p.id === 'growth'
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : p.id === 'starter'
                      ? 'bg-pink-600 text-white hover:bg-pink-700'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {checkoutLoading === `${p.id}_${billingCycle || 'monthly'}`
                    ? 'Redirecting...'
                    : effectivePlan === 'growth' && p.id !== 'growth'
                    ? `Downgrade to ${p.name}`
                    : p.price === 0
                    ? 'Downgrade to Starter'
                    : `Upgrade to ${p.name}`
                  }
                </button>
              ) : null}
            </div>
          )
        })}
      </div>

      {/* Referral Section */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="text-lg font-bold mb-2">👥 Referral Program</h3>
        <p className="text-gray-600 text-sm mb-4">
          Refer 1 shop → both get <strong>1 month free Starter</strong>. Refer 3 shops → you get <strong>1 month free Growth</strong>!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Your Code */}
          <div className="bg-white rounded-xl p-4">
            <label className="text-sm font-semibold text-gray-700 block mb-2">Your Referral Code</label>
            {referralCode ? (
              <div className="flex items-center gap-2">
                <code className="bg-gray-100 px-3 py-2 rounded-lg text-lg font-mono font-bold tracking-wider">{referralCode}</code>
                <button
                  onClick={() => navigator.clipboard.writeText(`https://www.timia.nz/register?ref=${referralCode}`)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Copy Link
                </button>
              </div>
            ) : (
              <button onClick={handleGetReferralCode} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
                Generate Code
              </button>
            )}
            {planInfo.referral && (
              <p className="text-xs text-gray-500 mt-2">
                {planInfo.referral.successfulReferrals} successful referral(s)
              </p>
            )}
          </div>

          {/* Apply Code */}
          <div className="bg-white rounded-xl p-4">
            <label className="text-sm font-semibold text-gray-700 block mb-2">Have a Referral Code?</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralInput}
                onChange={e => setReferralInput(e.target.value.toUpperCase())}
                placeholder="Enter code"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                maxLength={8}
              />
              <button onClick={handleApplyReferral} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
                Apply
              </button>
            </div>
            {referralMsg && <p className="text-xs text-green-600 mt-2">{referralMsg}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

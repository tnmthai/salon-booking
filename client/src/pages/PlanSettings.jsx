import { useState, useEffect } from 'react'
import { api } from '../utils/api'

const PLAN_COLORS = {
  free: { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700', badge: 'bg-gray-200 text-gray-700' },
  starter: { bg: 'bg-pink-50', border: 'border-pink-400', text: 'text-pink-700', badge: 'bg-pink-100 text-pink-700' },
  growth: { bg: 'bg-purple-50', border: 'border-purple-400', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700' },
}

export default function PlanSettings() {
  const [planInfo, setPlanInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getPlan().then(data => {
      setPlanInfo(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>
  if (!planInfo) return <div className="text-center py-12 text-gray-400">Failed to load plan info</div>

  const { plan, planDef, usage, limits } = planInfo
  const pc = PLAN_COLORS[plan] || PLAN_COLORS.free

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      desc: 'Get started at no cost',
      features: ['Online booking page', 'Marketplace listing', 'Basic reports', 'Email notifications', '2 staff members', '40 appointments/month'],
      maxStaff: 2,
      maxAppts: 40,
    },
    {
      id: 'starter',
      name: 'Starter',
      price: 11,
      desc: 'For growing teams',
      popular: true,
      features: ['Everything in Free', 'Up to 6 staff', 'Unlimited appointments', 'Staff roster & schedule', 'Loyalty points (50 cards)', 'Reviews & Gallery'],
      maxStaff: 6,
      maxAppts: 'Unlimited',
    },
    {
      id: 'growth',
      name: 'Growth',
      price: 29,
      desc: 'For established businesses',
      features: ['Everything in Starter', 'Unlimited staff', 'Advanced reports', 'Unlimited loyalty system', 'Unlimited email automation', 'Priority marketplace ranking', 'Promotions & deals engine'],
      maxStaff: 'Unlimited',
      maxAppts: 'Unlimited',
    },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">📦 Subscription Plan</h1>
      <p className="text-gray-500 mb-8">Manage your plan and view usage</p>

      {/* Current Plan Summary */}
      <div className={`${pc.bg} border ${pc.border} rounded-2xl p-6 mb-8`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${pc.badge}`}>
              {planDef.name} Plan
            </span>
            <span className="ml-3 text-2xl font-bold">${planDef.price}/mo</span>
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

      {/* Plan Cards */}
      <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map(p => {
          const isActive = plan === p.id
          const pc2 = PLAN_COLORS[p.id]
          return (
            <div key={p.id} className={`rounded-2xl border-2 p-6 relative ${isActive ? `${pc2.border} ${pc2.bg}` : 'border-gray-200 bg-white'}`}>
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-pink-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              {isActive && (
                <div className="absolute -top-3 right-4 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Current Plan
                </div>
              )}
              <h3 className="text-lg font-bold mt-1">{p.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{p.desc}</p>
              <div className="text-3xl font-bold mb-4">${p.price}<span className="text-base font-normal text-gray-400">/mo</span></div>
              <ul className="space-y-2 mb-6">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              {!isActive && (
                <button
                  onClick={async () => {
                    if (!confirm(`Switch to ${p.name} plan ($${p.price}/mo)?`)) return
                    try {
                      // Need salon_id from current user
                      const me = await api.me()
                      await api.updatePlan(me.salon.id, p.id)
                      const updated = await api.getPlan()
                      setPlanInfo(updated)
                      alert(`Switched to ${p.name} plan!`)
                    } catch (e) { alert(e.message) }
                  }}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition ${
                    p.id === 'growth'
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : p.id === 'starter'
                      ? 'bg-pink-600 text-white hover:bg-pink-700'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {p.price === 0 ? 'Downgrade to Free' : `Upgrade to ${p.name}`}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

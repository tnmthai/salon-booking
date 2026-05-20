import { useState, useEffect } from 'react'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'

const basePlans = [
  { name: 'Free', price: 0, annualPrice: 0, desc: 'Get started at no cost.', features: ['Online booking page', 'Marketplace listing', 'Basic reports', 'Email notifications', '2 staff members', '40 appointments/month'], cta: 'Start for free', popular: false, trial: null },
  { name: 'Starter', price: 11, annualPrice: 8.80, desc: 'For growing teams.', features: ['Everything in Free', 'Up to 6 staff', 'Unlimited appointments', 'Staff roster & schedule', 'Loyalty points (50 cards)', 'Reviews & Gallery'], cta: 'Try free for 3 months', popular: true, trial: '3 months free trial' },
  { name: 'Growth', price: 29, annualPrice: 23.20, desc: 'For established businesses.', features: ['Everything in Starter', 'Unlimited staff', 'Advanced reports', 'Unlimited loyalty system', 'Unlimited email automation', 'Priority marketplace ranking', 'Promotions & deals engine'], cta: 'Try free for 60 days', popular: false, trial: '60 days free trial' },
]

const faqs = [
  { q: 'Is there really a free plan?', a: 'Yes! Free forever. No credit card required.' },
  { q: 'How does the free trial work?', a: 'Free users get 3 months of Starter features free. Starter users can try Growth for 60 days. No credit card needed — your plan auto-downgrades when the trial ends.' },
  { q: 'What is the Early Bird offer?', a: 'The first 50 shops to sign up get Starter at $7/mo forever — a locked-in price that never increases. Once all 50 slots are taken, the offer ends.' },
  { q: 'How does annual billing work?', a: 'Save 20% by paying annually. Starter drops to $8.80/mo ($105.60/year, save $26.40) and Growth drops to $23.20/mo ($278.40/year, save $69.60).' },
  { q: 'Can I upgrade or downgrade anytime?', a: 'Absolutely. Switch plans anytime, no lock-in.' },
  { q: 'What payment methods do you accept?', a: 'All major credit cards through Stripe.' },
  { q: 'Is there a contract?', a: 'No contracts. Month-to-month, cancel anytime.' },
]

function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 z-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold">
          <img src="/logo.png" alt="Timia" className="w-8 h-8 rounded-full" />
          <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Timia</span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          <Link to="/explore" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">Explore</Link>
          <Link to="/features" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">Features</Link>
          <Link to="/pricing" className="text-sm text-pink-600 font-medium px-3 py-2">Pricing</Link>
          <Link to="/about" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">About</Link>
          <Link to="/contact" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">Contact</Link>
          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">Sign in</Link>
          <Link to="/register" className="text-sm bg-gray-900 text-white px-5 py-2 rounded-full hover:bg-gray-800 transition ml-1">Get Started</Link>
        </div>
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 -mr-2 text-gray-600 hover:text-gray-900" aria-label="Menu">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-2 space-y-0.5">
            <Link to="/explore" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">Explore</Link>
            <Link to="/features" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">Features</Link>
            <Link to="/pricing" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-pink-600 bg-pink-50 font-medium rounded-lg">Pricing</Link>
            <Link to="/about" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">About</Link>
            <Link to="/contact" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">Contact</Link>
            <Link to="/login" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">Sign in</Link>
            <Link to="/register" onClick={() => setOpen(false)} className="block mt-2 text-center bg-gray-900 text-white py-2.5 rounded-full text-sm font-medium">Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  )
}

// Early Bird Countdown Component
function EarlyBirdBanner({ earlyBird }) {
  const [slots, setSlots] = useState(earlyBird)

  useEffect(() => {
    api.getEarlyBirdStatus().then(setSlots).catch(() => {})
  }, [])

  if (!slots || slots.soldOut) return null

  const pct = (slots.slotsTaken / slots.totalSlots) * 100

  return (
    <div className="max-w-5xl mx-auto mb-8 px-4 md:px-6">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 md:p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🔥</span>
            <span className="font-bold text-lg">Early Bird Launch Special</span>
          </div>
          <p className="text-amber-100 mb-3 text-sm md:text-base">
            First 50 shops get <strong className="text-white">Starter at $7/mo forever</strong> — locked-in price!
          </p>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 bg-white/20 rounded-full h-3 overflow-hidden">
              <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-sm font-bold whitespace-nowrap">{slots.slotsRemaining} slots left</span>
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            <Link to="/register" className="bg-white text-amber-600 px-5 py-2 rounded-full font-semibold text-sm hover:bg-amber-50 transition">
              Claim Your Spot →
            </Link>
            <span className="text-amber-200 text-sm self-center">
              ⭐ "Founder member" badge on marketplace
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false)
  const [earlyBird, setEarlyBird] = useState(null)

  useEffect(() => {
    api.getEarlyBirdStatus().then(setEarlyBird).catch(() => {})
  }, [])

  const plans = basePlans.map(p => ({
    ...p,
    displayPrice: isAnnual ? p.annualPrice : p.price,
    annualSaving: p.price > 0 ? Math.round((p.price - p.annualPrice) * 12 * 100) / 100 : 0,
  }))

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-24 md:pt-32 pb-6 md:pb-10 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6">
            <span className="w-2 h-2 bg-pink-500 rounded-full" />Simple, transparent pricing
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 md:mb-6">
            Plans that<span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"> grow with you</span>
          </h1>
          <p className="text-base md:text-lg text-gray-500 max-w-xl mx-auto mb-6">Start for free, upgrade when you need more. No credit card required.</p>

          {/* Monthly / Annual Toggle */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-14 h-7 rounded-full transition-colors ${isAnnual ? 'bg-pink-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${isAnnual ? 'translate-x-7' : ''}`} />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-400'}`}>
              Annual
              {isAnnual && <span className="ml-1 text-green-600 text-xs font-bold">Save 20%</span>}
            </span>
          </div>
        </div>
      </section>

      {/* Early Bird Banner */}
      <EarlyBirdBanner earlyBird={earlyBird} />

      {/* Plans */}
      <section className="pb-12 md:pb-20 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {plans.map((plan, i) => (
              <div key={i} className={`relative bg-white rounded-xl md:rounded-2xl p-6 md:p-8 border-2 transition hover:shadow-lg ${plan.popular ? 'border-pink-500 shadow-lg shadow-pink-500/10' : 'border-gray-100'}`}>
                {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full">MOST POPULAR</div>}

                {/* Trial Badge */}
                {plan.trial && (
                  <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    🆓 {plan.trial}
                  </div>
                )}

                <h3 className="font-bold text-gray-900 text-lg md:text-xl mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  {plan.price > 0 ? (
                    <>
                      <span className="text-3xl md:text-4xl font-bold text-gray-900">${plan.displayPrice}</span>
                      <span className="text-gray-400 text-sm">/mo</span>
                    </>
                  ) : (
                    <span className="text-3xl md:text-4xl font-bold text-gray-900">$0</span>
                  )}
                </div>

                {/* Annual saving */}
                {isAnnual && plan.annualSaving > 0 && (
                  <p className="text-green-600 text-xs font-semibold mb-1">Save ${plan.annualSaving}/year</p>
                )}

                <p className="text-gray-500 text-sm mb-5 md:mb-6">{plan.desc}</p>
                <ul className="space-y-2.5 md:space-y-3 mb-6 md:mb-8">{plan.features.map((f, j) => (<li key={j} className="flex items-center gap-2 text-sm text-gray-600"><span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs flex-shrink-0">✓</span>{f}</li>))}</ul>
                <Link to="/register" className={`block text-center py-2.5 md:py-3 rounded-xl font-semibold transition text-sm md:text-base ${plan.popular ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:opacity-90' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>{plan.cta}</Link>
              </div>
            ))}
          </div>

          {/* Bonus Banner */}
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 md:p-8 border border-purple-100">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="text-3xl">🎁</div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg mb-1">Registration Bonus</h3>
                <p className="text-gray-600 text-sm">
                  Sign up now and get <strong>free setup assistance</strong> — we'll help import your services and configure your staff. Plus, create 10+ services and get <strong>1 month of Growth free!</strong>
                </p>
              </div>
              <Link to="/register" className="bg-purple-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-purple-700 transition whitespace-nowrap">
                Claim Bonus →
              </Link>
            </div>
          </div>

          {/* Referral Banner */}
          <div className="mt-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 md:p-8 border border-blue-100">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="text-3xl">👥</div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg mb-1">Refer & Earn</h3>
                <p className="text-gray-600 text-sm">
                  Refer 1 shop → both get <strong>1 month free Starter</strong>.
                  Refer 3 shops → you get <strong>1 month free Growth</strong>!
                </p>
              </div>
              <Link to="/register" className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition whitespace-nowrap">
                Get Referral Code →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">Frequently asked questions</h2>
          </div>
          <div className="space-y-3 md:space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group border border-gray-100 rounded-xl overflow-hidden bg-white">
                <summary className="flex items-center justify-between px-5 md:px-6 py-3.5 md:py-4 cursor-pointer hover:bg-gray-50 transition text-sm md:text-base">
                  <span className="font-medium text-gray-900 pr-2">{faq.q}</span>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 text-xs">▼</span>
                </summary>
                <div className="px-5 md:px-6 pb-3.5 md:pb-4 text-gray-500 text-sm">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

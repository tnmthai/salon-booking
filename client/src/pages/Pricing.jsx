import { useState, useEffect } from 'react'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'
import { useI18n } from '../utils/i18n'

const EARLY_BIRD_TOTAL = 50
const EARLY_BIRD_BASE_DATE = new Date('2026-05-12')
const EARLY_BIRD_BASE_TAKEN = 10
const EARLY_BIRD_RATE_PER_DAY = 1.2
const EARLY_BIRD_CAP = 40

function getEarlyBirdSlots() {
  const now = new Date()
  const daysSinceLaunch = Math.max(0, (now - EARLY_BIRD_BASE_DATE) / (1000 * 60 * 60 * 24))
  const slotsTaken = Math.min(EARLY_BIRD_CAP, Math.floor(EARLY_BIRD_BASE_TAKEN + daysSinceLaunch * EARLY_BIRD_RATE_PER_DAY))
  const slotsRemaining = EARLY_BIRD_TOTAL - slotsTaken
  return { slotsTaken, slotsRemaining, totalSlots: EARLY_BIRD_TOTAL, soldOut: slotsRemaining <= 0 }
}

function Navbar() {
  const [open, setOpen] = useState(false)
  const { t, lang, switchLang } = useI18n()
  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 z-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold">
          <img src="/logo.png" alt="Timia" className="w-8 h-8 rounded-full" />
          <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Timia</span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          <Link to="/explore" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">{t('explore')}</Link>
          <Link to="/features" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">{t('features')}</Link>
          <Link to="/pricing" className="text-sm text-pink-600 font-medium px-3 py-2">{t('pricing')}</Link>
          <Link to="/about" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">{t('about')}</Link>
          <Link to="/contact" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">{t('contact')}</Link>
          <select value={lang} onChange={e => switchLang(e.target.value)} className="text-xs bg-transparent border border-gray-200 rounded px-1.5 py-1 text-gray-600 cursor-pointer">
            <option value="en">EN</option><option value="vi">VI</option><option value="mi">MI</option>
          </select>
          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">{t('signIn')}</Link>
          <Link to="/register" className="text-sm bg-gray-900 text-white px-5 py-2 rounded-full hover:bg-gray-800 transition ml-1">{t('getStarted')}</Link>
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
            <Link to="/explore" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">{t('explore')}</Link>
            <Link to="/features" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">{t('features')}</Link>
            <Link to="/pricing" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-pink-600 bg-pink-50 font-medium rounded-lg">{t('pricing')}</Link>
            <Link to="/about" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">{t('about')}</Link>
            <Link to="/contact" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">{t('contact')}</Link>
            <div className="flex gap-2 py-2">
              <select value={lang} onChange={e => switchLang(e.target.value)} className="text-xs bg-gray-100 border border-gray-200 rounded px-2 py-1.5 text-gray-600">
                <option value="en">EN</option><option value="vi">VI</option><option value="mi">MI</option>
              </select>
            </div>
            <Link to="/login" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">{t('signIn')}</Link>
            <Link to="/register" onClick={() => setOpen(false)} className="block mt-2 text-center bg-gray-900 text-white py-2.5 rounded-full text-sm font-medium">{t('getStarted')}</Link>
          </div>
        </div>
      )}
    </nav>
  )
}

function EarlyBirdBanner() {
  const { t } = useI18n()
  const [slots, setSlots] = useState(null)

  useEffect(() => {
    fetch('/api/early-bird/status').then(r => r.json()).then(data => {
      if (!data.error) setSlots(data)
    }).catch(() => {})
    const interval = setInterval(() => {
      fetch('/api/early-bird/status').then(r => r.json()).then(data => {
        if (!data.error) setSlots(data)
      }).catch(() => {})
    }, 60000)
    return () => clearInterval(interval)
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
            <span className="font-bold text-lg">{t('pricing_earlybird_title')}</span>
          </div>
          <p className="text-amber-100 mb-3 text-sm md:text-base">{t('pricing_earlybird_desc')}</p>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 bg-white/20 rounded-full h-3 overflow-hidden">
              <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-sm font-bold whitespace-nowrap">{slots.slotsRemaining} {t('pricing_earlybird_slots_left')}</span>
          </div>
          <p className="text-amber-200 text-xs mb-3">{slots.slotsTaken}/{slots.totalSlots} {t('pricing_earlybird_claimed')}</p>
          <div className="flex flex-wrap gap-3 mt-1">
            <Link to="/register" className="bg-white text-amber-600 px-5 py-2 rounded-full font-semibold text-sm hover:bg-amber-50 transition">{t('pricing_claim_spot')}</Link>
            <span className="text-amber-200 text-sm self-center">⭐ {t('pricing_founder_badge')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Pricing() {
  const { t } = useI18n()
  const [isAnnual, setIsAnnual] = useState(false)

  const basePlans = [
    { name: t('pricing_starter_name'), price: 0, annualPrice: 0, desc: t('pricing_starter_desc'), features: [t('pricing_starter_f1'), t('pricing_starter_f2'), t('pricing_starter_f3'), t('pricing_starter_f4'), t('pricing_starter_f5'), t('pricing_starter_f6')], cta: t('pricing_starter_cta'), popular: false, trial: null },
    { name: t('pricing_plus_name'), price: 11, annualPrice: 8.80, desc: t('pricing_plus_desc'), features: [t('pricing_plus_f1'), t('pricing_plus_f2'), t('pricing_plus_f3'), t('pricing_plus_f4'), t('pricing_plus_f5'), t('pricing_plus_f6')], cta: t('pricing_plus_cta'), popular: true, trial: t('pricing_plus_trial') },
    { name: t('pricing_growth_name'), price: 29, annualPrice: 23.20, desc: t('pricing_growth_desc'), features: [t('pricing_growth_f1'), t('pricing_growth_f2'), t('pricing_growth_f3'), t('pricing_growth_f4'), t('pricing_growth_f5'), t('pricing_growth_f6'), t('pricing_growth_f7')], cta: t('pricing_growth_cta'), popular: false, trial: t('pricing_growth_trial') },
  ]

  const faqs = [
    { q: t('pricing_faq1_q'), a: t('pricing_faq1_a') },
    { q: t('pricing_faq2_q'), a: t('pricing_faq2_a') },
    { q: t('pricing_faq3_q'), a: t('pricing_faq3_a') },
    { q: t('pricing_faq4_q'), a: t('pricing_faq4_a') },
    { q: t('pricing_faq5_q'), a: t('pricing_faq5_a') },
    { q: t('pricing_faq6_q'), a: t('pricing_faq6_a') },
    { q: t('pricing_faq7_q'), a: t('pricing_faq7_a') },
  ]

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
            <span className="w-2 h-2 bg-pink-500 rounded-full" />{t('pricing_badge')}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 md:mb-6">
            {t('pricing_title_1')}<span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"> {t('pricing_title_2')}</span>
          </h1>
          <p className="text-base md:text-lg text-gray-500 max-w-xl mx-auto mb-6">{t('pricing_subtitle')}</p>
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-400'}`}>{t('pricing_monthly')}</span>
            <button onClick={() => setIsAnnual(!isAnnual)} className={`relative w-14 h-7 rounded-full transition-colors ${isAnnual ? 'bg-pink-500' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${isAnnual ? 'translate-x-7' : ''}`} />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-400'}`}>
              {t('pricing_annual')}
              {isAnnual && <span className="ml-1 text-green-600 text-xs font-bold">{t('pricing_save20')}</span>}
            </span>
          </div>
        </div>
      </section>
      <EarlyBirdBanner />
      <section className="pb-12 md:pb-20 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {plans.map((plan, i) => (
              <div key={i} className={`relative bg-white rounded-xl md:rounded-2xl p-6 md:p-8 border-2 transition hover:shadow-lg ${plan.popular ? 'border-pink-500 shadow-lg shadow-pink-500/10' : 'border-gray-100'}`}>
                {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full">{t('pricing_most_popular')}</div>}
                {plan.trial && <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">🆓 {plan.trial}</div>}
                <h3 className="font-bold text-gray-900 text-lg md:text-xl mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  {plan.price > 0 ? (
                    <><span className="text-3xl md:text-4xl font-bold text-gray-900">${plan.displayPrice}</span><span className="text-gray-400 text-sm">/mo</span></>
                  ) : (
                    <span className="text-3xl md:text-4xl font-bold text-gray-900">$0</span>
                  )}
                </div>
                {isAnnual && plan.annualSaving > 0 && <p className="text-green-600 text-xs font-semibold mb-1">{t('pricing_save_year')}{plan.annualSaving}{t('pricing_save_suffix')}</p>}
                <p className="text-gray-500 text-sm mb-5 md:mb-6">{plan.desc}</p>
                <ul className="space-y-2.5 md:space-y-3 mb-6 md:mb-8">{plan.features.map((f, j) => (<li key={j} className="flex items-center gap-2 text-sm text-gray-600"><span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs flex-shrink-0">✓</span>{f}</li>))}</ul>
                <Link to="/register" className={`block text-center py-2.5 md:py-3 rounded-xl font-semibold transition text-sm md:text-base ${plan.popular ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:opacity-90' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>{plan.cta}</Link>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 md:p-8 border border-purple-100">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="text-3xl">🎁</div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg mb-1">{t('pricing_bonus_title')}</h3>
                <p className="text-gray-600 text-sm">{t('pricing_bonus_desc')}</p>
              </div>
              <Link to="/register" className="bg-purple-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-purple-700 transition whitespace-nowrap">{t('pricing_claim_bonus')}</Link>
            </div>
          </div>
          <div className="mt-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 md:p-8 border border-blue-100">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="text-3xl">👥</div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg mb-1">{t('pricing_referral_title')}</h3>
                <p className="text-gray-600 text-sm">{t('pricing_referral_desc')}</p>
              </div>
              <Link to="/register" className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition whitespace-nowrap">{t('pricing_get_referral')}</Link>
            </div>
          </div>
        </div>
      </section>
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">{t('pricing_faq_title')}</h2>
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

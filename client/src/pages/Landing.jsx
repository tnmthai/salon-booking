import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import { useI18n } from '../utils/i18n'
import Footer from '../components/Footer'

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
          <Link to="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">{t('pricing')}</Link>
          <Link to="/compare/timely" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">{t('compare')}</Link>
          <Link to="/about" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">{t('about')}</Link>
          <Link to="/lookup" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">{t('findBooking')}</Link>
          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">{t('signIn')}</Link>
          <select value={lang} onChange={e => switchLang(e.target.value)} className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white text-gray-600 mx-1">
            <option value="en">EN</option>
            <option value="vi">VI</option>
            <option value="mi">MI</option>
                <option value="zh">中文</option>
                <option value="hi">हिन्दी</option>
          </select>
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
            <Link to="/pricing" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">{t('pricing')}</Link>
            <Link to="/compare/timely" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">{t('compare')}</Link>
            <Link to="/about" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">{t('about')}</Link>
            <Link to="/lookup" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">{t('findBooking')}</Link>
            <Link to="/login" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">{t('signIn')}</Link>
            <div className="flex items-center gap-2 px-3 py-2">
              <select value={lang} onChange={e => switchLang(e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1 bg-white text-gray-600">
                <option value="en">EN</option>
                <option value="vi">VI</option>
                <option value="mi">MI</option>
                <option value="zh">中文</option>
                <option value="hi">हिन्दी</option>
              </select>
            </div>
            <Link to="/register" onClick={() => setOpen(false)} className="block mt-2 text-center bg-gray-900 text-white py-2.5 rounded-full text-sm font-medium">{t('getStarted')}</Link>
          </div>
        </div>
      )}
    </nav>
  )
}

export default function Landing() {
  const { t } = useI18n()
  const [salons, setSalons] = useState([])
  const [ratings, setRatings] = useState({})

  const [lookupCode, setLookupCode] = useState('')
  const [bookedToday, setBookedToday] = useState(() => {
    const now = new Date()
    const minutesToday = now.getHours() * 60 + now.getMinutes()
    return Math.floor(minutesToday / 10) + 10
  })
  useEffect(() => {
    const interval = setInterval(() => setBookedToday(c => c + 1), 600000)
    return () => clearInterval(interval)
  }, [])


  const navigate = useNavigate()

  useEffect(() => {
    api.getSalons().then(async (data) => {
      setSalons(data)
      const r = {}
      for (const s of data) {
        try {
          const rating = await api.getSalonRating(s.slug)
          if (rating.total_reviews > 0) r[s.id] = rating
        } catch {}
      }
      setRatings(r)
    }).catch(console.error)
  }, [])

  const landingFeatures = [
    { icon: '📅', title: t('landing_f1_title'), desc: t('landing_f1_desc'), color: 'from-blue-500 to-cyan-500' },
    { icon: '👥', title: t('landing_f2_title'), desc: t('landing_f2_desc'), color: 'from-purple-500 to-pink-500' },
    { icon: '📊', title: t('landing_f3_title'), desc: t('landing_f3_desc'), color: 'from-orange-500 to-red-500' },
  ]

  const steps = [
    { step: '01', title: t('landing_step1_title'), desc: t('landing_step1_desc') },
    { step: '02', title: t('landing_step2_title'), desc: t('landing_step2_desc') },
    { step: '03', title: t('landing_step3_title'), desc: t('landing_step3_desc') },
  ]

  const testimonials = [
    { quote: t('landing_testimonial1_quote'), name: t('landing_testimonial1_name'), role: t('landing_testimonial1_role'), stars: '⭐⭐⭐⭐⭐' },
    { quote: t('landing_testimonial2_quote'), name: t('landing_testimonial2_name'), role: t('landing_testimonial2_role'), stars: '⭐⭐⭐⭐⭐' },
    { quote: t('landing_testimonial3_quote'), name: t('landing_testimonial3_name'), role: t('landing_testimonial3_role'), stars: '⭐⭐⭐⭐⭐' },
  ]

  const stats = [
    { value: '24/7', label: t('landing_stat_online') },
    { value: 'Easy', label: t('landing_stat_setup') },
    { value: 'Free', label: t('landing_stat_migrate') },
    { value: '$0', label: t('landing_stat_start') },
  ]

  const timelyItems = [
    { icon: '💰', title: t('landing_timely_50_title'), desc: t('landing_timely_50_desc') },
    { icon: '⚡', title: t('landing_timely_setup_title'), desc: t('landing_timely_setup_desc') },
    { icon: '🇳🇿', title: t('landing_timely_nz_title'), desc: t('landing_timely_nz_desc') },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6">
              <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
              {t('landing_badge')}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 md:mb-6">
              {t('landing_hero_title_1')}
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">{t('landing_hero_title_2')}</span>
            </h1>
            <p className="text-base md:text-lg text-gray-500 mb-6 md:mb-10 max-w-xl mx-auto leading-relaxed">
              {t('landing_hero_subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link to="/register" className="bg-gray-900 text-white px-6 md:px-8 py-3 md:py-3.5 rounded-full hover:bg-gray-800 font-medium transition shadow-lg shadow-gray-900/10 text-sm md:text-base w-full sm:w-auto text-center">
                {t('landing_start_free')}
              </Link>
              <button
                onClick={async () => {
                  try {
                    const data = await api.demoStart()
                    localStorage.setItem('salon_token', data.token)
                    window.location.href = '/admin'
                  } catch (e) { alert('Failed to start demo: ' + e.message) }
                }}
                className="border-2 border-pink-200 text-pink-700 px-6 md:px-8 py-3 md:py-3.5 rounded-full hover:bg-pink-50 font-medium transition text-sm md:text-base w-full sm:w-auto text-center"
              >
                {t('landing_try_demo')}
              </button>
              <Link to="/login" className="border border-gray-200 text-gray-700 px-6 md:px-8 py-3 md:py-3.5 rounded-full hover:bg-gray-50 font-medium transition text-sm md:text-base w-full sm:w-auto text-center">
                {t('signIn')}
              </Link>
            </div>
            <div className="mt-4 text-xs text-gray-400">
              {t('landing_accept_bookings')}
            </div>

            {/* Booking Lookup */}
            <div className="mt-8 md:mt-10 max-w-md mx-auto">
              <form onSubmit={(e) => { e.preventDefault(); if (lookupCode.trim()) navigate(`/lookup?code=${lookupCode.trim()}`); }} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={lookupCode}
                  onChange={(e) => setLookupCode(e.target.value)}
                  placeholder={t('landing_lookup_placeholder')}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <button type="submit" className="px-6 py-3 bg-pink-600 text-white rounded-xl text-sm font-medium hover:bg-pink-700 transition whitespace-nowrap">
                  {t('landing_find_booking')}
                </button>
              </form>
              <p className="text-xs text-gray-400 mt-2">{t('landing_lookup_hint')}</p>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 mt-5 md:mt-6 text-xs md:text-sm text-gray-400">
              <span className="flex items-center gap-1.5">{t('landing_free_start')}</span>
              <span className="flex items-center gap-1.5">{t('landing_no_card')}</span>
              <span className="flex items-center gap-1.5">{t('landing_setup_min')}</span>
              <span className="flex items-center gap-1.5">{t('landing_free_migrate')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">{t('landing_features_title')}</h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm md:text-base">{t('landing_features_subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {landingFeatures.map((f, i) => (
              <div key={i} className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 border border-gray-100 hover:shadow-lg transition group">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-xl md:text-2xl mb-4 md:mb-5 group-hover:scale-110 transition`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 text-base md:text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">{t('landing_how_title')}</h2>
            <p className="text-gray-500 text-sm md:text-base">{t('landing_how_subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-gray-100 mb-3 md:mb-4">{s.step}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Salon List */}
      {salons.length > 0 && (
        <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">{t('landing_explore_title')}</h2>
              <p className="text-gray-500 text-sm md:text-base">{t('landing_explore_subtitle')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
              {salons.map(s => (
                <Link key={s.id} to={`/${s.slug}/book`} className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-5 md:p-6 hover:shadow-lg hover:border-pink-100 transition group">
                  <div className="flex items-start justify-between mb-2 md:mb-3">
                    <h3 className="font-semibold text-gray-900 text-base md:text-lg group-hover:text-pink-600 transition">{s.name}</h3>
                    {ratings[s.id] && (
                      <span className="text-xs md:text-sm text-yellow-500 whitespace-nowrap ml-2">⭐ {ratings[s.id].average_rating} ({ratings[s.id].total_reviews})</span>
                    )}
                  </div>
                  {s.address && <p className="text-xs md:text-sm text-gray-400 flex items-center gap-1">📍 {s.address}</p>}
                  {s.description && <p className="text-xs md:text-sm text-gray-400 mt-2 line-clamp-2">{s.description}</p>}
                  <span className="text-pink-600 text-sm font-medium mt-3 inline-block">{t('landing_book')}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Social Proof */}
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">{t('landing_social_title')}</h2>
            <p className="text-gray-500 text-sm md:text-base">{t('landing_social_subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {testimonials.map((tv, i) => (
              <div key={i} className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 border border-gray-100 hover:shadow-lg transition">
                <div className="text-sm mb-3">{tv.stars}</div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"{tv.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {tv.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{tv.name}</p>
                    <p className="text-gray-400 text-xs">{tv.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 md:mt-10">
            {stats.map((s, i) => (
              <div key={i} className="text-center p-4">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">{s.value}</div>
                <p className="text-gray-500 text-xs md:text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timely Comparison Teaser */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">{t('landing_timely_title')}</h2>
          <p className="text-gray-500 text-sm md:text-base mb-6 md:mb-8">{t('landing_timely_subtitle')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {timelyItems.map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-100">
                <div className="text-2xl mb-2">{item.icon}</div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h3>
                <p className="text-gray-500 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
          <Link to="/compare/timely" className="inline-block bg-white border-2 border-pink-200 text-pink-700 px-6 py-3 rounded-full hover:bg-pink-50 font-medium transition text-sm">
            {t('landing_timely_compare')}
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">{t('landing_cta_title')}</h2>
          <p className="text-gray-500 mb-6 md:mb-8 text-sm md:text-base">{t('landing_cta_subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="inline-block bg-gray-900 text-white px-8 md:px-10 py-3.5 md:py-4 rounded-full hover:bg-gray-800 font-medium transition shadow-lg shadow-gray-900/10 text-sm md:text-base">
              {t('landing_cta_start')}
            </Link>
            <Link to="/compare/timely" className="inline-block border border-gray-200 text-gray-700 px-8 py-3.5 md:py-4 rounded-full hover:bg-gray-50 font-medium transition text-sm md:text-base">
              {t('landing_cta_compare')}
            </Link>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-12 md:py-20 px-4 md:px-6 bg-gray-50">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">{t('landing_contact_title')}</h2>
            <p className="text-gray-500 text-sm md:text-base">{t('landing_contact_subtitle')}</p>
          </div>
          <form onSubmit={async (e) => {
            e.preventDefault()
            const fd = new FormData(e.target)
            const btn = e.target.querySelector('button[type="submit"]')
            btn.disabled = true
            btn.textContent = t('landing_sending')
            try {
              const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: fd.get('name'), email: fd.get('email'), message: fd.get('message') }),
              })
              if (res.ok) { alert(t('landing_msg_sent')); e.target.reset() }
              else alert(t('landing_failed_send'))
            } catch { alert(t('landing_failed_send')) }
            btn.disabled = false
            btn.textContent = t('landing_send_msg')
          }} className="bg-white rounded-xl md:rounded-2xl shadow-lg p-5 md:p-6 space-y-3 md:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <input name="name" placeholder={t('landing_your_name')} required className="border border-gray-200 rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
              <input name="email" type="email" placeholder={t('landing_your_email')} required className="border border-gray-200 rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
            </div>
            <textarea name="message" placeholder={t('landing_your_message')} rows={4} required className="w-full border border-gray-200 rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none" />
            <button type="submit" className="w-full bg-pink-600 text-white py-2.5 md:py-3 rounded-lg md:rounded-xl font-semibold hover:bg-pink-700 transition text-sm md:text-base">
              {t('landing_send_msg')}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  )
}

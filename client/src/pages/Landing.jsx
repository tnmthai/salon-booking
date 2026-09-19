import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import { useI18n } from '../utils/i18n'
import Footer from '../components/Footer'

function Navbar() {
  const [open, setOpen] = useState(false)
  const { t, lang, switchLang } = useI18n()
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-gray-100 z-50">
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
          <Link to="/blog" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">Blog</Link>
          <Link to="/about" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">{t('about')}</Link>
          <Link to="/lookup" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">{t('findBooking')}</Link>
          <select value={lang} onChange={e => switchLang(e.target.value)} className="text-xs bg-transparent border border-gray-200 rounded px-1.5 py-1 text-gray-600 cursor-pointer">
            <option value="en">EN</option><option value="vi">VI</option><option value="mi">MI</option><option value="zh">中文</option><option value="hi">हिन्दी</option>
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
            <Link to="/pricing" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">{t('pricing')}</Link>
            <Link to="/compare/timely" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">{t('compare')}</Link>
            <Link to="/blog" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">Blog</Link>
            <Link to="/about" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">{t('about')}</Link>
            <Link to="/lookup" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">{t('findBooking')}</Link>
            <div className="flex gap-2 py-2">
              <select value={lang} onChange={e => switchLang(e.target.value)} className="text-xs bg-gray-100 border border-gray-200 rounded px-2 py-1.5 text-gray-600">
                <option value="en">EN</option><option value="vi">VI</option><option value="mi">MI</option><option value="zh">中文</option><option value="hi">हिन्दी</option>
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

export default function Landing() {
  const { t } = useI18n()
  const [salons, setSalons] = useState([])
  const [ratings, setRatings] = useState({})

  const [demoLoading, setDemoLoading] = useState(false)
  const [demoError, setDemoError] = useState('')
  const [contactSending, setContactSending] = useState(false)
  const [contactSent, setContactSent] = useState(false)
  const [contactError, setContactError] = useState('')
  const [showShot, setShowShot] = useState(true)
  // Removed: a `bookedToday` counter seeded from the clock and incremented
  // every ten minutes — an invented "bookings today" figure. It was already
  // dead code (nothing rendered it), and it should stay that way.



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

  // Line icons in the brand colour, instead of 📅👥📊 in blue/purple/orange
  // tiles — three system emoji rendered differently on every OS, in colours
  // that belong to no part of the brand.
  const Icon = ({ path }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden="true">
      {path}
    </svg>
  )

  const landingFeatures = [
    {
      icon: <Icon path={<><rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4M8.5 14h3M8.5 17.5h7" /></>} />,
      title: t('landing_f1_title'), desc: t('landing_f1_desc'),
    },
    {
      icon: <Icon path={<><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16.5 5.2a3.2 3.2 0 0 1 0 5.6M18 14.2a6.5 6.5 0 0 1 3.5 5.8" /></>} />,
      title: t('landing_f2_title'), desc: t('landing_f2_desc'),
    },
    {
      icon: <Icon path={<><path d="M3 20.5h18M6.5 20.5v-6M11 20.5v-11M15.5 20.5v-7M20 20.5v-13" /></>} />,
      title: t('landing_f3_title'), desc: t('landing_f3_desc'),
    },
  ]

  const steps = [
    { step: '01', title: t('landing_step1_title'), desc: t('landing_step1_desc') },
    { step: '02', title: t('landing_step2_title'), desc: t('landing_step2_desc') },
    { step: '03', title: t('landing_step3_title'), desc: t('landing_step3_desc') },
  ]


  const stats = [
    { value: '24/7', label: t('landing_stat_online') },
    // 'Easy' was rendered in the same big-number style as the real figures —
    // an adjective dressed up as a statistic. Replaced with an actual one.
    { value: '5 min', label: t('landing_stat_setup') },
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
            {/* One primary action. The hero used to carry three buttons of
                similar weight plus a bright pink "Find booking" box — an action
                for the salon's *customers*, on the page whose only job is to
                sign up salon *owners*. It out-shouted the signup button.
                Finding a booking now lives in the nav and footer, where the
                handful of people who need it will look. */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link to="/register" className="bg-pink-600 text-white px-8 md:px-10 py-3.5 md:py-4 rounded-full hover:bg-pink-700 font-semibold transition shadow-lg shadow-pink-600/20 text-base w-full sm:w-auto text-center">
                {t('landing_start_free')}
              </Link>
              <button
                onClick={async () => {
                  setDemoError('')
                  setDemoLoading(true)
                  try {
                    const data = await api.demoStart()
                    localStorage.setItem('salon_token', data.token)
                    window.location.href = '/admin'
                  } catch (e) {
                    setDemoError(e.message || 'Please try again.')
                    setDemoLoading(false)
                  }
                }}
                disabled={demoLoading}
                className="text-gray-600 hover:text-pink-600 px-6 py-3 font-medium transition text-sm md:text-base underline-offset-4 hover:underline disabled:opacity-60"
              >
                {demoLoading ? t('landing_demo_loading') : t('landing_try_demo')}
              </button>
            </div>
            {demoError && <p className="mt-3 text-sm text-red-600">{demoError}</p>}

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

      {/* Product shot.
          Nothing on this page showed what Timia actually looks like, which for
          a booking app is the most persuasive thing there is. Drop a real
          screenshot at client/public/product-dashboard.png and it appears
          here; until then the section removes itself rather than showing a
          broken image. */}
      {showShot && (
        <section className="px-4 md:px-6 pb-4 md:pb-10">
          <div className="max-w-5xl mx-auto">
            <img
              src="/product-dashboard.png"
              alt={t('landing_shot_alt')}
              onError={() => setShowShot(false)}
              className="w-full rounded-xl md:rounded-2xl border border-gray-200 shadow-2xl shadow-gray-900/10"
            />
          </div>
        </section>
      )}

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
                <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-4 md:mb-5 group-hover:bg-pink-100 transition">
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
                {/* Was text-gray-100 on white — all but invisible, and nowhere
                    near the 4.5:1 contrast a reader needs. */}
                <div className="w-11 h-11 mx-auto mb-3 md:mb-4 rounded-full bg-pink-600 text-white text-base font-bold flex items-center justify-center">
                  {s.step}
                </div>
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
                // Flex column with the link pushed to the bottom, so a salon
                // with no address does not leave a ragged, half-empty card
                // next to the ones that have one.
                <Link key={s.id} to={`/${s.slug}/book`} className="flex flex-col bg-white rounded-xl md:rounded-2xl border border-gray-100 p-5 md:p-6 hover:shadow-lg hover:border-pink-100 transition group">
                  <div className="flex items-start justify-between mb-2 md:mb-3">
                    <h3 className="font-semibold text-gray-900 text-base md:text-lg group-hover:text-pink-600 transition">{s.name}</h3>
                    {ratings[s.id] && (
                      <span className="text-xs md:text-sm text-yellow-500 whitespace-nowrap ml-2">⭐ {ratings[s.id].average_rating} ({ratings[s.id].total_reviews})</span>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-gray-400">{s.address ? `📍 ${s.address}` : t('landing_book_online')}</p>
                  {s.description && <p className="text-xs md:text-sm text-gray-400 mt-2 line-clamp-2">{s.description}</p>}
                  <span className="text-pink-600 text-sm font-medium mt-auto pt-3 inline-block">{t('landing_book')}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Our story.
          This section used to carry three five-star testimonials from salons
          that do not exist. Invented reviews are a misleading representation
          under the Fair Trading Act, and anyone who googles the names finds
          nothing — which costs more trust than it buys. Until there are real
          customers willing to be quoted, we say plainly who we are instead. */}
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">{t('landing_why_title')}</h2>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-4">{t('landing_why_p1')}</p>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">{t('landing_why_p2')}</p>
          <Link to="/about" className="inline-block mt-6 text-pink-600 font-medium hover:underline">
            {t('landing_why_cta')}
          </Link>

          {/* These are product facts, not measurements — so they no longer get
              the giant gradient-number treatment that made them read as
              company metrics we do not actually have. */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-10 md:mt-12 pt-8 border-t border-gray-100">
            {stats.map((s, i) => (
              <div key={i} className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{s.value}</span>
                <span className="text-gray-400"> · {s.label}</span>
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
          {contactSent ? (
            <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-8 text-center">
              <div className="text-4xl mb-3">✅</div>
              <p className="font-semibold text-gray-900 mb-1">{t('landing_msg_sent')}</p>
              <p className="text-sm text-gray-500">{t('landing_msg_sent_detail')}</p>
              <button onClick={() => setContactSent(false)} className="mt-4 text-sm text-pink-600 hover:underline">
                {t('landing_send_another')}
              </button>
            </div>
          ) : (
          <form onSubmit={async (e) => {
            e.preventDefault()
            const form = e.target
            const fd = new FormData(form)
            setContactError('')
            setContactSending(true)
            try {
              const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: fd.get('name'), email: fd.get('email'), message: fd.get('message') }),
              })
              if (res.ok) { form.reset(); setContactSent(true) }
              else setContactError(t('landing_failed_send'))
            } catch { setContactError(t('landing_failed_send')) }
            setContactSending(false)
          }} className="bg-white rounded-xl md:rounded-2xl shadow-lg p-5 md:p-6 space-y-4">
            {/* Visible labels, so the fields stay identifiable once filled in. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label htmlFor="ct-name" className="block text-sm font-medium text-gray-700 mb-1">{t('landing_your_name')}</label>
                <input id="ct-name" name="name" required className="w-full border border-gray-200 rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
              </div>
              <div>
                <label htmlFor="ct-email" className="block text-sm font-medium text-gray-700 mb-1">{t('landing_your_email')}</label>
                <input id="ct-email" name="email" type="email" required className="w-full border border-gray-200 rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
              </div>
            </div>
            <div>
              <label htmlFor="ct-message" className="block text-sm font-medium text-gray-700 mb-1">{t('landing_your_message')}</label>
              <textarea id="ct-message" name="message" rows={4} required className="w-full border border-gray-200 rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none" />
            </div>
            {contactError && <p className="text-sm text-red-600">{contactError}</p>}
            <button type="submit" disabled={contactSending} className="w-full bg-pink-600 text-white py-2.5 md:py-3 rounded-lg md:rounded-xl font-semibold hover:bg-pink-700 transition text-sm md:text-base disabled:opacity-60">
              {contactSending ? t('landing_sending') : t('landing_send_msg')}
            </button>
            <p className="text-xs text-gray-400 text-center">{t('landing_contact_promise')}</p>
          </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

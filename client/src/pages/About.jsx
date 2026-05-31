import { useState } from 'react'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'
import { useI18n } from '../utils/i18n'

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
          <Link to="/about" className="text-sm text-pink-600 font-medium px-3 py-2">{t('about')}</Link>
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
            <Link to="/pricing" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">{t('pricing')}</Link>
            <Link to="/about" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-pink-600 bg-pink-50 font-medium rounded-lg">{t('about')}</Link>
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

export default function About() {
  const { t } = useI18n()
  const values = [
    { icon: '🎯', title: t('about_v1_title'), desc: t('about_v1_desc') },
    { icon: '🤝', title: t('about_v2_title'), desc: t('about_v2_desc') },
    { icon: '🔧', title: t('about_v3_title'), desc: t('about_v3_desc') },
    { icon: '💡', title: t('about_v4_title'), desc: t('about_v4_desc') },
  ]
  const stats = [
    { number: '5000+', label: t('about_stat_bookings') },
    { number: '99.9%', label: t('about_stat_uptime') },
    { number: '4.8★', label: t('about_stat_rating') },
  ]
  const team = [
    { name: t('about_eng_title'), desc: t('about_eng_desc'), icon: '⚙️' },
    { name: t('about_design_title'), desc: t('about_design_desc'), icon: '🎨' },
    { name: t('about_support_title'), desc: t('about_support_desc'), icon: '💬' },
  ]
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-24 md:pt-32 pb-12 md:pb-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6">
            <span className="w-2 h-2 bg-pink-500 rounded-full" />{t('about_badge')}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 md:mb-6">
            {t('about_title_1')}<span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"> {t('about_title_2')}</span>
          </h1>
          <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">{t('about_subtitle')}</p>
        </div>
      </section>
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">{t('about_why_title')}</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed text-sm md:text-base">
                <p>{t('about_why_p1')}</p>
                <p>{t('about_why_p2')}</p>
                <p>{t('about_why_p3')}</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl md:rounded-3xl p-8 md:p-10 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl md:text-6xl mb-4">💅</div>
                <p className="text-gray-700 font-medium text-sm md:text-base">{t('about_started_in')}</p>
                <p className="text-gray-500 text-xs md:text-sm mt-1">{t('about_built_nz')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-1 md:mb-2">{stat.number}</div>
                <div className="text-gray-500 text-xs md:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">{t('about_values_title')}</h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm md:text-base">{t('about_values_subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {values.map((v, i) => (
              <div key={i} className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 border border-gray-100">
                <div className="text-3xl md:text-4xl mb-3 md:mb-4">{v.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg md:text-xl mb-2 md:mb-3">{v.title}</h3>
                <p className="text-gray-500 text-sm md:text-base leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">{t('about_team_title')}</h2>
          <p className="text-gray-500 mb-8 md:mb-12 max-w-lg mx-auto text-sm md:text-base">{t('about_team_subtitle')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            {team.map((m, i) => (
              <div key={i} className="bg-gray-50 rounded-xl md:rounded-2xl p-6 md:p-8">
                <div className="text-3xl md:text-4xl mb-3 md:mb-4">{m.icon}</div>
                <h3 className="font-bold text-gray-900 text-base md:text-lg mb-2">{m.name}</h3>
                <p className="text-gray-500 text-sm">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">{t('about_community_title')}</h2>
          <p className="text-gray-500 mb-6 md:mb-8 text-sm md:text-base">{t('about_community_subtitle')}</p>
          <Link to="/register" className="inline-block bg-gray-900 text-white px-8 md:px-10 py-3.5 md:py-4 rounded-full hover:bg-gray-800 font-medium transition shadow-lg shadow-gray-900/10 text-sm md:text-base">{t('about_community_cta')}</Link>
        </div>
      </section>
      <Footer />
    </div>
  )
}

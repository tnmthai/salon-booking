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
          <Link to="/features" className="text-sm text-pink-600 font-medium px-3 py-2">{t('features')}</Link>
          <Link to="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">{t('pricing')}</Link>
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
            <Link to="/features" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-pink-600 bg-pink-50 font-medium rounded-lg">{t('features')}</Link>
            <Link to="/pricing" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">{t('pricing')}</Link>
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

export default function Features() {
  const { t } = useI18n()
  const features = [
    { icon: '📅', title: t('features_f1_title'), desc: t('features_f1_desc'), details: [t('features_f1_d1'), t('features_f1_d2'), t('features_f1_d3')], color: 'from-blue-500 to-cyan-500' },
    { icon: '👥', title: t('features_f2_title'), desc: t('features_f2_desc'), details: [t('features_f2_d1'), t('features_f2_d2'), t('features_f2_d3')], color: 'from-purple-500 to-pink-500' },
    { icon: '📊', title: t('features_f3_title'), desc: t('features_f3_desc'), details: [t('features_f3_d1'), t('features_f3_d2'), t('features_f3_d3')], color: 'from-orange-500 to-red-500' },
    { icon: '⭐', title: t('features_f4_title'), desc: t('features_f4_desc'), details: [t('features_f4_d1'), t('features_f4_d2'), t('features_f4_d3')], color: 'from-yellow-500 to-orange-500' },
    { icon: '🖼', title: t('features_f5_title'), desc: t('features_f5_desc'), details: [t('features_f5_d1'), t('features_f5_d2'), t('features_f5_d3')], color: 'from-pink-500 to-rose-500' },
    { icon: '🔔', title: t('features_f6_title'), desc: t('features_f6_desc'), details: [t('features_f6_d1'), t('features_f6_d2'), t('features_f6_d3')], color: 'from-teal-500 to-emerald-500' },
    { icon: '📱', title: t('features_f7_title'), desc: t('features_f7_desc'), details: [t('features_f7_d1'), t('features_f7_d2'), t('features_f7_d3')], color: 'from-indigo-500 to-blue-500' },
    { icon: '🔒', title: t('features_f8_title'), desc: t('features_f8_desc'), details: [t('features_f8_d1'), t('features_f8_d2'), t('features_f8_d3')], color: 'from-gray-500 to-slate-600' },
    { icon: '🌍', title: t('features_f9_title'), desc: t('features_f9_desc'), details: [t('features_f9_d1'), t('features_f9_d2'), t('features_f9_d3')], color: 'from-emerald-500 to-teal-500' },
  ]
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-24 md:pt-32 pb-10 md:pb-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6">
            <span className="w-2 h-2 bg-pink-500 rounded-full" />{t('features_badge')}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 md:mb-6">
            {t('features_title_1')}<span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"> {t('features_title_2')}</span>
          </h1>
          <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">{t('features_subtitle')}</p>
        </div>
      </section>
      <section className="py-10 md:py-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 border border-gray-100 hover:shadow-lg transition group">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl md:text-3xl mb-4 md:mb-5 group-hover:scale-110 transition`}>{f.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg md:text-xl mb-2 md:mb-3">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{f.desc}</p>
                <ul className="space-y-2">{f.details.map((d, j) => (<li key={j} className="flex items-center gap-2 text-sm text-gray-600"><span className="w-1.5 h-1.5 bg-pink-500 rounded-full flex-shrink-0" />{d}</li>))}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">{t('features_cta_title')}</h2>
          <p className="text-gray-500 mb-6 md:mb-8 text-sm md:text-base">{t('features_cta_subtitle')}</p>
          <Link to="/register" className="inline-block bg-gray-900 text-white px-8 md:px-10 py-3.5 md:py-4 rounded-full hover:bg-gray-800 font-medium transition text-sm md:text-base">{t('features_cta_btn')}</Link>
        </div>
      </section>
      <Footer />
    </div>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
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
          <Link to="/about" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">{t('about')}</Link>
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
            <Link to="/about" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">{t('about')}</Link>
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

export default function CompareTimely() {
  const { t } = useI18n()

  const comparisons = [
    { feature: t('compare_row1_feature'), timia: t('compare_row1_timia'), timely: t('compare_row1_timely'), timiaWins: true },
    { feature: t('compare_row2_feature'), timia: t('compare_row2_timia'), timely: t('compare_row2_timely'), timiaWins: true },
    { feature: t('compare_row3_feature'), timia: t('compare_row3_timia'), timely: t('compare_row3_timely'), timiaWins: null },
    { feature: t('compare_row4_feature'), timia: t('compare_row4_timia'), timely: t('compare_row4_timely'), timiaWins: null },
    { feature: t('compare_row5_feature'), timia: t('compare_row5_timia'), timely: t('compare_row5_timely'), timiaWins: null },
    { feature: t('compare_row6_feature'), timia: t('compare_row6_timia'), timely: t('compare_row6_timely'), timiaWins: null },
    { feature: t('compare_row7_feature'), timia: t('compare_row7_timia'), timely: t('compare_row7_timely'), timiaWins: null },
    { feature: t('compare_row8_feature'), timia: t('compare_row8_timia'), timely: t('compare_row8_timely'), timiaWins: true },
    { feature: t('compare_row9_feature'), timia: t('compare_row9_timia'), timely: t('compare_row9_timely'), timiaWins: true },
    { feature: t('compare_row10_feature'), timia: t('compare_row10_timia'), timely: t('compare_row10_timely'), timiaWins: true },
    { feature: t('compare_row11_feature'), timia: t('compare_row11_timia'), timely: t('compare_row11_timely'), timiaWins: true },
    { feature: t('compare_row12_feature'), timia: t('compare_row12_timia'), timely: t('compare_row12_timely'), timiaWins: true },
    { feature: t('compare_row13_feature'), timia: t('compare_row13_timia'), timely: t('compare_row13_timely'), timiaWins: true },
    { feature: t('compare_row14_feature'), timia: t('compare_row14_timia'), timely: t('compare_row14_timely'), timiaWins: null },
    { feature: t('compare_row15_feature'), timia: t('compare_row15_timia'), timely: t('compare_row15_timely'), timiaWins: true },
  ]

  const faqs = [
    { q: t('compare_faq1_q'), a: t('compare_faq1_a') },
    { q: t('compare_faq2_q'), a: t('compare_faq2_a') },
    { q: t('compare_faq3_q'), a: t('compare_faq3_a') },
    { q: t('compare_faq4_q'), a: t('compare_faq4_a') },
    { q: t('compare_faq5_q'), a: t('compare_faq5_a') },
    { q: t('compare_faq6_q'), a: t('compare_faq6_a') },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-24 md:pt-32 pb-12 md:pb-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6">
            <span className="w-2 h-2 bg-pink-500 rounded-full" />{t('compare_badge')}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4 md:mb-6">{t('compare_title')}</h1>
          <p className="text-base md:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">{t('compare_subtitle')}</p>
        </div>
      </section>
      <section className="pb-12 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 md:p-8 border border-pink-100 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">{t('compare_short_version')}</h2>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              <strong>Timely</strong> {t('compare_short_desc_1')}<br />
              <strong>Timia</strong> {t('compare_short_desc_2')}
            </p>
          </div>
        </div>
      </section>
      <section className="pb-12 md:pb-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 md:mb-12">{t('compare_feature_header')}</h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100">
              <div className="p-4 text-sm font-medium text-gray-500">{t('compare_feature_header')}</div>
              <div className="p-4 text-sm font-bold text-pink-600 text-center">{t('compare_timia_header')}</div>
              <div className="p-4 text-sm font-medium text-gray-500 text-center">{t('compare_timely_header')}</div>
            </div>
            {comparisons.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 border-b border-gray-50 last:border-0 ${row.timiaWins ? 'bg-pink-50/30' : ''}`}>
                <div className="p-4 text-sm text-gray-700 font-medium">{row.feature}</div>
                <div className={`p-4 text-sm text-center ${row.timiaWins ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>{row.timia}</div>
                <div className="p-4 text-sm text-center text-gray-500">{row.timely}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center mt-4">{t('compare_disclaimer')}</p>
        </div>
      </section>
      <section className="py-12 md:py-16 px-4 md:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">{t('compare_when_title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-3">{t('compare_choose_timely_title')}</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• {t('compare_choose_timely_1')}</li>
                <li>• {t('compare_choose_timely_2')}</li>
                <li>• {t('compare_choose_timely_3')}</li>
                <li>• {t('compare_choose_timely_4')}</li>
                <li>• {t('compare_choose_timely_5')}</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 border border-pink-100 bg-pink-50/30">
              <h3 className="font-bold text-gray-900 mb-3">{t('compare_choose_timia_title')}</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• {t('compare_choose_timia_1')}</li>
                <li>• {t('compare_choose_timia_2')}</li>
                <li>• {t('compare_choose_timia_3')}</li>
                <li>• {t('compare_choose_timia_4')}</li>
                <li>• {t('compare_choose_timia_5')}</li>
                <li>• {t('compare_choose_timia_6')}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section className="py-12 md:py-16 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">{t('compare_ready_title')}</h2>
            <p className="text-pink-100 text-sm md:text-base mb-6 max-w-lg mx-auto">{t('compare_migration_desc')}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register" className="bg-white text-pink-600 px-8 py-3 rounded-full font-semibold hover:bg-pink-50 transition text-sm">{t('compare_start_free')}</Link>
              <Link to="/contact" className="border border-white/30 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition text-sm">{t('compare_request_migration')}</Link>
            </div>
          </div>
        </div>
      </section>
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">{t('compare_migration_faq_title')}</h2>
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
      <section className="py-8 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-400">
            {t('compare_also_compare')}{' '}
            <Link to="/pricing" className="text-pink-600 hover:underline">{t('pricing')}</Link>
            {' · '}
            <Link to="/features" className="text-pink-600 hover:underline">{t('features')}</Link>
            {' · '}
            <Link to="/about" className="text-pink-600 hover:underline">{t('about')}</Link>
          </p>
        </div>
      </section>
      <Footer />
    </div>
  )
}

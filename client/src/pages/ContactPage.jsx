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
          <Link to="/about" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">{t('about')}</Link>
          <Link to="/contact" className="text-sm text-pink-600 font-medium px-3 py-2">{t('contact')}</Link>
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
            <Link to="/contact" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-pink-600 bg-pink-50 font-medium rounded-lg">{t('contact')}</Link>
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

export default function ContactPage() {
  const { t } = useI18n()
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    setSending(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fd.get('name'), email: fd.get('email'), subject: fd.get('subject'), message: fd.get('message') }),
      })
      if (res.ok) { setSubmitted(true); e.target.reset() }
      else alert(t('contact_failed_send'))
    } catch { alert(t('contact_failed_send')) }
    setSending(false)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-24 md:pt-32 pb-10 md:pb-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6">
            <span className="w-2 h-2 bg-pink-500 rounded-full" />{t('contact_badge')}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 md:mb-6">
            {t('contact_title_1')}<span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"> {t('contact_title_2')}</span>
          </h1>
          <p className="text-base md:text-lg text-gray-500 max-w-xl mx-auto">{t('contact_subtitle')}</p>
        </div>
      </section>
      <section className="pb-12 md:pb-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="space-y-4 md:space-y-6">
            <div className="bg-gray-50 rounded-xl p-5 md:p-6">
              <div className="text-xl md:text-2xl mb-2 md:mb-3">📧</div>
              <h3 className="font-bold text-gray-900 mb-1 text-sm md:text-base">{t('contact_email_title')}</h3>
              <p className="text-gray-500 text-xs md:text-sm mb-2">{t('contact_email_desc')}</p>
              <a href="mailto:support@timia.nz" className="text-pink-600 font-medium text-xs md:text-sm">support@timia.nz</a>
            </div>
            <div className="bg-gray-50 rounded-xl p-5 md:p-6">
              <div className="text-xl md:text-2xl mb-2 md:mb-3">📍</div>
              <h3 className="font-bold text-gray-900 mb-1 text-sm md:text-base">{t('contact_location_title')}</h3>
              <p className="text-gray-500 text-xs md:text-sm">{t('contact_location_value')}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-5 md:p-6">
              <div className="text-xl md:text-2xl mb-2 md:mb-3">⏰</div>
              <h3 className="font-bold text-gray-900 mb-1 text-sm md:text-base">{t('contact_hours_title')}</h3>
              <p className="text-gray-500 text-xs md:text-sm">{t('contact_hours_value')}</p>
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100 p-5 md:p-8">
              {submitted ? (
                <div className="text-center py-8 md:py-12">
                  <div className="text-4xl md:text-5xl mb-4">✅</div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{t('contact_msg_sent_title')}</h3>
                  <p className="text-gray-500 mb-6 text-sm md:text-base">{t('contact_msg_sent_desc')}</p>
                  <button onClick={() => setSubmitted(false)} className="text-pink-600 font-medium text-sm md:text-base">{t('contact_send_another')}</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">{t('contact_your_name')}</label>
                      <input name="name" placeholder="John Smith" required className="w-full border border-gray-200 rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">{t('contact_your_email')}</label>
                      <input name="email" type="email" placeholder="john@example.com" required className="w-full border border-gray-200 rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">{t('contact_subject')}</label>
                    <select name="subject" required className="w-full border border-gray-200 rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white">
                      <option value="">{t('contact_select_topic')}</option>
                      <option value="general">{t('contact_general')}</option>
                      <option value="support">{t('contact_tech_support')}</option>
                      <option value="billing">{t('contact_billing')}</option>
                      <option value="partnership">{t('contact_partnership')}</option>
                      <option value="feedback">{t('contact_feedback')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">{t('contact_message')}</label>
                    <textarea name="message" placeholder={t('contact_message_placeholder')} rows={5} required className="w-full border border-gray-200 rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none" />
                  </div>
                  <button type="submit" disabled={sending} className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-2.5 md:py-3.5 rounded-lg md:rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 text-sm md:text-base">
                    {sending ? t('contact_sending') : t('contact_send_msg')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

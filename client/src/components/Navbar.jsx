import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useI18n } from '../utils/i18n'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { t, lang, switchLang } = useI18n()
  const isActive = (path) => location.pathname === path

  const navLinks = [
    { to: '/features', label: t('features') },
    { to: '/pricing', label: t('pricing') },
    { to: '/about', label: t('about') },
    { to: '/lookup', label: t('findBooking') },
    { to: '/kiosk-guide', label: t('kioskGuide') },
  ]

  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 z-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold">
          <img src="/logo.png" alt="Timia" className="w-8 h-8 rounded-full" />
          <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Timia</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm transition px-3 py-2 rounded-lg ${isActive(link.to) ? 'text-pink-600 font-medium' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              {link.label}
            </Link>
          ))}
          <select
            value={lang}
            onChange={(e) => switchLang(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-600 mx-1"
          >
            <option value="en">EN</option>
            <option value="vi">VI</option>
            <option value="mi">MI</option>
                <option value="zh">中文</option>
                <option value="hi">हिन्दी</option>
          </select>
          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">{t('signIn')}</Link>
          <Link to="/register" className="text-sm bg-gray-900 text-white px-5 py-2 rounded-full hover:bg-gray-800 transition ml-1">{t('getStarted')}</Link>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 -mr-2 text-gray-600 hover:text-gray-900" aria-label="Menu">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-2 space-y-0.5">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={`block py-2.5 px-3 text-sm rounded-lg transition ${isActive(link.to) ? 'text-pink-600 bg-pink-50 font-medium' : 'text-gray-700 hover:text-pink-600 hover:bg-gray-50'}`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="block py-2.5 px-3 text-sm rounded-lg text-gray-700 hover:text-pink-600 hover:bg-gray-50"
            >
              {t('signIn')}
            </Link>
            <div className="flex items-center gap-2 px-3 py-2">
              <select
                value={lang}
                onChange={(e) => switchLang(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-600"
              >
                <option value="en">EN</option>
                <option value="vi">VI</option>
                <option value="mi">MI</option>
                <option value="zh">中文</option>
                <option value="hi">हिन्दी</option>
              </select>
            </div>
            <Link
              to="/register"
              onClick={() => setOpen(false)}
              className="block mt-2 text-center bg-gray-900 text-white py-2.5 rounded-full text-sm font-medium hover:bg-gray-800"
            >
              {t('getStarted')}
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

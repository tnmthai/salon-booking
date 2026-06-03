import { Link } from 'react-router-dom'
import { useI18n } from '../utils/i18n'

export default function Footer() {
  const { t, lang, switchLang } = useI18n()

  return (
    <footer className="border-t border-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-gradient-to-br from-pink-600 to-purple-600 rounded flex items-center justify-center text-white font-bold text-xs">T</span>
              <span className="text-sm text-gray-400">{t('footer_copyright')}</span>
            </div>
          </div>
          <select
            value={lang}
            onChange={(e) => switchLang(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-600"
          >
            <option value="en">English</option>
            <option value="vi">Tiếng Việt</option>
            <option value="mi">Māori</option>
            <option value="zh">中文</option>
            <option value="hi">हिन्दी</option>
          </select>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 text-sm text-gray-400">
          <div className="space-y-2">
            <p className="font-medium text-gray-500 text-xs uppercase tracking-wider">{t('footer_product')}</p>
            <Link to="/features" className="block hover:text-gray-600 transition">{t('footer_features')}</Link>
            <Link to="/pricing" className="block hover:text-gray-600 transition">{t('footer_pricing')}</Link>
            <Link to="/lookup" className="block hover:text-gray-600 transition">{t('footer_find_booking')}</Link>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-gray-500 text-xs uppercase tracking-wider">{t('footer_company')}</p>
            <Link to="/about" className="block hover:text-gray-600 transition">{t('footer_about')}</Link>
            <Link to="/contact" className="block hover:text-gray-600 transition">{t('footer_contact')}</Link>
            <Link to="/blog" className="block hover:text-gray-600 transition">Blog</Link>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-gray-500 text-xs uppercase tracking-wider">{t('footer_account')}</p>
            <Link to="/login" className="block hover:text-gray-600 transition">{t('footer_sign_in')}</Link>
            <Link to="/register" className="block hover:text-gray-600 transition">{t('footer_sign_up')}</Link>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-gray-500 text-xs uppercase tracking-wider">{t('footer_legal')}</p>
            <Link to="/terms" className="block hover:text-gray-600 transition">{t('footer_terms')}</Link>
            <Link to="/privacy" className="block hover:text-gray-600 transition">{t('footer_privacy')}</Link>
            <Link to="/cookies" className="block hover:text-gray-600 transition">{t('footer_cookies')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

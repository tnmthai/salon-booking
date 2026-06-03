import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import { useI18n } from '../utils/i18n'

export default function Login({ onLogin }) {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.login({ email, password })
      onLogin(data.token, data.salon, data.user)
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <div className="p-4">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition">
          ← {t('login_back')}
        </Link>
      </div>

      {/* Login card */}
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-gray-900">
              <span className="w-10 h-10 bg-gradient-to-br from-pink-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">T</span>
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Timia</span>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900 mt-6 mb-1">{t('login_title')}</h1>
            <p className="text-sm text-gray-500">{t('login_subtitle')}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('login_email')}</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition" required />
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('login_password')}</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition" required />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-gray-900 text-white py-2.5 rounded-xl hover:bg-gray-800 disabled:opacity-50 text-sm font-medium transition">
                {loading ? t('login_signing_in') : t('login_sign_in')}
              </button>
            </form>
          </div>

          <p className="text-center mt-5 text-sm text-gray-500">
            {t('login_no_account')} <Link to="/register" className="text-pink-600 font-medium hover:underline">{t('login_sign_up')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

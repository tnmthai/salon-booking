import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import { useI18n } from '../utils/i18n'

export default function Login({ onLogin }) {
  const { t } = useI18n()
  const [step, setStep] = useState(1) // 1 = email, 2 = code
  const [email, setEmail] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [showPasswordLogin, setShowPasswordLogin] = useState(false)
  const [password, setPassword] = useState('')
  const codeRefs = useRef([])
  const navigate = useNavigate()

  // Countdown for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => setResendCooldown(c => c - 1), 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  // Auto-focus first code input when entering step 2
  useEffect(() => {
    if (step === 2 && codeRefs.current[0]) {
      codeRefs.current[0].focus()
    }
  }, [step])

  const handleSendCode = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.sendCode({ email })
      setStep(2)
      setResendCooldown(60)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    setError('')
    setLoading(true)
    try {
      await api.sendCode({ email })
      setResendCooldown(60)
      setCode(['', '', '', '', '', ''])
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const handleCodeChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-advance to next input
    if (value && index < 5) {
      codeRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all 6 digits entered
    if (value && index === 5 && newCode.every(d => d !== '')) {
      handleVerify(newCode.join(''))
    }
  }

  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus()
    }
  }

  const handleCodePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const newCode = [...code]
    for (let i = 0; i < 6; i++) {
      newCode[i] = pasted[i] || ''
    }
    setCode(newCode)
    const nextEmpty = newCode.findIndex(d => d === '')
    const focusIdx = nextEmpty === -1 ? 5 : nextEmpty
    codeRefs.current[focusIdx]?.focus()

    // Auto-submit if all filled
    if (newCode.every(d => d !== '')) {
      handleVerify(newCode.join(''))
    }
  }

  const handleVerify = async (codeStr) => {
    setError('')
    setLoading(true)
    try {
      const data = await api.verifyCode({ email, code: codeStr })
      onLogin(data.token, data.salon, data.user)
      navigate('/admin')
    } catch (err) {
      setError(err.message)
      setCode(['', '', '', '', '', ''])
      codeRefs.current[0]?.focus()
    }
    setLoading(false)
  }

  const handleVerifySubmit = (e) => {
    e.preventDefault()
    const codeStr = code.join('')
    if (codeStr.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }
    handleVerify(codeStr)
  }

  // Password login fallback
  const handlePasswordLogin = async (e) => {
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
            {step === 1 && !showPasswordLogin && (
              <>
                <h1 className="text-xl font-semibold text-gray-900 mt-6 mb-1">Sign in with email code</h1>
                <p className="text-sm text-gray-500">Enter your email and we'll send you a login code</p>
              </>
            )}
            {step === 2 && !showPasswordLogin && (
              <>
                <h1 className="text-xl font-semibold text-gray-900 mt-6 mb-1">Check your email</h1>
                <p className="text-sm text-gray-500">We sent a 6-digit code to <strong>{email}</strong></p>
              </>
            )}
            {showPasswordLogin && (
              <>
                <h1 className="text-xl font-semibold text-gray-900 mt-6 mb-1">{t('login_title')}</h1>
                <p className="text-sm text-gray-500">{t('login_subtitle')}</p>
              </>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">{error}</div>}

            {/* Step 1: Email input */}
            {step === 1 && !showPasswordLogin && (
              <form onSubmit={handleSendCode}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('login_email')}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition"
                    required
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 text-white py-2.5 rounded-xl hover:bg-gray-800 disabled:opacity-50 text-sm font-medium transition"
                >
                  {loading ? 'Sending...' : 'Send Code'}
                </button>
              </form>
            )}

            {/* Step 2: Code input */}
            {step === 2 && !showPasswordLogin && (
              <form onSubmit={handleVerifySubmit}>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Enter your 6-digit code</label>
                  <div className="flex justify-center gap-2">
                    {code.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => codeRefs.current[i] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleCodeChange(i, e.target.value)}
                        onKeyDown={e => handleCodeKeyDown(i, e)}
                        onPaste={i === 0 ? handleCodePaste : undefined}
                        className="w-11 h-13 text-center text-xl font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition"
                        disabled={loading}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || code.some(d => !d)}
                  className="w-full bg-gray-900 text-white py-2.5 rounded-xl hover:bg-gray-800 disabled:opacity-50 text-sm font-medium transition"
                >
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setError(''); setCode(['', '', '', '', '', '']) }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ← Back to email
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || loading}
                    className="text-pink-600 hover:text-pink-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                  </button>
                </div>
              </form>
            )}

            {/* Password login fallback */}
            {showPasswordLogin && (
              <form onSubmit={handlePasswordLogin}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('login_email')}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition"
                    required
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('login_password')}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 text-white py-2.5 rounded-xl hover:bg-gray-800 disabled:opacity-50 text-sm font-medium transition"
                >
                  {loading ? t('login_signing_in') : t('login_sign_in')}
                </button>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => { setShowPasswordLogin(false); setError(''); setPassword('') }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    ← Back to email code login
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Links below card */}
          <div className="mt-5 space-y-2 text-center">
            {!showPasswordLogin && (
              <p className="text-sm text-gray-500">
                <button
                  onClick={() => { setShowPasswordLogin(true); setError(''); setStep(1); setCode(['', '', '', '', '', '']) }}
                  className="text-gray-400 hover:text-gray-600 underline"
                >
                  Sign in with password
                </button>
              </p>
            )}
            <p className="text-sm text-gray-500">
              {t('login_no_account')}{' '}
              <Link to="/register" className="text-pink-600 font-medium hover:underline">{t('login_sign_up')}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

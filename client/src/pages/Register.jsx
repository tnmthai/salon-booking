import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import { sanitizeName, sanitizePhone, sanitizeSlug } from '../utils/validation'

export default function Register({ onLogin }) {
  const [form, setForm] = useState({
    salon_name: '', slug: '', email: '', password: '', owner_name: '', phone: '', address: '', website: ''
  })
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const generateSlug = (name) => {
    return name.toLowerCase()
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
      .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'i')
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
      .replace(/[ùúụủũưừứựửữ]/g, 'u')
      .replace(/[ỳýỵỷỹ]/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validate inputs
    if (!form.salon_name || form.salon_name.trim().length < 2) {
      setError('Business name must be at least 2 characters')
      return
    }
    if (!form.owner_name || form.owner_name.trim().length < 2) {
      setError('Owner name must be at least 2 characters')
      return
    }
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address')
      return
    }
    if (!form.password || form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (form.phone && form.phone.replace(/\D/g, '').length < 7) {
      setError('Please enter a valid phone number (at least 7 digits)')
      return
    }
    
    setLoading(true)
    try {
      const refCode = new URLSearchParams(window.location.search).get('ref') || ''
      const data = await api.register({
        ...form,
        salon_name: form.salon_name.trim(),
        owner_name: form.owner_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone?.trim() || '',
        address: form.address?.trim() || '',
        website: form.website?.trim() || '',
        referral_code: refCode,
      })
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
          ← Back to Home
        </Link>
      </div>

      {/* Register card */}
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-gray-900">
              <span className="w-10 h-10 bg-gradient-to-br from-pink-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">T</span>
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Timia</span>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900 mt-6 mb-1">Create your business</h1>
            <p className="text-sm text-gray-500">Start receiving bookings in minutes</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Name *</label>
                  <input value={form.salon_name} onChange={e => {
                    setForm({...form, salon_name: e.target.value, slug: generateSlug(e.target.value)})
                  }} placeholder="e.g. Bella Hair Studio"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Booking URL</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm shrink-0">www.timia.nz/</span>
                    <input value={form.slug} onChange={e => setForm({...form, slug: sanitizeSlug(e.target.value)})}
                      placeholder="bella-hair"
                      className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition" pattern="[a-z0-9-]+" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Owner Name *</label>
                  <input value={form.owner_name} onChange={e => setForm({...form, owner_name: e.target.value})}
                    placeholder="Your name"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                  <input value={form.phone} type="tel" onChange={e => setForm({...form, phone: e.target.value})}
                    placeholder="021 123 4567"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    placeholder="you@example.com"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
                  <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition" minLength={6} required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Website <span className="text-gray-400">(optional)</span></label>
                  <input value={form.website} onChange={e => setForm({...form, website: e.target.value})}
                    placeholder="https://www.yourcompany.com"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                  <input value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                    placeholder="123 Main St, Auckland"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition" />
                </div>
              </div>
              <label className="flex items-start gap-2 mt-6 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                  className="rounded border-gray-300 mt-0.5" required />
                <span className="text-sm text-gray-500">
                  I agree to the <Link to="/terms" className="text-pink-600 hover:underline" target="_blank">Terms & Conditions</Link>
                </span>
              </label>
              <button type="submit" disabled={loading || !agreed}
                className="w-full bg-gray-900 text-white py-2.5 rounded-xl hover:bg-gray-800 disabled:opacity-50 mt-4 text-sm font-medium transition">
                {loading ? 'Creating...' : 'Create Business'}
              </button>
            </form>
          </div>

          <p className="text-center mt-5 text-sm text-gray-500">
            Already have an account? <Link to="/login" className="text-pink-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

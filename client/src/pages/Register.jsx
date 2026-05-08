import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'

export default function Register({ onLogin }) {
  const [form, setForm] = useState({
    salon_name: '', slug: '', email: '', password: '', owner_name: '', phone: '', address: ''
  })
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
    setLoading(true)
    try {
      const data = await api.register(form)
      onLogin(data.token, data.salon)
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">✂️</div>
          <h1 className="text-2xl font-bold">Đăng ký Salon</h1>
          <p className="text-sm text-gray-500">Tạo tài khoản và bắt đầu nhận booking</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Tên Salon *</label>
              <input value={form.salon_name} onChange={e => {
                setForm({...form, salon_name: e.target.value, slug: generateSlug(e.target.value)})
              }} className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">URL (slug) *</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">salon.com/</span>
                <input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})}
                  className="flex-1 border rounded-lg px-3 py-2" pattern="[a-z0-9-]+" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Chủ Salon *</label>
              <input value={form.owner_name} onChange={e => setForm({...form, owner_name: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SĐT</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password *</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" minLength={6} required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Địa chỉ</label>
              <input value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 disabled:opacity-50 mt-6">
            {loading ? 'Đang tạo...' : 'Tạo Salon'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-500">
          Đã có tài khoản? <Link to="/login" className="text-pink-600 hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  )
}

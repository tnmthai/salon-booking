import { useState, useEffect } from 'react'
import { api } from '../utils/api'

export default function Settings() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    api.me().then(data => {
      if (data.salon) {
        setForm({
          name: data.salon.name || '',
          phone: data.salon.phone || '',
          email: data.salon.email || '',
          address: data.salon.address || '',
          description: data.salon.description || '',
        })
      }
    }).catch(console.error)
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    try {
      // Only send changed fields
      const updates = {}
      if (form.name) updates.name = form.name
      if (form.phone) updates.phone = form.phone
      if (form.email) updates.email = form.email
      if (form.address) updates.address = form.address
      if (form.description !== undefined) updates.description = form.description

      await api.updateSalonSettings(updates)
      setMsg('✅ Settings saved!')
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setMsg('❌ ' + err.message)
    }
    setSaving(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">⚙️ Shop Settings</h1>

      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${msg.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {msg}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
            className="w-full border rounded-lg px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
            className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
            className="w-full border rounded-lg px-3 py-2" />
          <p className="text-xs text-gray-400 mt-1">Booking notifications will be sent to this email</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input value={form.address} onChange={e => setForm({...form, address: e.target.value})}
            className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
            className="w-full border rounded-lg px-3 py-2" rows={3} />
        </div>
        <button type="submit" disabled={saving}
          className="w-full bg-pink-600 text-white py-2.5 rounded-lg font-medium hover:bg-pink-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { api, setSalonTimezone } from '../utils/api'

const TIMEZONES = [
  { value: 'Pacific/Auckland', label: 'Pacific/Auckland (NZ)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST)' },
  { value: 'Australia/Melbourne', label: 'Australia/Melbourne (AEST)' },
  { value: 'Australia/Perth', label: 'Australia/Perth (AWST)' },
  { value: 'America/Toronto', label: 'America/Toronto (EST)' },
  { value: 'America/Vancouver', label: 'America/Vancouver (PST)' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'America/Chicago', label: 'America/Chicago (CST)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
  { value: 'Europe/London', label: 'Europe/London (GMT)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai (CST)' },
  { value: 'Asia/Ho_Chi_Minh', label: 'Asia/Ho_Chi_Minh (ICT)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)' },
]

export default function Settings() {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '', description: '',
    show_on_landing: true, timezone: 'Pacific/Auckland',
  })
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
          show_on_landing: data.salon.show_on_landing !== false,
          timezone: data.salon.timezone || 'Pacific/Auckland',
        })
      }
    }).catch(console.error)
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    try {
      const updates = {}
      if (form.name) updates.name = form.name
      if (form.phone) updates.phone = form.phone
      if (form.email) updates.email = form.email
      if (form.address) updates.address = form.address
      if (form.description !== undefined) updates.description = form.description
      updates.show_on_landing = form.show_on_landing
      if (form.timezone) updates.timezone = form.timezone

      await api.updateSalonSettings(updates)
      setSalonTimezone(form.timezone)
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

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow p-6 space-y-5">
        {/* Business Info */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Business Info</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2" />
              </div>
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
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Regional */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Regional</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <select
              value={form.timezone}
              onChange={e => setForm({...form, timezone: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              {TIMEZONES.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">All bookings and schedules use this timezone</p>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Visibility */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Visibility</h2>
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">Show in Explore</label>
                <p className="text-xs text-gray-400 mt-0.5">Allow your shop to appear in the public search and explore page</p>
              </div>
              <button
                type="button"
                onClick={() => setForm({...form, show_on_landing: !form.show_on_landing})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${form.show_on_landing ? 'bg-pink-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${form.show_on_landing ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            {!form.show_on_landing && (
              <p className="text-xs text-orange-500 mt-2">⚠️ Your shop is hidden from search. Customers can still book via direct link.</p>
            )}
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="w-full bg-pink-600 text-white py-2.5 rounded-lg font-medium hover:bg-pink-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}

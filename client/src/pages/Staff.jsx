import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import { sanitizeName, sanitizePhone } from '../utils/validation'
import { useI18n } from '../utils/i18n'

export default function Staff() {
  const { t } = useI18n()
  const [staff, setStaff] = useState([])
  const [form, setForm] = useState({ name: '', role: '', phone: '', email: '' })
  const [editing, setEditing] = useState(null)

  const load = () => api.getStaff().then(setStaff).catch(console.error)
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Validate
    if (!form.name || form.name.trim().length < 2) {
      alert('Staff name must be at least 2 characters')
      return
    }
    if (form.phone && form.phone.replace(/\D/g, '').length < 7) {
      alert('Please enter a valid phone number (at least 7 digits)')
      return
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      alert('Please enter a valid email address')
      return
    }
    try {
      if (editing) {
        await api.updateStaff(editing, { ...form, active: true })
        setEditing(null)
      } else {
        await api.createStaff({ ...form, name: form.name.trim(), phone: form.phone?.trim() || '', email: form.email?.trim() || '' })
      }
      setForm({ name: '', role: '', phone: '', email: '' })
      load()
    } catch (err) { alert(err.message) }
  }

  const handleEdit = (s) => {
    setForm({ name: s.name, role: s.role || '', phone: s.phone || '', email: s.email || '' })
    setEditing(s.id)
  }

  const toggleActive = async (s) => {
    const newActive = !s.is_active
    if (!confirm(newActive ? `Activate ${s.name}?` : `Deactivate ${s.name}? They won't appear in current schedules.`)) return
    try {
      await api.updateStaff(s.id, { ...s, is_active: newActive, active: newActive })
      load()
    } catch (err) { alert(err.message) }
  }

  const handleDelete = async (s) => {
    if (!confirm(`Delete ${s.name}? This will permanently remove them.`)) return
    try {
      await api.deleteStaff(s.id)
      load()
    } catch (err) { alert(err.message) }
  }

  const activeStaff = staff.filter(s => s.is_active !== false)
  const inactiveStaff = staff.filter(s => s.is_active === false)

  const roles = ['Senior Stylist', 'Stylist', 'Colorist', 'Nail Technician', 'Esthetician', 'Massage Therapist', 'Receptionist']

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">👥 {t('staff')}</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">{editing ? t('editStaff') : t('addStaff')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input placeholder={t('staffName')} value={form.name} onChange={e => setForm({...form, name: e.target.value})}
            className="border rounded-lg px-3 py-2" required minLength={2} />
          <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
            className="border rounded-lg px-3 py-2">
            <option value="">{t('selectRole')}</option>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <input placeholder={t('phone')} type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
            className="border rounded-lg px-3 py-2" />
          <input placeholder={t('email')} value={form.email} onChange={e => setForm({...form, email: e.target.value})}
            className="border rounded-lg px-3 py-2" />
        </div>
        <div className="mt-4 flex gap-2">
          <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
            {editing ? t('update') : t('add')}
          </button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: '', role: '', phone: '', email: '' }) }}
            className="border px-4 py-2 rounded-lg hover:bg-gray-50">{t('cancelBtn')}</button>}
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeStaff.map(s => (
          <Link key={s.id} to={`/admin/staff/${s.id}/bookings`}
            className="bg-white rounded-xl shadow p-4 flex items-center gap-4 hover:shadow-md transition block">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-xl font-bold text-purple-600">
              {s.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold">{s.name}</h3>
              <p className="text-sm text-gray-500">{s.role}</p>
              <p className="text-xs text-gray-400">{s.phone} {s.email && `• ${s.email}`}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <span className="text-xs text-purple-600 hover:underline" onClick={e => { e.preventDefault(); e.stopPropagation(); handleEdit(s) }}>{t('edit')}</span>
              <span className="text-xs text-gray-400">|</span>
              <span className="text-xs text-purple-600 hover:underline">📋 Bookings</span>
              <span className="text-xs text-gray-400">|</span>
              <span className="text-xs text-red-500 hover:underline" onClick={e => { e.preventDefault(); e.stopPropagation(); handleDelete(s) }}>🗑 Delete</span>
            </div>
          </Link>
        ))}
      </div>

      {inactiveStaff.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mt-8 mb-4 text-gray-500">⏸ Inactive / Paused</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inactiveStaff.map(s => (
              <div key={s.id} className="bg-gray-50 rounded-xl shadow p-4 flex items-center gap-4 opacity-60">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-400">
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-500">{s.name}</h3>
                  <p className="text-sm text-gray-400">{s.role}</p>
                  <p className="text-xs text-gray-300">{s.phone} {s.email && `• ${s.email}`}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <span className="text-xs text-green-600 hover:underline font-medium" onClick={() => toggleActive(s)}>▶ Activate</span>
                  <span className="text-xs text-gray-400">|</span>
                  <span className="text-xs text-purple-600 hover:underline" onClick={e => { e.preventDefault(); e.stopPropagation(); handleEdit(s) }}>{t('edit')}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

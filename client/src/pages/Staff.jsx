import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import { sanitizeName, sanitizePhone } from '../utils/validation'
import { useI18n } from '../utils/i18n'
import { toast, confirmDialog } from '../utils/notify'

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
      toast('Staff name must be at least 2 characters', 'error')
      return
    }
    if (form.phone && form.phone.replace(/\D/g, '').length < 7) {
      toast('Please enter a valid phone number (at least 7 digits)', 'error')
      return
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast('Please enter a valid email address', 'error')
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
    } catch (err) { toast(err.message, 'error') }
  }

  const handleEdit = (s) => {
    setForm({ name: s.name, role: s.role || '', phone: s.phone || '', email: s.email || '' })
    setEditing(s.id)
  }

  const toggleActive = async (s) => {
    const newActive = !s.is_active
    if (!await confirmDialog(newActive ? { message: `Activate ${s.name}?`, confirmLabel: 'Activate' } : { message: `Deactivate ${s.name}? They will not appear in current schedules.`, confirmLabel: 'Deactivate', danger: true })) return
    try {
      await api.updateStaff(s.id, { ...s, is_active: newActive, active: newActive })
      load()
    } catch (err) { toast(err.message, 'error') }
  }

  const handleDelete = async (s) => {
    if (!await confirmDialog({ title: 'Delete staff member', message: `Delete ${s.name}? This permanently removes them.`, confirmLabel: 'Delete', danger: true })) return
    try {
      await api.deleteStaff(s.id)
      load()
    } catch (err) { toast(err.message, 'error') }
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
          <div>
            <label htmlFor="stf-name" className="block text-sm font-medium text-gray-700 mb-1">
              {t('staffName')} <span className="text-purple-600">*</span>
            </label>
            <input id="stf-name" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full border rounded-lg px-3 py-2" required minLength={2} />
            <p className="text-xs text-gray-400 mt-1">{t('stfNameHint')}</p>
          </div>
          <div>
            <label htmlFor="stf-role" className="block text-sm font-medium text-gray-700 mb-1">{t('role')}</label>
            <select id="stf-role" value={form.role} onChange={e => setForm({...form, role: e.target.value})}
              className="w-full border rounded-lg px-3 py-2">
              <option value="">{t('selectRole')}</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="stf-phone" className="block text-sm font-medium text-gray-700 mb-1">{t('phone')}</label>
            <input id="stf-phone" type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
              className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label htmlFor="stf-email" className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
            <input id="stf-email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="w-full border rounded-lg px-3 py-2" />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
            {editing ? t('update') : t('add')}
          </button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: '', role: '', phone: '', email: '' }) }}
            className="border px-4 py-2 rounded-lg hover:bg-gray-50">{t('cancelBtn')}</button>}
        </div>
      </form>

      {staff.length === 0 && (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <h2 className="font-semibold text-gray-900 mb-1">{t('stfEmptyTitle')}</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">{t('stfEmptyBody')}</p>
        </div>
      )}

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

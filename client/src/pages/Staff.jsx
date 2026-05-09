import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { translations } from '../utils/translations'

const TZ = 'Pacific/Auckland'

function StaffBookings({ staffId, staffName, onClose }) {
  const [appts, setAppts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.getAppointments({ staff_id: staffId })
      .then(data => { setAppts(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [staffId])

  const statusColors = {
    confirmed: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  // Group by date
  const byDate = {}
  appts.forEach(a => {
    const d = new Date(a.start_time).toLocaleDateString('en-NZ', { timeZone: TZ, weekday: 'short', month: 'short', day: 'numeric' })
    if (!byDate[d]) byDate[d] = []
    byDate[d].push(a)
  })

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b flex items-center justify-between shrink-0">
          <h3 className="font-semibold text-lg">📋 {staffName}'s Bookings</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {loading && <div className="text-center py-8 text-gray-400">Loading...</div>}
          {!loading && appts.length === 0 && <div className="text-center py-8 text-gray-400">No bookings found</div>}
          {Object.entries(byDate).map(([date, items]) => (
            <div key={date} className="mb-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{date}</div>
              <div className="space-y-2">
                {items.map(a => (
                  <div key={a.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <div className="text-sm font-medium w-28 shrink-0">
                      {new Date(a.start_time).toLocaleTimeString('en-NZ', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })}
                      -{new Date(a.end_time).toLocaleTimeString('en-NZ', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{a.customer_name}</div>
                      <div className="text-xs text-gray-400">{a.service_name} · ${a.price}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${statusColors[a.status]}`}>{a.status}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Staff() {
  const t = (k) => translations[k] || k
  const [staff, setStaff] = useState([])
  const [form, setForm] = useState({ name: '', role: '', phone: '', email: '' })
  const [editing, setEditing] = useState(null)
  const [viewStaff, setViewStaff] = useState(null)

  const load = () => api.getStaff().then(setStaff).catch(console.error)
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.updateStaff(editing, { ...form, active: true })
        setEditing(null)
      } else {
        await api.createStaff(form)
      }
      setForm({ name: '', role: '', phone: '', email: '' })
      load()
    } catch (err) { alert(err.message) }
  }

  const handleEdit = (s) => {
    setForm({ name: s.name, role: s.role || '', phone: s.phone || '', email: s.email || '' })
    setEditing(s.id)
  }

  const roles = ['Senior Stylist', 'Stylist', 'Colorist', 'Nail Technician', 'Esthetician', 'Massage Therapist', 'Receptionist']

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">👥 {t('staff')}</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">{editing ? t('editStaff') : t('addStaff')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input placeholder={t('staffName')} value={form.name} onChange={e => setForm({...form, name: e.target.value})}
            className="border rounded-lg px-3 py-2" required />
          <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
            className="border rounded-lg px-3 py-2">
            <option value="">{t('selectRole')}</option>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <input placeholder={t('phone')} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
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
        {staff.map(s => (
          <div key={s.id} className="bg-white rounded-xl shadow p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition"
            onClick={() => setViewStaff(s)}>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-xl font-bold text-purple-600">
              {s.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold">{s.name}</h3>
              <p className="text-sm text-gray-500">{s.role}</p>
              <p className="text-xs text-gray-400">{s.phone} {s.email && `• ${s.email}`}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <span className="text-xs text-purple-600 hover:underline" onClick={e => { e.stopPropagation(); handleEdit(s) }}>{t('edit')}</span>
              <span className="text-xs text-gray-400">|</span>
              <span className="text-xs text-purple-600 hover:underline">📋 Bookings</span>
            </div>
          </div>
        ))}
      </div>

      {viewStaff && (
        <StaffBookings staffId={viewStaff.id} staffName={viewStaff.name} onClose={() => setViewStaff(null)} />
      )}
    </div>
  )
}

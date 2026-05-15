import { useState, useEffect } from 'react'
import { api, getSalonTimezone } from '../utils/api'

const TZ = getSalonTimezone()

export default function Overrides() {
  const [staff, setStaff] = useState([])
  const [overrides, setOverrides] = useState([])
  const [appointments, setAppointments] = useState({})
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ staff_id: '', date: '', is_active: false, start_time: '09:00', end_time: '21:00', reason: '' })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [s, o] = await Promise.all([api.getStaff(), api.getOverrides()])
      setStaff(s)
      setOverrides(o)
      
      // Check appointments for each override date
      if (o.length > 0) {
        const dates = [...new Set(o.map(ov => new Date(ov.date).toLocaleDateString('en-CA', { timeZone: TZ })))]
        const apptsByDate = {}
        for (const date of dates) {
          try {
            const appts = await api.getAppointments({ date })
            apptsByDate[date] = appts
          } catch { apptsByDate[date] = [] }
        }
        setAppointments(apptsByDate)
      }
    } catch (err) {}
    setLoading(false)
  }

  const handleAdd = async () => {
    if (!form.staff_id || !form.date) return alert('Select staff and date')
    try {
      await api.createOverride({
        staff_id: parseInt(form.staff_id),
        date: form.date,
        is_active: form.is_active,
        start_time: form.is_active ? form.start_time : null,
        end_time: form.is_active ? form.end_time : null,
        reason: form.reason || null,
      })
      setShowAdd(false)
      setForm({ staff_id: '', date: '', is_active: false, start_time: '09:00', end_time: '21:00', reason: '' })
      loadData()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this override?')) return
    try {
      await api.deleteOverride(id)
      loadData()
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🗓 Days Off & Overrides</h1>
        <button onClick={() => setShowAdd(true)}
          className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700">
          + Add Override
        </button>
      </div>

      <p className="text-gray-500 text-sm mb-6">
        Set specific dates when staff are off or have different hours (holidays, personal days, etc.)
      </p>

      {overrides.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🗓</div>
          <p className="text-gray-400 text-lg">No overrides set</p>
          <p className="text-gray-400 text-sm mt-2">Add days off or custom hours for specific dates</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-gray-500">Staff</th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">Date</th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">Hours</th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">Reason</th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {overrides.map(o => {
                const overrideDate = new Date(o.date).toLocaleDateString('en-CA', { timeZone: TZ })
                const dateAppts = appointments[overrideDate] || []
                const staffAppts = dateAppts.filter(a => a.staff_id === o.staff_id && a.status !== 'cancelled')
                const hasBookings = staffAppts.length > 0
                const isDayOff = !o.is_active
                
                return (
                <tr key={o.id} className={`border-t hover:bg-gray-50 ${isDayOff && hasBookings ? 'bg-red-50' : ''}`}>
                  <td className="p-3 text-sm font-medium">{o.staff_name}</td>
                  <td className="p-3 text-sm">
                    {new Date(o.date).toLocaleDateString('en-NZ', { timeZone: TZ, weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isDayOff && hasBookings ? 'bg-red-100 text-red-700' :
                      o.is_active ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {isDayOff && hasBookings ? `⚠️ Day Off (${staffAppts.length} bookings)` : o.is_active ? 'Custom Hours' : 'Day Off'}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-500">
                    {o.is_active ? `${o.start_time?.substring(0, 5)} – ${o.end_time?.substring(0, 5)}` : '—'}
                  </td>
                  <td className="p-3 text-sm text-gray-400">{o.reason || '—'}</td>
                  <td className="p-3">
                    <button onClick={() => handleDelete(o.id)}
                      className="text-red-400 hover:text-red-600 text-sm">🗑</button>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Add Override</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Staff Member</label>
                <select value={form.staff_id} onChange={e => setForm({...form, staff_id: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2">
                  <option value="">Select staff...</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={form.date} min={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm({...form, date: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2" />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})}
                    className="rounded border-gray-300" />
                  <span className="text-sm font-medium text-gray-700">Custom hours (instead of day off)</span>
                </label>
              </div>

              {form.is_active && (
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
                    <input type="time" value={form.start_time}
                      onChange={e => setForm({...form, start_time: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
                    <input type="time" value={form.end_time}
                      onChange={e => setForm({...form, end_time: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                <input type="text" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})}
                  placeholder="e.g. Christmas Day, Personal leave..."
                  className="w-full border rounded-lg px-3 py-2" />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowAdd(false)} className="flex-1 border px-4 py-2 rounded-lg">Cancel</button>
              <button onClick={handleAdd} className="flex-1 bg-pink-600 text-white px-4 py-2 rounded-lg">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { api } from '../utils/api'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [];
for (let h = 6; h <= 23; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`);
}

export default function StaffSchedule() {
  const [staff, setStaff] = useState([])
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const isSuperAdmin = (() => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return false
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.email === 'admin@tnmthai.com'
    } catch { return false }
  })()

  const isStaffRole = (() => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return false
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.role === 'staff'
    } catch { return false }
  })()

  // Load staff list
  useEffect(() => {
    api.getStaff().then(data => {
      setStaff(data)
      if (data.length > 0) {
        // If staff role, find their own record
        if (isStaffRole) {
          const token = localStorage.getItem('token')
          const payload = JSON.parse(atob(token.split('.')[1]))
          const me = data.find(s => s.user_id === payload.id)
          if (me) setSelectedStaff(me)
          else if (data.length > 0) setSelectedStaff(data[0])
        } else {
          setSelectedStaff(data[0])
        }
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  // Load schedule when staff changes
  useEffect(() => {
    if (!selectedStaff) return
    api.getWorkingHours(selectedStaff.id).then(data => {
      // Build full week schedule
      const fullSchedule = DAYS.map((_, dayIndex) => {
        const existing = data.find(d => d.day_of_week === dayIndex)
        return {
          day_of_week: dayIndex,
          start_time: existing?.start_time?.substring(0, 5) || '09:00',
          end_time: existing?.end_time?.substring(0, 5) || '21:00',
          is_active: !!existing
        }
      })
      setSchedule(fullSchedule)
    })
  }, [selectedStaff])

  const toggleDay = (dayIndex) => {
    setSchedule(prev => prev.map((s, i) =>
      i === dayIndex ? { ...s, is_active: !s.is_active } : s
    ))
  }

  const updateTime = (dayIndex, field, value) => {
    setSchedule(prev => prev.map((s, i) =>
      i === dayIndex ? { ...s, [field]: value } : s
    ))
  }

  const handleSave = async () => {
    if (!selectedStaff) return
    setSaving(true)
    try {
      await api.setWorkingHours(selectedStaff.id, schedule)
      alert('Schedule saved!')
    } catch (err) {
      alert('Error: ' + err.message)
    }
    setSaving(false)
  }

  const applyToAll = (dayIndex) => {
    const source = schedule[dayIndex]
    setSchedule(prev => prev.map(s => ({
      ...s,
      start_time: source.start_time,
      end_time: source.end_time,
      is_active: source.is_active
    })))
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">📅 Working Hours</h1>

      {/* Staff selector */}
      {staff.length > 1 && !isStaffRole && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Staff</label>
          <div className="flex gap-2 flex-wrap">
            {staff.map(s => (
              <button key={s.id} onClick={() => setSelectedStaff(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedStaff?.id === s.id
                    ? 'bg-pink-600 text-white'
                    : 'bg-white border text-gray-600 hover:border-pink-300'
                }`}>
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedStaff && (
        <div>
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-1">{selectedStaff.name}</h2>
            <p className="text-sm text-gray-500">{selectedStaff.role || 'Staff'}</p>
          </div>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="grid grid-cols-1 divide-y">
              {schedule.map((day, index) => (
                <div key={index} className={`flex items-center p-4 gap-4 ${day.is_active ? '' : 'bg-gray-50'}`}>
                  <div className="w-28">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={day.is_active} onChange={() => toggleDay(index)}
                        className="w-4 h-4 text-pink-600 rounded" />
                      <span className={`font-medium ${day.is_active ? 'text-gray-900' : 'text-gray-400'}`}>
                        {DAYS[index]}
                      </span>
                    </label>
                  </div>

                  {day.is_active ? (
                    <div className="flex items-center gap-3 flex-1">
                      <select value={day.start_time} onChange={e => updateTime(index, 'start_time', e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm">
                        {TIME_SLOTS.filter(t => t < (day.end_time || '23:30')).map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <span className="text-gray-400">to</span>
                      <select value={day.end_time} onChange={e => updateTime(index, 'end_time', e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm">
                        {TIME_SLOTS.filter(t => t > (day.start_time || '06:00')).map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <button onClick={() => applyToAll(index)}
                        className="text-xs text-pink-600 hover:text-pink-700 ml-2">
                        Apply to all
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Day off</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button onClick={handleSave} disabled={saving}
              className="bg-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-pink-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Schedule'}
            </button>
          </div>
        </div>
      )}

      {staff.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No staff members yet</p>
          <p className="text-gray-400 text-sm mt-2">Add staff first, then set their working hours</p>
        </div>
      )}
    </div>
  )
}

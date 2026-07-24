import { useState, useEffect } from 'react'
import { api } from '../utils/api'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// 12-hour time format for display, 24-hour value for DB
function fmt12h(h, m) {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

// Generate half-hour time slots 06:00–23:30
function genTimeSlots() {
  const slots = [];
  for (let h = 6; h <= 23; h++) {
    slots.push({ value: `${String(h).padStart(2, '0')}:00`, label: fmt12h(h, 0) });
    slots.push({ value: `${String(h).padStart(2, '0')}:30`, label: fmt12h(h, 30) });
  }
  return slots;
}
const TIME_SLOTS = genTimeSlots();

// Convert API working_hours rows → day-by-day schedule with multiple slots
function buildScheduleFromApi(data) {
  return DAYS.map((_, dayIndex) => {
    const dayRows = data.filter(d => d.day_of_week === dayIndex);
    const slots = dayRows.map(r => ({
      start: r.start_time?.substring(0, 5) || '09:00',
      end: r.end_time?.substring(0, 5) || '21:00',
    }));
    return {
      day_of_week: dayIndex,
      is_active: dayRows.length > 0,
      slots: slots.length > 0 ? slots : [{ start: '09:00', end: '21:00' }],
    };
  });
}

// Flatten schedule back to API format
function flattenSchedule(schedule) {
  const result = [];
  for (const day of schedule) {
    if (!day.is_active) {
      result.push({ day_of_week: day.day_of_week, start_time: null, end_time: null, is_active: false });
    } else {
      for (const slot of day.slots) {
        result.push({
          day_of_week: day.day_of_week,
          start_time: slot.start,
          end_time: slot.end,
          is_active: true,
        });
      }
    }
  }
  return result;
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
      setSchedule(buildScheduleFromApi(data))
    }).catch(() => {
      setSchedule(buildScheduleFromApi([]))
    })
  }, [selectedStaff])

  const toggleDay = (dayIndex) => {
    setSchedule(prev => prev.map((d, i) =>
      i === dayIndex ? { ...d, is_active: !d.is_active } : d
    ))
  }

  const addSlot = (dayIndex) => {
    setSchedule(prev => prev.map((d, i) => {
      if (i !== dayIndex) return d;
      const last = d.slots[d.slots.length - 1];
      const newStart = last ? last.end : '09:00';
      const newEnd = addHalfHour(newStart);
      return { ...d, slots: [...d.slots, { start: newStart, end: newEnd }] };
    }))
  }

  const removeSlot = (dayIndex, slotIndex) => {
    setSchedule(prev => prev.map((d, i) => {
      if (i !== dayIndex) return d;
      const slots = d.slots.filter((_, si) => si !== slotIndex);
      return { ...d, slots: slots.length > 0 ? slots : [{ start: '09:00', end: '21:00' }] };
    }))
  }

  const updateSlot = (dayIndex, slotIndex, field, value) => {
    setSchedule(prev => prev.map((d, i) => {
      if (i !== dayIndex) return d;
      const slots = d.slots.map((s, si) =>
        si === slotIndex ? { ...s, [field]: value } : s
      );
      return { ...d, slots };
    }))
  }

  const addHalfHour = (time) => {
    const [h, m] = time.split(':').map(Number);
    const total = h * 60 + m + 30;
    const nh = Math.floor(total / 60);
    const nm = total % 60;
    return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
  }

  const applyToAll = (dayIndex) => {
    const source = schedule[dayIndex]
    setSchedule(prev => prev.map(d => ({
      ...d,
      is_active: source.is_active,
      slots: source.is_active ? source.slots.map(s => ({ ...s })) : d.slots,
    })))
  }

  const handleSave = async () => {
    if (!selectedStaff) return
    setSaving(true)
    try {
      const flat = flattenSchedule(schedule)
      await api.setWorkingHours(selectedStaff.id, flat)
      alert('Schedule saved!')
    } catch (err) {
      alert('Error: ' + err.message)
    }
    setSaving(false)
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
                <div key={index} className={`p-4 ${day.is_active ? '' : 'bg-gray-50'}`}>
                  {/* Day header + toggle */}
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-28">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={day.is_active} onChange={() => toggleDay(index)}
                          className="w-4 h-4 text-pink-600 rounded" />
                        <span className={`font-medium ${day.is_active ? 'text-gray-900' : 'text-gray-400'}`}>
                          {DAYS[index]}
                        </span>
                      </label>
                    </div>

                    {day.is_active && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => addSlot(index)}
                          className="text-xs px-2 py-1 rounded bg-pink-50 text-pink-600 hover:bg-pink-100 border border-pink-200">
                          + Add slot
                        </button>
                        <button onClick={() => applyToAll(index)}
                          className="text-xs px-2 py-1 rounded bg-gray-50 text-gray-500 hover:text-pink-600 border border-gray-200">
                          Apply to all
                        </button>
                      </div>
                    )}

                    {!day.is_active && (
                      <span className="text-sm text-gray-400">Day off</span>
                    )}
                  </div>

                  {/* Time slots for this day */}
                  {day.is_active && (
                    <div className="ml-32 space-y-2">
                      {day.slots.map((slot, si) => (
                        <div key={si} className="flex items-center gap-3">
                          <select value={slot.start}
                            onChange={e => updateSlot(index, si, 'start', e.target.value)}
                            className="border rounded-lg px-3 py-2 text-sm">
                            {TIME_SLOTS.filter(t => t.value < (slot.end || '23:30')).map(t => (
                              <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                          </select>
                          <span className="text-gray-400">to</span>
                          <select value={slot.end}
                            onChange={e => updateSlot(index, si, 'end', e.target.value)}
                            className="border rounded-lg px-3 py-2 text-sm">
                            {TIME_SLOTS.filter(t => t.value > (slot.start || '06:00')).map(t => (
                              <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                          </select>
                          {day.slots.length > 1 && (
                            <button onClick={() => removeSlot(index, si)}
                              className="text-red-400 hover:text-red-600 text-lg leading-none px-1"
                              title="Remove this slot">
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
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

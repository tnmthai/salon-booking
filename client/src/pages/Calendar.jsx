import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { translations } from '../utils/translations'

const STAFF_COLORS = [
  { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800', dot: 'bg-blue-500' },
  { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-800', dot: 'bg-purple-500' },
  { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-800', dot: 'bg-pink-500' },
  { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-800', dot: 'bg-amber-500' },
  { bg: 'bg-cyan-100', border: 'border-cyan-300', text: 'text-cyan-800', dot: 'bg-cyan-500' },
  { bg: 'bg-rose-100', border: 'border-rose-300', text: 'text-rose-800', dot: 'bg-rose-500' },
  { bg: 'bg-teal-100', border: 'border-teal-300', text: 'text-teal-800', dot: 'bg-teal-500' },
]

const TZ = 'Pacific/Auckland'

// Get date/time parts in NZ timezone
function nzParts(dateStr) {
  const d = new Date(dateStr)
  const parts = new Intl.DateTimeFormat('en-NZ', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(d)
  const get = (type) => parseInt(parts.find(p => p.type === type).value)
  return { year: get('year'), month: get('month'), day: get('day'), hour: get('hour'), minute: get('minute') }
}

function nzDateStr(dateStr) {
  const p = nzParts(dateStr)
  return `${p.year}-${String(p.month).padStart(2,'0')}-${String(p.day).padStart(2,'0')}`
}

function nzTimeStr(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-NZ', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })
}

function nzDateLabel(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-NZ', {
    timeZone: TZ, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
}

export default function Calendar() {
  const t = (k) => translations[k] || k
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA', { timeZone: TZ }))
  const [staffList, setStaffList] = useState([])
  const [appointments, setAppointments] = useState([])
  const [selectedStaff, setSelectedStaff] = useState('')
  const [showAllDates, setShowAllDates] = useState(false)

  useEffect(() => { api.getStaff().then(setStaffList).catch(console.error) }, [])

  useEffect(() => {
    const params = {}
    if (!showAllDates) params.date = date
    if (selectedStaff) params.staff_id = selectedStaff
    api.getAppointments(params).then(setAppointments).catch(console.error)
  }, [date, selectedStaff, showAllDates])

  const SLOT_MINUTES = 15
  const START_HOUR = 8
  const END_HOUR = 19
  const totalSlots = ((END_HOUR - START_HOUR) * 60) / SLOT_MINUTES

  const timeLabels = Array.from({ length: totalSlots }, (_, i) => {
    const mins = START_HOUR * 60 + i * SLOT_MINUTES
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return { hour: h, minute: m, label: m === 0 ? `${h}:00` : '' }
  })

  const shiftDate = (offset) => {
    const d = new Date(date + 'T12:00:00')
    d.setDate(d.getDate() + offset)
    setDate(d.toLocaleDateString('en-CA', { timeZone: TZ }))
  }

  const filteredStaff = selectedStaff ? staffList.filter(s => s.id == selectedStaff) : staffList

  const staffColorMap = {}
  filteredStaff.forEach((s, i) => {
    staffColorMap[s.id] = STAFF_COLORS[i % STAFF_COLORS.length]
  })

  // Get unique dates from appointments in NZ timezone
  const allDates = showAllDates
    ? [...new Set(appointments.map(a => nzDateStr(a.start_time)))].sort()
    : [date]

  const getAppts = (staffId, targetDate) => {
    return appointments.filter(a => {
      return a.staff_id === staffId && nzDateStr(a.start_time) === targetDate
    })
  }

  const getBlockStyle = (appt) => {
    const sp = nzParts(appt.start_time)
    const ep = nzParts(appt.end_time)
    const startMins = sp.hour * 60 + sp.minute
    const endMins = ep.hour * 60 + ep.minute
    const top = ((startMins - START_HOUR * 60) / SLOT_MINUTES)
    const height = ((endMins - startMins) / SLOT_MINUTES)
    return { top: `${top * 2}rem`, height: `${height * 2}rem`, minHeight: '2rem' }
  }

  const statusBorder = {
    confirmed: '',
    completed: 'opacity-70',
    cancelled: 'opacity-50 line-through',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">📅 {t('calendar')}</h1>

      <div className="flex gap-4 mb-6 flex-wrap items-center">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={showAllDates} onChange={e => setShowAllDates(e.target.checked)}
            className="rounded border-gray-300" />
          All dates
        </label>
        {!showAllDates && (
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="border rounded-lg px-3 py-2" />
        )}
        <select value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)}
          className="border rounded-lg px-3 py-2">
          <option value="">{t('allStaff')}</option>
          {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {!showAllDates && (
          <div className="flex gap-2 ml-auto">
            <button onClick={() => shiftDate(-1)} className="border px-3 py-2 rounded-lg hover:bg-gray-50">{t('prev')}</button>
            <button onClick={() => setDate(new Date().toLocaleDateString('en-CA', { timeZone: TZ }))} className="border px-3 py-2 rounded-lg hover:bg-gray-50">{t('today')}</button>
            <button onClick={() => shiftDate(1)} className="border px-3 py-2 rounded-lg hover:bg-gray-50">{t('next')}</button>
          </div>
        )}
      </div>

      {filteredStaff.length > 1 && (
        <div className="flex gap-4 mb-4 flex-wrap">
          {filteredStaff.map(s => {
            const c = staffColorMap[s.id]
            return (
              <div key={s.id} className="flex items-center gap-1.5 text-sm">
                <span className={`w-3 h-3 rounded-full ${c.dot}`} />
                <span className="text-gray-600">{s.name}</span>
              </div>
            )
          })}
        </div>
      )}

      {allDates.map(d => (
        <div key={d} className="mb-10">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">{nzDateLabel(d)}</h2>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="grid" style={{ gridTemplateColumns: `60px repeat(${filteredStaff.length}, 1fr)` }}>
              <div className="bg-gray-50 border-b p-2" />
              {filteredStaff.map(s => {
                const c = staffColorMap[s.id]
                return (
                  <div key={s.id} className="bg-gray-50 border-b border-l p-2 text-center">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${c.dot} mr-1.5 align-middle`} />
                    <span className="text-sm font-medium text-gray-700">{s.name}</span>
                  </div>
                )
              })}

              <div className="relative" style={{ gridRow: `span ${totalSlots}` }}>
                {timeLabels.map((t, i) => (
                  <div key={i} className="h-8 border-b border-gray-100 flex items-start justify-end pr-2">
                    {t.label && <span className="text-[11px] text-gray-400 -mt-1.5">{t.label}</span>}
                  </div>
                ))}
              </div>

              {filteredStaff.map(s => {
                const c = staffColorMap[s.id]
                const appts = getAppts(s.id, d)
                return (
                  <div key={s.id} className="relative border-l" style={{ gridRow: `span ${totalSlots}` }}>
                    {timeLabels.map((_, i) => (
                      <div key={i} className="h-8 border-b border-gray-100" />
                    ))}
                    {appts.map(appt => {
                      const style = getBlockStyle(appt)
                      return (
                        <div
                          key={appt.id}
                          className={`absolute left-0.5 right-0.5 rounded-md border ${c.bg} ${c.border} ${c.text} px-1.5 py-0.5 overflow-hidden cursor-default ${statusBorder[appt.status] || ''}`}
                          style={style}
                          title={`${appt.customer_name} — ${appt.service_name}\n${nzTimeStr(appt.start_time)} - ${nzTimeStr(appt.end_time)}`}
                        >
                          <div className="font-semibold text-[11px] truncate">{appt.customer_name}</div>
                          <div className="text-[10px] truncate opacity-80">{appt.service_name}</div>
                          <div className="text-[10px] opacity-60">{nzTimeStr(appt.start_time)} - {nzTimeStr(appt.end_time)}</div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ))}

      {allDates.length === 0 && (
        <div className="text-center py-12 text-gray-400">No bookings found</div>
      )}
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'
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

function nzDateStr(utcDateStr) {
  return new Date(utcDateStr).toLocaleDateString('en-CA', { timeZone: TZ })
}

function nzTimeStr(utcDateStr) {
  return new Date(utcDateStr).toLocaleTimeString('en-NZ', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })
}

function nzParts(utcDateStr) {
  const d = new Date(utcDateStr)
  const parts = new Intl.DateTimeFormat('en-NZ', {
    timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(d)
  const get = (type) => parseInt(parts.find(p => p.type === type).value)
  return { hour: get('hour'), minute: get('minute') }
}

function todayNZ() {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ })
}

function shiftDateNZ(dateStr, offset) {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + offset)
  return d.toLocaleDateString('en-CA', { timeZone: TZ })
}

function formatDateLabel(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-NZ', {
    timeZone: TZ, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
}

export default function Calendar() {
  const t = (k) => translations[k] || k
  const [date, setDate] = useState(todayNZ())
  const [staffList, setStaffList] = useState([])
  const [appointments, setAppointments] = useState([])
  const [selectedStaff, setSelectedStaff] = useState('')
  const [showAllDates, setShowAllDates] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => { api.getStaff().then(setStaffList).catch(console.error) }, [])

  const loadAppointments = useCallback(() => {
    setLoading(true)
    const params = {}
    if (!showAllDates) params.date = date
    if (selectedStaff) params.staff_id = selectedStaff
    api.getAppointments(params)
      .then(data => { setAppointments(data); setLoading(false) })
      .catch(err => { console.error(err); setLoading(false) })
  }, [date, selectedStaff, showAllDates])

  useEffect(() => { loadAppointments() }, [loadAppointments])

  const SLOT_H = 32 // px per slot (compact)
  const START_HOUR = 8
  const END_HOUR = 19
  const SLOT_MINUTES = 30
  const totalSlots = ((END_HOUR - START_HOUR) * 60) / SLOT_MINUTES

  const timeLabels = Array.from({ length: totalSlots }, (_, i) => {
    const mins = START_HOUR * 60 + i * SLOT_MINUTES
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return m === 0 ? `${h}:00` : ''
  })

  const filteredStaff = selectedStaff ? staffList.filter(s => s.id == selectedStaff) : staffList

  const staffColorMap = {}
  filteredStaff.forEach((s, i) => {
    staffColorMap[s.id] = STAFF_COLORS[i % STAFF_COLORS.length]
  })

  const allDates = showAllDates
    ? [...new Set(appointments.map(a => nzDateStr(a.start_time)))].sort()
    : [date]

  const getAppts = (staffId, targetDate) => {
    return appointments.filter(a => a.staff_id === staffId && nzDateStr(a.start_time) === targetDate)
  }

  const getBlockStyle = (appt) => {
    const sp = nzParts(appt.start_time)
    const ep = nzParts(appt.end_time)
    const startSlot = (sp.hour - START_HOUR) * (60 / SLOT_MINUTES) + sp.minute / SLOT_MINUTES
    const endSlot = (ep.hour - START_HOUR) * (60 / SLOT_MINUTES) + ep.minute / SLOT_MINUTES
    const top = startSlot * SLOT_H
    const height = Math.max((endSlot - startSlot) * SLOT_H, SLOT_H)
    return { top: `${top}px`, height: `${height}px` }
  }

  const gridH = totalSlots * SLOT_H

  return (
    <div className="max-w-7xl mx-auto px-4 pt-20 pb-6">
      <h1 className="text-2xl font-bold mb-4">📅 {t('calendar')}</h1>

      {/* Controls */}
      <div className="flex gap-3 mb-4 flex-wrap items-center">
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input type="checkbox" checked={showAllDates} onChange={e => setShowAllDates(e.target.checked)}
            className="rounded border-gray-300" />
          All dates
        </label>
        {!showAllDates && (
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm" />
        )}
        <select value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm">
          <option value="">{t('allStaff')}</option>
          {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {!showAllDates && (
          <div className="flex gap-1 ml-auto">
            <button onClick={() => setDate(shiftDateNZ(date, -1))} className="border px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50">← {t('prev')}</button>
            <button onClick={() => setDate(todayNZ())} className="border px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50">{t('today')}</button>
            <button onClick={() => setDate(shiftDateNZ(date, 1))} className="border px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50">{t('next')} →</button>
          </div>
        )}
        {loading && <span className="text-xs text-gray-400 ml-2">Loading...</span>}
      </div>

      {/* Staff legend */}
      {filteredStaff.length > 1 && (
        <div className="flex gap-4 mb-3 flex-wrap">
          {filteredStaff.map(s => {
            const c = staffColorMap[s.id]
            return (
              <div key={s.id} className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                {s.name}
              </div>
            )
          })}
        </div>
      )}

      {/* Calendar grids */}
      {allDates.map(d => (
        <div key={d} className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">{formatDateLabel(d)}</h2>

          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <div className="flex" style={{ minWidth: `${60 + filteredStaff.length * 140}px` }}>
                {/* Time column */}
                <div className="w-[52px] shrink-0 relative" style={{ height: `${gridH}px` }}>
                  {timeLabels.map((label, i) => (
                    <div key={i} className="absolute w-full flex items-start justify-end pr-1.5" style={{ top: `${i * SLOT_H}px`, height: `${SLOT_H}px` }}>
                      {label && <span className="text-[10px] text-gray-400 -mt-2">{label}</span>}
                    </div>
                  ))}
                </div>

                {/* Staff columns */}
                {filteredStaff.map((s, si) => {
                  const c = staffColorMap[s.id]
                  const appts = getAppts(s.id, d)
                  return (
                    <div key={s.id} className="flex-1 relative border-l" style={{ height: `${gridH}px`, minWidth: '140px' }}>
                      {/* Header */}
                      <div className="absolute top-0 left-0 right-0 h-7 bg-gray-50 border-b z-10 flex items-center justify-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                        <span className="text-xs font-medium text-gray-700 truncate">{s.name}</span>
                      </div>
                      {/* Grid lines */}
                      <div className="absolute inset-0 top-7">
                        {Array.from({ length: totalSlots }, (_, i) => (
                          <div key={i} className="absolute w-full border-b border-gray-100" style={{ top: `${i * SLOT_H}px`, height: `${SLOT_H}px` }} />
                        ))}
                      </div>
                      {/* Appointment blocks */}
                      {appts.map(appt => {
                        const style = getBlockStyle(appt)
                        const isCancelled = appt.status === 'cancelled'
                        const isCompleted = appt.status === 'completed'
                        return (
                          <div
                            key={appt.id}
                            className={`absolute left-0.5 right-0.5 rounded px-1 py-0.5 overflow-hidden cursor-default text-[11px] leading-tight border ${c.bg} ${c.border} ${c.text} ${isCancelled ? 'opacity-40 line-through' : ''} ${isCompleted ? 'opacity-60' : ''}`}
                            style={{ top: `${style.top + 28}px`, height: style.height }}
                            title={`${appt.customer_name} — ${appt.service_name}\n${nzTimeStr(appt.start_time)} - ${nzTimeStr(appt.end_time)}`}
                          >
                            <div className="font-semibold truncate text-[11px]">{appt.customer_name}</div>
                            {parseInt(style.height) > 30 && <div className="truncate opacity-80 text-[10px]">{appt.service_name}</div>}
                            {parseInt(style.height) > 45 && <div className="opacity-60 text-[10px]">{nzTimeStr(appt.start_time)}-{nzTimeStr(appt.end_time)}</div>}
                          </div>
                        )
                      })}
                      {/* Empty state */}
                      {appts.length === 0 && !showAllDates && (
                        <div className="absolute inset-0 top-7 flex items-center justify-center">
                          <span className="text-xs text-gray-300">No bookings</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
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

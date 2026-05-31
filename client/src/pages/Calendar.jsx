import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { api, getSalonTimezone } from '../utils/api'
import { useI18n } from '../utils/i18n'

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

const TZ = getSalonTimezone()
const SLOT_H = 36
const START_HOUR = 8
const END_HOUR = 21
const SLOT_MIN = 30
const totalSlots = ((END_HOUR - START_HOUR) * 60) / SLOT_MIN
const gridH = totalSlots * SLOT_H
const HEADER_H = 40

function nzDateStr(utc) { return new Date(utc).toLocaleDateString('en-CA', { timeZone: TZ }) }
function nzTimeStr(utc) { return new Date(utc).toLocaleTimeString('en-NZ', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }) }
function nzParts(utc) {
  const parts = new Intl.DateTimeFormat('en-NZ', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date(utc))
  const g = (t) => parseInt(parts.find(p => p.type === t).value)
  return { hour: g('hour'), minute: g('minute') }
}
function todayNZ() { return new Date().toLocaleDateString('en-CA', { timeZone: TZ }) }
function shiftDateNZ(d, off) { const dt = new Date(d + 'T12:00:00'); dt.setDate(dt.getDate() + off); return dt.toLocaleDateString('en-CA', { timeZone: TZ }) }
function fmtDateLabel(d) { return new Date(d + 'T12:00:00').toLocaleDateString('en-NZ', { timeZone: TZ, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }

// Lunch break helpers
const DEFAULT_LUNCH_START = 12 * 60 + 30 // 12:30 in minutes
const DEFAULT_LUNCH_END = 13 * 60 // 13:00 in minutes
const LUNCH_KEY = 'timia_lunch_breaks'

function loadLunchBreaks() {
  try {
    return JSON.parse(localStorage.getItem(LUNCH_KEY)) || {}
  } catch { return {} }
}

function saveLunchBreaks(data) {
  localStorage.setItem(LUNCH_KEY, JSON.stringify(data))
}

function getLunchBreak(lunchBreaks, staffId, date) {
  const key = `${staffId}_${date}`
  if (lunchBreaks[key]) return lunchBreaks[key]
  return { start: DEFAULT_LUNCH_START, end: DEFAULT_LUNCH_END }
}

function BookingModal({ appt, onClose, onUpdate, services }) {
  const [status, setStatus] = useState(appt.status)
  const [newDate, setNewDate] = useState(nzDateStr(appt.start_time))
  const [newTime, setNewTime] = useState(nzTimeStr(appt.start_time).replace(/\s/g, ''))
  const [showReschedule, setShowReschedule] = useState(false)
  const [showAddService, setShowAddService] = useState(false)
  const [saving, setSaving] = useState(false)
  const [checkIn, setCheckIn] = useState(false)

  const handleStatus = async (s) => {
    setSaving(true)
    try { await api.updateAppointment(appt.id, { status: s }); setStatus(s); onUpdate() } catch (e) { alert(e.message) }
    setSaving(false)
  }

  const handleCheckIn = async () => {
    setSaving(true)
    try {
      await api.updateAppointment(appt.id, { status: 'checked_in' })
      setCheckIn(true)
      onUpdate()
    } catch (e) { alert(e.message) }
    setSaving(false)
  }

  const handleReschedule = async () => {
    setSaving(true)
    try {
      const [h, m] = newTime.split(':').map(Number)
      const ld = new Date(newDate + 'T00:00:00'); ld.setHours(h, m, 0, 0)
      const nzS = ld.toLocaleString('en-US', { timeZone: TZ })
      const utcS = ld.toLocaleString('en-US', { timeZone: 'UTC' })
      const off = new Date(nzS).getTime() - new Date(utcS).getTime()
      const utcStart = new Date(ld.getTime() - off)
      const dur = (new Date(appt.end_time) - new Date(appt.start_time))
      await api.updateAppointment(appt.id, { start_time: utcStart.toISOString(), end_time: new Date(utcStart.getTime() + dur).toISOString() })
      onUpdate(); onClose()
    } catch (e) { alert(e.message) }
    setSaving(false)
  }

  const handleAddService = async (serviceId) => {
    setSaving(true)
    try {
      const svc = services.find(s => s.id === serviceId)
      if (!svc) return
      const newEnd = new Date(new Date(appt.end_time).getTime() + svc.duration_min * 60000)
      const currentName = appt.service_name || ''
      const newName = currentName ? `${currentName}, ${svc.name}` : svc.name
      await api.updateAppointment(appt.id, {
        end_time: newEnd.toISOString(),
        price: parseFloat(appt.price || 0) + parseFloat(svc.price),
        service_name: newName,
      })
      onUpdate(); setShowAddService(false)
    } catch (e) { alert(e.message) }
    setSaving(false)
  }

  const sc = {
    confirmed: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
    checked_in: 'bg-yellow-100 text-yellow-700'
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-semibold text-lg">Booking Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">✕</button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Customer</div>
            <div className="font-semibold">{appt.customer_name}</div>
            {appt.customer_phone && <div className="text-sm text-gray-500">📞 {appt.customer_phone}</div>}
            {appt.customer_email && <div className="text-sm text-gray-500">✉️ {appt.customer_email}</div>}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><div className="text-xs text-gray-400 uppercase mb-1">Service</div><div className="font-medium">{appt.service_name}</div></div>
            <div><div className="text-xs text-gray-400 uppercase mb-1">Staff</div><div className="font-medium">{appt.staff_name}</div></div>
            <div><div className="text-xs text-gray-400 uppercase mb-1">Date</div><div className="font-medium">{fmtDateLabel(nzDateStr(appt.start_time))}</div></div>
            <div><div className="text-xs text-gray-400 uppercase mb-1">Time</div><div className="font-medium">{nzTimeStr(appt.start_time)} - {nzTimeStr(appt.end_time)}</div></div>
            <div><div className="text-xs text-gray-400 uppercase mb-1">Price</div><div className="font-medium">${appt.price || appt.service_price}</div></div>
            <div><div className="text-xs text-gray-400 uppercase mb-1">Status</div><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sc[status] || sc[appt.status]}`}>{status || appt.status}</span></div>
          </div>
          {appt.notes && <div><div className="text-xs text-gray-400 uppercase mb-1">Notes</div><div className="text-sm text-gray-600">{appt.notes}</div></div>}
          {appt.booking_code && <div><div className="text-xs text-gray-400 uppercase mb-1">Booking Code</div><div className="font-mono font-bold text-green-600">{appt.booking_code}</div></div>}

          {showReschedule && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="text-sm font-medium">Reschedule</div>
              <div className="flex gap-2">
                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm flex-1" />
                <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowReschedule(false)} className="flex-1 border py-1.5 rounded-lg text-sm">Cancel</button>
                <button onClick={handleReschedule} disabled={saving} className="flex-1 bg-gray-900 text-white py-1.5 rounded-lg text-sm disabled:opacity-50">{saving ? 'Saving...' : 'Confirm'}</button>
              </div>
            </div>
          )}

          {showAddService && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="text-sm font-medium">Add Service</div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {services.filter(s => s.active !== false).map(s => (
                  <button key={s.id} onClick={() => handleAddService(s.id)}
                    className="w-full text-left border rounded-lg px-3 py-2 text-sm hover:bg-white transition flex justify-between items-center">
                    <span>{s.name}</span>
                    <span className="text-gray-500">${s.price} · {s.duration_min}min</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setShowAddService(false)} className="w-full border py-1.5 rounded-lg text-sm">Cancel</button>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t bg-gray-50 rounded-b-2xl sticky bottom-0">
          {(status === 'confirmed' || status === 'checked_in') && !showReschedule && !showAddService && (
            <div className="flex gap-1.5">
              {status === 'confirmed' && (
                <button onClick={handleCheckIn} disabled={saving}
                  className="flex-1 bg-yellow-50 text-yellow-700 py-2 rounded-lg text-xs font-medium hover:bg-yellow-100 border border-yellow-200 disabled:opacity-50">
                  ✋ Check In
                </button>
              )}
              <button onClick={() => setShowAddService(true)}
                className="flex-1 bg-purple-50 text-purple-700 py-2 rounded-lg text-xs font-medium hover:bg-purple-100 border border-purple-200">
                ➕ Service
              </button>
              <button onClick={() => setShowReschedule(true)}
                className="flex-1 border py-2 rounded-lg text-xs font-medium hover:bg-gray-50">📅 Reschedule</button>
              <button onClick={() => handleStatus('completed')} disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50">✅ Complete</button>
              <button onClick={() => { if (confirm('Cancel this booking?')) handleStatus('cancelled') }} disabled={saving}
                className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-xs font-medium hover:bg-red-100 disabled:opacity-50">❌ Cancel</button>
            </div>
          )}
          {status === 'completed' && !showReschedule && !showAddService && (
            <button onClick={() => handleStatus('confirmed')} disabled={saving}
              className="w-full border py-2 rounded-xl text-sm font-medium hover:bg-white">🔄 Restore</button>
          )}
          {status === 'cancelled' && !showReschedule && !showAddService && (
            <button onClick={() => handleStatus('confirmed')} disabled={saving}
              className="w-full border py-2 rounded-xl text-sm font-medium hover:bg-white">🔄 Restore</button>
          )}
          <button onClick={onClose} className="w-full mt-2 border py-2 rounded-xl text-sm font-medium hover:bg-gray-100 text-gray-500">✕ Close</button>
        </div>
      </div>
    </div>
  )
}

export default function Calendar() {
  const { t } = useI18n()
  const [date, setDate] = useState(todayNZ())
  const [staffList, setStaffList] = useState([])
  const [appointments, setAppointments] = useState([])
  const [services, setServices] = useState([])
  const [selectedStaff, setSelectedStaff] = useState('')
  const [showAllDates, setShowAllDates] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedAppt, setSelectedAppt] = useState(null)
  const [dragAppt, setDragAppt] = useState(null)
  const [dragLunch, setDragLunch] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const [lunchBreaks, setLunchBreaks] = useState(loadLunchBreaks)
  const [now, setNow] = useState(new Date())
  const scrollRef = useRef(null)
  const calendarRef = useRef(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [mobileStaffIdx, setMobileStaffIdx] = useState(0)
  const mobileScrollRef = useRef(null)
  const isScrollingRef = useRef(false)

  // Track screen size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Load staff + services once
  useEffect(() => {
    Promise.all([api.getStaff(), api.getServices()]).then(([st, sv]) => {
      setStaffList(st)
      setServices(sv)
    }).catch(console.error)
  }, [])

  // Save lunch breaks when changed
  useEffect(() => { saveLunchBreaks(lunchBreaks) }, [lunchBreaks])

  const loadAppts = useCallback(() => {
    setLoading(true)
    const p = {}
    if (!showAllDates) p.date = date
    if (selectedStaff) p.staff_id = selectedStaff
    api.getAppointments(p).then(d => { setAppointments(d); setLoading(false) }).catch(e => { console.error(e); setLoading(false) })
  }, [date, selectedStaff, showAllDates])

  useEffect(() => { loadAppts() }, [loadAppts])

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Auto-scroll to current time on load
  useEffect(() => {
    if (scrollRef.current && date === todayNZ()) {
      const nzNow = new Date(now.toLocaleString('en-US', { timeZone: TZ }))
      const minutes = nzNow.getHours() * 60 + nzNow.getMinutes()
      const pxFromTop = ((minutes - START_HOUR * 60) / SLOT_MIN) * SLOT_H
      const viewportH = scrollRef.current.clientHeight
      scrollRef.current.scrollTop = Math.max(0, pxFromTop - viewportH / 3)
    }
  }, [date, appointments])

  const timeLabels = Array.from({ length: totalSlots }, (_, i) => {
    const m = START_HOUR * 60 + i * SLOT_MIN
    const h = Math.floor(m / 60)
    return m % 60 === 0 ? `${h}:00` : ''
  })

  // Mobile: show all staff as swipeable cards; Desktop: show all or filtered
  const staff = isMobile
    ? staffList
    : (selectedStaff ? staffList.filter(s => s.id == selectedStaff) : staffList)
  const colorMap = {}
  staffList.forEach((s, i) => { colorMap[s.id] = STAFF_COLORS[i % STAFF_COLORS.length] })

  // Sync mobile scroll to mobileStaffIdx
  const scrollToStaffIdx = useCallback((idx) => {
    if (!mobileScrollRef.current) return
    const container = mobileScrollRef.current
    const cardWidth = container.clientWidth
    isScrollingRef.current = true
    container.scrollTo({ left: cardWidth * idx, behavior: 'smooth' })
    setMobileStaffIdx(idx)
    setTimeout(() => { isScrollingRef.current = false }, 400)
  }, [])

  // Handle scroll end to update index
  const handleMobileScroll = useCallback(() => {
    if (isScrollingRef.current || !mobileScrollRef.current) return
    const container = mobileScrollRef.current
    const cardWidth = container.clientWidth
    const newIdx = Math.round(container.scrollLeft / cardWidth)
    if (newIdx !== mobileStaffIdx && newIdx >= 0 && newIdx < staffList.length) {
      setMobileStaffIdx(newIdx)
    }
  }, [mobileStaffIdx, staffList.length])

  const dates = showAllDates ? [...new Set(appointments.map(a => nzDateStr(a.start_time)))].sort() : [date]
  const getAppts = (sid, d) => appointments.filter(a => a.staff_id == sid && nzDateStr(a.start_time) === d)

  const blockStyle = (a) => {
    const s = nzParts(a.start_time), e = nzParts(a.end_time)
    const top = ((s.hour - START_HOUR) * 60 + s.minute) / SLOT_MIN * SLOT_H
    const h = Math.max(((e.hour - s.hour) * 60 + e.minute - s.minute) / SLOT_MIN * SLOT_H, SLOT_H)
    return { top: `${top}px`, height: `${h}px` }
  }

  const lunchStyle = (lunch) => {
    const top = (lunch.start - START_HOUR * 60) / SLOT_MIN * SLOT_H
    const h = Math.max((lunch.end - lunch.start) / SLOT_MIN * SLOT_H, SLOT_H)
    return { top: `${top}px`, height: `${h}px` }
  }

  // Drag handlers for appointments
  const handleDragStart = (e, appt) => {
    setDragAppt(appt)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', appt.id)
    e.currentTarget.style.opacity = '0.4'
  }

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1'
    setDragAppt(null)
    setDragLunch(null)
    setDragOver(null)
  }

  // Drag handlers for lunch breaks
  const handleLunchDragStart = (e, staffId, dateStr) => {
    setDragLunch({ staffId, date: dateStr })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', 'lunch')
    e.currentTarget.style.opacity = '0.4'
  }

  const handleLunchDragEnd = (e) => {
    e.currentTarget.style.opacity = '1'
    setDragLunch(null)
    setDragOver(null)
  }

  const handleDragOver = (e, staffId, dateStr) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver({ staffId, date: dateStr })
  }

  const handleDrop = async (e, targetStaffId, targetDate) => {
    e.preventDefault()
    setDragOver(null)

    // Calculate new start time based on drop position
    const rect = e.currentTarget.getBoundingClientRect()
    const relY = e.clientY - rect.top
    const slotIndex = Math.floor(relY / SLOT_H)
    const minutes = START_HOUR * 60 + slotIndex * SLOT_MIN

    // Handle lunch break drop
    if (dragLunch) {
      const lunch = getLunchBreak(lunchBreaks, dragLunch.staffId, dragLunch.date)
      const duration = lunch.end - lunch.start
      const newLunch = { start: minutes, end: minutes + duration }
      const key = `${targetStaffId}_${targetDate}`
      setLunchBreaks(prev => ({ ...prev, [key]: newLunch }))
      setDragLunch(null)
      return
    }

    // Handle appointment drop
    if (!dragAppt) return

    const h = Math.floor(minutes / 60)
    const m = minutes % 60

    // Parse date parts from YYYY-MM-DD
    const [yr, mo, dy] = targetDate.split('-').map(Number)
    // Create UTC date then offset by NZ timezone
    // NZ is UTC+12 (or +13 during DST), so subtract offset to get UTC
    const tempDate = new Date(Date.UTC(yr, mo - 1, dy, h, m, 0))
    // Get NZ offset for this date
    const nzOffset = new Date(tempDate.toLocaleString('en-US', { timeZone: 'UTC' })).getTime() - new Date(tempDate.toLocaleString('en-US', { timeZone: TZ })).getTime()
    const utcStart = new Date(tempDate.getTime() + nzOffset)
    const dur = new Date(dragAppt.end_time) - new Date(dragAppt.start_time)
    const utcEnd = new Date(utcStart.getTime() + dur)

    try {
      await api.updateAppointment(dragAppt.id, {
        staff_id: targetStaffId,
        start_time: utcStart.toISOString(),
        end_time: utcEnd.toISOString()
      })
      loadAppts()
    } catch (err) {
      alert(err.message)
    }
    setDragAppt(null)
  }

  return (
    <div className="w-full px-2 pt-2 pb-6">
      {/* Mobile: compact date controls */}
      {isMobile && !showAllDates && (
        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => setShowAllDates(true)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 text-xs" title="All dates">📅</button>
          <div className="flex-1 flex items-center justify-between bg-white rounded-xl shadow-sm border px-3 py-2">
            <button onClick={() => setDate(shiftDateNZ(date, -1))} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 text-lg">←</button>
            <button onClick={() => setDate(todayNZ())} className="text-center">
              <div className="font-bold text-sm text-gray-800">{fmtDateLabel(date)}</div>
              <div className="text-[10px] text-pink-500 font-medium">Today</div>
            </button>
            <button onClick={() => setDate(shiftDateNZ(date, 1))} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 text-lg">→</button>
          </div>
        </div>
      )}
      {isMobile && showAllDates && (
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setShowAllDates(false)} className="text-xs text-pink-600 bg-pink-50 px-3 py-1.5 rounded-full">📅 Single Day</button>
          <span className="text-xs text-gray-400">All dates</span>
        </div>
      )}

      {/* Desktop: full controls */}
      {!isMobile && (
        <>
          <div className="flex items-center gap-2 md:gap-4 mb-4 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold">📅 {t('calendar')}</h1>
            <div className="h-6 w-px bg-gray-300 hidden md:block" />
            <label className="flex items-center gap-1.5 text-sm md:text-base cursor-pointer select-none">
              <input type="checkbox" checked={showAllDates} onChange={e => setShowAllDates(e.target.checked)} className="rounded border-gray-300 w-4 h-4" />
              All dates
            </label>
            {!showAllDates && <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border rounded-lg px-2 md:px-3 py-1.5 text-sm md:text-base" />}
            <select value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)} className="border rounded-lg px-3 py-1.5 text-base">
              <option value="">{t('allStaff')}</option>
              {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {!showAllDates && (
              <div className="flex gap-1 ml-auto">
                <button onClick={() => setDate(shiftDateNZ(date, -1))} className="border px-3 py-1.5 rounded-lg text-base hover:bg-gray-50">←</button>
                <button onClick={() => setDate(todayNZ())} className="border px-3 py-1.5 rounded-lg text-base hover:bg-gray-50 font-medium">{t('today')}</button>
                <button onClick={() => setDate(shiftDateNZ(date, 1))} className="border px-3 py-1.5 rounded-lg text-base hover:bg-gray-50">→</button>
              </div>
            )}
            {loading && <span className="text-sm text-gray-400">Loading...</span>}
          </div>

          {staff.length > 1 && (
            <div className="flex gap-5 mb-3 flex-wrap">
              {staff.map(s => { const c = colorMap[s.id]; return <div key={s.id} className="flex items-center gap-2 text-sm text-gray-600"><span className={`w-3 h-3 rounded-full ${c.dot}`} />{s.name}</div> })}
            </div>
          )}
        </>
      )}

      {/* Mobile swipeable card indicator */}
      {isMobile && staffList.length > 1 && (
        <div className="flex flex-col items-center gap-2 mb-3">
          <div className="flex items-center gap-2 bg-white rounded-full shadow-sm border px-4 py-2">
            <span className={`w-3 h-3 rounded-full ${colorMap[staffList[mobileStaffIdx]?.id]?.dot || 'bg-gray-400'}`} />
            <span className="font-semibold text-gray-800 text-sm">{staffList[mobileStaffIdx]?.name}</span>
            <span className="text-xs text-gray-400">({mobileStaffIdx + 1}/{staffList.length})</span>
          </div>
          <div className="flex gap-1.5">
            {staffList.map((s, i) => (
              <button
                key={s.id}
                onClick={() => scrollToStaffIdx(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === mobileStaffIdx
                    ? 'w-6 h-2 bg-gray-800'
                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {dates.map(d => (
        <div key={d} className="mb-4">
          <h2 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide hidden md:block">{fmtDateLabel(d)}</h2>

          {/* Mobile: swipeable full-screen cards */}
          {isMobile && (
            <div
              ref={mobileScrollRef}
              onScroll={handleMobileScroll}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              {staff.map(s => {
                const c = colorMap[s.id]
                const appts = getAppts(s.id, d)
                const lunch = getLunchBreak(lunchBreaks, s.id, d)
                const ls = lunchStyle(lunch)

                // Current time position
                const nzNow = new Date(now.toLocaleString('en-US', { timeZone: TZ }))
                const minutes = nzNow.getHours() * 60 + nzNow.getMinutes()
                const topPx = ((minutes - START_HOUR * 60) / SLOT_MIN) * SLOT_H
                const showTimeLine = date === todayNZ() && topPx >= 0 && topPx <= gridH

                return (
                  <div
                    key={s.id}
                    className="snap-start flex-shrink-0 w-full"
                    style={{ width: '100vw', maxWidth: '100%' }}
                  >
                    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden mx-1">
                      {/* Staff header card */}
                      <div className={`px-4 py-3 flex items-center gap-3 border-b ${c.bg}`}>
                        <div className={`w-10 h-10 rounded-full ${c.dot} flex items-center justify-center text-white font-bold text-lg`}>
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className={`font-bold text-base ${c.text}`}>{s.name}</div>
                          <div className="text-xs text-gray-500">{appts.length} booking{appts.length !== 1 ? 's' : ''} today</div>
                        </div>
                      </div>

                      {/* Time grid */}
                      <div className="relative" ref={scrollRef} style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
                        <div className="flex" style={{ height: `${gridH}px` }}>
                          {/* Time column */}
                          <div className="w-[48px] shrink-0 relative">
                            {timeLabels.map((label, i) => (
                              <div key={i} className="absolute w-full flex items-start justify-end pr-1" style={{ top: `${i * SLOT_H}px`, height: `${SLOT_H}px` }}>
                                {label && <span className="text-[10px] text-gray-400 -mt-2">{label}</span>}
                              </div>
                            ))}
                          </div>

                          {/* Single staff column */}
                          <div
                            className="flex-1 relative border-l"
                            onDragOver={(e) => handleDragOver(e, s.id, d)}
                            onDragLeave={() => setDragOver(null)}
                            onDrop={(e) => handleDrop(e, s.id, d)}
                          >
                            {Array.from({ length: totalSlots }, (_, i) => (
                              <div key={i} className="absolute w-full border-b border-gray-100" style={{ top: `${i * SLOT_H}px`, height: `${SLOT_H}px` }} />
                            ))}

                            {/* Lunch break */}
                            {!dragAppt && (
                              <div
                                draggable
                                onDragStart={(e) => handleLunchDragStart(e, s.id, d)}
                                onDragEnd={handleLunchDragEnd}
                                className="absolute left-1 right-1 rounded px-1.5 py-1 overflow-hidden text-xs leading-tight border cursor-grab active:cursor-grabbing hover:brightness-95 transition bg-gray-200 border-gray-300 text-gray-600 z-10"
                                style={ls}
                              >
                                <div className="font-semibold truncate text-sm">🍽️ Lunch</div>
                                <div className="truncate opacity-80 text-xs">{Math.floor(lunch.start / 60)}:{String(lunch.start % 60).padStart(2, '0')} - {Math.floor(lunch.end / 60)}:{String(lunch.end % 60).padStart(2, '0')}</div>
                              </div>
                            )}

                            {/* Current time line */}
                            {showTimeLine && (
                              <div className="absolute left-0 right-0 z-30 pointer-events-none" style={{ top: `${topPx}px` }}>
                                <div className="flex items-center">
                                  <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
                                  <div className="flex-1 h-[2px] bg-red-500" />
                                </div>
                              </div>
                            )}

                            {/* Appointment blocks */}
                            {appts.map(a => {
                              const st = blockStyle(a)
                              return (
                                <div
                                  key={a.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, a)}
                                  onDragEnd={handleDragEnd}
                                  className={`absolute left-1.5 right-1.5 rounded-lg px-2 py-1.5 overflow-hidden text-xs leading-tight border cursor-pointer active:scale-[0.98] transition ${c.bg} ${c.border} ${c.text} ${a.status === 'cancelled' ? 'opacity-40 line-through' : ''} ${a.status === 'completed' ? 'opacity-60' : ''} ${a.status === 'checked_in' ? 'ring-2 ring-yellow-400' : ''}`}
                                  style={{ ...st, zIndex: 20 }}
                                  onClick={() => { if (!dragAppt && !dragLunch) setSelectedAppt(a) }}
                                >
                                  <div className="font-semibold truncate text-sm">{a.customer_name}</div>
                                  {parseInt(st.height) > 35 && <div className="truncate opacity-80 text-xs">{a.service_name}</div>}
                                  {parseInt(st.height) > 55 && <div className="opacity-60 text-xs">{nzTimeStr(a.start_time)}-{nzTimeStr(a.end_time)}</div>}
                                  {a.status === 'checked_in' && parseInt(st.height) > 35 && <div className="text-xs font-bold text-yellow-600">✋ CHECKED IN</div>}
                                </div>
                              )
                            })}

                            {appts.length === 0 && !showAllDates && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-sm text-gray-300">No bookings</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Desktop: grid view (unchanged) */}
          {!isMobile && (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden" ref={calendarRef}>
              <div className="overflow-x-auto">
                <div style={{ minWidth: `${52 + staff.length * 150}px` }}>
                  {/* Header row */}
                  <div className="flex border-b bg-gray-50">
                    <div className="w-[52px] shrink-0" style={{ height: `${HEADER_H}px` }} />
                    {staff.map(s => {
                      const c = colorMap[s.id]
                      return (
                        <div key={s.id} className="flex-1 border-l flex items-center justify-center gap-1" style={{ height: `${HEADER_H}px` }}>
                          <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                          <span className="text-sm font-medium text-gray-700 truncate">{s.name}</span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Grid body */}
                  <div className="flex" ref={scrollRef} style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                    {/* Time column */}
                    <div className="w-[52px] shrink-0 relative" style={{ height: `${gridH}px` }}>
                      {timeLabels.map((label, i) => (
                        <div key={i} className="absolute w-full flex items-start justify-end pr-1.5" style={{ top: `${i * SLOT_H}px`, height: `${SLOT_H}px` }}>
                          {label && <span className="text-xs text-gray-400 -mt-2">{label}</span>}
                        </div>
                      ))}
                    </div>

                    {/* Staff columns container */}
                    <div className="flex-1 flex relative" style={{ overflow: 'hidden' }}>
                      {staff.map(s => {
                        const c = colorMap[s.id]
                        const appts = getAppts(s.id, d)
                        const lunch = getLunchBreak(lunchBreaks, s.id, d)
                        const ls = lunchStyle(lunch)
                        const isDragOver = dragOver?.staffId === s.id && dragOver?.date === d

                        const nzNow = new Date(now.toLocaleString('en-US', { timeZone: TZ }))
                        const minutes = nzNow.getHours() * 60 + nzNow.getMinutes()
                        const topPx = ((minutes - START_HOUR * 60) / SLOT_MIN) * SLOT_H
                        const showTimeLine = date === todayNZ() && topPx >= 0 && topPx <= gridH

                        return (
                          <div
                            key={s.id}
                            className={`relative border-l transition-colors overflow-hidden ${isDragOver ? 'bg-pink-50' : ''}`}
                            style={{ height: `${gridH}px`, width: 0, minWidth: '150px', flex: 1 }}
                            onDragOver={(e) => handleDragOver(e, s.id, d)}
                            onDragLeave={() => setDragOver(null)}
                            onDrop={(e) => handleDrop(e, s.id, d)}
                          >
                            {Array.from({ length: totalSlots }, (_, i) => (
                              <div key={i} className="absolute w-full border-b border-gray-100" style={{ top: `${i * SLOT_H}px`, height: `${SLOT_H}px` }} />
                            ))}

                            {!dragAppt && (
                              <div
                                draggable
                                onDragStart={(e) => handleLunchDragStart(e, s.id, d)}
                                onDragEnd={handleLunchDragEnd}
                                className="absolute left-1 right-1 rounded px-1.5 py-1 overflow-hidden text-xs leading-tight border cursor-grab active:cursor-grabbing hover:brightness-95 transition bg-gray-200 border-gray-300 text-gray-600 z-10"
                                style={ls}
                                title={`Lunch break\n${Math.floor(lunch.start / 60)}:${String(lunch.start % 60).padStart(2, '0')} - ${Math.floor(lunch.end / 60)}:${String(lunch.end % 60).padStart(2, '0')}`}
                              >
                                <div className="font-semibold truncate text-sm">🍽️ Lunch</div>
                                <div className="truncate opacity-80 text-xs">{Math.floor(lunch.start / 60)}:{String(lunch.start % 60).padStart(2, '0')} - {Math.floor(lunch.end / 60)}:{String(lunch.end % 60).padStart(2, '0')}</div>
                              </div>
                            )}

                            {showTimeLine && (
                              <div className="absolute left-0 right-0 z-30 pointer-events-none" style={{ top: `${topPx}px` }}>
                                <div className="flex items-center">
                                  <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
                                  <div className="flex-1 h-[2px] bg-red-500" />
                                </div>
                              </div>
                            )}

                            {appts.map(a => {
                              const st = blockStyle(a)
                              return (
                                <div
                                  key={a.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, a)}
                                  onDragEnd={handleDragEnd}
                                  className={`absolute left-1 right-1 rounded px-1.5 py-1 overflow-hidden text-xs leading-tight border cursor-grab active:cursor-grabbing hover:brightness-95 transition ${c.bg} ${c.border} ${c.text} ${a.status === 'cancelled' ? 'opacity-40 line-through' : ''} ${a.status === 'completed' ? 'opacity-60' : ''} ${a.status === 'checked_in' ? 'ring-2 ring-yellow-400' : ''}`}
                                  style={{ ...st, zIndex: 20 }}
                                  onClick={(e) => { if (!dragAppt && !dragLunch) setSelectedAppt(a) }}
                                  title={`${a.customer_name} — ${a.service_name}\n${nzTimeStr(a.start_time)} - ${nzTimeStr(a.end_time)}`}
                                >
                                  <div className="font-semibold truncate text-sm">{a.customer_name}</div>
                                  {parseInt(st.height) > 30 && <div className="truncate opacity-80 text-xs">{a.service_name}</div>}
                                  {parseInt(st.height) > 50 && <div className="opacity-60 text-xs">{nzTimeStr(a.start_time)}-{nzTimeStr(a.end_time)}</div>}
                                  {a.status === 'checked_in' && parseInt(st.height) > 30 && <div className="text-xs font-bold text-yellow-600">✋ CHECKED IN</div>}
                                </div>
                              )
                            })}

                            {appts.length === 0 && !showAllDates && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-sm text-gray-300">No bookings</span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {dates.length === 0 && <div className="text-center py-12 text-gray-400">No bookings found</div>}

      {selectedAppt && (
        <BookingModal
          appt={selectedAppt}
          services={services}
          onClose={() => setSelectedAppt(null)}
          onUpdate={() => { loadAppts(); setSelectedAppt(null) }}
        />
      )}
    </div>
  )
}

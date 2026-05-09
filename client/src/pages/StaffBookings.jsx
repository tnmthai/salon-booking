import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../utils/api'

const TZ = 'Pacific/Auckland'

const statusColors = {
  confirmed: 'bg-green-100 text-green-700 border-green-200',
  completed: 'bg-blue-100 text-blue-700 border-blue-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
}

const statusDot = {
  confirmed: 'bg-green-500',
  completed: 'bg-blue-500',
  cancelled: 'bg-red-500',
}

export default function StaffBookings() {
  const { staffId } = useParams()
  const [staff, setStaff] = useState(null)
  const [appts, setAppts] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('week') // day, week, month, year
  const [date, setDate] = useState(() => {
    const now = new Date()
    return now.toLocaleDateString('en-CA', { timeZone: TZ }) // YYYY-MM-DD
  })

  useEffect(() => {
    api.getStaff().then(list => {
      const s = list.find(x => String(x.id) === String(staffId))
      if (s) setStaff(s)
    }).catch(console.error)
  }, [staffId])

  useEffect(() => {
    setLoading(true)
    api.getAppointments({ staff_id: staffId })
      .then(data => {
        setAppts(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [staffId])

  // Filter appointments by date range
  const getDateRange = () => {
    const d = new Date(date + 'T00:00:00')
    const start = new Date(d)
    const end = new Date(d)

    if (view === 'day') {
      return { start, end }
    } else if (view === 'week') {
      const day = start.getDay()
      const diff = day === 0 ? 6 : day - 1 // Monday start
      start.setDate(start.getDate() - diff)
      end.setDate(start.getDate() + 6)
    } else if (view === 'month') {
      start.setDate(1)
      end.setMonth(end.getMonth() + 1, 0)
    } else {
      start.setMonth(0, 1)
      end.setMonth(12, 0)
    }
    return { start, end }
  }

  const { start: rangeStart, end: rangeEnd } = getDateRange()
  rangeStart.setHours(0, 0, 0, 0)
  rangeEnd.setHours(23, 59, 59, 999)

  const filtered = appts.filter(a => {
    const d = new Date(a.start_time)
    return d >= rangeStart && d <= rangeEnd
  }).sort((a, b) => new Date(a.start_time) - new Date(b.start_time))

  // Group by date
  const grouped = {}
  filtered.forEach(a => {
    const d = new Date(a.start_time).toLocaleDateString('en-NZ', {
      timeZone: TZ, weekday: 'long', month: 'long', day: 'numeric'
    })
    if (!grouped[d]) grouped[d] = []
    grouped[d].push(a)
  })

  // Stats
  const totalRevenue = filtered.reduce((s, a) => s + parseFloat(a.price || 0), 0)
  const confirmed = filtered.filter(a => a.status === 'confirmed').length
  const completed = filtered.filter(a => a.status === 'completed').length

  const navigateDate = (dir) => {
    const d = new Date(date + 'T00:00:00')
    if (view === 'day') d.setDate(d.getDate() + dir)
    else if (view === 'week') d.setDate(d.getDate() + dir * 7)
    else if (view === 'month') d.setMonth(d.getMonth() + dir)
    else d.setFullYear(d.getFullYear() + dir)
    setDate(d.toLocaleDateString('en-CA', { timeZone: TZ }))
  }

  const rangeLabel = () => {
    if (view === 'day') {
      return new Date(date + 'T00:00:00').toLocaleDateString('en-NZ', {
        timeZone: TZ, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
      })
    } else if (view === 'week') {
      const s = rangeStart.toLocaleDateString('en-NZ', { timeZone: TZ, month: 'short', day: 'numeric' })
      const e = rangeEnd.toLocaleDateString('en-NZ', { timeZone: TZ, month: 'short', day: 'numeric', year: 'numeric' })
      return `${s} – ${e}`
    } else if (view === 'month') {
      return new Date(date + 'T00:00:00').toLocaleDateString('en-NZ', { timeZone: TZ, month: 'long', year: 'numeric' })
    } else {
      return date.substring(0, 4)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/staff" className="text-gray-400 hover:text-gray-600 text-sm">← Staff</Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-lg font-bold text-purple-600">
            {staff?.name?.charAt(0) || '?'}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{staff?.name || 'Loading...'}</h1>
            <p className="text-sm text-gray-500">{staff?.role}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* View toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['day', 'week', 'month', 'year'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${view === v ? 'bg-white shadow text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          {/* Date navigation */}
          <div className="flex items-center gap-3">
            <button onClick={() => navigateDate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">◀</button>
            <span className="font-medium text-sm min-w-[200px] text-center">{rangeLabel()}</span>
            <button onClick={() => navigateDate(1)} className="p-2 hover:bg-gray-100 rounded-lg">▶</button>
            <button onClick={() => setDate(new Date().toLocaleDateString('en-CA', { timeZone: TZ }))}
              className="text-xs text-purple-600 hover:underline ml-2">Today</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{filtered.length}</div>
          <div className="text-xs text-gray-500">Bookings</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{completed}/{confirmed + completed}</div>
          <div className="text-xs text-gray-500">Completed</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-2xl font-bold text-pink-600">${totalRevenue.toFixed(0)}</div>
          <div className="text-xs text-gray-500">Revenue</div>
        </div>
      </div>

      {/* Bookings list */}
      {loading && <div className="text-center py-12 text-gray-400">Loading...</div>}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-2">📭</div>
          <div>No bookings found for this period</div>
        </div>
      )}
      {Object.entries(grouped).map(([dateLabel, items]) => (
        <div key={dateLabel} className="mb-6">
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{dateLabel}</div>
          <div className="space-y-2">
            {items.map(a => (
              <div key={a.id} className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4 hover:shadow-md transition">
                <div className="text-sm font-mono w-28 shrink-0">
                  {new Date(a.start_time).toLocaleTimeString('en-NZ', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })}
                  {' – '}
                  {new Date(a.end_time).toLocaleTimeString('en-NZ', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className={`w-2 h-2 rounded-full shrink-0 ${statusDot[a.status] || 'bg-gray-400'}`}></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{a.customer_name}</div>
                  <div className="text-xs text-gray-400">{a.service_name}</div>
                </div>
                <div className="text-sm font-medium text-gray-600">${a.price}</div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border shrink-0 ${statusColors[a.status] || 'bg-gray-100 text-gray-600'}`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

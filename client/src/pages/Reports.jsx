import { useState, useEffect } from 'react'
import { api } from '../utils/api'

export default function Reports() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [salons, setSalons] = useState([])
  const [filters, setFilters] = useState({
    from: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
    salon_id: '',
  })

  useEffect(() => {
    api.getSalons().then(setSalons).catch(console.error)
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = { from: filters.from, to: filters.to }
    if (filters.salon_id) params.salon_id = filters.salon_id
    api.getReportStats(params)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [filters])

  const fmt = (n) => Number(n || 0).toLocaleString('en-NZ', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  const fmtCurrency = (n) => '$' + Number(n || 0).toLocaleString('en-NZ', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  const pct = (n, total) => total > 0 ? Math.round((n / total) * 100) : 0

  const s = data?.summary || {}
  const total = Number(s.total_bookings || 0)
  const completionRate = pct(Number(s.completed), total)
  const cancellationRate = pct(Number(s.cancelled), total)

  // Max values for chart scaling
  const maxDaily = Math.max(...(data?.daily?.map(d => Number(d.total)) || [1]), 1)
  const maxHourly = Math.max(...(data?.hourly?.map(h => Number(h.booking_count)) || [1]), 1)
  const maxServiceBookings = Math.max(...(data?.services?.map(sv => Number(sv.booking_count)) || [1]), 1)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">📊 Reports & Analytics</h1>
        <div className="text-center py-20 text-gray-400">Loading report data...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">📊 Reports & Analytics</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
          <input type="date" value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
          <input type="date" value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm" />
        </div>
        {salons.length > 1 && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Shop</label>
            <select value={filters.salon_id} onChange={e => setFilters({ ...filters, salon_id: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm">
              <option value="">All Shops</option>
              {salons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}
        <div className="flex gap-1 ml-auto">
          <button onClick={() => setFilters({ ...filters, from: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0] })}
            className="border px-3 py-2 rounded-lg text-sm hover:bg-gray-50">7 Days</button>
          <button onClick={() => setFilters({ ...filters, from: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0] })}
            className="border px-3 py-2 rounded-lg text-sm hover:bg-gray-50">30 Days</button>
          <button onClick={() => setFilters({ ...filters, from: new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0] })}
            className="border px-3 py-2 rounded-lg text-sm hover:bg-gray-50">90 Days</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <Card label="Total Bookings" value={fmt(total)} color="pink" />
        <Card label="Revenue" value={fmtCurrency(s.total_revenue)} color="green" />
        <Card label="Confirmed" value={fmt(s.confirmed)} color="blue" />
        <Card label="Completed" value={fmt(s.completed)} color="indigo" />
        <Card label="Cancelled" value={fmt(s.cancelled)} color="red" />
        <Card label="Unique Customers" value={fmt(s.unique_customers)} color="purple" />
      </div>

      {/* Completion / Cancellation Rates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold mb-3">Completion Rate</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
              <div className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2 text-xs text-white font-medium transition-all"
                style={{ width: `${completionRate}%` }}>
                {completionRate > 10 && `${completionRate}%`}
              </div>
            </div>
            <span className="text-lg font-bold text-green-600">{completionRate}%</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold mb-3">Cancellation Rate</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
              <div className="bg-red-400 h-6 rounded-full flex items-center justify-end pr-2 text-xs text-white font-medium transition-all"
                style={{ width: `${cancellationRate}%` }}>
                {cancellationRate > 10 && `${cancellationRate}%`}
              </div>
            </div>
            <span className="text-lg font-bold text-red-500">{cancellationRate}%</span>
          </div>
        </div>
      </div>

      {/* Daily Bookings Chart */}
      {data?.daily?.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h3 className="font-semibold mb-4">📅 Daily Bookings</h3>
          <div className="flex items-end gap-1 h-48 overflow-x-auto pb-2">
            {data.daily.map((d, i) => (
              <div key={i} className="flex flex-col items-center flex-1 min-w-[28px]">
                <div className="text-xs text-gray-400 mb-1">{Number(d.total) > 0 ? Number(d.total) : ''}</div>
                <div className="w-full flex flex-col justify-end" style={{ height: '160px' }}>
                  {Number(d.cancelled) > 0 && (
                    <div className="bg-red-300 w-full rounded-t-sm" style={{ height: `${(Number(d.cancelled) / maxDaily) * 160}px` }} title={`Cancelled: ${d.cancelled}`} />
                  )}
                  {Number(d.completed) > 0 && (
                    <div className="bg-indigo-400 w-full" style={{ height: `${(Number(d.completed) / maxDaily) * 160}px` }} title={`Completed: ${d.completed}`} />
                  )}
                  {Number(d.confirmed) > 0 && (
                    <div className="bg-blue-400 w-full rounded-b-sm" style={{ height: `${(Number(d.confirmed) / maxDaily) * 160}px` }} title={`Confirmed: ${d.confirmed}`} />
                  )}
                </div>
                <div className="text-[10px] text-gray-400 mt-1 -rotate-45 origin-top-left whitespace-nowrap">
                  {new Date(d.date).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4 justify-center text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-400 rounded-sm" /> Confirmed</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-indigo-400 rounded-sm" /> Completed</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-300 rounded-sm" /> Cancelled</span>
          </div>
        </div>
      )}

      {/* Peak Hours */}
      {data?.hourly?.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h3 className="font-semibold mb-4">⏰ Peak Hours</h3>
          <div className="flex items-end gap-1 h-32">
            {Array.from({ length: 12 }, (_, i) => i + 8).map(hour => {
              const entry = data.hourly.find(h => Number(h.hour) === hour)
              const count = entry ? Number(entry.booking_count) : 0
              return (
                <div key={hour} className="flex-1 flex flex-col items-center">
                  <div className="text-[10px] text-gray-400 mb-1">{count > 0 ? count : ''}</div>
                  <div className="w-full bg-pink-400 rounded-t" style={{ height: `${(count / maxHourly) * 100}px`, minHeight: count > 0 ? '4px' : '0' }} />
                  <div className="text-[10px] text-gray-500 mt-1">{hour}:00</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Top Services */}
        {data?.services?.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold mb-4">💅 Top Services</h3>
            <div className="space-y-3">
              {data.services.map((sv, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{sv.service_name}</span>
                    <span className="text-gray-500">{sv.booking_count} bookings · {fmtCurrency(sv.revenue)}</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div className="bg-pink-500 h-3 rounded-full" style={{ width: `${(Number(sv.booking_count) / maxServiceBookings) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Staff Performance */}
        {data?.staff?.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold mb-4">👥 Staff Performance</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Staff</th>
                  <th className="pb-2 text-center">Bookings</th>
                  <th className="pb-2 text-center">Completed</th>
                  <th className="pb-2 text-center">Cancelled</th>
                  <th className="pb-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.staff.map((st, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 font-medium">{st.staff_name}</td>
                    <td className="py-2 text-center">{st.booking_count}</td>
                    <td className="py-2 text-center text-green-600">{st.completed_count}</td>
                    <td className="py-2 text-center text-red-500">{st.cancelled_count}</td>
                    <td className="py-2 text-right font-medium">{fmtCurrency(st.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function Card({ label, value, color }) {
  const colors = {
    pink: 'text-pink-600',
    green: 'text-green-600',
    blue: 'text-blue-600',
    indigo: 'text-indigo-600',
    red: 'text-red-500',
    purple: 'text-purple-600',
  }
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className={`text-2xl font-bold ${colors[color] || 'text-gray-600'}`}>{value}</div>
      <div className="text-gray-500 text-xs mt-1">{label}</div>
    </div>
  )
}

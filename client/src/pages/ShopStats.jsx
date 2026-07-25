import { useState, useEffect } from 'react'
import { api } from '../utils/api'

const GROUP_OPTIONS = [
  { value: 'day', label: '📅 Ngày' },
  { value: 'week', label: '📆 Tuần' },
  { value: 'month', label: '📊 Tháng' },
  { value: 'quarter', label: '📈 Quý' },
  { value: 'year', label: '🗓 Năm' },
]

export default function ShopStats() {
  const [salons, setSalons] = useState([])
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    group_by: 'month',
    salon_id: '',
    from: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    api.getAdminSalons().then(setSalons).catch(console.error)
  }, [])

  useEffect(() => {
    if (!salons.length) return
    setLoading(true)
    const params = { group_by: filters.group_by, from: filters.from, to: filters.to }
    if (filters.salon_id) params.salon_id = filters.salon_id
    api.getShopStats(params)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [filters, salons])

  // Group data by salon
  const grouped = {}
  const salonOrder = []
  data.forEach(row => {
    if (!grouped[row.salon_id]) {
      grouped[row.salon_id] = { name: row.salon_name, slug: row.salon_slug, periods: [] }
      salonOrder.push(row.salon_id)
    }
    grouped[row.salon_id].periods.push(row)
  })

  // Totals per salon
  const salonTotals = salonOrder.map(id => {
    const periods = grouped[id].periods
    return {
      id,
      name: grouped[id].name,
      slug: grouped[id].slug,
      total: periods.reduce((s, p) => s + Number(p.total_bookings), 0),
      confirmed: periods.reduce((s, p) => s + Number(p.confirmed), 0),
      completed: periods.reduce((s, p) => s + Number(p.completed), 0),
      cancelled: periods.reduce((s, p) => s + Number(p.cancelled), 0),
      revenue: periods.reduce((s, p) => s + Number(p.revenue), 0),
    }
  })

  const fmt = (n) => Number(n || 0).toLocaleString('en-NZ')
  const fmtCurrency = (n) => '$' + Number(n || 0).toLocaleString('en-NZ', { minimumFractionDigits: 0 })

  const setQuickRange = (monthsBack) => {
    const d = new Date()
    d.setMonth(d.getMonth() - monthsBack)
    setFilters(prev => ({
      ...prev,
      from: d.toISOString().split('T')[0],
      to: new Date().toISOString().split('T')[0],
    }))
  }

  // Find max for bar scaling
  const allTotals = salonTotals.map(s => s.total)
  const maxTotal = Math.max(...allTotals, 1)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">📊 Thống kê bookings theo shop</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Shop</label>
          <select value={filters.salon_id} onChange={e => setFilters({ ...filters, salon_id: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm">
            <option value="">Tất cả shop</option>
            {salons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Nhóm theo</label>
          <select value={filters.group_by} onChange={e => setFilters({ ...filters, group_by: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm">
            {GROUP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Từ ngày</label>
          <input type="date" value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Đến ngày</label>
          <input type="date" value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="flex gap-1 ml-auto flex-wrap">
          <button onClick={() => setQuickRange(1)} className="border px-3 py-2 rounded-lg text-sm hover:bg-gray-50">1 tháng</button>
          <button onClick={() => setQuickRange(3)} className="border px-3 py-2 rounded-lg text-sm hover:bg-gray-50">3 tháng</button>
          <button onClick={() => setQuickRange(6)} className="border px-3 py-2 rounded-lg text-sm hover:bg-gray-50">6 tháng</button>
          <button onClick={() => setQuickRange(12)} className="border px-3 py-2 rounded-lg text-sm hover:bg-gray-50">12 tháng</button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Đang tải dữ liệu...</div>
      ) : salonTotals.length === 0 ? (
        <div className="text-center py-20 text-gray-400">Không có dữ liệu</div>
      ) : (
        <>
          {/* Summary cards per shop */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {salonTotals.map(s => (
              <div key={s.id} className="bg-white rounded-xl shadow p-4 border-t-4 border-pink-400">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-800">{s.name}</h3>
                  <span className="text-xs text-gray-400">#{s.id}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <div className="text-lg font-bold text-pink-600">{fmt(s.total)}</div>
                    <div className="text-gray-400 text-xs">Tổng</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">{fmt(s.completed)}</div>
                    <div className="text-gray-400 text-xs">Hoàn tất</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-500">{fmt(s.cancelled)}</div>
                    <div className="text-gray-400 text-xs">Hủy</div>
                  </div>
                </div>
                <div className="mt-2 text-right text-sm font-medium text-green-700">
                  {fmtCurrency(s.revenue)}
                </div>
              </div>
            ))}
          </div>

          {/* Bar chart: total bookings per shop */}
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h3 className="font-semibold mb-4">📊 Tổng bookings theo shop</h3>
            <div className="space-y-3">
              {salonTotals.map((s, i) => {
                const pct = Math.max((s.total / maxTotal) * 100, 1)
                return (
                  <div key={s.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{s.name}</span>
                      <span className="text-gray-500">{fmt(s.total)} bookings · {fmtCurrency(s.revenue)}</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-5 overflow-hidden flex">
                      {/* Confirmed */}
                      <div className="bg-blue-400 h-5 transition-all" style={{ width: `${(s.confirmed / maxTotal) * 100}%` }} title={`Confirmed: ${s.confirmed}`} />
                      {/* Completed */}
                      <div className="bg-green-400 h-5 transition-all" style={{ width: `${(s.completed / maxTotal) * 100}%` }} title={`Completed: ${s.completed}`} />
                      {/* Cancelled */}
                      <div className="bg-red-300 h-5 transition-all" style={{ width: `${(s.cancelled / maxTotal) * 100}%` }} title={`Cancelled: ${s.cancelled}`} />
                    </div>
                    <div className="flex gap-3 text-[10px] text-gray-400 mt-0.5">
                      <span>✅ {s.confirmed} confirmed</span>
                      <span>✅ {s.completed} completed</span>
                      <span>❌ {s.cancelled} cancelled</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Detailed table per shop */}
          {salonOrder.map(salonId => {
            const shop = grouped[salonId]
            return (
              <div key={salonId} className="bg-white rounded-xl shadow p-6 mb-6">
                <h3 className="font-semibold mb-1 text-lg">{shop.name}</h3>
                <p className="text-xs text-gray-400 mb-3">/{shop.slug}</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="pb-2 font-medium">Kỳ</th>
                        <th className="pb-2 text-center font-medium">Tổng</th>
                        <th className="pb-2 text-center font-medium">Confirmed</th>
                        <th className="pb-2 text-center font-medium">Completed</th>
                        <th className="pb-2 text-center font-medium">Cancelled</th>
                        <th className="pb-2 text-right font-medium">Doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shop.periods.map((row, i) => (
                        <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-2 font-medium">{row.period_label}</td>
                          <td className="py-2 text-center">{fmt(row.total_bookings)}</td>
                          <td className="py-2 text-center text-blue-600">{fmt(row.confirmed)}</td>
                          <td className="py-2 text-center text-green-600">{fmt(row.completed)}</td>
                          <td className="py-2 text-center text-red-500">{fmt(row.cancelled)}</td>
                          <td className="py-2 text-right font-medium">{fmtCurrency(row.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-200 font-bold text-gray-800">
                        <td className="py-2">Tổng</td>
                        <td className="py-2 text-center">{fmt(shop.periods.reduce((s, r) => s + Number(r.total_bookings), 0))}</td>
                        <td className="py-2 text-center text-blue-600">{fmt(shop.periods.reduce((s, r) => s + Number(r.confirmed), 0))}</td>
                        <td className="py-2 text-center text-green-600">{fmt(shop.periods.reduce((s, r) => s + Number(r.completed), 0))}</td>
                        <td className="py-2 text-center text-red-500">{fmt(shop.periods.reduce((s, r) => s + Number(r.cancelled), 0))}</td>
                        <td className="py-2 text-right">{fmtCurrency(shop.periods.reduce((s, r) => s + Number(r.revenue), 0))}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

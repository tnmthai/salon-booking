import { useState, useEffect } from 'react'
import { api } from '../utils/api'

export default function Dashboard() {
  const [tab, setTab] = useState('bookings')
  const [appts, setAppts] = useState([])
  const [customers, setCustomers] = useState([])
  const [stats, setStats] = useState({ services: 0, staff: 0, todayBookings: 0, totalBookings: 0 })
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0])
  const [filterStatus, setFilterStatus] = useState('')

  const loadAppts = () => {
    const params = { date: filterDate }
    if (filterStatus) params.status = filterStatus
    api.getAppointments(params).then(setAppts).catch(console.error)
  }

  const loadCustomers = () => {
    api.getCustomers().then(setCustomers).catch(console.error)
  }

  useEffect(() => {
    Promise.all([api.getServices(), api.getStaff()])
      .then(([services, staff]) => setStats({ services: services.length, staff: staff.length }))
      .catch(console.error)
    loadAppts()
    loadCustomers()
  }, [])

  useEffect(() => { loadAppts() }, [filterDate, filterStatus])

  const updateStatus = async (id, status) => {
    await api.updateAppointment(id, { status })
    loadAppts()
  }

  const statusColors = {
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700',
    pending: 'bg-yellow-100 text-yellow-700',
  }

  const tabs = [
    { id: 'bookings', label: '📅 Bookings', count: appts.length },
    { id: 'customers', label: '👥 Customers', count: customers.length },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-2xl font-bold text-pink-600">{stats.services}</div>
          <div className="text-gray-500 text-sm">Services</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.staff}</div>
          <div className="text-gray-500 text-sm">Staff</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-2xl font-bold text-green-600">{appts.filter(a => a.status === 'confirmed').length}</div>
          <div className="text-gray-500 text-sm">Confirmed</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-2xl font-bold text-gray-600">{customers.length}</div>
          <div className="text-gray-500 text-sm">Total Customers</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t.id ? 'bg-white shadow text-pink-600' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Bookings Tab */}
      {tab === 'bookings' && (
        <div>
          {/* Filters */}
          <div className="flex gap-3 mb-4 flex-wrap">
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm" />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm">
              <option value="">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="flex gap-1 ml-auto">
              {[-1, 0, 1].map(offset => {
                const d = new Date(filterDate)
                d.setDate(d.getDate() + offset)
                const label = offset === -1 ? '← Prev' : offset === 0 ? 'Today' : 'Next →'
                return (
                  <button key={offset} onClick={() => setFilterDate(d.toISOString().split('T')[0])}
                    className="border px-3 py-2 rounded-lg text-sm hover:bg-gray-50">{label}</button>
                )
              })}
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-gray-500">Time</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500">Customer</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500">Phone</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500">Service</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500">Staff</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500">Price</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appts.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-gray-400">No bookings found</td></tr>
                ) : appts.map(a => (
                  <tr key={a.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 text-sm">
                      <div className="font-medium">{new Date(a.start_time).toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="text-xs text-gray-400">{new Date(a.start_time).toLocaleDateString('en-NZ')}</div>
                    </td>
                    <td className="p-3 text-sm font-medium">{a.customer_name}</td>
                    <td className="p-3 text-sm text-gray-500">{a.customer_phone}</td>
                    <td className="p-3 text-sm">{a.service_name}</td>
                    <td className="p-3 text-sm text-pink-600">{a.staff_name}</td>
                    <td className="p-3 text-sm font-medium">${a.price}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[a.status] || 'bg-gray-100'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {a.status === 'confirmed' && (
                          <>
                            <button onClick={() => updateStatus(a.id, 'completed')}
                              className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">Complete</button>
                            <button onClick={() => updateStatus(a.id, 'cancelled')}
                              className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100">Cancel</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {tab === 'customers' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">Phone</th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">Email</th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">Notes</th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">No customers yet</td></tr>
              ) : customers.map(c => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 text-sm font-medium">{c.name}</td>
                  <td className="p-3 text-sm text-gray-500">{c.phone}</td>
                  <td className="p-3 text-sm text-gray-500">{c.email}</td>
                  <td className="p-3 text-sm text-gray-400">{c.notes}</td>
                  <td className="p-3 text-sm text-gray-400">{new Date(c.created_at).toLocaleDateString('en-NZ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

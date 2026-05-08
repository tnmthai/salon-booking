import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'

export default function Dashboard() {
  const [todayAppts, setTodayAppts] = useState([])
  const [stats, setStats] = useState({ services: 0, staff: 0, todayBookings: 0 })

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    Promise.all([api.getServices(), api.getStaff(), api.getAppointments({ date: today })])
      .then(([services, staff, appts]) => {
        setStats({ services: services.length, staff: staff.length })
        setTodayAppts(appts)
      })
      .catch(console.error)
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-3xl font-bold text-pink-600">{stats.services}</div>
          <div className="text-gray-500 text-sm">Services</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-3xl font-bold text-purple-600">{stats.staff}</div>
          <div className="text-gray-500 text-sm">Staff Members</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-3xl font-bold text-green-600">{todayAppts.length}</div>
          <div className="text-gray-500 text-sm">Today's Bookings</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">📅 Today's Schedule</h2>
        {todayAppts.length === 0 ? (
          <p className="text-gray-400">No bookings today</p>
        ) : (
          <div className="space-y-3">
            {todayAppts.map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium">{a.customer_name}</span>
                  <span className="text-gray-500 ml-2">— {a.service_name}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(a.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  {' → '}
                  {new Date(a.end_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  <span className="ml-2 text-pink-600">{a.staff_name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Link to="/admin/services" className="bg-white border px-6 py-3 rounded-xl hover:bg-gray-50 font-medium">Manage Services</Link>
        <Link to="/admin/staff" className="bg-white border px-6 py-3 rounded-xl hover:bg-gray-50 font-medium">Manage Staff</Link>
      </div>
    </div>
  )
}

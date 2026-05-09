import { useState, useEffect } from 'react'
import { api } from '../utils/api'

const TZ = 'Pacific/Auckland'

export default function StaffDashboard() {
  const [staffRecord, setStaffRecord] = useState(null)
  const [todayAppts, setTodayAppts] = useState([])
  const [upcomingAppts, setUpcomingAppts] = useState([])
  const [weekSchedule, setWeekSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('today')

  const today = new Date().toLocaleDateString('en-CA', { timeZone: TZ })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const staffList = await api.getStaff()
      const token = localStorage.getItem('salon_token')
      const payload = JSON.parse(atob(token.split('.')[1]))
      const me = staffList.find(s => s.user_id === payload.id)
      if (!me) {
        setLoading(false)
        return
      }
      setStaffRecord(me)

      // Load today's appointments
      const todayData = await api.getAppointments({ date: today, staff_id: me.id })
      setTodayAppts(todayData)

      // Load upcoming (next 7 days)
      const allAppts = await api.getAppointments({ staff_id: me.id })
      const now = new Date()
      const upcoming = allAppts.filter(a =>
        new Date(a.start_time) >= now && a.status === 'confirmed'
      ).sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
      setUpcomingAppts(upcoming)

      // Load working hours
      const wh = await api.getWorkingHours(me.id)
      const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const fullWeek = DAYS.map((name, i) => {
        const existing = wh.find(d => d.day_of_week === i)
        return { day: name, active: !!existing, start: existing?.start_time?.substring(0, 5), end: existing?.end_time?.substring(0, 5) }
      })
      setWeekSchedule(fullWeek)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const markCompleted = async (id) => {
    try {
      await api.completeAppointment(id)
      loadData()
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>
  if (!staffRecord) return <div className="p-8 text-center text-gray-400">No staff record found for your account.</div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">👋 {staffRecord.name}</h1>
        <p className="text-gray-500">{staffRecord.role || 'Staff'} · Your dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-2xl font-bold text-pink-600">{todayAppts.length}</div>
          <div className="text-gray-500 text-sm">Today's Bookings</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-2xl font-bold text-purple-600">{upcomingAppts.length}</div>
          <div className="text-gray-500 text-sm">Upcoming</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-2xl font-bold text-green-600">{todayAppts.filter(a => a.status === 'confirmed').length}</div>
          <div className="text-gray-500 text-sm">Confirmed Today</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        <button onClick={() => setTab('today')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'today' ? 'bg-white shadow text-pink-600' : 'text-gray-500'}`}>
          📅 Today
        </button>
        <button onClick={() => setTab('upcoming')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'upcoming' ? 'bg-white shadow text-pink-600' : 'text-gray-500'}`}>
          📆 Upcoming
        </button>
        <button onClick={() => setTab('schedule')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'schedule' ? 'bg-white shadow text-pink-600' : 'text-gray-500'}`}>
          🕐 My Schedule
        </button>
      </div>

      {/* Today's Bookings */}
      {tab === 'today' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-gray-500">Time</th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">Customer</th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">Service</th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">Price</th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {todayAppts.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-400">No bookings today</td></tr>
              ) : todayAppts.map(a => (
                <tr key={a.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 text-sm font-medium">
                    {new Date(a.start_time).toLocaleTimeString('en-NZ', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })}
                    {' – '}
                    {new Date(a.end_time).toLocaleTimeString('en-NZ', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-3 text-sm font-medium">{a.customer_name}</td>
                  <td className="p-3 text-sm">{a.service_name}</td>
                  <td className="p-3 text-sm font-medium">${a.price}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      a.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      a.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>{a.status}</span>
                  </td>
                  <td className="p-3">
                    {a.status === 'confirmed' && (
                      <button onClick={() => markCompleted(a.id)}
                        className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100">
                        ✅ Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upcoming */}
      {tab === 'upcoming' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-gray-500">Date</th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">Time</th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">Customer</th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">Service</th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">Price</th>
              </tr>
            </thead>
            <tbody>
              {upcomingAppts.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">No upcoming bookings</td></tr>
              ) : upcomingAppts.map(a => (
                <tr key={a.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 text-sm">
                    {new Date(a.start_time).toLocaleDateString('en-NZ', { timeZone: TZ, weekday: 'short', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="p-3 text-sm font-medium">
                    {new Date(a.start_time).toLocaleTimeString('en-NZ', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-3 text-sm font-medium">{a.customer_name}</td>
                  <td className="p-3 text-sm">{a.service_name}</td>
                  <td className="p-3 text-sm font-medium">${a.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Weekly Schedule */}
      {tab === 'schedule' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="grid grid-cols-1 divide-y">
            {weekSchedule.map((day, i) => (
              <div key={i} className={`flex items-center p-4 gap-4 ${day.active ? '' : 'bg-gray-50'}`}>
                <div className="w-16 font-medium text-gray-900">{day.day}</div>
                {day.active ? (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{day.start}</span> – <span className="font-medium">{day.end}</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">Day off</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

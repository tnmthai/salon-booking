import { useState, useEffect } from 'react'
import { api } from '../utils/api'

export default function Calendar() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [staffList, setStaffList] = useState([])
  const [appointments, setAppointments] = useState([])
  const [selectedStaff, setSelectedStaff] = useState('')

  useEffect(() => { api.getStaff().then(setStaffList).catch(console.error) }, [])

  useEffect(() => {
    const params = { date }
    if (selectedStaff) params.staff_id = selectedStaff
    api.getAppointments(params).then(setAppointments).catch(console.error)
  }, [date, selectedStaff])

  const hours = Array.from({ length: 11 }, (_, i) => i + 8) // 8am - 6pm

  const getApptForSlot = (staffId, hour) => {
    return appointments.find(a => {
      const start = new Date(a.start_time)
      return a.staff_id === staffId && start.getHours() === hour
    })
  }

  const statusColor = {
    confirmed: 'bg-green-100 border-green-300 text-green-800',
    cancelled: 'bg-red-100 border-red-300 text-red-800',
    completed: 'bg-blue-100 border-blue-300 text-blue-800',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">📅 Calendar</h1>

      {/* Controls */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="border rounded-lg px-3 py-2" />
        <select value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)}
          className="border rounded-lg px-3 py-2">
          <option value="">All Staff</option>
          {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <div className="flex gap-2 ml-auto">
          <button onClick={() => { const d = new Date(date); d.setDate(d.getDate() - 1); setDate(d.toISOString().split('T')[0]) }}
            className="border px-3 py-2 rounded-lg hover:bg-gray-50">← Prev</button>
          <button onClick={() => setDate(new Date().toISOString().split('T')[0])}
            className="border px-3 py-2 rounded-lg hover:bg-gray-50">Today</button>
          <button onClick={() => { const d = new Date(date); d.setDate(d.getDate() + 1); setDate(d.toISOString().split('T')[0]) }}
            className="border px-3 py-2 rounded-lg hover:bg-gray-50">Next →</button>
        </div>
      </div>

      {/* Time Grid */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-left text-sm text-gray-500 w-20">Time</th>
              {(selectedStaff ? staffList.filter(s => s.id == selectedStaff) : staffList).map(s => (
                <th key={s.id} className="p-3 text-left text-sm font-medium">{s.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map(hour => (
              <tr key={hour} className="border-b border-gray-100">
                <td className="p-3 text-sm text-gray-400">{hour}:00</td>
                {(selectedStaff ? staffList.filter(s => s.id == selectedStaff) : staffList).map(s => {
                  const appt = getApptForSlot(s.id, hour)
                  return (
                    <td key={s.id} className="p-1 border-l border-gray-50">
                      {appt ? (
                        <div className={`p-2 rounded-lg border text-xs ${statusColor[appt.status] || 'bg-gray-50'}`}>
                          <div className="font-medium">{appt.customer_name}</div>
                          <div>{appt.service_name}</div>
                          <div className="text-gray-500">
                            {new Date(appt.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            -{new Date(appt.end_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ) : null}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

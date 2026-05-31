import { useState, useEffect } from 'react'
import { api, getSalonTimezone, setSalonTimezone } from '../utils/api'
import { useI18n } from '../utils/i18n'


export default function Dashboard() {
  const { t } = useI18n()
  const [tab, setTab] = useState('bookings')
  const [appts, setAppts] = useState([])
  const [customers, setCustomers] = useState([])
  const [stats, setStats] = useState({ services: 0, staff: 0 })
  const [visitStats, setVisitStats] = useState(null)
  const [filterDate, setFilterDate] = useState(new Date().toLocaleDateString('en-CA', { timeZone: getSalonTimezone() }))
  const [filterStatus, setFilterStatus] = useState('')
  const [showAllDates, setShowAllDates] = useState(false)
  const [salonSettings, setSalonSettings] = useState(null)
  const [savingSettings, setSavingSettings] = useState(false)


  const loadAppts = () => {
    const params = {}
    if (!showAllDates) params.date = filterDate
    if (filterStatus) params.status = filterStatus
    api.getAppointments(params).then(setAppts).catch(console.error)
  }

  useEffect(() => {
    Promise.all([api.getServices(), api.getStaff()])
      .then(([s, st]) => setStats({ services: s.length, staff: st.length }))
      .catch(console.error)
    api.getCustomers().then(setCustomers).catch(console.error)
    api.getVisitStats().then(setVisitStats).catch(console.error)
  }, [])

  useEffect(() => { loadAppts() }, [filterDate, filterStatus, showAllDates])

  const updateStatus = async (id, status) => {
    if (status === 'completed') {
      await api.completeAppointment(id)
    } else {
      await api.updateAppointment(id, { status })
    }
    loadAppts()
  }

  const statusColors = {
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700',
  }

  const shiftDate = (offset) => {
    const d = new Date(filterDate + 'T12:00:00'); d.setDate(d.getDate() + offset)
    setFilterDate(d.toLocaleDateString('en-CA', { timeZone: getSalonTimezone() }))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('dashboard')}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-2xl font-bold text-pink-600">{stats.services}</div>
          <div className="text-gray-500 text-sm">{t('totalServices')}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.staff}</div>
          <div className="text-gray-500 text-sm">{t('totalStaff')}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-2xl font-bold text-green-600">{appts.filter(a => a.status === 'confirmed').length}</div>
          <div className="text-gray-500 text-sm">{t('confirmed')}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-2xl font-bold text-gray-600">{customers.length}</div>
          <div className="text-gray-500 text-sm">{t('totalCustomers')}</div>
        </div>
      </div>

      {visitStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-2xl font-bold text-indigo-600">{visitStats.total}</div>
            <div className="text-gray-500 text-sm">👁 Total Visits</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-2xl font-bold text-blue-600">{visitStats.today}</div>
            <div className="text-gray-500 text-sm">📅 Visits Today</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-2xl font-bold text-cyan-600">{visitStats.week}</div>
            <div className="text-gray-500 text-sm">📆 This Week</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-2xl font-bold text-teal-600">{visitStats.month}</div>
            <div className="text-gray-500 text-sm">📊 This Month</div>
          </div>
        </div>
      )}

      {visitStats?.cities?.length > 0 && (
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">📍 Top Cities</h3>
          <div className="space-y-2">
            {visitStats.cities.map((c, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm">{c.city}{c.country ? `, ${c.country}` : ''}</span>
                <span className="text-sm font-medium text-gray-600">{c.count} visits</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        <button onClick={() => setTab('bookings')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'bookings' ? 'bg-white shadow text-pink-600' : 'text-gray-500'}`}>
          📅 {t('bookingsTab')} ({appts.length})
        </button>
        <button onClick={() => setTab('customers')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'customers' ? 'bg-white shadow text-pink-600' : 'text-gray-500'}`}>
          👥 {t('customersTab')} ({customers.length})
        </button>
        <button onClick={() => { setTab('settings'); if (!salonSettings) api.me().then(d => setSalonSettings(d.salon)).catch(console.error) }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'settings' ? 'bg-white shadow text-pink-600' : 'text-gray-500'}`}>
          ⚙️ {t('settingsTab')}
        </button>
      </div>

      {tab === 'bookings' && (
        <div>
          <div className="flex gap-3 mb-4 flex-wrap items-center">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={showAllDates} onChange={e => setShowAllDates(e.target.checked)}
                className="rounded border-gray-300" />
              All dates
            </label>
            {!showAllDates && (
              <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm" />
            )}
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm">
              <option value="">{t('allStatus')}</option>
              <option value="confirmed">{t('confirmedStatus')}</option>
              <option value="completed">{t('completedStatus')}</option>
              <option value="cancelled">{t('cancelledStatus')}</option>
            </select>
            {!showAllDates && (
              <div className="flex gap-1 ml-auto">
                <button onClick={() => shiftDate(-1)} className="border px-3 py-2 rounded-lg text-sm hover:bg-gray-50">{t('prev')}</button>
                <button onClick={() => setFilterDate(new Date().toLocaleDateString('en-CA', { timeZone: getSalonTimezone() }))} className="border px-3 py-2 rounded-lg text-sm hover:bg-gray-50">{t('today')}</button>
                <button onClick={() => shiftDate(1)} className="border px-3 py-2 rounded-lg text-sm hover:bg-gray-50">{t('next')}</button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-gray-500">{t('time')}</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500">{t('customer')}</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500">{t('phone')}</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500">{t('service')}</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500">{t('staff')}</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500">{t('price')}</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500">{t('status')}</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {appts.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-gray-400">{t('noBookings')}</td></tr>
                ) : appts.map(a => (
                  <tr key={a.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 text-sm">
                      <div className="font-medium">{new Date(a.start_time).toLocaleTimeString('en-NZ', { timeZone: getSalonTimezone(), hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="text-xs text-gray-400">{new Date(a.start_time).toLocaleDateString('en-NZ', { timeZone: getSalonTimezone() })}</div>
                    </td>
                    <td className="p-3 text-sm font-medium">{a.customer_name}</td>
                    <td className="p-3 text-sm text-gray-500">{a.customer_phone}</td>
                    <td className="p-3 text-sm">{a.service_name}</td>
                    <td className="p-3 text-sm text-pink-600">{a.staff_name}</td>
                    <td className="p-3 text-sm font-medium">${a.price}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[a.status] || 'bg-gray-100'}`}>{a.status}</span>
                    </td>
                    <td className="p-3">
                      {a.status === 'confirmed' && (
                        <div className="flex gap-1">
                          <button onClick={() => updateStatus(a.id, 'completed')} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">{t('complete')}</button>
                          <button onClick={() => updateStatus(a.id, 'cancelled')} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100">{t('cancel')}</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'customers' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-gray-500">{t('name')}</th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">{t('phone')}</th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">{t('email')}</th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">{t('notes')}</th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">{t('joined')}</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">{t('noCustomers')}</td></tr>
              ) : customers.map(c => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 text-sm font-medium">{c.name}</td>
                  <td className="p-3 text-sm text-gray-500">{c.phone}</td>
                  <td className="p-3 text-sm text-gray-500">{c.email}</td>
                  <td className="p-3 text-sm text-gray-400">{c.notes}</td>
                  <td className="p-3 text-sm text-gray-400">{new Date(c.created_at).toLocaleDateString('en-NZ', { timeZone: getSalonTimezone() })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'settings' && salonSettings && (
        <div className="bg-white rounded-xl shadow p-6 max-w-lg">
          <h2 className="text-lg font-semibold mb-4">⚙️ {t('settingsTab')}</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">Show on Homepage</label>
                <p className="text-xs text-gray-400">Display your shop on the homepage</p>
              </div>
              <button
                onClick={() => setSalonSettings({ ...salonSettings, show_on_landing: !salonSettings.show_on_landing })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${salonSettings.show_on_landing ? 'bg-pink-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${salonSettings.show_on_landing ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">Show in Explore</label>
                <p className="text-xs text-gray-400">Appear in search results</p>
              </div>
              <button
                onClick={() => setSalonSettings({ ...salonSettings, show_in_explore: !salonSettings.show_in_explore })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${salonSettings.show_in_explore ? 'bg-pink-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${salonSettings.show_in_explore ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            {!salonSettings.show_in_explore && <p className="text-xs text-orange-500 mt-1">⚠️ Hidden from search. Customers can still book via direct link.</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <select
                value={salonSettings.timezone || 'Pacific/Auckland'}
                onChange={e => setSalonSettings({ ...salonSettings, timezone: e.target.value })}
                className="border rounded-lg px-3 py-2 w-full text-sm"
              >
                <option value="Pacific/Auckland">Pacific/Auckland (NZ)</option>
                <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                <option value="Australia/Melbourne">Australia/Melbourne (AEST)</option>
                <option value="Australia/Perth">Australia/Perth (AWST)</option>
                <option value="America/Toronto">America/Toronto (EST)</option>
                <option value="America/Vancouver">America/Vancouver (PST)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Chicago">America/Chicago (CST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="Europe/Paris">Europe/Paris (CET)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                <option value="Asia/Shanghai">Asia/Shanghai (CST)</option>
                <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (ICT)</option>
                <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">All bookings and schedules use this timezone</p>
            </div>
            <button
              onClick={async () => {
                setSavingSettings(true)
                try {
                  await fetch('/api/salon/settings', {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('salon_token')}`
                    },
                    body: JSON.stringify({ timezone: salonSettings.timezone, show_on_landing: salonSettings.show_on_landing, show_in_explore: salonSettings.show_in_explore })
                  })
                  setSalonTimezone(salonSettings.timezone)
                  alert('Settings saved!')
                } catch (e) { alert(e.message) }
                setSavingSettings(false)
              }}
              disabled={savingSettings}
              className="bg-pink-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-pink-700 disabled:opacity-50"
            >
              {savingSettings ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

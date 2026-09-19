import { useState, useEffect } from 'react'
import { api, getSalonTimezone, setSalonTimezone } from '../utils/api'
import { useI18n } from '../utils/i18n'
import { toast } from '../utils/notify'


export default function Dashboard() {
  const { t } = useI18n()
  const [tab, setTab] = useState('bookings')
  const [appts, setAppts] = useState([])
  const [customers, setCustomers] = useState([])
  // null = not loaded yet; treated as "done" so the checklist never
  // flashes into view for salons that already finished setup.
  const [stats, setStats] = useState({ services: null, staff: null })
  const [visitStats, setVisitStats] = useState(null)
  const [filterDate, setFilterDate] = useState(new Date().toLocaleDateString('en-CA', { timeZone: getSalonTimezone() }))
  const [filterStatus, setFilterStatus] = useState('')
  // 'upcoming' is the default: a small salon has empty days all the time, and
  // landing on an empty "today" made the product look broken.
  const [view, setView] = useState('upcoming')
  const [salon, setSalon] = useState(null)
  // null = not checked yet; treated as "done" so the checklist never flashes.
  const [hasHours, setHasHours] = useState(null)
  const [upcomingCount, setUpcomingCount] = useState(null)
  const [copied, setCopied] = useState(false)
  const [showVisits, setShowVisits] = useState(false)
  const [salonSettings, setSalonSettings] = useState(null)
  const [savingSettings, setSavingSettings] = useState(false)

  const loadAppts = () => {
    const params = {}
    if (view === 'date') params.date = filterDate
    if (view === 'upcoming') params.from = new Date().toISOString()
    if (filterStatus) params.status = filterStatus
    api.getAppointments(params).then(setAppts).catch(console.error)
  }

  // Counted separately from the table so it never changes when the owner
  // filters by date — the old "Confirmed" card silently meant "today".
  const loadUpcomingCount = () => {
    api.getAppointments({ from: new Date().toISOString(), status: 'confirmed' })
      .then(rows => setUpcomingCount(rows.length))
      .catch(() => setUpcomingCount(null))
  }

  useEffect(() => {
    Promise.all([api.getServices(), api.getStaff()])
      .then(([s, st]) => setStats({ services: s.length, staff: st.length }))
      .catch(console.error)
    api.getCustomers().then(setCustomers).catch(console.error)
    api.getVisitStats().then(setVisitStats).catch(console.error)
    api.me().then(d => {
      setSalon(d.salon)
      // Without working hours the slot generator returns nothing, so a salon
      // can look "set up" and still be unbookable. Check it for real.
      if (d.salon?.id) {
        api.getSalonWorkingHours(d.salon.id)
          .then(rows => setHasHours(rows.some(r => r.is_active)))
          .catch(() => setHasHours(true))
      }
    }).catch(console.error)
    loadUpcomingCount()
  }, [])

  useEffect(() => { loadAppts() }, [filterDate, filterStatus, view])

  const bookingUrl = salon?.slug ? `${window.location.origin}/${salon.slug}/book` : ''

  const copyBookingLink = async () => {
    if (!bookingUrl) return
    try {
      await navigator.clipboard.writeText(bookingUrl)
    } catch {
      // Clipboard API needs a secure context; fall back to a manual select.
      const el = document.createElement('textarea')
      el.value = bookingUrl
      document.body.appendChild(el)
      el.select()
      try { document.execCommand('copy') } catch { /* ignore */ }
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Setup steps a brand-new salon still has to finish before it can take a booking.
  const setupSteps = [
    { done: stats.services === null || stats.services > 0, label: t('setupAddServices'), to: '/admin/services' },
    { done: stats.staff === null || stats.staff > 0, label: t('setupAddStaff'), to: '/admin/staff' },
    { done: hasHours !== false, label: t('setupSetHours'), to: '/admin/schedule' },
  ]
  const setupDone = setupSteps.every(s => s.done)

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
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">{t('dashboard')}</h1>
        {bookingUrl && (
          <button onClick={copyBookingLink}
            className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-700 transition">
            {copied ? `✓ ${t('linkCopied')}` : `🔗 ${t('copyBookingLink')}`}
          </button>
        )}
      </div>

      {/* Setup checklist — only while the salon still cannot take a booking. */}
      {!setupDone && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-amber-900 mb-1">{t('setupTitle')}</h2>
          <p className="text-sm text-amber-800 mb-4">{t('setupSubtitle')}</p>
          <div className="space-y-2">
            {setupSteps.map((s, i) => (
              <a key={i} href={s.to}
                className={`flex items-center gap-2 text-sm ${s.done ? 'text-amber-700' : 'text-amber-900 font-medium hover:underline'}`}>
                <span>{s.done ? '✅' : '⬜'}</span>
                <span className={s.done ? 'line-through opacity-70' : ''}>{s.label}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* What the owner actually opens the dashboard to find out. */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-2xl font-bold text-green-600">{upcomingCount === null ? '—' : upcomingCount}</div>
          <div className="text-gray-500 text-sm">{t('upcomingBookings')}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-2xl font-bold text-gray-700">{customers.length}</div>
          <div className="text-gray-500 text-sm">{t('totalCustomers')}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-2xl font-bold text-pink-600">{stats.services === null ? '—' : stats.services}</div>
          <div className="text-gray-500 text-sm">{t('totalServices')}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.staff === null ? '—' : stats.staff}</div>
          <div className="text-gray-500 text-sm">{t('totalStaff')}</div>
        </div>
      </div>

      {/* Page-visit analytics: useful, but not what you open a booking app for.
          Collapsed by default so it stops competing with the bookings. */}
      {visitStats && (
        <div className="bg-white rounded-xl shadow mb-6">
          <button onClick={() => setShowVisits(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 rounded-xl">
            <span>👁 {t('pageVisits')} — {visitStats.total} {t('visitsTotalSuffix')}</span>
            <span className={`transition ${showVisits ? 'rotate-180' : ''}`}>▾</span>
          </button>
          {showVisits && (
            <div className="px-4 pb-4 border-t pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div><div className="text-xl font-bold text-indigo-600">{visitStats.total}</div><div className="text-gray-500 text-xs">{t('visitsTotal')}</div></div>
                <div><div className="text-xl font-bold text-blue-600">{visitStats.today}</div><div className="text-gray-500 text-xs">{t('visitsToday')}</div></div>
                <div><div className="text-xl font-bold text-cyan-600">{visitStats.week}</div><div className="text-gray-500 text-xs">{t('visitsWeek')}</div></div>
                <div><div className="text-xl font-bold text-teal-600">{visitStats.month}</div><div className="text-gray-500 text-xs">{t('visitsMonth')}</div></div>
              </div>
              {visitStats?.cities?.length > 0 && (
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">📍 {t('topCities')}</h3>
                  {visitStats.cities.map((c, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm">{c.city}{c.country ? `, ${c.country}` : ''}</span>
                      <span className="text-sm font-medium text-gray-600">{c.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {[
                { id: 'upcoming', label: t('viewUpcoming') },
                { id: 'date', label: t('viewByDate') },
                { id: 'all', label: t('viewAll') },
              ].map(v => (
                <button key={v.id} onClick={() => setView(v.id)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${view === v.id ? 'bg-white shadow text-pink-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  {v.label}
                </button>
              ))}
            </div>
            {view === 'date' && (
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
            {view === 'date' && (
              <div className="flex gap-1 ml-auto">
                <button onClick={() => shiftDate(-1)} className="border px-3 py-2 rounded-lg text-sm hover:bg-gray-50">{t('prev')}</button>
                <button onClick={() => setFilterDate(new Date().toLocaleDateString('en-CA', { timeZone: getSalonTimezone() }))} className="border px-3 py-2 rounded-lg text-sm hover:bg-gray-50">{t('today')}</button>
                <button onClick={() => shiftDate(1)} className="border px-3 py-2 rounded-lg text-sm hover:bg-gray-50">{t('next')}</button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full min-w-[720px]">
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
                  <tr>
                    <td colSpan={8} className="p-10 text-center">
                      <div className="text-gray-500 mb-1">
                        {view === 'upcoming' ? t('noUpcomingBookings')
                          : view === 'date' ? t('noBookingsThisDay')
                          : t('noBookings')}
                      </div>
                      {view === 'upcoming' && setupDone && bookingUrl && (
                        <>
                          <p className="text-sm text-gray-400 mb-4">{t('noUpcomingHint')}</p>
                          <button onClick={copyBookingLink}
                            className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-700">
                            {copied ? `✓ ${t('linkCopied')}` : `🔗 ${t('copyBookingLink')}`}
                          </button>
                          <div className="text-xs text-gray-400 mt-2 break-all">{bookingUrl}</div>
                        </>
                      )}
                      {view === 'date' && (
                        <p className="text-sm text-gray-400 mt-1">
                          <button onClick={() => setView('upcoming')} className="text-pink-600 hover:underline">{t('seeUpcomingInstead')}</button>
                        </p>
                      )}
                    </td>
                  </tr>
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
                  toast('Settings saved!', 'success')
                } catch (e) { toast(e.message, 'error') }
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

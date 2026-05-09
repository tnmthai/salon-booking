import { useState } from 'react'
import { Link } from 'react-router-dom'

const TZ = 'Pacific/Auckland'

const statusColors = {
  confirmed: 'bg-green-100 text-green-700 border-green-200',
  completed: 'bg-blue-100 text-blue-700 border-blue-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
}

export default function Lookup() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError('')
    setSearched(true)

    try {
      const trimmed = query.trim()
      const isCode = /^[A-Z0-9]{8}$/i.test(trimmed)
      const param = isCode ? `code=${trimmed.toUpperCase()}` : `phone=${trimmed}`
      const res = await fetch(`/api/appointments/lookup?${param}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'No bookings found')
        setResults([])
      } else {
        // Sort: upcoming first (by date ascending), then past (by date descending)
        const now = new Date()
        const upcoming = data.filter(a => new Date(a.start_time) >= now && a.status !== 'cancelled')
          .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
        const past = data.filter(a => new Date(a.start_time) < now || a.status === 'cancelled')
          .sort((a, b) => new Date(b.start_time) - new Date(a.start_time))
        setResults([...upcoming, ...past])
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setResults([])
    }
    setLoading(false)
  }

  const isUpcoming = (a) => new Date(a.start_time) >= new Date() && a.status !== 'cancelled'

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-pink-600">💅 Lincoln Nails</Link>
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">← Home</Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Search */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Look up your booking</h1>
          <p className="text-gray-500">Enter your booking code or phone number to view your appointments</p>
        </div>

        <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Booking code (e.g. ABC12345) or phone number"
              className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-pink-500 focus:outline-none transition"
            />
            <button type="submit" disabled={loading}
              className="bg-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-700 disabled:opacity-50 transition">
              {loading ? '...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center text-red-600">
            {error}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div>
            <div className="text-sm text-gray-500 mb-4">{results.length} booking(s) found</div>

            {/* Group: Upcoming first */}
            {results.some(isUpcoming) && (
              <div className="mb-6">
                <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-3">📅 Upcoming</div>
                <div className="space-y-3">
                  {results.filter(isUpcoming).map(a => (
                    <BookingCard key={a.id} appt={a} highlight />
                  ))}
                </div>
              </div>
            )}

            {/* Past / Cancelled */}
            {results.some(a => !isUpcoming(a)) && (
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Past</div>
                <div className="space-y-3">
                  {results.filter(a => !isUpcoming(a)).map(a => (
                    <BookingCard key={a.id} appt={a} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state after search */}
        {searched && !loading && !error && results.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-4">📭</div>
            <div className="text-lg">No bookings found</div>
            <p className="text-sm mt-2">Try a different booking code or phone number</p>
          </div>
        )}
      </div>
    </div>
  )
}

function BookingCard({ appt, highlight }) {
  const startDate = new Date(appt.start_time)
  const endDate = new Date(appt.end_time)

  const dayName = startDate.toLocaleDateString('en-NZ', { timeZone: TZ, weekday: 'short' })
  const dateStr = startDate.toLocaleDateString('en-NZ', { timeZone: TZ, month: 'short', day: 'numeric' })
  const startTime = startDate.toLocaleTimeString('en-NZ', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })
  const endTime = endDate.toLocaleTimeString('en-NZ', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-4 ${highlight ? 'border-green-200 ring-1 ring-green-100' : 'border-gray-100'}`}>
      <div className="flex items-start gap-4">
        {/* Date block */}
        <div className="text-center shrink-0 w-14">
          <div className="text-xs text-gray-500 uppercase">{dayName}</div>
          <div className="text-lg font-bold text-gray-900">{dateStr.split(' ')[1]}</div>
          <div className="text-xs text-gray-400">{dateStr.split(' ')[0]}</div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold">{appt.service_name}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[appt.status] || 'bg-gray-100 text-gray-600'}`}>
              {appt.status}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {startTime} – {endTime} · {appt.staff_name}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            💅 {appt.salon_name} {appt.salon_address && `· 📍 ${appt.salon_address}`}
          </div>
          {appt.booking_code && (
            <div className="mt-2 text-xs text-gray-400">
              Code: <span className="font-mono font-semibold text-gray-600">{appt.booking_code}</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="text-right shrink-0">
          <div className="text-lg font-bold text-pink-600">${appt.price}</div>
        </div>
      </div>
    </div>
  )
}

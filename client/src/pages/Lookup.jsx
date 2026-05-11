import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api, getSalonTimezone } from '../utils/api'

const TZ = getSalonTimezone()

const statusColors = {
  confirmed: 'bg-green-100 text-green-700 border-green-200',
  completed: 'bg-blue-100 text-blue-700 border-blue-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
}

export default function Lookup() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('code') || '')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const [rescheduleId, setRescheduleId] = useState(null)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleSlots, setRescheduleSlots] = useState([])
  const [rescheduleSlot, setRescheduleSlot] = useState(null)
  const [rescheduleLoading, setRescheduleLoading] = useState(false)
  const [reviewId, setReviewId] = useState(null)
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' })
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState('')

  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      setQuery(code)
      handleSearch(null, code)
    }
  }, [])

  const handleSearch = async (e, overrideQuery) => {
    if (e) e.preventDefault()
    const q = overrideQuery || query
    if (!q.trim()) return

    setLoading(true)
    setError('')
    setSearched(true)

    try {
      const trimmed = q.trim()
      const isCode = /^[A-Z0-9]{8}$/i.test(trimmed)
      const param = isCode ? `code=${trimmed.toUpperCase()}` : `phone=${trimmed}`
      const res = await fetch(`/api/appointments/lookup?${param}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'No bookings found')
        setResults([])
      } else {
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

  const handleCancel = async (appt) => {
    if (!confirm(`Cancel your ${appt.service_name} appointment on ${formatDate(appt.start_time)}?`)) return

    try {
      const isCode = /^[A-Z0-9]{8}$/i.test(query.trim())
      const body = isCode ? { booking_code: query.trim().toUpperCase() } : { phone: query.trim() }
      const res = await fetch(`/api/appointments/${appt.id}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed to cancel')
        return
      }
      // Refresh results
      handleSearch()
    } catch (err) {
      alert('Failed to cancel. Please try again.')
    }
  }

  const openReschedule = async (appt) => {
    setRescheduleId(appt.id)
    setRescheduleDate('')
    setRescheduleSlots([])
    setRescheduleSlot(null)
  }

  const loadRescheduleSlots = async (date) => {
    setRescheduleDate(date)
    setRescheduleSlot(null)
    const appt = results.find(a => a.id === rescheduleId)
    if (!appt || !date) return

    setRescheduleLoading(true)
    try {
      // Fetch salon slug from the appointment's salon name
      const res = await fetch(`/api/appointments/slots?slug=${encodeURIComponent(appt.salon_name?.toLowerCase().replace(/\s+/g, '-') || 'salon')}&staff_id=${appt.staff_id}&service_id=${appt.service_id}&date=${date}`)
      if (res.ok) {
        const data = await res.json()
        setRescheduleSlots(data)
      }
    } catch (err) {}
    setRescheduleLoading(false)
  }

  const handleReschedule = async () => {
    if (!rescheduleSlot) return
    const appt = results.find(a => a.id === rescheduleId)
    if (!appt) return

    setRescheduleLoading(true)
    try {
      const isCode = /^[A-Z0-9]{8}$/i.test(query.trim())
      const body = {
        start_time: rescheduleSlot.start,
        ...(isCode ? { booking_code: query.trim().toUpperCase() } : { phone: query.trim() }),
      }
      const res = await fetch(`/api/appointments/${rescheduleId}/reschedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed to reschedule')
        return
      }
      setRescheduleId(null)
      handleSearch()
    } catch (err) {
      alert('Failed to reschedule. Please try again.')
    }
    setRescheduleLoading(false)
  }

  const handleReview = async () => {
    if (!reviewId) return
    setReviewSubmitting(true)
    try {
      const isCode = /^[A-Z0-9]{8}$/i.test(query.trim())
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_code: isCode ? query.trim().toUpperCase() : results.find(a => a.id === reviewId)?.booking_code,
          phone: isCode ? results.find(a => a.id === reviewId)?.customer_phone : query.trim(),
          rating: reviewData.rating,
          comment: reviewData.comment,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed to submit review')
      } else {
        setReviewSuccess('Thank you for your review! ⭐')
        setReviewId(null)
        setTimeout(() => setReviewSuccess(''), 5000)
      }
    } catch (err) {
      alert('Failed to submit review. Please try again.')
    }
    setReviewSubmitting(false)
  }

  const canCancel = (a) => {
    if (a.status !== 'confirmed') return false
    const hoursUntil = (new Date(a.start_time) - new Date()) / (1000 * 60 * 60)
    return hoursUntil >= 3
  }

  const canReschedule = (a) => {
    if (a.status !== 'confirmed') return false
    const hoursUntil = (new Date(a.start_time) - new Date()) / (1000 * 60 * 60)
    return hoursUntil >= 3
  }

  const canReview = (a) => a.status === 'completed'

  const isUpcoming = (a) => new Date(a.start_time) >= new Date() && a.status !== 'cancelled'

  const formatDate = (ts) => {
    const d = new Date(ts)
    return d.toLocaleDateString('en-NZ', { timeZone: TZ, weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-pink-600 flex items-center gap-2"><span className="w-7 h-7 bg-gradient-to-br from-pink-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">T</span> Timia</Link>
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">← Home</Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Search */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Look up your booking</h1>
          <p className="text-gray-500">Enter your booking code or phone number to view your appointments</p>
        </div>

        <form onSubmit={(e) => handleSearch(e)} className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Booking code (e.g. ABC12345) or phone number"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-pink-500 focus:outline-none transition"
            />
            <button type="submit" disabled={loading}
              className="w-full bg-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-700 disabled:opacity-50 transition">
              {loading ? '...' : '🔍 Search'}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center text-red-600">
            {error}
          </div>
        )}

        {/* Review success */}
        {reviewSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-center text-green-600">
            {reviewSuccess}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div>
            <div className="text-sm text-gray-500 mb-4">{results.length} booking(s) found</div>

            {/* Upcoming */}
            {results.some(isUpcoming) && (
              <div className="mb-6">
                <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-3">📅 Upcoming</div>
                <div className="space-y-3">
                  {results.filter(isUpcoming).map(a => (
                    <BookingCard key={a.id} appt={a} highlight
                      onCancel={() => handleCancel(a)}
                      onReschedule={() => openReschedule(a)}
                      canCancel={canCancel(a)}
                      canReschedule={canReschedule(a)}
                    />
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
                    <BookingCard key={a.id} appt={a}
                      onReview={canReview(a) ? () => setReviewId(a.id) : null}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {searched && !loading && !error && results.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-4">📭</div>
            <div className="text-lg">No bookings found</div>
            <p className="text-sm mt-2">Try a different booking code or phone number</p>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">🔄 Reschedule Appointment</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">New Date</label>
              <input type="date" value={rescheduleDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => loadRescheduleSlots(e.target.value)}
                className="w-full border rounded-lg px-3 py-2" />
            </div>

            {rescheduleLoading && <p className="text-gray-400 text-sm">Loading slots...</p>}

            {rescheduleSlots.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Times</label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {rescheduleSlots.map((slot, i) => (
                    <button key={i} onClick={() => setRescheduleSlot(slot)}
                      className={`p-2 rounded-lg border text-sm font-medium transition ${
                        rescheduleSlot?.start === slot.start
                          ? 'border-green-600 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-green-300'
                      }`}>
                      {new Date(slot.start).toLocaleTimeString('en-NZ', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {rescheduleDate && rescheduleSlots.length === 0 && !rescheduleLoading && (
              <p className="text-gray-400 text-sm mb-4">No available slots for this date.</p>
            )}

            <div className="flex gap-2">
              <button onClick={() => setRescheduleId(null)} className="flex-1 border px-4 py-2 rounded-lg">Cancel</button>
              <button onClick={handleReschedule} disabled={!rescheduleSlot || rescheduleLoading}
                className="flex-1 bg-pink-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">
                {rescheduleLoading ? 'Rescheduling...' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">⭐ Leave a Review</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} onClick={() => setReviewData({...reviewData, rating: star})}
                    className={`text-3xl transition ${star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Comment (optional)</label>
              <textarea value={reviewData.comment} onChange={e => setReviewData({...reviewData, comment: e.target.value})}
                rows={3} className="w-full border rounded-lg px-3 py-2" placeholder="Tell us about your experience..." />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setReviewId(null)} className="flex-1 border px-4 py-2 rounded-lg">Cancel</button>
              <button onClick={handleReview} disabled={reviewSubmitting}
                className="flex-1 bg-pink-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function BookingCard({ appt, highlight, onCancel, onReschedule, canCancel, canReschedule, onReview }) {
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

          {/* Action buttons */}
          <div className="mt-3 flex gap-2 flex-wrap">
            {canCancel && (
              <button onClick={onCancel}
                className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 border border-red-200">
                ❌ Cancel
              </button>
            )}
            {canReschedule && (
              <button onClick={onReschedule}
                className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 border border-blue-200">
                🔄 Reschedule
              </button>
            )}
            {onReview && (
              <button onClick={onReview}
                className="text-xs bg-yellow-50 text-yellow-600 px-3 py-1.5 rounded-lg hover:bg-yellow-100 border border-yellow-200">
                ⭐ Review
              </button>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="text-right shrink-0">
          <div className="text-lg font-bold text-pink-600">${appt.price}</div>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { api, getSalonTimezone } from '../utils/api'

const TZ = getSalonTimezone()
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
}

function getOpeningHours(workingHours) {
  // Group by day_of_week, find earliest start and latest end across all staff
  const byDay = {}
  for (const wh of workingHours) {
    if (!byDay[wh.day_of_week]) byDay[wh.day_of_week] = { starts: [], ends: [] }
    byDay[wh.day_of_week].starts.push(wh.start_time)
    byDay[wh.day_of_week].ends.push(wh.end_time)
  }
  const result = []
  for (let d = 1; d <= 7; d++) { // 1=Mon, 7=Sun (ISO)
    const info = byDay[d]
    if (info) {
      const earliest = info.starts.sort()[0]
      const latest = info.ends.sort().reverse()[0]
      result.push({ day: d, open: earliest, close: latest, isOpen: true })
    } else {
      result.push({ day: d, open: null, close: null, isOpen: false })
    }
  }
  return result
}

export default function Booking() {
  const { slug } = useParams()
  const [step, setStep] = useState(1)
  const [salon, setSalon] = useState(null)
  const [services, setServices] = useState([])
  const [staffList, setStaffList] = useState([])
  const [slots, setSlots] = useState([])
  const [gallery, setGallery] = useState([])
  const [reviews, setReviews] = useState([])
  const [salonRating, setSalonRating] = useState(null)
  const [workingHours, setWorkingHours] = useState([])

  const [selectedServices, setSelectedServices] = useState([]) // Priority 6: multiple services
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [nextAvailable, setNextAvailable] = useState(null)
  const [checkingNext, setCheckingNext] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [doneData, setDoneData] = useState(null)

  useEffect(() => {
    api.getSalon(slug).then(salonData => {
      setSalon(salonData)
      // Track page visit
      api.trackVisit(salonData.id, 'booking').catch(() => {})
    }).catch(() => setError('Salon not found'))
    api.getPublicServices(slug).then(setServices).catch(console.error)
    api.getPublicStaff(slug).then(setStaffList).catch(console.error)
    api.getPublicGallery(slug).then(setGallery).catch(console.error)
    api.getPublicReviews(slug).then(setReviews).catch(console.error)
    api.getSalonRating(slug).then(setSalonRating).catch(console.error)
    api.getPublicWorkingHours(slug).then(setWorkingHours).catch(console.error)
  }, [slug])

  useEffect(() => {
    if (selectedStaff && selectedServices.length > 0 && selectedDate) {
      // For multi-service, pass total duration
      const totalDur = selectedServices.reduce((sum, svcId) => {
        const svc = services.find(s => s.id == svcId)
        return sum + (svc?.duration_min || 30)
      }, 0)
      // Use service_ids param for multi-service
      const params = `slug=${slug}&staff_id=${selectedStaff}&service_ids=${selectedServices.join(',')}&date=${selectedDate}`
      setNextAvailable(null)
      fetch(`/api/appointments/slots?${params}`).then(r => r.json()).then(async (data) => {
        setSlots(data)
        // If no slots, find next available date
        if (data.length === 0) {
          setCheckingNext(true)
          for (let i = 1; i <= 14; i++) {
            const d = new Date(selectedDate + 'T00:00:00')
            d.setDate(d.getDate() + i)
            const dateStr = d.toISOString().split('T')[0]
            try {
              const check = await fetch(`/api/appointments/slots?slug=${slug}&staff_id=${selectedStaff}&service_ids=${selectedServices.join(',')}&date=${dateStr}`)
              const checkData = await check.json()
              if (checkData.length > 0) {
                setNextAvailable(dateStr)
                break
              }
            } catch {}
          }
          setCheckingNext(false)
        }
      }).catch(console.error)
    }
  }, [selectedStaff, selectedServices, selectedDate, slug, services])

  const totalDuration = selectedServices.reduce((sum, svcId) => {
    const svc = services.find(s => s.id == svcId)
    return sum + (svc?.duration_min || 30)
  }, 0)

  const totalPrice = selectedServices.reduce((sum, svcId) => {
    const svc = services.find(s => s.id == svcId)
    return sum + parseFloat(svc?.price || 0)
  }, 0)

  const toggleService = (svcId) => {
    setSelectedServices(prev => {
      if (prev.includes(svcId)) {
        return prev.filter(id => id !== svcId)
      }
      if (prev.length >= 3) return prev // Max 3 services
      return [...prev, svcId]
    })
  }

  const handleBook = async () => {
    // Validate inputs
    if (!customer.name || customer.name.trim().length < 2) {
      alert('Please enter a valid name (at least 2 characters)')
      return
    }
    if (/[0-9]/.test(customer.name)) {
      alert('Name cannot contain numbers')
      return
    }
    if (!customer.phone || customer.phone.replace(/\D/g, '').length < 7) {
      alert('Please enter a valid phone number (at least 7 digits)')
      return
    }
    if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      alert('Please enter a valid email address')
      return
    }
    if (!selectedSlot) {
      alert('Please select a time slot')
      return
    }
    setLoading(true)
    try {
      const result = await api.createPublicAppointment({
        salon_id: salon.id,
        service_id: selectedServices[0], // Primary service
        service_ids: selectedServices, // All services (Priority 6)
        staff_id: selectedStaff,
        customer_name: customer.name.trim(),
        customer_phone: customer.phone.trim(),
        customer_email: customer.email?.trim() || '',
        start_time: selectedSlot.start,
        notes: customer.notes?.trim() || '',
      })
      setDoneData(result)
      setDone(true)
    } catch (err) {
      alert(err.message)
    }
    setLoading(false)
  }

  const selectedServiceNames = selectedServices.map(id => services.find(s => s.id == id)).filter(Boolean)
  const staff = staffList.find(s => s.id == selectedStaff)

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <h1 className="text-2xl font-bold">{error}</h1>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-gray-500 mb-6">{customer.name}, your appointment at <strong>{salon?.name}</strong> has been confirmed.</p>
        <div className="bg-white rounded-xl shadow p-6 text-left">
          <div className="mb-2"><strong>Services:</strong> {selectedServiceNames.map(s => s.name).join(', ')}</div>
          <div className="mb-2"><strong>Staff:</strong> {staff?.name}</div>
          <div className="mb-2"><strong>Date:</strong> {selectedDate}</div>
          <div className="mb-2"><strong>Time:</strong> {selectedSlot && new Date(selectedSlot.start).toLocaleTimeString('en-NZ', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })}</div>
          <div className="mb-2"><strong>Duration:</strong> {totalDuration} min</div>
          <div><strong>Price:</strong> ${totalPrice.toFixed(2)}</div>
          {doneData?.booking_code && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg text-center">
              <div className="text-xs text-gray-500 uppercase">Booking Code</div>
              <div className="text-2xl font-bold text-green-600 font-mono">{doneData.booking_code}</div>
            </div>
          )}
        </div>
        <button onClick={() => { setDone(false); setStep(1); setSelectedServices([]); setSelectedStaff(null); setSelectedDate(''); setSelectedSlot(null); setCustomer({ name: '', phone: '', email: '', notes: '' }) }}
          className="mt-6 bg-pink-600 text-white px-6 py-3 rounded-xl hover:bg-pink-700">
          Book Another
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Salon Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <a href="/" className="text-gray-400 hover:text-gray-600 text-sm">← Home</a>
          <a href={`/${slug}/gift-card`} className="text-pink-500 hover:text-pink-600 text-sm ml-4">🎁 Gift Card</a>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-lg md:text-xl font-bold text-pink-600">💅 {salon?.name || 'Loading...'}</h1>
            {salonRating && salonRating.total_reviews > 0 && (
              <span className="text-sm text-yellow-500 ml-auto">⭐ {salonRating.average_rating} ({salonRating.total_reviews})</span>
            )}
          </div>
          {salon?.address && <p className="text-sm text-gray-500 mt-1">📍 {salon.address}</p>}
          {/* Opening Hours */}
          {workingHours.length > 0 && (
            <details className="mt-3">
              <summary className="text-sm text-pink-600 cursor-pointer hover:text-pink-700 font-medium">
                🕐 Opening Hours
              </summary>
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                {getOpeningHours(workingHours).map(h => {
                  // Convert ISO day (1=Mon..7=Sun) to display
                  const dayLabel = h.day === 7 ? 'Sun' : ['Mon','Tue','Wed','Thu','Fri','Sat'][h.day - 1]
                  return (
                    <div key={h.day} className="flex justify-between">
                      <span className="font-medium">{dayLabel}</span>
                      <span className={h.isOpen ? 'text-gray-600' : 'text-red-400'}>
                        {h.isOpen ? `${formatTime(h.open)} – ${formatTime(h.close)}` : 'Closed'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </details>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Book Appointment</h2>

        {/* Progress */}
        <div className="flex items-center justify-center gap-1 md:gap-2 mb-8">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`flex items-center gap-1 md:gap-2 ${step >= s ? 'text-pink-600' : 'text-gray-300'}`}>
              <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold ${step >= s ? 'bg-pink-600 text-white' : 'bg-gray-200'}`}>{s}</div>
              <span className="text-xs md:text-sm hidden md:inline">{s === 1 ? 'Services' : s === 2 ? 'Staff' : s === 3 ? 'Time' : 'Confirm'}</span>
              {s < 4 && <div className={`w-4 md:w-8 h-0.5 ${step > s ? 'bg-pink-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Services (Priority 6: multiple selection) */}
        {step === 1 && (
          <div>
            <p className="text-sm text-gray-500 mb-4">Select 1-3 services ({selectedServices.length}/3 selected)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.length === 0 && <p className="text-gray-400 col-span-2 text-center">Loading services...</p>}
              {services.map(s => (
                <button key={s.id} onClick={() => toggleService(s.id)}
                  className={`p-4 rounded-xl border-2 text-left transition ${
                    selectedServices.includes(s.id)
                      ? 'border-pink-600 bg-pink-50 ring-2 ring-pink-200'
                      : 'border-gray-200 hover:border-pink-300 bg-white'
                  }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{s.name}</div>
                      <div className="text-sm text-gray-500">{s.category} • {s.duration_min} min</div>
                    </div>
                    {selectedServices.includes(s.id) && (
                      <span className="text-pink-600 text-xl">✓</span>
                    )}
                  </div>
                  <div className="text-lg font-bold text-pink-600 mt-2">${s.price}</div>
                </button>
              ))}
            </div>
            {selectedServices.length > 0 && (
              <div className="mt-4 bg-pink-50 rounded-xl p-4">
                <div className="text-sm font-medium text-pink-800">
                  {selectedServices.length} service(s) selected · Total: {totalDuration} min · ${totalPrice.toFixed(2)}
                </div>
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button onClick={() => setStep(2)} disabled={selectedServices.length === 0}
                className="w-full md:w-auto bg-pink-600 text-white px-6 py-3 rounded-lg disabled:opacity-50 font-medium">Next</button>
            </div>
          </div>
        )}

        {/* Step 2: Staff & Date */}
        {step === 2 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Choose Staff</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {staffList.map(s => (
                <button key={s.id} onClick={() => setSelectedStaff(s.id)}
                  className={`p-3 rounded-xl border-2 text-center transition ${selectedStaff == s.id ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300 bg-white'}`}>
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 text-lg">{s.name.charAt(0)}</div>
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className="text-xs text-gray-400">{s.role}</div>
                </button>
              ))}
            </div>
            <h3 className="text-lg font-semibold mb-4">Choose Date</h3>
            <input type="date" value={selectedDate} min={new Date().toISOString().split('T')[0]}
              onChange={e => { setSelectedDate(e.target.value); setNextAvailable(null); }}
              className="border rounded-lg px-3 py-2 mb-6" />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setStep(1)} className="border px-4 py-2.5 rounded-lg">Back</button>
              <button onClick={() => setStep(3)} disabled={!selectedStaff || !selectedDate}
                className="flex-1 md:flex-none bg-pink-600 text-white px-4 py-2.5 rounded-lg disabled:opacity-50 font-medium">Next</button>
            </div>
          </div>
        )}

        {/* Step 3: Time */}
        {step === 3 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Choose Time</h3>
            <p className="text-sm text-gray-500 mb-4">Duration: {totalDuration} min ({selectedServiceNames.map(s => s.name).join(' + ')})</p>
            {slots.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">😔</div>
                <p className="text-gray-500 font-medium">No available slots on this date</p>
                <p className="text-sm text-gray-400 mt-1">Staff may be off or fully booked</p>
                {checkingNext && <p className="text-sm text-pink-500 mt-3">🔍 Finding next available date...</p>}
                {nextAvailable && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Next available:</p>
                    <p className="text-lg font-bold text-pink-600 mt-1">
                      {new Date(nextAvailable + 'T00:00:00').toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <button
                      onClick={() => setSelectedDate(nextAvailable)}
                      className="mt-3 bg-pink-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-pink-700"
                    >
                      Go to {new Date(nextAvailable + 'T00:00:00').toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })} →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {slots.map((slot, i) => (
                  <button key={i} onClick={() => setSelectedSlot(slot)}
                    className={`p-3 rounded-xl border-2 text-center transition ${selectedSlot?.start === slot.start ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-300 bg-white'}`}>
                    <div className="font-medium">{new Date(slot.start).toLocaleTimeString('en-NZ', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })}</div>
                  </button>
                ))}
              </div>
              </div>
            )}
            <div className="flex gap-2 mt-6">
              <button onClick={() => setStep(2)} className="border px-4 py-2.5 rounded-lg">Back</button>
              <button onClick={() => setStep(4)} disabled={!selectedSlot}
                className="flex-1 md:flex-none bg-pink-600 text-white px-4 py-2.5 rounded-lg disabled:opacity-50 font-medium">Next</button>
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Your Information</h3>
            <div className="bg-white rounded-xl shadow p-4 md:p-6 mb-6">
              <div className="grid grid-cols-1 gap-3">
                <input placeholder="Full Name" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value.replace(/[^a-zA-ZÀ-ỹà-ỹĂăÂâĐđÊêÔôƠơƯưẠ-ỹ\s\-']/g, '')})} className="border rounded-lg px-3 py-2.5" required minLength={2} />
                <input placeholder="Phone" type="tel" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} className="border rounded-lg px-3 py-2.5" required minLength={7} />
                <input placeholder="Email (optional)" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} className="border rounded-lg px-3 py-2.5" />
                <input placeholder="Notes (optional)" value={customer.notes} onChange={e => setCustomer({...customer, notes: e.target.value})} className="border rounded-lg px-3 py-2.5" />
              </div>
              <p className="text-xs text-pink-500 mt-2">⭐ Enter your correct phone & email to collect loyalty points!</p>
            </div>
            <div className="bg-pink-50 rounded-xl p-6 mb-6">
              <h4 className="font-semibold mb-3">📋 Summary</h4>
              <div className="space-y-1 text-sm">
                <div><strong>Services:</strong> {selectedServiceNames.map(s => `${s.name} ($${s.price})`).join(', ')}</div>
                <div><strong>Staff:</strong> {staff?.name}</div>
                <div><strong>Date:</strong> {selectedDate}</div>
                <div><strong>Time:</strong> {selectedSlot && new Date(selectedSlot.start).toLocaleTimeString('en-NZ', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })}</div>
                <div><strong>Duration:</strong> {totalDuration} min</div>
                <div className="font-bold text-lg mt-2"><strong>Total:</strong> ${totalPrice.toFixed(2)}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(3)} className="border px-4 py-2.5 rounded-lg">Back</button>
              <button onClick={handleBook} disabled={!customer.name || !customer.phone || loading}
                className="flex-1 bg-pink-600 text-white px-6 py-2.5 rounded-lg disabled:opacity-50 font-medium">
                {loading ? 'Booking...' : '✅ Confirm Booking'}
              </button>
            </div>
          </div>
        )}

        {/* Gallery Section */}
        {gallery.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-bold mb-4">🖼 Our Work</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
              {gallery.slice(0, 9).map(img => (
                <img key={img.id} src={img.image_url} alt={img.caption || ''} className="w-full h-32 object-cover rounded-lg" />
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-bold mb-4">⭐ Reviews ({reviews.length})</h3>
            <div className="space-y-3">
              {reviews.slice(0, 5).map(r => (
                <div key={r.id} className="bg-white rounded-xl shadow-sm border p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{r.customer_name}</span>
                    <span className="text-yellow-400 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { api, getSalonTimezone } from '../utils/api'
import { useI18n } from '../utils/i18n'

const TZ = getSalonTimezone()

export default function Booking() {
  const { slug } = useParams()
  const { t, lang, switchLang } = useI18n()
  const [step, setStep] = useState(1)
  const [salon, setSalon] = useState(null)
  const [services, setServices] = useState([])
  const [staffList, setStaffList] = useState([])
  const [slots, setSlots] = useState([])
  const [gallery, setGallery] = useState([])
  const [reviews, setReviews] = useState([])
  const [salonRating, setSalonRating] = useState(null)

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
    }).catch(() => setError(t('salonNotFound')))
    api.getPublicServices(slug).then(setServices).catch(console.error)
    api.getPublicStaff(slug).then(setStaffList).catch(console.error)
    api.getPublicGallery(slug).then(setGallery).catch(console.error)
    api.getPublicReviews(slug).then(setReviews).catch(console.error)
    api.getSalonRating(slug).then(setSalonRating).catch(console.error)
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
      alert(t('pleaseEnterName'))
      return
    }
    if (/[0-9]/.test(customer.name)) {
      alert(t('nameNoNumbers'))
      return
    }
    if (!customer.phone || customer.phone.replace(/\D/g, '').length < 7) {
      alert(t('pleaseEnterPhone'))
      return
    }
    if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      alert(t('pleaseEnterEmail'))
      return
    }
    if (!selectedSlot) {
      alert(t('pleaseSelectSlot'))
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
        <h1 className="text-2xl font-bold mb-2">{t('bookingSuccess')}</h1>
        <p className="text-gray-500 mb-6">{customer.name}, {t('bookingSuccessMsg')} <strong>{salon?.name}</strong> {t('hasBeenConfirmed')}</p>
        <div className="bg-white rounded-xl shadow p-6 text-left">
          <div className="mb-2"><strong>{t('servicesLabel')}:</strong> {selectedServiceNames.map(s => s.name).join(', ')}</div>
          <div className="mb-2"><strong>{t('staffLabel')}:</strong> {staff?.name}</div>
          <div className="mb-2"><strong>{t('dateLabel')}:</strong> {selectedDate}</div>
          <div className="mb-2"><strong>{t('timeLabel')}:</strong> {selectedSlot && new Date(selectedSlot.start).toLocaleTimeString('en-NZ', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })}</div>
          <div className="mb-2"><strong>{t('durationLabelKey')}:</strong> {totalDuration} {t('minTotal')}</div>
          <div><strong>{t('price')}:</strong> ${totalPrice.toFixed(2)}</div>
          {doneData?.booking_code && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg text-center">
              <div className="text-xs text-gray-500 uppercase">{t('bookingCode')}</div>
              <div className="text-2xl font-bold text-green-600 font-mono">{doneData.booking_code}</div>
            </div>
          )}
        </div>
        <button onClick={() => { setDone(false); setStep(1); setSelectedServices([]); setSelectedStaff(null); setSelectedDate(''); setSelectedSlot(null); setCustomer({ name: '', phone: '', email: '', notes: '' }) }}
          className="mt-6 bg-pink-600 text-white px-6 py-3 rounded-xl hover:bg-pink-700">
          {t('bookAnother')}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Salon Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="text-gray-400 hover:text-gray-600 text-sm">← {t('home')}</a>
            <select value={lang} onChange={e => switchLang(e.target.value)} className="text-xs border rounded px-2 py-1">
              <option value="en">EN</option>
              <option value="vi">VI</option>
              <option value="mi">MI</option>
            </select>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-lg md:text-xl font-bold text-pink-600">💅 {salon?.name || t('loading')}</h1>
            {salonRating && salonRating.total_reviews > 0 && (
              <span className="text-sm text-yellow-500 ml-auto">⭐ {salonRating.average_rating} ({salonRating.total_reviews})</span>
            )}
          </div>
          {salon?.address && <p className="text-sm text-gray-500 mt-1">📍 {salon.address}</p>}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-center">{t('bookAppointment')}</h2>

        {/* Progress */}
        <div className="flex items-center justify-center gap-1 md:gap-2 mb-8">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`flex items-center gap-1 md:gap-2 ${step >= s ? 'text-pink-600' : 'text-gray-300'}`}>
              <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold ${step >= s ? 'bg-pink-600 text-white' : 'bg-gray-200'}`}>{s}</div>
              <span className="text-xs md:text-sm hidden md:inline">{s === 1 ? t('chooseServices') : s === 2 ? t('selectStaff') : s === 3 ? t('selectTime') : t('confirm')}</span>
              {s < 4 && <div className={`w-4 md:w-8 h-0.5 ${step > s ? 'bg-pink-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Services (Priority 6: multiple selection) */}
        {step === 1 && (
          <div>
            <p className="text-sm text-gray-500 mb-4">{t('selectServices')} ({selectedServices.length}/3 {t('selectedTotal')})</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.length === 0 && <p className="text-gray-400 col-span-2 text-center">{t('loadingServices')}</p>}
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
                      <div className="text-sm text-gray-500">{s.category} • {s.duration_min} {t('minTotal')}</div>
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
                  {selectedServices.length} {t('servicesSelected')} · {t('total')}: {totalDuration} {t('minTotal')} · ${totalPrice.toFixed(2)}
                </div>
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button onClick={() => setStep(2)} disabled={selectedServices.length === 0}
                className="w-full md:w-auto bg-pink-600 text-white px-6 py-3 rounded-lg disabled:opacity-50 font-medium">{t('nextBtn')}</button>
            </div>
          </div>
        )}

        {/* Step 2: Staff & Date */}
        {step === 2 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('chooseStaff')}</h3>
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
            <h3 className="text-lg font-semibold mb-4">{t('chooseDate')}</h3>
            <input type="date" value={selectedDate} min={new Date().toISOString().split('T')[0]}
              onChange={e => { setSelectedDate(e.target.value); setNextAvailable(null); }}
              className="border rounded-lg px-3 py-2 mb-6" />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setStep(1)} className="border px-4 py-2.5 rounded-lg">{t('back')}</button>
              <button onClick={() => setStep(3)} disabled={!selectedStaff || !selectedDate}
                className="flex-1 md:flex-none bg-pink-600 text-white px-4 py-2.5 rounded-lg disabled:opacity-50 font-medium">{t('nextBtn')}</button>
            </div>
          </div>
        )}

        {/* Step 3: Time */}
        {step === 3 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">{t('chooseTime')}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('durationLabel')}: {totalDuration} {t('minTotal')} ({selectedServiceNames.map(s => s.name).join(' + ')})</p>
            {slots.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">😔</div>
                <p className="text-gray-500 font-medium">{t('noSlotsTitle')}</p>
                <p className="text-sm text-gray-400 mt-1">{t('staffMayBeOff')}</p>
                {checkingNext && <p className="text-sm text-pink-500 mt-3">🔍 {t('findingNext')}</p>}
                {nextAvailable && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">{t('nextAvailable')}:</p>
                    <p className="text-lg font-bold text-pink-600 mt-1">
                      {new Date(nextAvailable + 'T00:00:00').toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <button
                      onClick={() => setSelectedDate(nextAvailable)}
                      className="mt-3 bg-pink-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-pink-700"
                    >
                      {t('goTo')} {new Date(nextAvailable + 'T00:00:00').toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })} →
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
              <button onClick={() => setStep(2)} className="border px-4 py-2.5 rounded-lg">{t('back')}</button>
              <button onClick={() => setStep(4)} disabled={!selectedSlot}
                className="flex-1 md:flex-none bg-pink-600 text-white px-4 py-2.5 rounded-lg disabled:opacity-50 font-medium">{t('nextBtn')}</button>
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('yourInfo')}</h3>
            <div className="bg-white rounded-xl shadow p-4 md:p-6 mb-6">
              <div className="grid grid-cols-1 gap-3">
                <input placeholder={t('fullName')} value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value.replace(/[^a-zA-ZÀ-ỹà-ỹĂăÂâĐđÊêÔôƠơƯưẠ-ỹ\s\-']/g, '')})} className="border rounded-lg px-3 py-2.5" required minLength={2} />
                <input placeholder={t('phonePlaceholder')} type="tel" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} className="border rounded-lg px-3 py-2.5" required minLength={7} />
                <input placeholder={t('emailOptional')} value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} className="border rounded-lg px-3 py-2.5" />
                <input placeholder={t('notesOptional')} value={customer.notes} onChange={e => setCustomer({...customer, notes: e.target.value})} className="border rounded-lg px-3 py-2.5" />
              </div>
              <p className="text-xs text-pink-500 mt-2">⭐ {t('loyaltyHint')}</p>
            </div>
            <div className="bg-pink-50 rounded-xl p-6 mb-6">
              <h4 className="font-semibold mb-3">📋 {t('summaryTitle')}</h4>
              <div className="space-y-1 text-sm">
                <div><strong>{t('servicesLabel')}:</strong> {selectedServiceNames.map(s => `${s.name} ($${s.price})`).join(', ')}</div>
                <div><strong>{t('staffLabel')}:</strong> {staff?.name}</div>
                <div><strong>{t('dateLabel')}:</strong> {selectedDate}</div>
                <div><strong>{t('timeLabel')}:</strong> {selectedSlot && new Date(selectedSlot.start).toLocaleTimeString('en-NZ', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })}</div>
                <div><strong>{t('durationLabelKey')}:</strong> {totalDuration} {t('minTotal')}</div>
                <div className="font-bold text-lg mt-2"><strong>{t('totalLabel')}:</strong> ${totalPrice.toFixed(2)}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(3)} className="border px-4 py-2.5 rounded-lg">{t('back')}</button>
              <button onClick={handleBook} disabled={!customer.name || !customer.phone || loading}
                className="flex-1 bg-pink-600 text-white px-6 py-2.5 rounded-lg disabled:opacity-50 font-medium">
                {loading ? t('bookingAction') : `✅ ${t('confirmBooking')}`}
              </button>
            </div>
          </div>
        )}

        {/* Gallery Section */}
        {gallery.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-bold mb-4">🖼 {t('ourWork')}</h3>
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
            <h3 className="text-lg font-bold mb-4">⭐ {t('reviewsCount')} ({reviews.length})</h3>
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

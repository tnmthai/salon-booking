import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { api, getSalonTimezone, setSalonTimezone } from '../utils/api'
import { useI18n } from '../utils/i18n'

const TZ = getSalonTimezone()

// Upper bound on services per booking, so one appointment cannot swallow a
// whole day. Raised from 3 — three was arbitrary and blocked real combos.
const MAX_SERVICES = 6

// Today's date in a given timezone (YYYY-MM-DD)
function todayInTimezone(tz) {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  } catch {
    // Fallback to browser local
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
}

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
  const [selectedStaff, setSelectedStaff] = useState(0) // 0 = Any Staff
  const [selectedDate, setSelectedDate] = useState('')
  const [nextAvailable, setNextAvailable] = useState(null)
  const [salonTz, setSalonTz] = useState('Pacific/Auckland')
  const [checkingNext, setCheckingNext] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [doneData, setDoneData] = useState(null)
  const [limitMsg, setLimitMsg] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    api.getSalon(slug).then(salonData => {
      setSalon(salonData)
      const tz = salonData.timezone || 'Pacific/Auckland'
      setSalonTz(tz)
      setSalonTimezone(tz)
      api.trackVisit(salonData.id, 'booking').catch(() => {})
    }).catch(() => setError(t('salonNotFound')))
    api.getPublicServices(slug).then(setServices).catch(console.error)
    api.getPublicStaff(slug).then(setStaffList).catch(console.error)
    api.getPublicGallery(slug).then(setGallery).catch(console.error)
    api.getPublicReviews(slug).then(setReviews).catch(console.error)
    api.getSalonRating(slug).then(setSalonRating).catch(console.error)
  }, [slug])

  useEffect(() => {
    if (selectedServices.length > 0 && selectedDate) {
      const staffParam = selectedStaff ? selectedStaff : 'any'
      const totalDur = selectedServices.reduce((sum, svcId) => {
        const svc = services.find(s => s.id == svcId)
        return sum + (svc?.duration_min || 30)
      }, 0)
      const params = `slug=${slug}&staff_id=${staffParam}&service_ids=${selectedServices.join(',')}&date=${selectedDate}`
      setNextAvailable(null)
      fetch(`/api/appointments/slots?${params}`).then(r => r.json()).then(async (data) => {
        setSlots(data)
        if (data.length === 0) {
          setCheckingNext(true)
          for (let i = 1; i <= 14; i++) {
            const d = new Date(selectedDate + 'T00:00:00')
            d.setDate(d.getDate() + i)
            const dateStr = d.toISOString().split('T')[0]
            try {
              const check = await fetch(`/api/appointments/slots?slug=${slug}&staff_id=${staffParam}&service_ids=${selectedServices.join(',')}&date=${dateStr}`)
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
        setLimitMsg('')
        return prev.filter(id => id !== svcId)
      }
      if (prev.length >= MAX_SERVICES) {
        // The old code silently ignored the click, which just looked broken.
        setLimitMsg(t('maxServicesReached'))
        setTimeout(() => setLimitMsg(''), 3000)
        return prev
      }
      setLimitMsg('')
      return [...prev, svcId]
    })
  }

  // Services grouped by category so duplicate-looking names ("SNS Dipping
  // Powder with Gel Polish" exists as Extension, Infill and Overlay) are
  // finally distinguishable.
  const categories = [...new Set(services.map(s => s.category).filter(Boolean))]
  const visibleServices = activeCategory
    ? services.filter(s => s.category === activeCategory)
    : services
  const groupedServices = visibleServices.reduce((acc, s) => {
    const key = s.category || t('otherCategory')
    if (!acc[key]) acc[key] = []
    acc[key].push(s)
    return acc
  }, {})

  const formatLongDate = (dateStr) => {
    if (!dateStr) return ''
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-NZ', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    } catch { return dateStr }
  }

  // Errors are shown under the offending field instead of in a browser alert,
  // which appeared only after Confirm and said nothing about which box was wrong.
  const validate = () => {
    const errs = {}
    if (!customer.name || customer.name.trim().length < 2) errs.name = t('pleaseEnterName')
    else if (/[0-9]/.test(customer.name)) errs.name = t('nameNoNumbers')
    if (!customer.phone || customer.phone.replace(/\D/g, '').length < 7) errs.phone = t('pleaseEnterPhone')
    if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) errs.email = t('pleaseEnterEmail')
    if (!selectedSlot) errs.slot = t('pleaseSelectSlot')
    return errs
  }

  const handleBook = async () => {
    const errs = validate()
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    try {
      // Use the actual staff from the selected slot (important for 'any staff')
      const actualStaffId = selectedSlot.staff_id || selectedStaff
      const result = await api.createPublicAppointment({
        salon_id: salon.id,
        service_id: selectedServices[0], // Primary service
        service_ids: selectedServices, // All services (Priority 6)
        staff_id: actualStaffId,
        customer_name: customer.name.trim(),
        customer_phone: customer.phone.trim(),
        customer_email: customer.email?.trim() || '',
        start_time: selectedSlot.start,
        notes: customer.notes?.trim() || '',
      })
      setDoneData(result)
      setDone(true)
    } catch (err) {
      setFieldErrors({ submit: err.message })
    }
    setLoading(false)
  }

  const selectedServiceNames = selectedServices.map(id => services.find(s => s.id == id)).filter(Boolean)
  // Resolve actual staff info: prefer slot's staff_name, else lookup by id
  const resolvedStaffName = selectedSlot?.staff_name 
    || (selectedStaff > 0 ? staffList.find(s => s.id == selectedStaff)?.name : null)
    || (t('anyStaff') || 'Any Staff')

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
          <div className="mb-2"><strong>{t('staffLabel')}:</strong> {resolvedStaffName}</div>
          <div className="mb-2"><strong>{t('dateLabel')}:</strong> {formatLongDate(selectedDate)}</div>
          <div className="mb-2"><strong>{t('timeLabel')}:</strong> {selectedSlot && new Date(selectedSlot.start).toLocaleTimeString('en-NZ', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })}</div>
          <div className="mb-2"><strong>{t('durationLabelKey')}:</strong> {totalDuration} {t('minTotal')}</div>
          <div><strong>{t('price')}:</strong> ${totalPrice.toFixed(2)}</div>
          {doneData?.booking_code && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg text-center">
              <div className="text-xs text-gray-500 uppercase">{t('bookingCode')}</div>
              <div className="text-2xl font-bold text-green-600 font-mono">{doneData.booking_code}</div>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-4">
            {customer.email ? t('confirmEmailSent') : t('noEmailNoReminder')}
          </p>
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
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex items-center gap-1 md:gap-2 ${step >= s ? 'text-pink-600' : 'text-gray-300'}`}>
              <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold ${step >= s ? 'bg-pink-600 text-white' : 'bg-gray-200'}`}>{s}</div>
              <span className="text-xs md:text-sm hidden md:inline">{s === 1 ? t('chooseServices') : s === 2 ? (t('selectDateTime') || 'Date & Time') : t('confirm')}</span>
              {s < 3 && <div className={`w-4 md:w-8 h-0.5 ${step > s ? 'bg-pink-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Services (Priority 6: multiple selection) */}
        {step === 1 && (
          <div className="pb-28">
            <p className="text-sm text-gray-500 mb-3">{t('selectServices')}</p>

            {/* Category filter — 16 services in one flat list was unreadable. */}
            {categories.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
                <button onClick={() => setActiveCategory('')}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm border transition ${
                    activeCategory === '' ? 'bg-pink-600 text-white border-pink-600' : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300'
                  }`}>
                  {t('allCategories')}
                </button>
                {categories.map(c => (
                  <button key={c} onClick={() => setActiveCategory(c)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm border transition ${
                      activeCategory === c ? 'bg-pink-600 text-white border-pink-600' : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300'
                    }`}>
                    {c}
                  </button>
                ))}
              </div>
            )}

            {services.length === 0 && <p className="text-gray-400 text-center py-8">{t('loadingServices')}</p>}

            {Object.entries(groupedServices).map(([category, items]) => (
              <div key={category} className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map(s => (
                    <button key={s.id} onClick={() => toggleService(s.id)}
                      className={`p-4 rounded-xl border-2 text-left transition ${
                        selectedServices.includes(s.id)
                          ? 'border-pink-600 bg-pink-50 ring-2 ring-pink-200'
                          : 'border-gray-200 hover:border-pink-300 bg-white'
                      }`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold">{s.name}</div>
                          <div className="text-sm text-gray-500">{s.duration_min} {t('minTotal')}</div>
                        </div>
                        {selectedServices.includes(s.id) && (
                          <span className="text-pink-600 text-xl shrink-0">✓</span>
                        )}
                      </div>
                      <div className="text-lg font-bold text-pink-600 mt-2">${s.price}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {limitMsg && (
              <div className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-30">
                {limitMsg}
              </div>
            )}

            {/* Sticky bar: the Next button used to sit below 16 cards, so you had
                to scroll the whole list before you could move on. */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-20">
              <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  {selectedServices.length > 0 ? (
                    <>
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {selectedServices.length} {t('servicesSelected')} · ${totalPrice.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">{totalDuration} {t('minTotal')}</div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-400">{t('pickAtLeastOne')}</div>
                  )}
                </div>
                <button onClick={() => setStep(2)} disabled={selectedServices.length === 0}
                  className="bg-pink-600 text-white px-6 py-3 rounded-lg disabled:opacity-40 font-medium shrink-0">
                  {t('nextBtn')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Combined Step 2: Staff + Calendar + Time Slots */}
        {step === 2 && (
          <div>
            {/* Staff selector — pointless when the salon is one person, so it is
                hidden and "any staff" resolves to them automatically. */}
            {staffList.length > 1 ? (
              <>
                <h3 className="text-lg font-semibold mb-3">{t('chooseStaff')}</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  <button onClick={() => setSelectedStaff(0)}
                    className={`px-4 py-2.5 rounded-xl border-2 text-center transition ${
                      selectedStaff === 0 ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-200' : 'border-gray-200 hover:border-purple-300 bg-white'
                    }`}>
                    <div className="text-sm font-bold">👥 {t('anyStaff') || 'Any Staff'}</div>
                  </button>
                  {staffList.map(s => (
                    <button key={s.id} onClick={() => setSelectedStaff(s.id)}
                      className={`px-4 py-2.5 rounded-xl border-2 text-center transition ${
                        selectedStaff == s.id ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-200' : 'border-gray-200 hover:border-purple-300 bg-white'
                      }`}>
                      <div className="text-sm font-medium">{s.name}</div>
                    </button>
                  ))}
                </div>
              </>
            ) : staffList.length === 1 && (
              <p className="text-sm text-gray-500 mb-6">{t('withStaff')} <strong className="text-gray-700">{staffList[0].name}</strong></p>
            )}

            {/* Calendar widget */}
            <h3 className="text-lg font-semibold mb-3">{t('chooseDate')}</h3>
            <CalendarWidget
              selectedDate={selectedDate}
              onSelectDate={(d) => { setSelectedDate(d); setNextAvailable(null); setSelectedSlot(null); }}
              minDate={todayInTimezone(salonTz)}
              timezone={salonTz}
            />
            {!selectedDate && <p className="text-sm text-gray-500 mt-2">{t('pickDateHint')}</p>}

            {/* Time slots (shown when date is selected) */}
            {selectedDate && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">{t('chooseTime')}</h3>
                  <p className="text-sm text-gray-500">
                    {totalDuration} {t('minTotal')} {selectedStaff > 0 && `· ${staffList.find(s => s.id == selectedStaff)?.name}`}
                  </p>
                </div>

                {slots.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl">
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
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-gray-500">{slots.length} {t('availableSlots') || 'available'}</span>
                      {selectedStaff === 0 && (
                        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">{t('anyStaff') || 'All staff'}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2.5">
                      {slots.map((slot, i) => {
                        const staffName = slot.staff_name
                        return (
                          <button key={i} onClick={() => setSelectedSlot(slot)}
                            className={`p-3 rounded-xl border-2 text-center transition ${
                              selectedSlot?.start === slot.start && selectedSlot?.staff_id === slot.staff_id
                                ? 'border-green-600 bg-green-50 ring-2 ring-green-200'
                                : 'border-gray-200 hover:border-green-300 bg-white'
                            }`}>
                            <div className="font-medium">
                              {new Date(slot.start).toLocaleTimeString('en-NZ', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })}
                            </div>
                            {selectedStaff === 0 && staffName && (
                              <div className="text-[10px] text-gray-400 mt-0.5 truncate">{staffName}</div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 mt-6">
              <button onClick={() => setStep(1)} className="border px-4 py-2.5 rounded-lg">{t('back')}</button>
              <button onClick={() => setStep(3)} disabled={!selectedSlot || !selectedDate}
                className="flex-1 md:flex-none bg-pink-600 text-white px-4 py-2.5 rounded-lg disabled:opacity-50 font-medium">
                {selectedSlot 
                  ? `${t('nextBtn')} — ${new Date(selectedSlot.start).toLocaleTimeString('en-NZ', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })}`
                  : t('selectTime')}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm (was step 4) */}
        {step === 3 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('yourInfo')}</h3>
            <div className="bg-white rounded-xl shadow p-4 md:p-6 mb-6">
              <div className="grid grid-cols-1 gap-4">
                {/* Labels stay visible once a field is filled — with placeholders
                    alone the form became four unlabelled boxes. */}
                <div>
                  <label htmlFor="bk-name" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('fullName')} <span className="text-pink-600">*</span>
                  </label>
                  <input id="bk-name" placeholder={t('fullName')} value={customer.name}
                    onChange={e => { setCustomer({...customer, name: e.target.value.replace(/[^a-zA-ZÀ-ỹà-ỹĂăÂâĐđÊêÔôƠơƯưẠ-ỹ\s\-']/g, '')}); setFieldErrors(p => ({ ...p, name: '' })) }}
                    className={`w-full border rounded-lg px-3 py-2.5 ${fieldErrors.name ? 'border-red-400' : ''}`} required minLength={2} />
                  {fieldErrors.name && <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>}
                </div>

                <div>
                  <label htmlFor="bk-phone" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('phoneLabel')} <span className="text-pink-600">*</span>
                  </label>
                  <input id="bk-phone" placeholder={t('phonePlaceholder')} type="tel" inputMode="tel" value={customer.phone}
                    onChange={e => { setCustomer({...customer, phone: e.target.value}); setFieldErrors(p => ({ ...p, phone: '' })) }}
                    className={`w-full border rounded-lg px-3 py-2.5 ${fieldErrors.phone ? 'border-red-400' : ''}`} required minLength={7} />
                  {fieldErrors.phone && <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>}
                </div>

                <div>
                  <label htmlFor="bk-email" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('emailLabel')}
                  </label>
                  <input id="bk-email" placeholder="you@example.com" type="email" inputMode="email" value={customer.email}
                    onChange={e => { setCustomer({...customer, email: e.target.value}); setFieldErrors(p => ({ ...p, email: '' })) }}
                    className={`w-full border rounded-lg px-3 py-2.5 ${fieldErrors.email ? 'border-red-400' : ''}`} />
                  {fieldErrors.email
                    ? <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
                    : !customer.email && <p className="text-xs text-amber-600 mt-1">⚠️ {t('emailNeededForReminder')}</p>}
                </div>

                <div>
                  <label htmlFor="bk-notes" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('notesOptional')}
                  </label>
                  <input id="bk-notes" placeholder={t('notesPlaceholder')} value={customer.notes}
                    onChange={e => setCustomer({...customer, notes: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2.5" />
                </div>
              </div>
              <p className="text-xs text-pink-500 mt-3">⭐ {t('loyaltyHint')}</p>
            </div>
            <div className="bg-pink-50 rounded-xl p-6 mb-6">
              <h4 className="font-semibold mb-3">📋 {t('summaryTitle')}</h4>
              <div className="space-y-1 text-sm">
                <div><strong>{t('servicesLabel')}:</strong> {selectedServiceNames.map(s => `${s.name} ($${s.price})`).join(', ')}</div>
                {/* Show who will actually do the appointment — the system knows
                    it from the chosen slot, so "Any Staff" was needless mystery. */}
                <div><strong>{t('staffLabel')}:</strong> {resolvedStaffName}</div>
                <div><strong>{t('dateLabel')}:</strong> {formatLongDate(selectedDate)}</div>
                <div><strong>{t('timeLabel')}:</strong> {selectedSlot && new Date(selectedSlot.start).toLocaleTimeString('en-NZ', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })}</div>
                <div><strong>{t('durationLabelKey')}:</strong> {totalDuration} {t('minTotal')}</div>
                <div className="font-bold text-lg mt-2"><strong>{t('totalLabel')}:</strong> ${totalPrice.toFixed(2)}</div>
              </div>
            </div>
            {fieldErrors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                {fieldErrors.submit}
              </div>
            )}
            {fieldErrors.slot && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                {fieldErrors.slot}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => setStep(2)} className="border px-4 py-2.5 rounded-lg">{t('back')}</button>
              <button onClick={handleBook} disabled={!customer.name || !customer.phone || loading}
                className="flex-1 bg-pink-600 text-white px-6 py-2.5 rounded-lg disabled:opacity-50 font-medium">
                {loading ? t('bookingAction') : `✅ ${t('confirmBooking')}`}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">{t('confirmFinePrint')}</p>
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

/* ── Calendar Widget ── */
function CalendarWidget({ selectedDate, onSelectDate, minDate, timezone }) {
  const todayStr = todayInTimezone(timezone || 'Pacific/Auckland')
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())
  const [viewYear, setViewYear] = useState(new Date().getFullYear())

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const daysOfWeek = ['Mo','Tu','We','Th','Fr','Sa','Su']

  const firstDay = new Date(viewYear, viewMonth, 1)
  const lastDay = new Date(viewYear, viewMonth + 1, 0)
  const startPad = (firstDay.getDay() + 6) % 7 // Monday as first day

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }

  const isDisabled = (d) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    return minDate && dateStr < minDate
  }

  const isSelected = (d) => {
    return selectedDate === `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  const isToday = (d) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    return dateStr === todayStr
  }

  const cells = []
  // Empty cells before first day
  for (let i = 0; i < startPad; i++) cells.push(<div key={`pad-${i}`} />)
  // Day cells
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const disabled = isDisabled(d)
    const selected = isSelected(d)
    const todayClass = isToday(d)
    cells.push(
      <button
        key={d}
        disabled={disabled}
        onClick={() => !disabled && onSelectDate(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`)}
        className={`w-full aspect-square rounded-lg text-sm font-medium transition flex items-center justify-center
          ${selected ? 'bg-pink-600 text-white ring-2 ring-pink-300' : ''}
          ${!selected && todayClass ? 'bg-pink-100 text-pink-700 font-bold' : ''}
          ${!selected && !todayClass && !disabled ? 'hover:bg-pink-50 text-gray-700' : ''}
          ${disabled ? 'text-gray-200 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {d}
      </button>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 max-w-sm">
      {/* Month/Year navigation */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="font-semibold text-sm">{months[viewMonth]} {viewYear}</div>
        <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {daysOfWeek.map(d => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>
      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells}
      </div>
    </div>
  )
}

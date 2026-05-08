import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../utils/api'

export default function Booking() {
  const { slug } = useParams()
  const [step, setStep] = useState(1)
  const [salon, setSalon] = useState(null)
  const [services, setServices] = useState([])
  const [staffList, setStaffList] = useState([])
  const [slots, setSlots] = useState([])

  const [selected, setSelected] = useState({ service: null, staff: null, date: '', slot: null })
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getSalon(slug).then(setSalon).catch(() => setError('Salon not found'))
    api.getPublicServices(slug).then(setServices).catch(console.error)
    api.getPublicStaff(slug).then(setStaffList).catch(console.error)
  }, [slug])

  useEffect(() => {
    if (selected.staff && selected.service && selected.date) {
      api.getSlots(slug, selected.staff, selected.service, selected.date)
        .then(setSlots).catch(console.error)
    }
  }, [selected.staff, selected.service, selected.date, slug])

  const handleBook = async () => {
    setLoading(true)
    try {
      const customers = await api.getCustomers().catch(() => [])
      let cust = customers.find(c => c.phone === customer.phone || c.email === customer.email)
      if (!cust) {
        cust = await api.createCustomer({ ...customer, slug })
      }

      await api.createAppointment({
        slug,
        customer_id: cust.id,
        staff_id: selected.staff,
        service_id: selected.service,
        start_time: selected.slot.start,
        notes: customer.notes,
      })
      setDone(true)
    } catch (err) {
      alert(err.message)
    }
    setLoading(false)
  }

  const service = services.find(s => s.id == selected.service)
  const staff = staffList.find(s => s.id == selected.staff)

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
        <p className="text-gray-500 mb-6">{customer.name}, hair appointment at <strong>{salon?.name}</strong> has been confirmed.</p>
        <div className="bg-white rounded-xl shadow p-6 text-left">
          <div className="mb-2"><strong>Service:</strong> {service?.name}</div>
          <div className="mb-2"><strong>Staff:</strong> {staff?.name}</div>
          <div className="mb-2"><strong>Date:</strong> {selected.date}</div>
          <div className="mb-2"><strong>Time:</strong> {selected.slot && new Date(selected.slot.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
          <div><strong>Price:</strong> ${service?.price}</div>
        </div>
        <button onClick={() => { setDone(false); setStep(1); setSelected({ service: null, staff: null, date: '', slot: null }); setCustomer({ name: '', phone: '', email: '', notes: '' }) }}
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
          <h1 className="text-xl font-bold text-pink-600">✂️ {salon?.name || 'Loading...'}</h1>
          {salon?.address && <p className="text-sm text-gray-500">📍 {salon.address}</p>}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Book Appointment</h2>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`flex items-center gap-2 ${step >= s ? 'text-pink-600' : 'text-gray-300'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-pink-600 text-white' : 'bg-gray-200'}`}>{s}</div>
              <span className="text-sm hidden md:inline">{s === 1 ? 'Service' : s === 2 ? 'Staff' : s === 3 ? 'Time' : 'Confirm'}</span>
              {s < 4 && <div className={`w-8 h-0.5 ${step > s ? 'bg-pink-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Service */}
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.length === 0 && <p className="text-gray-400 col-span-2 text-center">Loading services...</p>}
            {services.map(s => (
              <button key={s.id} onClick={() => { setSelected({...selected, service: s.id}); setStep(2) }}
                className={`p-4 rounded-xl border-2 text-left transition ${selected.service == s.id ? 'border-pink-600 bg-pink-50' : 'border-gray-200 hover:border-pink-300 bg-white'}`}>
                <div className="font-semibold">{s.name}</div>
                <div className="text-sm text-gray-500">{s.category} • {s.duration_min} min</div>
                <div className="text-lg font-bold text-pink-600 mt-2">${s.price}</div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Staff & Date */}
        {step === 2 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Choose Staff</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {staffList.map(s => (
                <button key={s.id} onClick={() => setSelected({...selected, staff: s.id})}
                  className={`p-3 rounded-xl border-2 text-center transition ${selected.staff == s.id ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300 bg-white'}`}>
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 text-lg">{s.name.charAt(0)}</div>
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className="text-xs text-gray-400">{s.role}</div>
                </button>
              ))}
            </div>
            <h3 className="text-lg font-semibold mb-4">Choose Date</h3>
            <input type="date" value={selected.date} min={new Date().toISOString().split('T')[0]}
              onChange={e => setSelected({...selected, date: e.target.value})}
              className="border rounded-lg px-3 py-2 mb-6" />
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="border px-4 py-2 rounded-lg">Back</button>
              <button onClick={() => setStep(3)} disabled={!selected.staff || !selected.date}
                className="bg-pink-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">Next</button>
            </div>
          </div>
        )}

        {/* Step 3: Time */}
        {step === 3 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Choose Time</h3>
            {slots.length === 0 ? (
              <p className="text-gray-400">No available slots. Try another date.</p>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {slots.map((slot, i) => (
                  <button key={i} onClick={() => setSelected({...selected, slot})}
                    className={`p-3 rounded-xl border-2 text-center transition ${selected.slot?.start === slot.start ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-300 bg-white'}`}>
                    <div className="font-medium">{new Date(slot.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2 mt-6">
              <button onClick={() => setStep(2)} className="border px-4 py-2 rounded-lg">Back</button>
              <button onClick={() => setStep(4)} disabled={!selected.slot}
                className="bg-pink-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">Next</button>
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Your Information</h3>
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="Full Name" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="border rounded-lg px-3 py-2" required />
                <input placeholder="Phone" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} className="border rounded-lg px-3 py-2" required />
                <input placeholder="Email (optional)" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} className="border rounded-lg px-3 py-2" />
                <input placeholder="Notes (optional)" value={customer.notes} onChange={e => setCustomer({...customer, notes: e.target.value})} className="border rounded-lg px-3 py-2" />
              </div>
            </div>
            <div className="bg-pink-50 rounded-xl p-6 mb-6">
              <h4 className="font-semibold mb-3">📋 Summary</h4>
              <div className="space-y-1 text-sm">
                <div><strong>Service:</strong> {service?.name} (${service?.price})</div>
                <div><strong>Staff:</strong> {staff?.name}</div>
                <div><strong>Date:</strong> {selected.date}</div>
                <div><strong>Time:</strong> {selected.slot && new Date(selected.slot.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                <div><strong>Duration:</strong> {service?.duration_min} min</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(3)} className="border px-4 py-2 rounded-lg">Back</button>
              <button onClick={handleBook} disabled={!customer.name || !customer.phone || loading}
                className="bg-pink-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 flex-1">
                {loading ? 'Booking...' : '✅ Confirm Booking'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

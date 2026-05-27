import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../utils/api'

const PRESET_AMOUNTS = [25, 50, 75, 100, 150, 200]

export default function GiftCard() {
  const { slug } = useParams()
  const [salon, setSalon] = useState(null)
  const [step, setStep] = useState(1) // 1=form, 2=confirm, 3=done
  const [amount, setAmount] = useState(50)
  const [customAmount, setCustomAmount] = useState('')
  const [form, setForm] = useState({
    purchaser_name: '',
    purchaser_email: '',
    recipient_name: '',
    recipient_email: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [lookupCode, setLookupCode] = useState('')
  const [lookupResult, setLookupResult] = useState(null)
  const [lookupError, setLookupError] = useState('')

  useEffect(() => {
    api.getSalon(slug).then(setSalon).catch(() => setError('Salon not found'))
  }, [slug])

  const selectedAmount = customAmount ? parseFloat(customAmount) || 0 : amount

  const handlePurchase = async () => {
    if (selectedAmount < 5 || selectedAmount > 500) {
      alert('Amount must be between $5 and $500')
      return
    }
    if (!form.purchaser_name || !form.purchaser_email) {
      alert('Your name and email are required')
      return
    }
    setLoading(true)
    try {
      const res = await api.purchaseGiftCard({
        slug,
        amount: selectedAmount,
        ...form,
      })
      setResult(res)
      setStep(3)
    } catch (err) {
      alert(err.message)
    }
    setLoading(false)
  }

  const handleLookup = async () => {
    if (!lookupCode) return
    setLookupError('')
    setLookupResult(null)
    try {
      const res = await api.lookupGiftCard(lookupCode)
      setLookupResult(res)
    } catch (err) {
      setLookupError(err.message)
    }
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4">
          <a href={`/book/${slug}`} className="text-gray-400 hover:text-gray-600 text-sm">← Back to Booking</a>
          <h1 className="text-lg md:text-xl font-bold text-pink-600 mt-1">🎁 {salon?.name || 'Loading...'} — Gift Card</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Step 1: Form */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center">Buy a Gift Card</h2>

            {/* Amount selection */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Select Amount</h3>
              <div className="grid grid-cols-3 gap-3 mb-3">
                {PRESET_AMOUNTS.map(a => (
                  <button key={a} onClick={() => { setAmount(a); setCustomAmount(''); }}
                    className={`p-3 rounded-xl border-2 text-center font-bold transition ${
                      amount === a && !customAmount ? 'border-pink-600 bg-pink-50 text-pink-600' : 'border-gray-200 hover:border-pink-300'
                    }`}>
                    ${a}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Or custom:</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input type="number" min="5" max="500" placeholder="5-500"
                    value={customAmount} onChange={e => setCustomAmount(e.target.value)}
                    className="border rounded-lg pl-7 pr-3 py-2 w-28" />
                </div>
              </div>
            </div>

            {/* Your info */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Your Information</h3>
              <div className="space-y-3">
                <input placeholder="Your Name *" value={form.purchaser_name}
                  onChange={e => setForm({...form, purchaser_name: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2.5" />
                <input placeholder="Your Email *" type="email" value={form.purchaser_email}
                  onChange={e => setForm({...form, purchaser_email: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2.5" />
              </div>
            </div>

            {/* Recipient info */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Recipient (optional)</h3>
              <div className="space-y-3">
                <input placeholder="Recipient Name" value={form.recipient_name}
                  onChange={e => setForm({...form, recipient_name: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2.5" />
                <input placeholder="Recipient Email" type="email" value={form.recipient_email}
                  onChange={e => setForm({...form, recipient_email: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2.5" />
                <textarea placeholder="Personal message (optional)" value={form.message}
                  onChange={e => setForm({...form, message: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2.5 h-20 resize-none" />
              </div>
            </div>

            <button onClick={() => setStep(2)} disabled={selectedAmount < 5}
              className="w-full bg-pink-600 text-white py-3 rounded-xl font-bold disabled:opacity-50 hover:bg-pink-700">
              Continue — ${selectedAmount.toFixed(2)}
            </button>
          </div>
        )}

        {/* Step 2: Confirm */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center">Confirm Purchase</h2>
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <div className="text-center mb-4">
                <div className="text-5xl mb-2">🎁</div>
                <div className="text-3xl font-bold text-pink-600">${selectedAmount.toFixed(2)}</div>
                <div className="text-sm text-gray-500">Gift Card</div>
              </div>
              <div className="space-y-2 text-sm border-t pt-4">
                <div><strong>From:</strong> {form.purchaser_name}</div>
                {form.recipient_name && <div><strong>To:</strong> {form.recipient_name}</div>}
                {form.message && <div><strong>Message:</strong> {form.message}</div>}
                <div className="text-xs text-gray-400 mt-2">Valid for 1 year from purchase</div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 border py-3 rounded-xl">Back</button>
              <button onClick={handlePurchase} disabled={loading}
                className="flex-1 bg-pink-600 text-white py-3 rounded-xl font-bold disabled:opacity-50">
                {loading ? 'Processing...' : '✅ Purchase'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Done */}
        {step === 3 && result && (
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">Gift Card Purchased!</h2>
            <p className="text-gray-500 mb-6">Share this code with your recipient</p>
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <div className="text-xs text-gray-500 uppercase mb-1">Gift Card Code</div>
              <div className="text-3xl font-bold text-pink-600 font-mono tracking-wider">{result.code}</div>
              <div className="text-lg font-semibold mt-2">${selectedAmount.toFixed(2)}</div>
              {result.recipient_name && (
                <div className="text-sm text-gray-500 mt-1">For: {result.recipient_name}</div>
              )}
              <div className="text-xs text-gray-400 mt-2">
                Expires: {new Date(result.expires_at).toLocaleDateString('en-NZ')}
              </div>
            </div>
            {result.recipient_email && (
              <p className="text-sm text-gray-500 mb-4">📧 Sent to {result.recipient_email}</p>
            )}
            <button onClick={() => { setStep(1); setResult(null); setForm({ purchaser_name: '', purchaser_email: '', recipient_name: '', recipient_email: '', message: '' }); }}
              className="bg-pink-600 text-white px-6 py-3 rounded-xl hover:bg-pink-700">
              Buy Another
            </button>
          </div>
        )}

        {/* Lookup section */}
        <div className="mt-12 border-t pt-8">
          <h3 className="text-lg font-bold mb-4 text-center">🔍 Check Gift Card Balance</h3>
          <div className="flex gap-2">
            <input placeholder="Enter gift card code" value={lookupCode}
              onChange={e => setLookupCode(e.target.value.toUpperCase())}
              className="flex-1 border rounded-lg px-3 py-2.5 font-mono" />
            <button onClick={handleLookup}
              className="bg-gray-800 text-white px-4 py-2.5 rounded-lg hover:bg-gray-700">
              Check
            </button>
          </div>
          {lookupError && <p className="text-red-500 text-sm mt-2">{lookupError}</p>}
          {lookupResult && (
            <div className="bg-white rounded-xl shadow p-4 mt-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-500">Balance</div>
                  <div className="text-2xl font-bold text-green-600">${parseFloat(lookupResult.balance).toFixed(2)}</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  lookupResult.status === 'active' ? 'bg-green-100 text-green-700' :
                  lookupResult.status === 'redeemed' ? 'bg-gray-100 text-gray-500' :
                  'bg-red-100 text-red-700'
                }`}>
                  {lookupResult.status}
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Original: ${parseFloat(lookupResult.amount).toFixed(2)} · 
                Expires: {new Date(lookupResult.expires_at).toLocaleDateString('en-NZ')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

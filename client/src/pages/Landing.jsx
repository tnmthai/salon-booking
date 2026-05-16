import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'

function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 z-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold">
          <img src="/logo.png" alt="Timia" className="w-8 h-8 rounded-full" />
          <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Timia</span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          <Link to="/features" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">Features</Link>
          <Link to="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">Pricing</Link>
          <Link to="/about" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">About</Link>
          <Link to="/lookup" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">Find booking</Link>
          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">Sign in</Link>
          <Link to="/register" className="text-sm bg-gray-900 text-white px-5 py-2 rounded-full hover:bg-gray-800 transition ml-1">Get Started</Link>
        </div>
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 -mr-2 text-gray-600 hover:text-gray-900" aria-label="Menu">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-2 space-y-0.5">
            <Link to="/features" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">Features</Link>
            <Link to="/pricing" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">Pricing</Link>
            <Link to="/about" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">About</Link>
            <Link to="/lookup" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">Find booking</Link>
            <Link to="/login" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">Sign in</Link>
            <Link to="/register" onClick={() => setOpen(false)} className="block mt-2 text-center bg-gray-900 text-white py-2.5 rounded-full text-sm font-medium">Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  )
}

export default function Landing() {
  const [salons, setSalons] = useState([])
  const [ratings, setRatings] = useState({})
  const [totalVisits, setTotalVisits] = useState(null)
  const [lookupCode, setLookupCode] = useState('')
  const [bookedToday, setBookedToday] = useState(() => {
    const now = new Date()
    const minutesToday = now.getHours() * 60 + now.getMinutes()
    return Math.floor(minutesToday / 10) + 10
  })
  useEffect(() => {
    const interval = setInterval(() => setBookedToday(c => c + 1), 600000)
    return () => clearInterval(interval)
  }, [])
  const navigate = useNavigate()

  useEffect(() => {
    api.getSalons().then(async (data) => {
      setSalons(data)
      const r = {}
      for (const s of data) {
        try {
          const rating = await api.getSalonRating(s.slug)
          if (rating.total_reviews > 0) r[s.id] = rating
        } catch {}
      }
      setRatings(r)
    }).catch(console.error)
    api.getPublicVisitCount().then(data => setTotalVisits(data.total)).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6">
              <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
              Now supporting businesses across New Zealand
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 md:mb-6">
              The modern way to
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"> simplify your bookings</span>
            </h1>
            <p className="text-base md:text-lg text-gray-500 mb-6 md:mb-10 max-w-xl mx-auto leading-relaxed">
              Accept bookings 24/7, manage staff schedules, and grow your business — all from an easy-to-use dashboard.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link to="/register" className="bg-gray-900 text-white px-6 md:px-8 py-3 md:py-3.5 rounded-full hover:bg-gray-800 font-medium transition shadow-lg shadow-gray-900/10 text-sm md:text-base">
                Start for free →
              </Link>
              <Link to="/login" className="border border-gray-200 text-gray-700 px-6 md:px-8 py-3 md:py-3.5 rounded-full hover:bg-gray-50 font-medium transition text-sm md:text-base">
                Sign in
              </Link>
            </div>
            <div className="mt-4 text-xs text-gray-400">
              ✅ {bookedToday.toLocaleString()} appointments booked today
            </div>

            {/* Booking Lookup */}
            <div className="mt-8 md:mt-10 max-w-md mx-auto">
              <form onSubmit={(e) => { e.preventDefault(); if (lookupCode.trim()) navigate(`/lookup?code=${lookupCode.trim()}`); }} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={lookupCode}
                  onChange={(e) => setLookupCode(e.target.value)}
                  placeholder="Enter booking code (e.g. PY63X386)"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <button type="submit" className="px-6 py-3 bg-pink-600 text-white rounded-xl text-sm font-medium hover:bg-pink-700 transition whitespace-nowrap">
                  🔍 Find booking
                </button>
              </form>
              <p className="text-xs text-gray-400 mt-2">Enter your booking code or phone number to view your appointment</p>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 mt-5 md:mt-6 text-xs md:text-sm text-gray-400">
              <span className="flex items-center gap-1.5">✓ Free to start</span>
              <span className="flex items-center gap-1.5">✓ No credit card</span>
              <span className="flex items-center gap-1.5">✓ Setup in 5 min</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">Everything you need to run your business</h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm md:text-base">Powerful tools that save you time and help you deliver a better experience for your customers.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {[
              { icon: '📅', title: 'Online Booking', desc: 'Let customers book appointments anytime, from any device. No phone calls required.', color: 'from-blue-500 to-cyan-500' },
              { icon: '👥', title: 'Team Management', desc: 'Assign services, manage schedules, and track performance for your whole team.', color: 'from-purple-500 to-pink-500' },
              { icon: '📊', title: 'Reports & Analytics', desc: 'See booking trends, revenue, peak hours, and top services at a glance.', color: 'from-orange-500 to-red-500' },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 border border-gray-100 hover:shadow-lg transition group">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-xl md:text-2xl mb-4 md:mb-5 group-hover:scale-110 transition`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 text-base md:text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">Get started in minutes</h2>
            <p className="text-gray-500 text-sm md:text-base">Three simple steps to modern business management.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            {[
              { step: '01', title: 'Create your business', desc: 'Sign up and add your business details, services, and pricing.' },
              { step: '02', title: 'Set up your team', desc: 'Add staff members, assign services, and set working hours.' },
              { step: '03', title: 'Start receiving bookings', desc: 'Share your booking page and watch appointments come in.' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-gray-100 mb-3 md:mb-4">{s.step}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Salon List */}
      {salons.length > 0 && (
        <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">Browse businesses</h2>
              <p className="text-gray-500 text-sm md:text-base">Find and book your next appointment.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
              {salons.map(s => (
                <Link key={s.id} to={`/${s.slug}/book`} className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-5 md:p-6 hover:shadow-lg hover:border-pink-100 transition group">
                  <div className="flex items-start justify-between mb-2 md:mb-3">
                    <h3 className="font-semibold text-gray-900 text-base md:text-lg group-hover:text-pink-600 transition">{s.name}</h3>
                    {ratings[s.id] && (
                      <span className="text-xs md:text-sm text-yellow-500 whitespace-nowrap ml-2">⭐ {ratings[s.id].average_rating} ({ratings[s.id].total_reviews})</span>
                    )}
                  </div>
                  {s.address && <p className="text-xs md:text-sm text-gray-400 flex items-center gap-1">📍 {s.address}</p>}
                  {s.description && <p className="text-xs md:text-sm text-gray-400 mt-2 line-clamp-2">{s.description}</p>}
                  <span className="text-pink-600 text-sm font-medium mt-3 inline-block">Book →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Ready to simplify your bookings?</h2>
          <p className="text-gray-500 mb-6 md:mb-8 text-sm md:text-base">Join businesses already using Timia to manage their bookings.</p>
          <Link to="/register" className="inline-block bg-gray-900 text-white px-8 md:px-10 py-3.5 md:py-4 rounded-full hover:bg-gray-800 font-medium transition shadow-lg shadow-gray-900/10 text-sm md:text-base">
            Create your business — free
          </Link>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-12 md:py-20 px-4 md:px-6 bg-gray-50">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">Get in touch</h2>
            <p className="text-gray-500 text-sm md:text-base">Have a question? We'd love to hear from you.</p>
          </div>
          <form onSubmit={async (e) => {
            e.preventDefault()
            const fd = new FormData(e.target)
            const btn = e.target.querySelector('button[type="submit"]')
            btn.disabled = true
            btn.textContent = 'Sending...'
            try {
              const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: fd.get('name'), email: fd.get('email'), message: fd.get('message') }),
              })
              if (res.ok) { alert('Message sent! We\'ll get back to you soon.'); e.target.reset() }
              else alert('Failed to send. Please try again.')
            } catch { alert('Failed to send. Please try again.') }
            btn.disabled = false
            btn.textContent = 'Send Message'
          }} className="bg-white rounded-xl md:rounded-2xl shadow-lg p-5 md:p-6 space-y-3 md:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <input name="name" placeholder="Your name" required className="border border-gray-200 rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
              <input name="email" type="email" placeholder="Your email" required className="border border-gray-200 rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
            </div>
            <textarea name="message" placeholder="Your message..." rows={4} required className="w-full border border-gray-200 rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none" />
            <button type="submit" className="w-full bg-pink-600 text-white py-2.5 md:py-3 rounded-lg md:rounded-xl font-semibold hover:bg-pink-700 transition text-sm md:text-base">
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-gradient-to-br from-pink-600 to-purple-600 rounded flex items-center justify-center text-white font-bold text-xs">T</span>
                <span className="text-sm text-gray-400">© 2026 Timia</span>
              </div>
              {totalVisits !== null && (
                <span className="text-xs bg-gray-50 text-gray-400 px-3 py-1 rounded-full">👁 {Number(totalVisits || 0).toLocaleString()} visits</span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-400">
              <Link to="/features" className="hover:text-gray-600">Features</Link>
              <Link to="/pricing" className="hover:text-gray-600">Pricing</Link>
              <Link to="/about" className="hover:text-gray-600">About</Link>
              <Link to="/contact" className="hover:text-gray-600">Contact</Link>
              <Link to="/terms" className="hover:text-gray-600">Terms</Link>
              <Link to="/privacy" className="hover:text-gray-600">Privacy</Link>
              <Link to="/cookies" className="hover:text-gray-600">Cookies</Link>
              <Link to="/legal" className="hover:text-gray-600">Legal</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'

export default function Landing() {
  const [salons, setSalons] = useState([])

  useEffect(() => {
    api.getSalons().then(setSalons).catch(console.error)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <span className="text-2xl">💅</span>
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">SalonBook</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 transition px-4 py-2">
              Sign In
            </Link>
            <Link to="/register" className="text-sm bg-gray-900 text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
              Now serving salons across New Zealand
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
              The modern way to
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"> manage your salon</span>
            </h1>
            <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
              Accept bookings 24/7, manage staff schedules, and grow your business — all from one beautiful dashboard.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link to="/register" className="bg-gray-900 text-white px-8 py-3.5 rounded-full hover:bg-gray-800 font-medium transition shadow-lg shadow-gray-900/10">
                Start for Free →
              </Link>
              <Link to="/login" className="border border-gray-200 text-gray-700 px-8 py-3.5 rounded-full hover:bg-gray-50 font-medium transition">
                Sign In
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 mt-10 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">✓ Free to start</span>
              <span className="flex items-center gap-1.5">✓ No credit card</span>
              <span className="flex items-center gap-1.5">✓ Setup in 5 min</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything you need to run your salon</h2>
            <p className="text-gray-500 max-w-lg mx-auto">Powerful tools that save you time and help you deliver a better experience for your clients.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '📅', title: 'Online Booking', desc: 'Let clients book appointments anytime, from any device. No phone calls needed.', color: 'from-blue-500 to-cyan-500' },
              { icon: '👥', title: 'Staff Management', desc: 'Assign services, manage schedules, and track performance for your whole team.', color: 'from-purple-500 to-pink-500' },
              { icon: '📊', title: 'Reports & Analytics', desc: 'See booking trends, revenue, peak hours, and top services at a glance.', color: 'from-orange-500 to-red-500' },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Get started in minutes</h2>
            <p className="text-gray-500">Three simple steps to modern salon management.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create your salon', desc: 'Sign up and add your salon details, services, and pricing.' },
              { step: '02', title: 'Set up your team', desc: 'Add staff members, assign services, and set working hours.' },
              { step: '03', title: 'Start receiving bookings', desc: 'Share your booking page and watch appointments come in.' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl font-bold text-gray-100 mb-4">{s.step}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Salon List */}
      {salons.length > 0 && (
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Browse Salons</h2>
              <p className="text-gray-500">Find and book your next appointment.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {salons.map(s => (
                <Link key={s.id} to={`/${s.slug}/book`} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-pink-100 transition group">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg group-hover:text-pink-600 transition">{s.name}</h3>
                    <span className="text-pink-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition">Book →</span>
                  </div>
                  {s.address && <p className="text-sm text-gray-400 flex items-center gap-1">📍 {s.address}</p>}
                  {s.description && <p className="text-sm text-gray-400 mt-2 line-clamp-2">{s.description}</p>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to modernize your salon?</h2>
          <p className="text-gray-500 mb-8">Join salons already using SalonBook to manage their business.</p>
          <Link to="/register" className="inline-block bg-gray-900 text-white px-10 py-4 rounded-full hover:bg-gray-800 font-medium transition shadow-lg shadow-gray-900/10">
            Create Your Salon — Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="text-lg">💅</span>
            <span>© 2026 SalonBook</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link to="/login" className="hover:text-gray-600">Sign In</Link>
            <Link to="/register" className="hover:text-gray-600">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

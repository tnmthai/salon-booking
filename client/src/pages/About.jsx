import { useState } from 'react'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'

const values = [
  { icon: '🎯', title: 'Simplicity first', desc: 'We believe powerful software doesn\'t have to be complicated. Every feature is designed to be intuitive and easy to use.' },
  { icon: '🤝', title: 'Customer success', desc: 'Your success is our success. We\'re here to help you grow your business, not just sell software.' },
  { icon: '🔧', title: 'Built for NZ', desc: 'Designed specifically for New Zealand businesses. Local support, local payment methods, and understanding of the NZ market.' },
  { icon: '💡', title: 'Continuous improvement', desc: 'We\'re always listening to feedback and improving Timia. Your suggestions shape our roadmap.' },
]

const stats = [
  { number: '5000+', label: 'Bookings processed' },
  { number: '99.9%', label: 'Uptime' },
  { number: '4.8★', label: 'Customer rating' },
]

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
          <Link to="/explore" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">Explore</Link>
          <Link to="/features" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">Features</Link>
          <Link to="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">Pricing</Link>
          <Link to="/about" className="text-sm text-pink-600 font-medium px-3 py-2">About</Link>
          <Link to="/contact" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">Contact</Link>
          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">Sign in</Link>
          <Link to="/register" className="text-sm bg-gray-900 text-white px-5 py-2 rounded-full hover:bg-gray-800 transition ml-1">Get Started</Link>
        </div>
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 -mr-2 text-gray-600 hover:text-gray-900" aria-label="Menu">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-2 space-y-0.5">
            <Link to="/explore" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">Explore</Link>
            <Link to="/features" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">Features</Link>
            <Link to="/pricing" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">Pricing</Link>
            <Link to="/about" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-pink-600 bg-pink-50 font-medium rounded-lg">About</Link>
            <Link to="/contact" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">Contact</Link>
            <Link to="/login" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">Sign in</Link>
            <Link to="/register" onClick={() => setOpen(false)} className="block mt-2 text-center bg-gray-900 text-white py-2.5 rounded-full text-sm font-medium">Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  )
}

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-24 md:pt-32 pb-12 md:pb-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6">
            <span className="w-2 h-2 bg-pink-500 rounded-full" />
            Our story
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 md:mb-6">
            We're making
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"> business management simple</span>
          </h1>
          <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Timia was born from a simple observation: salon owners spend too much time on admin and not enough time doing what they love.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">Why we built Timia</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed text-sm md:text-base">
                <p>It started with a friend who owns a nail salon in Lincoln, Christchurch. She was juggling phone calls, paper diaries, and text messages just to manage her bookings.</p>
                <p>We looked at existing solutions — they were either too expensive, too complicated, or designed for big businesses overseas.</p>
                <p>So we built Timia: a simple, affordable booking platform designed specifically for New Zealand businesses.</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl md:rounded-3xl p-8 md:p-10 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl md:text-6xl mb-4">💅</div>
                <p className="text-gray-700 font-medium text-sm md:text-base">Started in Lincoln, Christchurch</p>
                <p className="text-gray-500 text-xs md:text-sm mt-1">Built for NZ businesses</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-1 md:mb-2">{stat.number}</div>
                <div className="text-gray-500 text-xs md:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">What we believe in</h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm md:text-base">Our values guide everything we build.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {values.map((v, i) => (
              <div key={i} className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 border border-gray-100">
                <div className="text-3xl md:text-4xl mb-3 md:mb-4">{v.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg md:text-xl mb-2 md:mb-3">{v.title}</h3>
                <p className="text-gray-500 text-sm md:text-base leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">Built in New Zealand</h2>
          <p className="text-gray-500 mb-8 md:mb-12 max-w-lg mx-auto text-sm md:text-base">We're a small team passionate about helping local businesses thrive.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            {[
              { name: 'Engineering', desc: 'Building reliable, fast software you can count on.', icon: '⚙️' },
              { name: 'Design', desc: 'Creating intuitive experiences that feel simple.', icon: '🎨' },
              { name: 'Support', desc: 'Friendly, local support when you need it.', icon: '💬' },
            ].map((team, i) => (
              <div key={i} className="bg-gray-50 rounded-xl md:rounded-2xl p-6 md:p-8">
                <div className="text-3xl md:text-4xl mb-3 md:mb-4">{team.icon}</div>
                <h3 className="font-bold text-gray-900 text-base md:text-lg mb-2">{team.name}</h3>
                <p className="text-gray-500 text-sm">{team.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Join the Timia community</h2>
          <p className="text-gray-500 mb-6 md:mb-8 text-sm md:text-base">Start managing your bookings the simple way.</p>
          <Link to="/register" className="inline-block bg-gray-900 text-white px-8 md:px-10 py-3.5 md:py-4 rounded-full hover:bg-gray-800 font-medium transition shadow-lg shadow-gray-900/10 text-sm md:text-base">Create your business — free</Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'

function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 z-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold">
          <span className="w-7 h-7 bg-gradient-to-br from-pink-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">T</span>
          <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Timia</span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          <Link to="/features" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">Features</Link>
          <Link to="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">Pricing</Link>
          <Link to="/about" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">About</Link>
          <Link to="/contact" className="text-sm text-pink-600 font-medium px-3 py-2">Contact</Link>
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
            <Link to="/contact" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-pink-600 bg-pink-50 font-medium rounded-lg">Contact</Link>
            <Link to="/login" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">Sign in</Link>
            <Link to="/register" onClick={() => setOpen(false)} className="block mt-2 text-center bg-gray-900 text-white py-2.5 rounded-full text-sm font-medium">Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  )
}

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    setSending(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fd.get('name'), email: fd.get('email'), subject: fd.get('subject'), message: fd.get('message') }),
      })
      if (res.ok) { setSubmitted(true); e.target.reset() }
      else alert('Failed to send. Please try again.')
    } catch { alert('Failed to send. Please try again.') }
    setSending(false)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-24 md:pt-32 pb-10 md:pb-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6">
            <span className="w-2 h-2 bg-pink-500 rounded-full" />We'd love to hear from you
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 md:mb-6">
            Get in<span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"> touch</span>
          </h1>
          <p className="text-base md:text-lg text-gray-500 max-w-xl mx-auto">Have a question? Want to partner? We'd love to hear from you.</p>
        </div>
      </section>
      <section className="pb-12 md:pb-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="space-y-4 md:space-y-6">
            <div className="bg-gray-50 rounded-xl p-5 md:p-6">
              <div className="text-xl md:text-2xl mb-2 md:mb-3">📧</div>
              <h3 className="font-bold text-gray-900 mb-1 text-sm md:text-base">Email us</h3>
              <p className="text-gray-500 text-xs md:text-sm mb-2">We'll respond within 24 hours.</p>
              <a href="mailto:support@timia.nz" className="text-pink-600 font-medium text-xs md:text-sm">support@timia.nz</a>
            </div>
            <div className="bg-gray-50 rounded-xl p-5 md:p-6">
              <div className="text-xl md:text-2xl mb-2 md:mb-3">📍</div>
              <h3 className="font-bold text-gray-900 mb-1 text-sm md:text-base">Location</h3>
              <p className="text-gray-500 text-xs md:text-sm">Lincoln, Canterbury, New Zealand</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-5 md:p-6">
              <div className="text-xl md:text-2xl mb-2 md:mb-3">⏰</div>
              <h3 className="font-bold text-gray-900 mb-1 text-sm md:text-base">Support hours</h3>
              <p className="text-gray-500 text-xs md:text-sm">Mon — Fri, 9AM — 5PM NZST</p>
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100 p-5 md:p-8">
              {submitted ? (
                <div className="text-center py-8 md:py-12">
                  <div className="text-4xl md:text-5xl mb-4">✅</div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Message sent!</h3>
                  <p className="text-gray-500 mb-6 text-sm md:text-base">Thanks for reaching out.</p>
                  <button onClick={() => setSubmitted(false)} className="text-pink-600 font-medium text-sm md:text-base">Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">Your name</label>
                      <input name="name" placeholder="John Smith" required className="w-full border border-gray-200 rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">Your email</label>
                      <input name="email" type="email" placeholder="john@example.com" required className="w-full border border-gray-200 rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                    <select name="subject" required className="w-full border border-gray-200 rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white">
                      <option value="">Select a topic...</option>
                      <option value="general">General enquiry</option>
                      <option value="support">Technical support</option>
                      <option value="billing">Billing question</option>
                      <option value="partnership">Partnership</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">Message</label>
                    <textarea name="message" placeholder="Tell us what you're thinking..." rows={5} required className="w-full border border-gray-200 rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none" />
                  </div>
                  <button type="submit" disabled={sending} className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-2.5 md:py-3.5 rounded-lg md:rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 text-sm md:text-base">
                    {sending ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
      <footer className="border-t border-gray-100 py-8 px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-2 text-sm text-gray-400">
          <span className="w-6 h-6 bg-gradient-to-br from-pink-600 to-purple-600 rounded flex items-center justify-center text-white font-bold text-xs">T</span>
          <span>© 2026 Timia</span>
          <span className="mx-2">·</span>
          <Link to="/features" className="hover:text-gray-600">Features</Link>
          <Link to="/pricing" className="hover:text-gray-600">Pricing</Link>
          <Link to="/about" className="hover:text-gray-600">About</Link>
          <Link to="/contact" className="hover:text-gray-600">Contact</Link>
        </div>
      </footer>
    </div>
  )
}

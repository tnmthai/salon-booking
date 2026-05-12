import { useState } from 'react'
import { Link } from 'react-router-dom'

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
        body: JSON.stringify({
          name: fd.get('name'),
          email: fd.get('email'),
          subject: fd.get('subject'),
          message: fd.get('message'),
        }),
      })
      if (res.ok) {
        setSubmitted(true)
        e.target.reset()
      } else {
        alert('Failed to send. Please try again.')
      }
    } catch {
      alert('Failed to send. Please try again.')
    }
    setSending(false)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <span className="w-8 h-8 bg-gradient-to-br from-pink-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">T</span>
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Timia</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/features" className="text-sm text-gray-600 hover:text-gray-900 transition px-4 py-2">Features</Link>
            <Link to="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition px-4 py-2">Pricing</Link>
            <Link to="/about" className="text-sm text-gray-600 hover:text-gray-900 transition px-4 py-2">About</Link>
            <Link to="/contact" className="text-sm text-pink-600 font-medium px-4 py-2">Contact</Link>
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 transition px-4 py-2">Sign in</Link>
            <Link to="/register" className="text-sm bg-gray-900 text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-pink-500 rounded-full" />
            We'd love to hear from you
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Get in
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"> touch</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            Have a question about Timia? Want to partner with us? Or just want to say hi? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="text-2xl mb-3">📧</div>
                <h3 className="font-bold text-gray-900 mb-1">Email us</h3>
                <p className="text-gray-500 text-sm mb-2">We'll respond within 24 hours.</p>
                <a href="mailto:support@timia.nz" className="text-pink-600 font-medium text-sm hover:text-pink-700">
                  support@timia.nz
                </a>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="text-2xl mb-3">📍</div>
                <h3 className="font-bold text-gray-900 mb-1">Location</h3>
                <p className="text-gray-500 text-sm">
                  Lincoln, Canterbury<br />
                  New Zealand
                </p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="text-2xl mb-3">⏰</div>
                <h3 className="font-bold text-gray-900 mb-1">Support hours</h3>
                <p className="text-gray-500 text-sm">
                  Monday — Friday<br />
                  9:00 AM — 5:00 PM NZST
                </p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="text-2xl mb-3">💬</div>
                <h3 className="font-bold text-gray-900 mb-1">Social</h3>
                <div className="flex gap-3 mt-2">
                  <a href="#" className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-pink-100 hover:text-pink-600 transition">f</a>
                  <a href="#" className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-pink-100 hover:text-pink-600 transition">in</a>
                  <a href="#" className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-pink-100 hover:text-pink-600 transition">tw</a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">✅</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Message sent!</h3>
                    <p className="text-gray-500 mb-6">Thanks for reaching out. We'll get back to you soon.</p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="text-pink-600 font-medium hover:text-pink-700"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Your name</label>
                        <input
                          name="name"
                          placeholder="John Smith"
                          required
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Your email</label>
                        <input
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          required
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                      <select
                        name="subject"
                        required
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
                      >
                        <option value="">Select a topic...</option>
                        <option value="general">General enquiry</option>
                        <option value="support">Technical support</option>
                        <option value="billing">Billing question</option>
                        <option value="partnership">Partnership opportunity</option>
                        <option value="feedback">Feedback</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                      <textarea
                        name="message"
                        placeholder="Tell us what you're thinking..."
                        rows={6}
                        required
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
                    >
                      {sending ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Common questions</h2>
            <p className="text-gray-500">Quick answers to things you might be wondering about.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { q: 'How do I get started?', a: 'Simply sign up for a free account, add your business details and services, and you\'re ready to accept bookings.' },
              { q: 'Is there a free trial?', a: 'Our Free plan is free forever with no credit card required. You can upgrade anytime.' },
              { q: 'Can I import my existing data?', a: 'Yes! Contact us and we\'ll help you migrate your customer and booking data from your current system.' },
              { q: 'Do you offer phone support?', a: 'Phone support is available on our Pro plan. All plans include email support.' },
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-500 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="w-6 h-6 bg-gradient-to-br from-pink-600 to-purple-600 rounded flex items-center justify-center text-white font-bold text-xs">T</span>
            <span>© 2026 Timia</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link to="/features" className="hover:text-gray-600">Features</Link>
            <Link to="/pricing" className="hover:text-gray-600">Pricing</Link>
            <Link to="/about" className="hover:text-gray-600">About</Link>
            <Link to="/contact" className="hover:text-gray-600">Contact</Link>
            <Link to="/terms" className="hover:text-gray-600">Terms</Link>
            <Link to="/privacy" className="hover:text-gray-600">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

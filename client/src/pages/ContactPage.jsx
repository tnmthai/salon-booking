import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

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

      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-10 md:pb-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6">
            <span className="w-2 h-2 bg-pink-500 rounded-full" />
            We'd love to hear from you
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 md:mb-6">
            Get in
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"> touch</span>
          </h1>
          <p className="text-base md:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            Have a question about Timia? Want to partner with us? Or just want to say hi? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="pb-12 md:pb-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Contact Info */}
            <div className="space-y-4 md:space-y-6">
              {[
                { icon: '📧', title: 'Email us', desc: 'We\'ll respond within 24 hours.', link: 'mailto:support@timia.nz', linkText: 'support@timia.nz' },
                { icon: '📍', title: 'Location', desc: 'Lincoln, Canterbury\nNew Zealand' },
                { icon: '⏰', title: 'Support hours', desc: 'Monday — Friday\n9:00 AM — 5:00 PM NZST' },
                { icon: '💬', title: 'Social', desc: '' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl md:rounded-2xl p-5 md:p-6">
                  <div className="text-xl md:text-2xl mb-2 md:mb-3">{item.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm md:text-base">{item.title}</h3>
                  <p className="text-gray-500 text-xs md:text-sm whitespace-pre-line">{item.desc}</p>
                  {item.link && (
                    <a href={item.link} className="text-pink-600 font-medium text-xs md:text-sm hover:text-pink-700">
                      {item.linkText}
                    </a>
                  )}
                  {item.title === 'Social' && (
                    <div className="flex gap-2 md:gap-3 mt-2">
                      <a href="#" className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-pink-100 hover:text-pink-600 transition text-xs md:text-base">f</a>
                      <a href="#" className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-pink-100 hover:text-pink-600 transition text-xs md:text-base">in</a>
                      <a href="#" className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-pink-100 hover:text-pink-600 transition text-xs md:text-base">tw</a>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100 p-5 md:p-8">
                {submitted ? (
                  <div className="text-center py-8 md:py-12">
                    <div className="text-4xl md:text-5xl mb-4">✅</div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Message sent!</h3>
                    <p className="text-gray-500 mb-6 text-sm md:text-base">Thanks for reaching out. We'll get back to you soon.</p>
                    <button onClick={() => setSubmitted(false)} className="text-pink-600 font-medium hover:text-pink-700 text-sm md:text-base">
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">Your name</label>
                        <input name="name" placeholder="John Smith" required className="w-full border border-gray-200 rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">Your email</label>
                        <input name="email" type="email" placeholder="john@example.com" required className="w-full border border-gray-200 rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                      <select name="subject" required className="w-full border border-gray-200 rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white">
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
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">Message</label>
                      <textarea name="message" placeholder="Tell us what you're thinking..." rows={5} required className="w-full border border-gray-200 rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none" />
                    </div>
                    <button type="submit" disabled={sending} className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-2.5 md:py-3.5 rounded-lg md:rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 text-sm md:text-base">
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
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">Common questions</h2>
            <p className="text-gray-500 text-sm md:text-base">Quick answers to things you might be wondering about.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {[
              { q: 'How do I get started?', a: 'Simply sign up for a free account, add your business details and services, and you\'re ready to accept bookings.' },
              { q: 'Is there a free trial?', a: 'Our Free plan is free forever with no credit card required. You can upgrade anytime.' },
              { q: 'Can I import my existing data?', a: 'Yes! Contact us and we\'ll help you migrate your customer and booking data.' },
              { q: 'Do you offer phone support?', a: 'Phone support is available on our Pro plan. All plans include email support.' },
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-xl p-5 md:p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">{faq.q}</h3>
                <p className="text-gray-500 text-xs md:text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

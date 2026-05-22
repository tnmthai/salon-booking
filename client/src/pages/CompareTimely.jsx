import { useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

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
          <Link to="/about" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">About</Link>
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
            <Link to="/explore" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">Explore</Link>
            <Link to="/features" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">Features</Link>
            <Link to="/pricing" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">Pricing</Link>
            <Link to="/about" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">About</Link>
            <Link to="/login" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm text-gray-700 hover:text-pink-600 rounded-lg">Sign in</Link>
            <Link to="/register" onClick={() => setOpen(false)} className="block mt-2 text-center bg-gray-900 text-white py-2.5 rounded-full text-sm font-medium">Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  )
}

const comparisons = [
  { feature: 'Monthly price', timia: 'From $0 (free forever)', timely: 'From $35/mo', timiaWins: true },
  { feature: 'Setup time', timia: '5 minutes', timely: '1-2 hours', timiaWins: true },
  { feature: 'Online booking page', timia: '✅ Included', timely: '✅ Included', timiaWins: null },
  { feature: 'Staff management', timia: '✅ Included', timely: '✅ Included', timiaWins: null },
  { feature: 'Calendar view', timia: '✅ Included', timely: '✅ Included', timiaWins: null },
  { feature: 'Email notifications', timia: '✅ Included (free)', timely: '✅ Included', timiaWins: null },
  { feature: 'SMS reminders', timia: '🔜 Coming soon', timely: '✅ Add-on cost', timiaWins: null },
  { feature: 'Loyalty system', timia: '✅ Included', timely: '❌ Not available', timiaWins: true },
  { feature: 'Gallery & reviews', timia: '✅ Included', timely: '✅ Limited', timiaWins: true },
  { feature: 'NZ local support', timia: '✅ Minutes response', timely: '⏱ Hours/days', timiaWins: true },
  { feature: 'Free migration help', timia: '✅ We do it for you', timely: '❌ DIY', timiaWins: true },
  { feature: 'Referral rewards', timia: '✅ Free months', timely: '❌ None', timiaWins: true },
  { feature: 'No lock-in contract', timia: '✅ Cancel anytime', timely: '⚠️ Annual plans', timiaWins: true },
  { feature: 'Multi-language', timia: '✅ EN + VI', timely: '✅ Multiple', timiaWins: null },
  { feature: 'Marketplace listing', timia: '✅ Free exposure', timely: '❌ Not available', timiaWins: true },
]

const faqs = [
  { q: 'Can I really switch from Timely in one day?', a: 'Yes! We offer free migration assistance. Just send us your Timely data (services, staff, customer list) and we\'ll set everything up for you. Most salons are up and running within 24 hours.' },
  { q: 'Will I lose my customer data?', a: 'No. We help you import your customer list, services, and staff profiles. Your booking history stays with you — we make the transition seamless.' },
  { q: 'Is Timia really free?', a: 'Yes! Our Starter plan is free forever — no credit card required. It includes online booking, marketplace listing, basic reports, and up to 2 staff. You only upgrade when you need more.' },
  { q: 'What about SMS reminders?', a: 'SMS reminders are coming soon! We\'re building this feature and it will be available at a fraction of the cost of other providers. Email notifications are already included for free.' },
  { q: 'Is my data secure?', a: 'Absolutely. We use industry-standard encryption and host on secure servers. Your data is backed up regularly and never shared with third parties.' },
  { q: 'Can I cancel anytime?', a: 'Yes. No contracts, no lock-in. Cancel anytime from your dashboard — your data is yours.' },
]

export default function CompareTimely() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6">
            <span className="w-2 h-2 bg-pink-500 rounded-full" />Honest comparison
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4 md:mb-6">
            Timia vs Timely
          </h1>
          <p className="text-base md:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            We respect Timely — they're a great product. But if you're a small salon in NZ looking for something simpler and more affordable, here's how we compare.
          </p>
        </div>
      </section>

      {/* Quick verdict */}
      <section className="pb-12 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 md:p-8 border border-pink-100 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">The short version</h2>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              <strong>Timely</strong> is great for large salons with big budgets and complex needs.<br />
              <strong>Timia</strong> is built for small-to-medium NZ salons who want <strong>simple, affordable, and effective</strong> booking — without the learning curve.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="pb-12 md:pb-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 md:mb-12">Feature-by-feature comparison</h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100">
              <div className="p-4 text-sm font-medium text-gray-500">Feature</div>
              <div className="p-4 text-sm font-bold text-pink-600 text-center">Timia</div>
              <div className="p-4 text-sm font-medium text-gray-500 text-center">Timely</div>
            </div>
            {/* Rows */}
            {comparisons.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 border-b border-gray-50 last:border-0 ${row.timiaWins ? 'bg-pink-50/30' : ''}`}>
                <div className="p-4 text-sm text-gray-700 font-medium">{row.feature}</div>
                <div className={`p-4 text-sm text-center ${row.timiaWins ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>{row.timia}</div>
                <div className="p-4 text-sm text-center text-gray-500">{row.timely}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center mt-4">* Pricing and features based on publicly available information as of May 2026.</p>
        </div>
      </section>

      {/* When to choose Timely */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">When should you choose Timely?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-3">✅ Choose Timely if:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• You have 10+ staff members</li>
                <li>• You need advanced inventory management</li>
                <li>• You're a franchise with multiple locations</li>
                <li>• You have a big budget and need enterprise features</li>
                <li>• You're already deeply integrated with their ecosystem</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 border border-pink-100 bg-pink-50/30">
              <h3 className="font-bold text-gray-900 mb-3">✅ Choose Timia if:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• You're a small-to-medium salon (1-6 staff)</li>
                <li>• You want something simple that just works</li>
                <li>• You don't want to pay $35+/month</li>
                <li>• You want local NZ support with fast response</li>
                <li>• You're starting out and want to grow without upfront cost</li>
                <li>• You want free migration from your current system</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Migration CTA */}
      <section className="py-12 md:py-16 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to switch?</h2>
            <p className="text-pink-100 text-sm md:text-base mb-6 max-w-lg mx-auto">
              We'll handle the migration for free. Send us your Timely data and we'll set up your Timia account — services, staff, and customer list included.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register" className="bg-white text-pink-600 px-8 py-3 rounded-full font-semibold hover:bg-pink-50 transition text-sm">
                Start free — no card needed
              </Link>
              <Link to="/contact" className="border border-white/30 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition text-sm">
                Request free migration
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">Migration FAQ</h2>
          </div>
          <div className="space-y-3 md:space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group border border-gray-100 rounded-xl overflow-hidden bg-white">
                <summary className="flex items-center justify-between px-5 md:px-6 py-3.5 md:py-4 cursor-pointer hover:bg-gray-50 transition text-sm md:text-base">
                  <span className="font-medium text-gray-900 pr-2">{faq.q}</span>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 text-xs">▼</span>
                </summary>
                <div className="px-5 md:px-6 pb-3.5 md:pb-4 text-gray-500 text-sm">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* SEO breadcrumbs / internal links */}
      <section className="py-8 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-400">
            Also compare: {' '}
            <Link to="/pricing" className="text-pink-600 hover:underline">Pricing</Link>
            {' · '}
            <Link to="/features" className="text-pink-600 hover:underline">Features</Link>
            {' · '}
            <Link to="/about" className="text-pink-600 hover:underline">About Timia</Link>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}

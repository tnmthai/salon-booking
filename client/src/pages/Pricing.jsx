import { useState } from 'react'
import { Link } from 'react-router-dom'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Perfect for getting started. No credit card required.',
    features: [
      '1 business location',
      'Up to 3 staff members',
      'Online booking page',
      'Email reminders',
      'Basic reports',
      'Customer management',
    ],
    cta: 'Start for free',
    ctaLink: '/register',
    popular: false,
  },
  {
    name: 'Growth',
    price: '$29',
    period: '/month',
    desc: 'For growing businesses that need more power and flexibility.',
    features: [
      'Everything in Free',
      'Unlimited staff members',
      'Custom branding',
      'Photo gallery',
      'Customer reviews',
      'Advanced reports & analytics',
      'Priority support',
    ],
    cta: 'Start free trial',
    ctaLink: '/register',
    popular: true,
  },
  {
    name: 'Pro',
    price: '$79',
    period: '/month',
    desc: 'For established businesses with multiple locations.',
    features: [
      'Everything in Growth',
      'Multiple locations',
      'API access',
      'Custom integrations',
      'Dedicated account manager',
      'White-label booking page',
      'Phone support',
    ],
    cta: 'Contact us',
    ctaLink: '/contact',
    popular: false,
  },
]

const faqs = [
  {
    q: 'Is there really a free plan?',
    a: 'Yes! Our Free plan is completely free forever. No credit card required, no hidden fees. You can start accepting bookings immediately.',
  },
  {
    q: 'Can I upgrade or downgrade anytime?',
    a: 'Absolutely. You can switch plans at any time. If you upgrade, you\'ll get immediate access to new features. If you downgrade, you\'ll keep access until the end of your billing period.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards (Visa, Mastercard, American Express) through Stripe, our secure payment processor.',
  },
  {
    q: 'Is there a contract or commitment?',
    a: 'No contracts, no commitments. All plans are month-to-month and you can cancel anytime.',
  },
  {
    q: 'What happens to my data if I cancel?',
    a: 'Your data is yours. If you cancel, you can export all your data before your account closes. We keep your data for 30 days after cancellation.',
  },
  {
    q: 'Do you offer discounts for annual billing?',
    a: 'Yes! Save 20% when you choose annual billing on Growth and Pro plans.',
  },
]

export default function Pricing() {
  const [annual, setAnnual] = useState(false)

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
            <Link to="/pricing" className="text-sm text-pink-600 font-medium px-4 py-2">Pricing</Link>
            <Link to="/about" className="text-sm text-gray-600 hover:text-gray-900 transition px-4 py-2">About</Link>
            <Link to="/contact" className="text-sm text-gray-600 hover:text-gray-900 transition px-4 py-2">Contact</Link>
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 transition px-4 py-2">Sign in</Link>
            <Link to="/register" className="text-sm bg-gray-900 text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-10 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-pink-500 rounded-full" />
            Simple, transparent pricing
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Plans that
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"> grow with you</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed mb-8">
            Start for free, upgrade when you need more. No surprises, no hidden fees.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <span className={`text-sm ${!annual ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-12 h-6 rounded-full transition ${annual ? 'bg-pink-600' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition ${annual ? 'left-6' : 'left-0.5'}`} />
            </button>
            <span className={`text-sm ${annual ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              Annual <span className="text-green-600 text-xs font-medium">Save 20%</span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`relative bg-white rounded-2xl p-8 border-2 transition hover:shadow-lg ${
                  plan.popular ? 'border-pink-500 shadow-lg shadow-pink-500/10' : 'border-gray-100'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="font-bold text-gray-900 text-xl mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price === '$0' ? '$0' : annual ? `$${Math.round(parseInt(plan.price.slice(1)) * 0.8)}` : plan.price}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {plan.price === '$0' ? plan.period : annual ? '/month' : plan.period}
                  </span>
                </div>
                {annual && plan.price !== '$0' && (
                  <p className="text-xs text-green-600 mb-2">Billed annually</p>
                )}
                <p className="text-gray-500 text-sm mb-6">{plan.desc}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.ctaLink}
                  className={`block text-center py-3 rounded-xl font-semibold transition ${
                    plan.popular
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:opacity-90'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-12 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: '🔒', title: 'Secure payments', desc: 'Powered by Stripe. Your payment info is never stored on our servers.' },
              { icon: '📞', title: 'NZ-based support', desc: 'Our team is based in New Zealand. Get help when you need it.' },
              { icon: '🚀', title: 'Setup in 5 minutes', desc: 'No technical skills needed. Get your booking page live in minutes.' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-3xl mb-3">{item.icon}</span>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Frequently asked questions</h2>
            <p className="text-gray-500">Everything you need to know about our pricing.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group border border-gray-100 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition">
                  <span className="font-medium text-gray-900">{faq.q}</span>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-6 pb-4 text-gray-500 text-sm leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
          <p className="text-gray-500 mb-8">Start for free. No credit card required.</p>
          <Link to="/register" className="inline-block bg-gray-900 text-white px-10 py-4 rounded-full hover:bg-gray-800 font-medium transition shadow-lg shadow-gray-900/10">
            Create your business — free
          </Link>
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

import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    desc: 'Get started at no cost.',
    features: ['Online booking page', 'Marketplace listing', 'Basic reports', 'Email notifications', '2 staff members', '40 appointments/month'],
    cta: 'Start for free',
    ctaLink: '/register',
    popular: false,
  },
  {
    name: 'Starter',
    price: '$11',
    period: '/mo',
    desc: 'For growing teams.',
    features: ['Everything in Free', 'Up to 6 staff', 'Unlimited appointments', 'Staff roster & schedule', 'Loyalty points (50 cards)', 'Reviews & Gallery'],
    cta: 'Get Starter',
    ctaLink: '/register',
    popular: true,
  },
  {
    name: 'Growth',
    price: '$29',
    period: '/mo',
    desc: 'For established businesses.',
    features: ['Everything in Starter', 'Unlimited staff', 'Advanced reports', 'Unlimited loyalty system', 'Unlimited email automation', 'Priority marketplace ranking', 'Promotions & deals engine'],
    cta: 'Get Growth',
    ctaLink: '/register',
    popular: false,
  },
]

const faqs = [
  { q: 'Is there really a free plan?', a: 'Yes! Our Free plan is completely free forever. No credit card required, no hidden fees. You can start accepting bookings immediately.' },
  { q: 'Can I upgrade or downgrade anytime?', a: 'Absolutely. You can switch plans at any time. If you upgrade, you\'ll get immediate access to new features. If you downgrade, you\'ll keep access until the end of your billing period.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards (Visa, Mastercard, American Express) through Stripe, our secure payment processor.' },
  { q: 'Is there a contract or commitment?', a: 'No contracts, no commitments. All plans are month-to-month and you can cancel anytime.' },
  { q: 'What happens to my data if I cancel?', a: 'Your data is yours. If you cancel, you can export all your data before your account closes. We keep your data for 30 days after cancellation.' },
]

export default function Pricing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-6 md:pb-10 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6">
            <span className="w-2 h-2 bg-pink-500 rounded-full" />
            Simple, transparent pricing
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 md:mb-6">
            Plans that
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"> grow with you</span>
          </h1>
          <p className="text-base md:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            Start for free, upgrade when you need more. No surprises, no hidden fees.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-12 md:pb-20 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`relative bg-white rounded-xl md:rounded-2xl p-6 md:p-8 border-2 transition hover:shadow-lg ${plan.popular ? 'border-pink-500 shadow-lg shadow-pink-500/10' : 'border-gray-100'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="font-bold text-gray-900 text-lg md:text-xl mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl md:text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-400 text-sm">{plan.period}</span>
                </div>
                <p className="text-gray-500 text-sm mb-5 md:mb-6">{plan.desc}</p>
                <ul className="space-y-2.5 md:space-y-3 mb-6 md:mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.ctaLink}
                  className={`block text-center py-2.5 md:py-3 rounded-xl font-semibold transition text-sm md:text-base ${plan.popular ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:opacity-90' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-10 md:py-12 px-4 md:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 text-center">
            {[
              { icon: '🔒', title: 'Secure payments', desc: 'Powered by Stripe. Your payment info is never stored.' },
              { icon: '📞', title: 'NZ-based support', desc: 'Our team is based in New Zealand. Get help when you need it.' },
              { icon: '🚀', title: 'Setup in 5 minutes', desc: 'No technical skills needed. Get your booking page live fast.' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-2xl md:text-3xl mb-2 md:mb-3">{item.icon}</span>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">{item.title}</h3>
                <p className="text-gray-500 text-xs md:text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">Frequently asked questions</h2>
            <p className="text-gray-500 text-sm md:text-base">Everything you need to know about our pricing.</p>
          </div>
          <div className="space-y-3 md:space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group border border-gray-100 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between px-5 md:px-6 py-3.5 md:py-4 cursor-pointer hover:bg-gray-50 transition text-sm md:text-base">
                  <span className="font-medium text-gray-900 pr-2">{faq.q}</span>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 text-xs">▼</span>
                </summary>
                <div className="px-5 md:px-6 pb-3.5 md:pb-4 text-gray-500 text-sm leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Ready to get started?</h2>
          <p className="text-gray-500 mb-6 md:mb-8 text-sm md:text-base">Start for free. No credit card required.</p>
          <Link to="/register" className="inline-block bg-gray-900 text-white px-8 md:px-10 py-3.5 md:py-4 rounded-full hover:bg-gray-800 font-medium transition shadow-lg shadow-gray-900/10 text-sm md:text-base">
            Create your business — free
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

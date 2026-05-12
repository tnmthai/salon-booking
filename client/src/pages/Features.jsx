import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const features = [
  { icon: '📅', title: 'Online Booking 24/7', desc: 'Customers can book appointments anytime, from any device. No phone calls, no waiting — just instant confirmations.', details: ['Customizable booking page', 'Automatic confirmations & reminders', 'Real-time availability'], color: 'from-blue-500 to-cyan-500' },
  { icon: '👥', title: 'Team Management', desc: 'Manage your entire team from one dashboard. Assign services, set schedules, and track performance.', details: ['Individual staff profiles', 'Service assignments', 'Working hours management'], color: 'from-purple-500 to-pink-500' },
  { icon: '📊', title: 'Reports & Analytics', desc: 'See booking trends, revenue, peak hours, and top services at a glance. Make data-driven decisions.', details: ['Revenue tracking', 'Booking trends', 'Peak hour analysis'], color: 'from-orange-500 to-red-500' },
  { icon: '⭐', title: 'Customer Reviews', desc: 'Collect and display reviews from your customers. Build trust and attract more bookings.', details: ['Automated review requests', 'Public review display', 'Rating analytics'], color: 'from-yellow-500 to-orange-500' },
  { icon: '🖼', title: 'Photo Gallery', desc: 'Showcase your work with a beautiful gallery. Let customers see your skills before they book.', details: ['Easy photo uploads', 'Portfolio showcase', 'Before & after displays'], color: 'from-pink-500 to-rose-500' },
  { icon: '🔔', title: 'Smart Reminders', desc: 'Reduce no-shows with automatic email reminders. Keep your schedule running smoothly.', details: ['24-hour reminders', 'Custom email templates', 'No-show reduction'], color: 'from-teal-500 to-emerald-500' },
  { icon: '📱', title: 'Mobile Friendly', desc: 'Works perfectly on any device. Manage your business from your phone or tablet on the go.', details: ['Responsive design', 'Touch-optimized', 'Fast loading'], color: 'from-indigo-500 to-blue-500' },
  { icon: '🔒', title: 'Secure & Reliable', desc: 'Your data is safe with us. Enterprise-grade security with 99.9% uptime guarantee.', details: ['SSL encryption', 'Daily backups', 'GDPR compliant'], color: 'from-gray-500 to-slate-600' },
  { icon: '🌍', title: 'Multi-Location', desc: 'Manage multiple business locations from a single account. Perfect for growing businesses.', details: ['Centralized dashboard', 'Location-specific settings', 'Cross-location reporting'], color: 'from-emerald-500 to-teal-500' },
]

export default function Features() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-10 md:pb-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6">
            <span className="w-2 h-2 bg-pink-500 rounded-full" />
            Built for modern businesses
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 md:mb-6">
            Everything you need to
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"> manage your salon</span>
          </h1>
          <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            From online booking to team management, Timia gives you all the tools to run and grow your business — without the complexity.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-10 md:py-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 border border-gray-100 hover:shadow-lg transition group">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl md:text-3xl mb-4 md:mb-5 group-hover:scale-110 transition`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-lg md:text-xl mb-2 md:mb-3">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{f.desc}</p>
                <ul className="space-y-2">
                  {f.details.map((d, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 bg-pink-500 rounded-full flex-shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">Why choose Timia?</h2>
            <p className="text-gray-500 text-sm md:text-base">See how we compare to traditional booking methods.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {[
              { title: 'Phone bookings', problems: ['Missed calls = missed revenue', 'Staff interrupted during service', 'No automatic confirmations', 'Manual scheduling errors'] },
              { title: 'Paper diaries', problems: ['No real-time availability', 'Hard to reschedule', 'No customer history', 'Can\'t book outside hours'] },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 border border-gray-100">
                <h3 className="font-bold text-gray-900 text-base md:text-lg mb-3 md:mb-4 flex items-center gap-2">
                  <span className="text-red-500">✗</span> {item.title}
                </h3>
                <ul className="space-y-2 md:space-y-3">
                  {item.problems.map((p, j) => (
                    <li key={j} className="text-gray-500 text-sm flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>{p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-6 md:mt-8 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl md:rounded-2xl p-6 md:p-8 text-white text-center">
            <h3 className="font-bold text-xl md:text-2xl mb-2 md:mb-3">With Timia</h3>
            <p className="text-pink-100 mb-5 md:mb-6 max-w-lg mx-auto text-sm md:text-base">All these problems solved. 24/7 online booking, automatic reminders, real-time scheduling, and a complete customer history — all in one place.</p>
            <Link to="/register" className="inline-block bg-white text-pink-600 px-6 md:px-8 py-2.5 md:py-3 rounded-full font-semibold hover:bg-pink-50 transition text-sm md:text-base">
              Start for free →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Ready to get started?</h2>
          <p className="text-gray-500 mb-6 md:mb-8 text-sm md:text-base">Join businesses across New Zealand using Timia to manage their bookings.</p>
          <Link to="/register" className="inline-block bg-gray-900 text-white px-8 md:px-10 py-3.5 md:py-4 rounded-full hover:bg-gray-800 font-medium transition shadow-lg shadow-gray-900/10 text-sm md:text-base">
            Create your business — free
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

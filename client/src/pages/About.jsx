import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const values = [
  { icon: '🎯', title: 'Simplicity first', desc: 'We believe powerful software doesn\'t have to be complicated. Every feature is designed to be intuitive and easy to use.' },
  { icon: '🤝', title: 'Customer success', desc: 'Your success is our success. We\'re here to help you grow your business, not just sell software.' },
  { icon: '🔧', title: 'Built for NZ', desc: 'Designed specifically for New Zealand businesses. Local support, local payment methods, and understanding of the NZ market.' },
  { icon: '💡', title: 'Continuous improvement', desc: 'We\'re always listening to feedback and improving Timia. Your suggestions shape our roadmap.' },
]

const stats = [
  { number: '500+', label: 'Businesses' },
  { number: '50,000+', label: 'Bookings processed' },
  { number: '99.9%', label: 'Uptime' },
  { number: '4.8★', label: 'Customer rating' },
]

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
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
            Timia was born from a simple observation: salon owners spend too much time on admin and not enough time doing what they love. We're changing that.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">Why we built Timia</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed text-sm md:text-base">
                <p>It started with a friend who owns a nail salon in Lincoln, Christchurch. She was juggling phone calls, paper diaries, and text messages just to manage her bookings. Every missed call was a missed customer.</p>
                <p>We looked at existing solutions — they were either too expensive, too complicated, or designed for big businesses overseas. Nothing fit the needs of small to medium NZ salons.</p>
                <p>So we built Timia: a simple, affordable booking platform designed specifically for New Zealand businesses. No unnecessary complexity, no confusing jargon — just the tools you need to run your business smoothly.</p>
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

      {/* Stats */}
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-1 md:mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-500 text-xs md:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">What we believe in</h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm md:text-base">Our values guide everything we build and every decision we make.</p>
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

      {/* Team */}
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">Built in New Zealand</h2>
          <p className="text-gray-500 mb-8 md:mb-12 max-w-lg mx-auto text-sm md:text-base">
            We're a small team based in New Zealand, passionate about helping local businesses thrive with better technology.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            {[
              { name: 'Engineering', desc: 'Building reliable, fast software that you can count on every day.', icon: '⚙️' },
              { name: 'Design', desc: 'Creating intuitive experiences that make complex tasks feel simple.', icon: '🎨' },
              { name: 'Support', desc: 'Helping you get the most out of Timia with friendly, local support.', icon: '💬' },
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

      {/* CTA */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Join the Timia community</h2>
          <p className="text-gray-500 mb-6 md:mb-8 text-sm md:text-base">Start managing your bookings the simple way.</p>
          <Link to="/register" className="inline-block bg-gray-900 text-white px-8 md:px-10 py-3.5 md:py-4 rounded-full hover:bg-gray-800 font-medium transition shadow-lg shadow-gray-900/10 text-sm md:text-base">
            Create your business — free
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

import { Link } from 'react-router-dom';

export default function StartSalonBusinessNZ() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-pink-600">Timia</Link>
          <Link to="/register" className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-700">Get Started Free</Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 py-12">
        <nav className="text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-pink-600">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/blog" className="hover:text-pink-600">Blog</Link>
          <span className="mx-2">/</span>
          <span>Start a Salon in NZ</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          How to Start a Salon Business in New Zealand (2026 Guide)
        </h1>
        <p className="text-gray-500 mb-8">Updated June 2026 · 10 min read</p>

        <div className="prose prose-lg max-w-none">
          <p>
            Starting a salon business in New Zealand? Whether it's a hair salon, nail studio, beauty clinic, or barbershop,
            this guide covers everything you need to know — from registration to your first client.
          </p>

          <h2>Step 1: Choose Your Salon Type</h2>
          <ul>
            <li><strong>Hair salon</strong> — Most common, steady demand</li>
            <li><strong>Nail studio</strong> — Lower startup costs, growing market</li>
            <li><strong>Beauty clinic</strong> — Higher margins, requires specialized training</li>
            <li><strong>Barbershop</strong> — Loyal clientele, simpler operations</li>
            <li><strong>Mobile salon</strong> — Lowest overhead, flexible schedule</li>
          </ul>

          <h2>Step 2: Register Your Business</h2>
          <p>
            In New Zealand, you need to:
          </p>
          <ol>
            <li>Register a company on the <a href="https://companies.govt.nz" target="_blank" rel="noopener">Companies Office</a> ($115 online)</li>
            <li>Get an IRD number from <a href="https://www.ird.govt.nz" target="_blank" rel="noopener">IRD</a></li>
            <li>Register for GST if earning over $60,000/year</li>
            <li>Get business insurance (public liability + professional indemnity)</li>
          </ol>

          <h2>Step 3: Find the Right Location</h2>
          <p>
            Consider foot traffic, parking, proximity to complementary businesses (cafes, gyms),
            and lease terms. Many successful salons start in shared spaces or home studios.
          </p>

          <h2>Step 4: Set Up Your Booking System</h2>
          <p>
            Don't rely on phone calls and paper diaries. Modern clients expect online booking.
            A good booking system should:
          </p>
          <ul>
            <li>Accept bookings 24/7 from your website</li>
            <li>Send automatic reminders to reduce no-shows</li>
            <li>Manage staff schedules</li>
            <li>Track customer history</li>
          </ul>
          <p>
            <Link to="/register" className="text-pink-600 font-medium">Timia</Link> offers all of this on a free plan —
            perfect for new salons watching their budget.
          </p>

          <h2>Step 5: Price Your Services</h2>
          <p>
            Research competitors in your area. Common pricing strategies:
          </p>
          <ul>
            <li><strong>Competitive pricing</strong> — Match local rates</li>
            <li><strong>Value pricing</strong> — Charge more for premium experience</li>
            <li><strong>Introductory offers</strong> — 20-30% off first visits to build clientele</li>
          </ul>

          <h2>Step 6: Market Your Salon</h2>
          <ul>
            <li><strong>Google Business Profile</strong> — Essential for local search</li>
            <li><strong>Instagram</strong> — Post before/after photos daily</li>
            <li><strong>Facebook</strong> — Join local community groups</li>
            <li><strong>Referral program</strong> — Reward clients who bring friends</li>
            <li><strong>Google Ads</strong> — Target "salon near me" searches</li>
          </ul>

          <h2>Step 7: Manage Operations</h2>
          <p>
            Once you're running, focus on:
          </p>
          <ul>
            <li>Consistent service quality</li>
            <li>Client retention (loyalty programs help!)</li>
            <li>Staff training and retention</li>
            <li>Financial tracking and tax compliance</li>
          </ul>

          <div className="bg-pink-50 border border-pink-200 rounded-xl p-6 my-8">
            <h3 className="text-pink-800 mt-0">Start Your Salon with Timia</h3>
            <p className="mb-4">Free booking system, loyalty rewards, and customer management. Set up in 5 minutes.</p>
            <Link to="/register" className="inline-block bg-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-700">
              Create Free Account →
            </Link>
          </div>

          <h2>Startup Costs Breakdown</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-2 text-left">Item</th>
                <th className="border p-2 text-right">Estimated Cost (NZD)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border p-2">Business registration</td><td className="border p-2 text-right">$115</td></tr>
              <tr><td className="border p-2">Lease bond (3 months)</td><td className="border p-2 text-right">$3,000–$15,000</td></tr>
              <tr><td className="border p-2">Fit-out & furniture</td><td className="border p-2 text-right">$5,000–$30,000</td></tr>
              <tr><td className="border p-2">Equipment & tools</td><td className="border p-2 text-right">$2,000–$10,000</td></tr>
              <tr><td className="border p-2">Initial stock/products</td><td className="border p-2 text-right">$1,000–$5,000</td></tr>
              <tr><td className="border p-2">Booking software</td><td className="border p-2 text-right">$0 (Timia Free)</td></tr>
              <tr><td className="border p-2">Insurance</td><td className="border p-2 text-right">$500–$1,500/year</td></tr>
              <tr><td className="border p-2">Marketing (first 3 months)</td><td className="border p-2 text-right">$500–$2,000</td></tr>
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}

import { Link } from 'react-router-dom';

export default function HowToReduceNoShows() {
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
          <span>Reduce No-Shows</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          How to Reduce No-Shows at Your Salon (Proven Strategies for 2026)
        </h1>
        <p className="text-gray-500 mb-8">Updated June 2026 · 6 min read</p>

        <div className="prose prose-lg max-w-none">
          <p>
            No-shows cost the average NZ salon <strong>$3,000–$8,000 per year</strong> in lost revenue.
            If you're tired of empty chairs and wasted time, here are proven strategies that actually work.
          </p>

          <h2>Why Clients No-Show</h2>
          <ul>
            <li>They simply forgot (60% of no-shows)</li>
            <li>Something came up and they didn't know how to cancel</li>
            <li>The booking process was too easy to commit to — no deposit</li>
            <li>No perceived consequence for not showing up</li>
          </ul>

          <h2>7 Proven Ways to Reduce No-Shows</h2>

          <h3>1. Send Automated Reminders</h3>
          <p>
            The #1 most effective strategy. Send a reminder <strong>24 hours before</strong> the appointment.
            Salons using automated reminders see a <strong>30-50% reduction</strong> in no-shows.
          </p>
          <p>
            <strong>Timia</strong> sends automatic email reminders 24 hours before every appointment — no setup needed.
          </p>

          <h3>2. Require Deposits or Pre-Payment</h3>
          <p>
            Even a small deposit ($10-20) dramatically reduces no-shows. Clients who pay upfront are 4x more likely to show up.
          </p>

          <h3>3. Make Cancellation Easy</h3>
          <p>
            If canceling is hard, clients just won't show up. Provide a simple link in your reminder email to cancel or reschedule.
          </p>

          <h3>4. Have a Clear No-Show Policy</h3>
          <p>
            Display your cancellation policy on your booking page. Something like: "Cancellations within 24 hours may incur a 50% fee."
          </p>

          <h3>5. Confirm Appointments via Text</h3>
          <p>
            A quick "See you tomorrow at 2pm! Reply C to confirm" text gets 80%+ confirmation rates.
          </p>

          <h3>6. Build a Loyalty Program</h3>
          <p>
            Clients with loyalty points are more invested in showing up. They want to earn their rewards.
            <Link to="/" className="text-pink-600"> Timia's built-in loyalty system</Link> makes this automatic.
          </p>

          <h3>7. Track Your No-Show Rate</h3>
          <p>
            What gets measured gets managed. Track no-shows by:
          </p>
          <ul>
            <li>Day of week (Mondays are worst)</li>
            <li>Time of day</li>
            <li>Service type</li>
            <li>Client history</li>
          </ul>

          <div className="bg-pink-50 border border-pink-200 rounded-xl p-6 my-8">
            <h3 className="text-pink-800 mt-0">Reduce No-Shows with Timia</h3>
            <p className="mb-4">Automated reminders, easy cancellation, and loyalty rewards — all included free.</p>
            <Link to="/register" className="inline-block bg-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-700">
              Start Free →
            </Link>
          </div>

          <h2>Quick Math: What No-Shows Cost You</h2>
          <p>
            If your average service is $60 and you get 3 no-shows per week:
          </p>
          <ul>
            <li>Per week: $180 lost</li>
            <li>Per month: $720 lost</li>
            <li><strong>Per year: $9,360 lost</strong></li>
          </ul>
          <p>
            Reducing no-shows by 50% = <strong>$4,680 saved per year</strong>. That's the cost of a new treatment chair or marketing campaign.
          </p>
        </div>
      </article>
    </div>
  );
}

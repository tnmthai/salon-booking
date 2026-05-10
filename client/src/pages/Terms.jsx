import { Link } from 'react-router-dom'

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition">
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: 10 May 2026</p>

          <div className="prose prose-gray max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing and using Timia ("the Platform", "the Service"), you accept and agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not use the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
              <p className="text-gray-600 leading-relaxed">
                Timia is an online booking management platform that allows businesses ("Business Owners") to manage appointments, staff schedules, and customer bookings. Customers can book services through the Business Owner's public booking page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Account Registration</h2>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2">
                <li>You must provide accurate and complete information when creating an account.</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You must be at least 18 years old to create a business account.</li>
                <li>One person or entity may not maintain more than one free account.</li>
                <li>You are responsible for all activities that occur under your account.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Business Owner Responsibilities</h2>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2">
                <li>You are solely responsible for the services you offer through the Platform.</li>
                <li>You must honour all confirmed bookings made through the Platform.</li>
                <li>You are responsible for managing your staff schedules and availability.</li>
                <li>You must comply with all applicable laws and regulations in your jurisdiction.</li>
                <li>You are responsible for your own pricing, cancellation policies, and customer communications.</li>
                <li>You must not use the Platform for any illegal or unauthorised purpose.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Customer Responsibilities</h2>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2">
                <li>You must provide accurate contact information when making a booking.</li>
                <li>You should arrive on time for your scheduled appointment.</li>
                <li>Cancellation policies are set by the individual Business Owner.</li>
                <li>Repeated no-shows may result in being blocked from future bookings.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Payments & Fees</h2>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2">
                <li>Timia currently offers its platform free of charge during the beta period.</li>
                <li>Payment processing between customers and businesses is handled directly between the parties.</li>
                <li>We reserve the right to introduce pricing plans in the future with reasonable notice.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Data & Privacy</h2>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2">
                <li>We collect and process personal data in accordance with our Privacy Policy.</li>
                <li>Business Owners are data controllers for their customer data and must comply with applicable privacy laws.</li>
                <li>We implement reasonable security measures to protect your data.</li>
                <li>We do not sell your personal data to third parties.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Intellectual Property</h2>
              <p className="text-gray-600 leading-relaxed">
                The Platform, including its design, features, and content, is owned by Timia and protected by intellectual property laws. You may not copy, modify, or distribute any part of the Platform without our prior written consent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed">
                Timia is provided "as is" without warranties of any kind. We are not liable for:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 mt-2">
                <li>The quality or safety of services provided by Business Owners.</li>
                <li>Disputes between businesses and their customers.</li>
                <li>Loss of data or service interruptions.</li>
                <li>Any indirect, incidental, or consequential damages.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Termination</h2>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2">
                <li>You may delete your account at any time by contacting us.</li>
                <li>We may suspend or terminate accounts that violate these terms.</li>
                <li>Upon termination, your data may be retained for a reasonable period for legal purposes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Changes to Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the Platform. Continued use of the Platform after changes constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Governing Law</h2>
              <p className="text-gray-600 leading-relaxed">
                These terms are governed by and construed in accordance with the laws of New Zealand. Any disputes shall be subject to the exclusive jurisdiction of the courts of New Zealand.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Contact</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have any questions about these Terms & Conditions, please contact us at:
              </p>
              <p className="text-gray-600 leading-relaxed mt-2">
                <strong>Email:</strong> support@timia.nz<br />
                <strong>Website:</strong> www.timia.nz
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

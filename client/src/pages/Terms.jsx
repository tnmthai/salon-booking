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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms and Conditions</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: 10 May 2026</p>

          <div className="prose prose-gray max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing and using Timia ("the Platform", "the Service"), you accept and agree to be bound by these Terms and Conditions. If you do not agree to these Terms and Conditions, please do not use the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
              <p className="text-gray-600 leading-relaxed">
                Timia is an online booking management platform that enables businesses ("Business Owners") to manage appointments, staff schedules, and customer bookings. Customers may book services through a Business Owner's public booking page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Account Registration</h2>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2">
                <li>You must provide accurate and complete information when creating an account.</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You must be at least 18 years old to create a business account.</li>
                <li>A person or entity may not maintain more than one free account.</li>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Payments and Fees</h2>
              <p className="text-gray-600 leading-relaxed">
                Timia currently offers its platform free of charge during the beta period at our sole discretion.
              </p>
              <p className="text-gray-600 leading-relaxed mt-2">
                Payment processing between customers and Business Owners is handled directly between the parties.
              </p>
              <p className="text-gray-600 leading-relaxed mt-2">
                We reserve the right to introduce pricing plans in the future with reasonable notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Data and Privacy</h2>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2">
                <li>We collect and process personal information in accordance with our Privacy Policy.</li>
                <li>Business Owners are responsible for the personal information they collect from their customers and must comply with applicable privacy laws.</li>
                <li>We implement reasonable security measures to protect your data.</li>
                <li>We do not sell your personal information to third parties.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Intellectual Property</h2>
              <p className="text-gray-600 leading-relaxed">
                The Platform, including its design, features, and content, is owned by Timia and protected by applicable intellectual property laws. You may not copy, modify, distribute, or reproduce any part of the Platform without our prior written consent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed">
                To the fullest extent permitted by law, Timia is provided "as is" without warranties of any kind.
              </p>
              <p className="text-gray-600 leading-relaxed mt-2">Timia is not liable for:</p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 mt-2">
                <li>The quality, safety, or legality of services provided by Business Owners.</li>
                <li>Disputes between Business Owners and their customers.</li>
                <li>Loss of data, service interruptions, or technical issues.</li>
                <li>Any indirect, incidental, special, or consequential damages.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Termination</h2>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2">
                <li>You may request deletion of your account at any time by contacting us.</li>
                <li>We may suspend or terminate accounts that violate these Terms and Conditions.</li>
                <li>Upon termination, your data may be retained for a reasonable period where required for legal, regulatory, or operational purposes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Changes to Terms</h2>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2">
                <li>We reserve the right to modify these Terms and Conditions at any time.</li>
                <li>We will notify users of significant changes by email or through the Platform.</li>
                <li>Your continued use of the Platform after any changes take effect constitutes acceptance of the updated Terms and Conditions.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Governing Law</h2>
              <p className="text-gray-600 leading-relaxed">
                These Terms and Conditions are governed by and construed in accordance with the laws of New Zealand.
              </p>
              <p className="text-gray-600 leading-relaxed mt-2">
                Any disputes arising in connection with these Terms and Conditions shall be subject to the exclusive jurisdiction of the courts of New Zealand.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Contact</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have any questions about these Terms and Conditions, please contact us:
              </p>
              <p className="text-gray-600 leading-relaxed mt-2">
                <strong>Email:</strong> <a href="mailto:support@timia.nz" className="text-pink-600 hover:underline">support@timia.nz</a><br />
                <strong>Website:</strong> <a href="https://www.timia.nz" className="text-pink-600 hover:underline">Timia.nz</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

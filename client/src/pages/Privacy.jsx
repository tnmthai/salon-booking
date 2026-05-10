import { Link } from 'react-router-dom'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition">
            ← Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: 10 May 2026</p>

          <div className="prose prose-gray max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
              <p className="text-gray-600 leading-relaxed">
                Timia ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and share your personal information when you use our booking platform at Timia.nz.
              </p>
              <p className="text-gray-600 leading-relaxed mt-2">
                This Privacy Policy complies with the Privacy Act 2020 of New Zealand.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
              <p className="text-gray-600 leading-relaxed">
                We collect the following types of personal information:
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Business Owners (when you register)</h3>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-1">
                <li>Business name</li>
                <li>Owner name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Business address</li>
                <li>Account credentials (passwords are securely stored in hashed form)</li>
                <li>Business settings (such as timezone, services, and staff information)</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Customers (when making a booking)</h3>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-1">
                <li>Name</li>
                <li>Phone number</li>
                <li>Email address</li>
                <li>Booking details (such as service, date, time, and staff member)</li>
                <li>Notes you provide with your booking</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Automatically collected information</h3>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-1">
                <li>Browser type and device information</li>
                <li>IP address</li>
                <li>Pages visited and usage activity</li>
                <li>Cookies and similar technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
              <p className="text-gray-600 leading-relaxed">We use your personal information to:</p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 mt-2">
                <li>Provide and maintain the Platform</li>
                <li>Process and manage bookings</li>
                <li>Send booking confirmations and reminders by email</li>
                <li>Communicate with you about your account or bookings</li>
                <li>Improve our services and user experience</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Sharing Your Information</h2>
              <p className="text-gray-600 leading-relaxed">
                We only share your personal information in the following circumstances:
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">With Business Owners</h3>
              <p className="text-gray-600 leading-relaxed">
                When you make a booking, your booking details and contact information are shared with the Business Owner you booked with.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Service Providers</h3>
              <p className="text-gray-600 leading-relaxed">
                We use trusted third-party service providers (such as hosting and email delivery providers) to operate the Platform and process data on our behalf.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Legal Requirements</h3>
              <p className="text-gray-600 leading-relaxed">
                We may disclose your information where required by law or where necessary to protect our legal rights.
              </p>
              <p className="text-gray-600 leading-relaxed mt-2">
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Storage and Security</h2>
              <p className="text-gray-600 leading-relaxed">
                We take reasonable steps to protect your personal information. This includes:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 mt-2">
                <li>Storing data on secure cloud servers</li>
                <li>Encrypting passwords using industry-standard hashing methods</li>
                <li>Using HTTPS to encrypt data during transmission</li>
                <li>Applying reasonable security measures to prevent unauthorised access, loss, or misuse</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-2">
                While we take reasonable steps to protect your information, no online system can be guaranteed to be completely secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Your Rights</h2>
              <p className="text-gray-600 leading-relaxed">
                Under the Privacy Act 2020, you have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 mt-2">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate or incomplete information</li>
                <li>Request deletion of your personal information (where applicable)</li>
                <li>Withdraw consent for certain types of processing</li>
                <li>Make a complaint to the Privacy Commissioner if you believe your privacy has been breached</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-2">
                To exercise any of these rights, contact us at <a href="mailto:support@timia.nz" className="text-pink-600 hover:underline">support@timia.nz</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Cookies</h2>
              <p className="text-gray-600 leading-relaxed">
                We use essential cookies to maintain your login session and provide core platform functionality.
              </p>
              <p className="text-gray-600 leading-relaxed mt-2">
                We do not use advertising or third-party tracking cookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Data Retention</h2>
              <p className="text-gray-600 leading-relaxed">
                We retain personal information for as long as necessary to provide our services, comply with legal obligations, and resolve disputes.
              </p>
              <p className="text-gray-600 leading-relaxed mt-2">
                You may request deletion of your account and associated personal information at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Third-Party Links</h2>
              <p className="text-gray-600 leading-relaxed">
                The Platform may contain links to third-party websites. We are not responsible for the privacy practices or content of those websites.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Changes to This Privacy Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this Privacy Policy from time to time. If we make significant changes, we will notify users by email or through the Platform.
              </p>
              <p className="text-gray-600 leading-relaxed mt-2">
                Your continued use of the Platform after changes take effect constitutes acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Contact Us</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have any questions about this Privacy Policy or wish to exercise your privacy rights, please contact us:
              </p>
              <p className="text-gray-600 leading-relaxed mt-2">
                <strong>Email:</strong> <a href="mailto:support@timia.nz" className="text-pink-600 hover:underline">support@timia.nz</a><br />
                <strong>Website:</strong> <a href="https://www.timia.nz" className="text-pink-600 hover:underline">Timia.nz</a>
              </p>
              <p className="text-gray-600 leading-relaxed mt-4">
                If you are not satisfied with our response, you may contact the <strong>Office of the Privacy Commissioner</strong> through their official website: <a href="https://www.privacy.org.nz" className="text-pink-600 hover:underline" target="_blank" rel="noopener noreferrer">Privacy Commissioner New Zealand</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'

export default function Privacy() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: 10 May 2026</p>

          <div className="prose prose-gray max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
              <p className="text-gray-600 leading-relaxed">
                Timia ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and share your personal information when you use our booking platform at www.timia.nz.
              </p>
              <p className="text-gray-600 leading-relaxed mt-2">
                This policy complies with the New Zealand Privacy Act 2020.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
              <p className="text-gray-600 leading-relaxed">We collect the following types of information:</p>
              
              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Business Owners (when you register)</h3>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-1">
                <li>Business name, owner name, email, phone, address</li>
                <li>Account credentials (password stored securely as a hash)</li>
                <li>Business settings (timezone, services, staff information)</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Customers (when you make a booking)</h3>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-1">
                <li>Name, phone number, email address</li>
                <li>Booking details (service, date, time, staff)</li>
                <li>Notes you provide with your booking</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Automatically collected</h3>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-1">
                <li>Browser type, device information</li>
                <li>IP address, pages visited</li>
                <li>Cookies and similar technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
              <p className="text-gray-600 leading-relaxed">We use your information to:</p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 mt-2">
                <li>Provide and maintain the booking platform</li>
                <li>Process and manage bookings</li>
                <li>Send booking confirmations and reminders via email</li>
                <li>Communicate with you about your account or bookings</li>
                <li>Improve our services and user experience</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Sharing Your Information</h2>
              <p className="text-gray-600 leading-relaxed">
                We share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 mt-2">
                <li><strong>With the business:</strong> When you make a booking, your details are shared with the business you booked with</li>
                <li><strong>Service providers:</strong> We use third-party services (email delivery, hosting) that process data on our behalf</li>
                <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-2">
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Storage & Security</h2>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2">
                <li>Your data is stored on secure servers provided by Railway (cloud hosting)</li>
                <li>Passwords are encrypted using industry-standard hashing</li>
                <li>We use HTTPS to encrypt data in transit</li>
                <li>We implement reasonable security measures to protect against unauthorised access</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Your Rights</h2>
              <p className="text-gray-600 leading-relaxed">
                Under the Privacy Act 2020, you have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 mt-2">
                <li><strong>Access</strong> the personal information we hold about you</li>
                <li><strong>Request correction</strong> of inaccurate information</li>
                <li><strong>Request deletion</strong> of your personal information</li>
                <li><strong>Withdraw consent</strong> for certain data processing</li>
                <li><strong>Complain</strong> to the Privacy Commissioner if you believe your privacy has been breached</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-2">
                To exercise these rights, contact us at support@timia.nz.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Cookies</h2>
              <p className="text-gray-600 leading-relaxed">
                We use essential cookies to maintain your login session and provide core functionality. We do not use tracking cookies for advertising purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Data Retention</h2>
              <p className="text-gray-600 leading-relaxed">
                We retain your data for as long as your account is active or as needed to provide our services. You may request deletion of your account and associated data at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Third-Party Links</h2>
              <p className="text-gray-600 leading-relaxed">
                Our platform may contain links to third-party websites. We are not responsible for the privacy practices of these websites.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Changes to This Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify users of significant changes via email or through the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Contact Us</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have questions about this Privacy Policy or wish to exercise your privacy rights, contact us at:
              </p>
              <p className="text-gray-600 leading-relaxed mt-2">
                <strong>Email:</strong> support@timia.nz<br />
                <strong>Website:</strong> www.timia.nz
              </p>
              <p className="text-gray-600 leading-relaxed mt-4">
                If you are not satisfied with our response, you can contact the <strong>New Zealand Privacy Commissioner</strong> at <a href="https://www.privacy.org.nz" className="text-pink-600 hover:underline" target="_blank" rel="noopener noreferrer">www.privacy.org.nz</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'

export default function Cookies() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cookie Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: 10 May 2026</p>

          <div className="prose prose-gray max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. What Are Cookies</h2>
              <p className="text-gray-600 leading-relaxed">
                Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work efficiently and to provide information to website owners.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Cookies</h2>
              <p className="text-gray-600 leading-relaxed">
                Timia uses cookies for the following purposes:
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Essential Cookies</h3>
              <p className="text-gray-600 leading-relaxed">
                These cookies are necessary for the website to function properly. They enable core features such as:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-1 mt-2">
                <li>Keeping you logged in during your session</li>
                <li>Remembering your preferences and settings</li>
                <li>Maintaining security and preventing fraud</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-2">
                These cookies cannot be disabled as the website would not function without them.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Functional Cookies</h3>
              <p className="text-gray-600 leading-relaxed">
                These cookies enhance your experience by:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-1 mt-2">
                <li>Remembering your language preference</li>
                <li>Storing your calendar view preferences</li>
                <li>Saving lunch break schedules locally</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Cookies We Use</h2>
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border p-3 text-left font-medium">Cookie Name</th>
                      <th className="border p-3 text-left font-medium">Purpose</th>
                      <th className="border p-3 text-left font-medium">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-3 text-gray-600">salon_token</td>
                      <td className="border p-3 text-gray-600">Authentication token to keep you logged in</td>
                      <td className="border p-3 text-gray-600">7 days</td>
                    </tr>
                    <tr>
                      <td className="border p-3 text-gray-600">salon_timezone</td>
                      <td className="border p-3 text-gray-600">Your business timezone setting</td>
                      <td className="border p-3 text-gray-600">Persistent</td>
                    </tr>
                    <tr>
                      <td className="border p-3 text-gray-600">lunch_breaks</td>
                      <td className="border p-3 text-gray-600">Staff lunch break schedules</td>
                      <td className="border p-3 text-gray-600">Persistent</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Third-Party Cookies</h2>
              <p className="text-gray-600 leading-relaxed">
                We do not use third-party tracking or advertising cookies. Our platform does not integrate with analytics services that would place cookies on your device.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Local Storage</h2>
              <p className="text-gray-600 leading-relaxed">
                In addition to cookies, we use browser local storage to store certain preferences locally on your device. This data is not transmitted to our servers and can be cleared through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Managing Cookies</h2>
              <p className="text-gray-600 leading-relaxed">
                You can control and manage cookies through your browser settings. Most browsers allow you to:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 mt-2">
                <li>View what cookies are stored</li>
                <li>Delete cookies individually or entirely</li>
                <li>Block cookies from specific websites</li>
                <li>Block all cookies</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-2">
                Please note that disabling essential cookies may prevent the website from functioning properly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Changes to This Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Contact Us</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have questions about our use of cookies, please contact us at:
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

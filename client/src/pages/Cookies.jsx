import { Link } from 'react-router-dom'

export default function Cookies() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cookie Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: 10 May 2026</p>

          <div className="prose prose-gray max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. What Are Cookies</h2>
              <p className="text-gray-600 leading-relaxed">
                Cookies are small text files stored on your device when you visit a website.
              </p>
              <p className="text-gray-600 leading-relaxed mt-2">
                They help websites function properly, improve your experience, and remember your preferences.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Cookies</h2>
              <p className="text-gray-600 leading-relaxed">
                Timia uses cookies for the following purposes:
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Essential Cookies</h3>
              <p className="text-gray-600 leading-relaxed">
                These cookies are necessary for the Platform to function properly. They enable core features such as:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-1 mt-2">
                <li>Keeping you signed in during your session</li>
                <li>Remembering your preferences and settings</li>
                <li>Maintaining security and helping prevent fraud</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-2">
                These cookies cannot be disabled, as the Platform would not function correctly without them.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Functional Cookies</h3>
              <p className="text-gray-600 leading-relaxed">
                These cookies improve your experience by:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-1 mt-2">
                <li>Remembering your timezone preferences</li>
                <li>Saving your calendar display preferences</li>
                <li>Storing scheduling preferences locally on your device</li>
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
                      <td className="border p-3 text-gray-600">timia_token</td>
                      <td className="border p-3 text-gray-600">Authentication token to keep you signed in</td>
                      <td className="border p-3 text-gray-600">7 days</td>
                    </tr>
                    <tr>
                      <td className="border p-3 text-gray-600">timia_timezone</td>
                      <td className="border p-3 text-gray-600">Your timezone setting</td>
                      <td className="border p-3 text-gray-600">Persistent</td>
                    </tr>
                    <tr>
                      <td className="border p-3 text-gray-600">timia_preferences</td>
                      <td className="border p-3 text-gray-600">Saved booking and scheduling preferences</td>
                      <td className="border p-3 text-gray-600">Persistent</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Third-Party Cookies</h2>
              <p className="text-gray-600 leading-relaxed">
                Timia does not use third-party advertising or tracking cookies.
              </p>
              <p className="text-gray-600 leading-relaxed mt-2">
                We do not use analytics services that place cookies on your device for advertising purposes.
              </p>
              <p className="text-gray-600 leading-relaxed mt-2">
                Some integrated third-party services (if enabled by Business Owners) may use their own cookies, and their use is subject to their own privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Local Storage</h2>
              <p className="text-gray-600 leading-relaxed">
                In addition to cookies, Timia may use your browser's local storage to save certain preferences on your device.
              </p>
              <p className="text-gray-600 leading-relaxed mt-2">
                This information is stored locally and is not transmitted to our servers unless required for platform functionality.
              </p>
              <p className="text-gray-600 leading-relaxed mt-2">
                You can clear local storage through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Managing Cookies</h2>
              <p className="text-gray-600 leading-relaxed">
                You can control and manage cookies through your browser settings. Most browsers allow you to:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 mt-2">
                <li>View stored cookies</li>
                <li>Delete cookies individually or all at once</li>
                <li>Block cookies from specific websites</li>
                <li>Block all cookies</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-2">
                Please note that disabling essential cookies may prevent the Platform from functioning properly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Changes to This Cookie Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this Cookie Policy from time to time. Any changes will be published on this page with an updated revision date.
              </p>
              <p className="text-gray-600 leading-relaxed mt-2">
                Your continued use of the Platform after changes take effect constitutes acceptance of the updated Cookie Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Contact Us</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have any questions about this Cookie Policy or our use of cookies, please contact us:
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

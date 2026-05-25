import { Link } from 'react-router-dom'

export default function KioskGuide() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link to="/" className="text-pink-600 hover:text-pink-700 text-sm font-medium">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-3">Kiosk Check-in Guide</h1>
          <p className="text-gray-600 mt-2">Everything you need to set up and use the self-check-in system for your salon.</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-16">

        {/* Section 1: Overview */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 What is Kiosk Check-in?</h2>
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <p className="text-gray-700 leading-relaxed">
              Kiosk Check-in lets your customers check themselves in when they arrive at your salon.
              No more queuing at the front desk — customers tap a few buttons on a tablet, and a
              receipt prints out with their service details for the staff.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="bg-pink-50 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">📱</div>
                <h3 className="font-semibold text-gray-900">Self-Service</h3>
                <p className="text-sm text-gray-600 mt-1">Customers check in without staff help</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">🖨️</div>
                <h3 className="font-semibold text-gray-900">Print Receipt</h3>
                <p className="text-sm text-gray-600 mt-1">Service list printed for staff</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="font-semibold text-gray-900">Fast & Easy</h3>
                <p className="text-sm text-gray-600 mt-1">Under 30 seconds per check-in</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Hardware Setup */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🖥️ Hardware Setup</h2>
          <div className="bg-white rounded-xl border p-6 space-y-6">

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommended Devices</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="py-3 px-4 font-semibold text-gray-700">Device</th>
                      <th className="py-3 px-4 font-semibold text-gray-700">Size</th>
                      <th className="py-3 px-4 font-semibold text-gray-700">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium">iPad (10th gen) or iPad Mini</td>
                      <td className="py-3 px-4">10.9" / 8.3"</td>
                      <td className="py-3 px-4">Best experience, supports fullscreen Safari</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium">Samsung Galaxy Tab A8</td>
                      <td className="py-3 px-4">10.5"</td>
                      <td className="py-3 px-4">Budget-friendly Android tablet</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium">Amazon Fire HD 8</td>
                      <td className="py-3 px-4">8"</td>
                      <td className="py-3 px-4">Cheapest option, works with Silk browser</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Any Android tablet 8-11"</td>
                      <td className="py-3 px-4">8-11"</td>
                      <td className="py-3 px-4">Chrome browser recommended</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Printer Setup</h3>
              <p className="text-gray-700 mb-4">
                The kiosk uses your browser's built-in print function, which works with any WiFi-connected printer.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4 bg-green-50 rounded-lg p-4">
                  <div className="text-2xl">✅</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Brother WiFi Printer (Recommended)</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Connect to the same WiFi network as your tablet. The kiosk will detect it automatically
                      through the browser's print dialog. No extra setup needed.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl">💡</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Thermal Receipt Printer (Best for receipts)</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      For 80mm receipt-style prints, use a thermal printer like Epson TM-T88VI or Star Micronics TSP143.
                      Connect via WiFi and set paper size to 80mm × 200mm in printer settings.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl">🖨️</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">AirPrint (iPad)</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      iPads support AirPrint natively. Any AirPrint-compatible printer on the same WiFi will appear
                      automatically in the print dialog.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tablet Stand</h3>
              <p className="text-gray-700">
                Mount the tablet at customer waist/eye height near the entrance. Use a secure stand
                that prevents theft — many kiosk stands lock the tablet in place and hide the cables.
                Search for "tablet kiosk stand" on Amazon or PB Tech.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Step-by-Step Setup */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">⚙️ Setting Up Your Kiosk</h2>
          <div className="bg-white rounded-xl border p-6">
            <div className="space-y-8">

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Open the Kiosk URL on your tablet</h3>
                  <p className="text-gray-600 mt-1">
                    In your tablet's browser (Safari for iPad, Chrome for Android), go to:
                  </p>
                  <div className="bg-gray-100 rounded-lg px-4 py-3 mt-2 font-mono text-sm text-pink-700">
                    https://www.timia.nz/kiosk/<span className="text-gray-500">your-salon-slug</span>
                  </div>
                  <p className="text-gray-500 text-sm mt-2">
                    Your salon slug is the same as your booking page URL. Find it in Settings → Salon Profile.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold text-lg">2</div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Add to Home Screen (recommended)</h3>
                  <p className="text-gray-600 mt-1">
                    This makes the kiosk open in fullscreen without browser bars:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 mt-3">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">📱 iPad (Safari)</h4>
                      <ol className="text-sm text-blue-800 space-y-1.5 list-decimal list-inside">
                        <li>Tap the Share button (square with arrow)</li>
                        <li>Scroll down, tap "Add to Home Screen"</li>
                        <li>Name it "Check-in" and tap Add</li>
                        <li>The kiosk now opens fullscreen!</li>
                      </ol>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2">🤖 Android (Chrome)</h4>
                      <ol className="text-sm text-green-800 space-y-1.5 list-decimal list-inside">
                        <li>Tap the three dots menu (⋮)</li>
                        <li>Tap "Add to Home screen"</li>
                        <li>Name it "Check-in" and tap Add</li>
                        <li>Opens without browser bars!</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold text-lg">3</div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Connect your printer</h3>
                  <p className="text-gray-600 mt-1">
                    Make sure your printer is on the same WiFi network as the tablet. When a customer checks in
                    and taps "Print", the browser's print dialog will show all available printers. Select your
                    printer once — the browser will remember it for next time.
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                    <p className="text-sm text-yellow-800">
                      <strong>💡 Tip:</strong> For thermal printers, set paper size to 80mm width in printer preferences.
                      For Brother A4 printers, the default settings work fine — the receipt will be centered on the page.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold text-lg">4</div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Test the system</h3>
                  <p className="text-gray-600 mt-1">
                    Create a test booking for today, then try checking in from the kiosk. You can use the
                    "Preview Receipt" button to see how the printout looks without actually printing.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold text-lg">5</div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">You're ready!</h3>
                  <p className="text-gray-600 mt-1">
                    Place the tablet on a stand near your entrance. Customers will tap "CHECK IN",
                    enter their phone number or booking code, and the system handles the rest.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Section 4: Customer Experience */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">👤 How Customers Use It</h2>
          <div className="bg-white rounded-xl border p-6">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">👋</span>
                </div>
                <h3 className="font-semibold text-gray-900">1. Tap Check In</h3>
                <p className="text-sm text-gray-600 mt-1">Customer taps the big button on the welcome screen</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="font-semibold text-gray-900">2. Enter Phone/Code</h3>
                <p className="text-sm text-gray-600 mt-1">Type phone number or 8-character booking code</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">✅</span>
                </div>
                <h3 className="font-semibold text-gray-900">3. Confirm</h3>
                <p className="text-sm text-gray-600 mt-1">Review services and tap "Check In" for each appointment</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🖨️</span>
                </div>
                <h3 className="font-semibold text-gray-900">4. Get Receipt</h3>
                <p className="text-sm text-gray-600 mt-1">Receipt prints automatically — hand it to staff</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Tips */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">💡 Tips & Troubleshooting</h2>
          <div className="bg-white rounded-xl border p-6 space-y-5">

            <div className="flex items-start gap-3">
              <span className="text-pink-600 font-bold text-lg">•</span>
              <div>
                <h4 className="font-semibold text-gray-900">Keep the tablet charged</h4>
                <p className="text-gray-600 text-sm">Use a charging cable that stays plugged in. Most kiosk stands have cable management built in.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-pink-600 font-bold text-lg">•</span>
              <div>
                <h4 className="font-semibold text-gray-900">Auto-reset keeps it clean</h4>
                <p className="text-gray-600 text-sm">After 60 seconds of inactivity, the screen resets to the welcome page. No need to worry about leaving customer data visible.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-pink-600 font-bold text-lg">•</span>
              <div>
                <h4 className="font-semibold text-gray-900">Portrait mode recommended</h4>
                <p className="text-gray-600 text-sm">The kiosk works best in portrait (vertical) orientation. If the tablet is in landscape, a "rotate device" message will appear.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-pink-600 font-bold text-lg">•</span>
              <div>
                <h4 className="font-semibold text-gray-900">Printer not showing up?</h4>
                <p className="text-gray-600 text-sm">Make sure the printer and tablet are on the same WiFi network. Try refreshing the page. For Brother printers, ensure the Brother iPrint&Scan app is not blocking the system print service.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-pink-600 font-bold text-lg">•</span>
              <div>
                <h4 className="font-semibold text-gray-900">Customer can't find their booking?</h4>
                <p className="text-gray-600 text-sm">They may have booked for a different day, or used a different phone number. Staff can look up bookings from the admin dashboard.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-pink-600 font-bold text-lg">•</span>
              <div>
                <h4 className="font-semibold text-gray-900">Offline? No problem</h4>
                <p className="text-gray-600 text-sm">The kiosk needs internet to look up bookings. If your WiFi goes down, customers can still check in manually with staff.</p>
              </div>
            </div>

          </div>
        </section>

        {/* Section 6: Quick Links */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🔗 Quick Links</h2>
          <div className="bg-white rounded-xl border p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Link to="/register" className="block bg-pink-50 hover:bg-pink-100 rounded-lg p-4 transition">
                <h3 className="font-semibold text-pink-700">Create a Salon Account</h3>
                <p className="text-sm text-pink-600 mt-1">Get started with Timia — free plan available</p>
              </Link>
              <Link to="/features" className="block bg-purple-50 hover:bg-purple-100 rounded-lg p-4 transition">
                <h3 className="font-semibold text-purple-700">All Features</h3>
                <p className="text-sm text-purple-600 mt-1">See everything Timia can do for your salon</p>
              </Link>
              <Link to="/pricing" className="block bg-blue-50 hover:bg-blue-100 rounded-lg p-4 transition">
                <h3 className="font-semibold text-blue-700">Pricing Plans</h3>
                <p className="text-sm text-blue-600 mt-1">Choose the plan that fits your business</p>
              </Link>
              <Link to="/contact" className="block bg-green-50 hover:bg-green-100 rounded-lg p-4 transition">
                <h3 className="font-semibold text-green-700">Need Help?</h3>
                <p className="text-sm text-green-600 mt-1">Contact us for support or questions</p>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Timia. Salon booking made simple.</p>
          <div className="mt-2 space-x-4">
            <Link to="/" className="hover:text-pink-600">Home</Link>
            <Link to="/features" className="hover:text-pink-600">Features</Link>
            <Link to="/pricing" className="hover:text-pink-600">Pricing</Link>
            <Link to="/contact" className="hover:text-pink-600">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

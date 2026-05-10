import { Link } from 'react-router-dom'

export default function Legal() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Legal Information</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: 10 May 2026</p>

          <div className="prose prose-gray max-w-none space-y-10">

            {/* Disclaimer */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Disclaimer</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                <p className="text-yellow-800 text-sm font-medium">
                  ⚠️ Important: Timia is a booking platform that connects businesses and customers. We are not a party to any transaction between businesses and their customers.
                </p>
              </div>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2">
                <li><strong>Platform Role:</strong> Timia provides software tools for managing bookings. We do not provide beauty, wellness, or any other services.</li>
                <li><strong>Business Responsibility:</strong> Each business is solely responsible for the quality, safety, and legality of their services.</li>
                <li><strong>No Endorsement:</strong> The presence of a business on Timia does not constitute our endorsement or recommendation.</li>
                <li><strong>Disputes:</strong> Any disputes regarding services must be resolved directly between the customer and the business.</li>
                <li><strong>Accuracy:</strong> While we strive for accuracy, we do not guarantee that all information on the platform is current or error-free.</li>
              </ul>
            </section>

            {/* Image & Media Policy */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Image & Media Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                Businesses may upload images to their gallery on Timia. By uploading images, you agree to the following:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 mt-3">
                <li><strong>Ownership:</strong> You must own or have the right to use all images you upload.</li>
                <li><strong>Copyright:</strong> Uploading copyrighted material without permission is prohibited under the Copyright Act 1994.</li>
                <li><strong>Consent:</strong> If images show identifiable people, you must have their consent to publish.</li>
                <li><strong>Content Standards:</strong> Images must not contain:
                  <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                    <li>Offensive, illegal, or inappropriate content</li>
                    <li>False or misleading representations</li>
                    <li>Content that violates the Fair Trading Act 1986</li>
                  </ul>
                </li>
                <li><strong>Removal:</strong> We reserve the right to remove any image that violates these standards without notice.</li>
                <li><strong>Licence:</strong> By uploading, you grant Timia a non-exclusive licence to display the images on your business page.</li>
              </ul>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                <p className="text-blue-800 text-sm">
                  💡 <strong>Tip:</strong> Use your own original photos. Stock images should be properly licensed. Under the Fair Trading Act, images must accurately represent your services.
                </p>
              </div>
            </section>

            {/* Cancellation Policy */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Cancellation Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                Each business sets their own cancellation policy. The following applies to all bookings made through Timia:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 mt-3">
                <li><strong>Customer Cancellation:</strong> Customers may cancel a booking through the booking lookup page. Cancellation terms are set by the individual business.</li>
                <li><strong>Business Cancellation:</strong> Businesses may cancel bookings through their admin dashboard.</li>
                <li><strong>No-Show:</strong> If a customer does not arrive for their appointment, the business's no-show policy applies.</li>
                <li><strong>Refunds:</strong> Refund policies are determined by each business. Under the Consumer Guarantees Act 1993, consumers may have rights to remedies if services are not provided with reasonable care and skill.</li>
              </ul>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed">
                To the maximum extent permitted by New Zealand law:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 mt-3">
                <li>Timia is not liable for any loss or damage arising from the use of services booked through the platform.</li>
                <li>Timia is not liable for the actions or omissions of any business listed on the platform.</li>
                <li>Our total liability shall not exceed the fees paid by you (if any) in the 12 months preceding the claim.</li>
                <li>Nothing in these terms excludes or limits liability that cannot be excluded under New Zealand law, including under the Consumer Guarantees Act 1993.</li>
              </ul>
            </section>

            {/* Fair Trading Act Compliance */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Fair Trading Act Compliance</h2>
              <p className="text-gray-600 leading-relaxed">
                Under the Fair Trading Act 1986:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 mt-3">
                <li>All information on the platform must not be misleading or deceptive.</li>
                <li>Businesses are responsible for the accuracy of their service descriptions, prices, and images.</li>
                <li>Customers should verify details directly with the business before making decisions.</li>
                <li>If you believe information on the platform is misleading, please contact us at support@timia.nz.</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Intellectual Property</h2>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2">
                <li>The Timia platform, including its design, code, and branding, is owned by Timia.</li>
                <li>Business names, logos, and images remain the property of their respective owners.</li>
                <li>Users may not copy, reproduce, or distribute any content from the platform without permission.</li>
              </ul>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Governing Law</h2>
              <p className="text-gray-600 leading-relaxed">
                These terms are governed by the laws of New Zealand. Any disputes shall be subject to the exclusive jurisdiction of the New Zealand courts.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Contact</h2>
              <p className="text-gray-600 leading-relaxed">
                For legal inquiries, please contact:
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

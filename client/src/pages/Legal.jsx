import { Link } from 'react-router-dom'

export default function Legal() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Legal Information</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: 10 May 2026</p>

          <div className="prose prose-gray max-w-none space-y-10">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Disclaimer</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                <p className="text-yellow-800 text-sm font-medium">
                  ⚠️ Important: Timia is a booking platform that connects businesses and customers. Timia is not a party to any agreement, transaction, or service arrangement between Business Owners and their customers.
                </p>
              </div>

              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Platform Role</h3>
              <p className="text-gray-600 leading-relaxed">
                Timia provides software tools for managing appointments, bookings, and customer communications. Timia does not provide beauty, wellness, medical, hospitality, or any other services offered by Business Owners.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Business Responsibility</h3>
              <p className="text-gray-600 leading-relaxed">
                Each Business Owner is solely responsible for the quality, safety, legality, pricing, and delivery of their services.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">No Endorsement</h3>
              <p className="text-gray-600 leading-relaxed">
                A business listed on Timia is not endorsed, certified, or recommended by Timia unless explicitly stated.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Disputes</h3>
              <p className="text-gray-600 leading-relaxed">
                Any disputes relating to bookings, services, cancellations, refunds, or customer experiences must be resolved directly between the customer and the Business Owner.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Accuracy of Information</h3>
              <p className="text-gray-600 leading-relaxed">
                While we make reasonable efforts to maintain accurate information on the Platform, we do not guarantee that all content is complete, current, or error-free.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Image and Media Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                Business Owners may upload images and other media to their business profiles on Timia. By uploading content, you agree to the following:
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Ownership</h3>
              <p className="text-gray-600 leading-relaxed">
                You must own or have the legal right to use all uploaded content.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Copyright Compliance</h3>
              <p className="text-gray-600 leading-relaxed">
                Uploading copyrighted material without proper permission is prohibited under the Copyright Act 1994 of New Zealand.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Consent</h3>
              <p className="text-gray-600 leading-relaxed">
                If uploaded content contains identifiable individuals, you must have their consent to publish that content.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Content Standards</h3>
              <p className="text-gray-600 leading-relaxed">Uploaded content must not contain:</p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-1 mt-2">
                <li>Offensive, illegal, harmful, or inappropriate material</li>
                <li>False, misleading, or deceptive representations</li>
                <li>Content that breaches applicable laws, including the Fair Trading Act 1986</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Removal of Content</h3>
              <p className="text-gray-600 leading-relaxed">
                Timia reserves the right to remove any content that breaches these standards or may expose the Platform to legal or reputational risk.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Licence to Display</h3>
              <p className="text-gray-600 leading-relaxed">
                By uploading content, you grant Timia a non-exclusive, royalty-free licence to display, reproduce, and publish that content on your business profile for platform-related purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Cancellation Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                Each Business Owner sets their own cancellation policy. The following general rules apply to bookings made through Timia:
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Customer Cancellations</h3>
              <p className="text-gray-600 leading-relaxed">
                Customers may cancel bookings through the booking lookup page, subject to the Business Owner's cancellation policy.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Business Cancellations</h3>
              <p className="text-gray-600 leading-relaxed">
                Business Owners may cancel bookings through their business dashboard.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">No-Shows</h3>
              <p className="text-gray-600 leading-relaxed">
                If a customer does not attend an appointment, the Business Owner's no-show policy will apply.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Refunds</h3>
              <p className="text-gray-600 leading-relaxed">
                Refund policies are determined by each Business Owner. Nothing in this policy limits any rights available under the Consumer Guarantees Act 1993 of New Zealand.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed">
                To the fullest extent permitted by law:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 mt-2">
                <li>Timia is not liable for any loss, damage, or claim arising from services booked through the Platform.</li>
                <li>Timia is not liable for the actions, omissions, or conduct of Business Owners or customers.</li>
                <li>Timia is not liable for cancellations, service quality issues, refunds, injuries, or disputes between parties.</li>
                <li>Where liability cannot be excluded, Timia's total liability will not exceed the fees paid by you (if any) in the 12 months before the claim arose.</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-2">
                Nothing in this Legal Information excludes or limits liability that cannot be excluded under applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Fair Trading Act Compliance</h2>
              <p className="text-gray-600 leading-relaxed">
                Under the Fair Trading Act 1986 of New Zealand:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 mt-2">
                <li>Information published on the Platform must not be false, misleading, or deceptive.</li>
                <li>Business Owners are responsible for ensuring their service descriptions, pricing, and images are accurate.</li>
                <li>Customers should confirm service details directly with the Business Owner before making decisions.</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-2">
                If you believe any information on the Platform is misleading or inaccurate, please contact us at <a href="mailto:support@timia.nz" className="text-pink-600 hover:underline">support@timia.nz</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Intellectual Property</h2>
              <p className="text-gray-600 leading-relaxed">
                The Timia Platform, including its software, branding, design, and content, is owned by Timia and protected by applicable intellectual property laws.
              </p>
              <p className="text-gray-600 leading-relaxed mt-2">
                Business names, logos, trademarks, and uploaded content remain the property of their respective owners.
              </p>
              <p className="text-gray-600 leading-relaxed mt-2">
                Users must not copy, reproduce, distribute, or use Platform content without prior written permission, except as permitted by law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Governing Law</h2>
              <p className="text-gray-600 leading-relaxed">
                This Legal Information is governed by and interpreted in accordance with the laws of New Zealand.
              </p>
              <p className="text-gray-600 leading-relaxed mt-2">
                Any disputes arising from or relating to the Platform shall be subject to the exclusive jurisdiction of the courts of New Zealand.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Contact</h2>
              <p className="text-gray-600 leading-relaxed">
                For legal enquiries, please contact us:
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

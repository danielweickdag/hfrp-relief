"use client";

import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
            <Link
              href="/"
              className="text-red-600 hover:text-red-700 font-medium"
            >
              ← Back to Home
            </Link>
          </div>
          <p className="mt-2 text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Introduction
            </h2>
            <p className="mb-6 text-gray-700 leading-relaxed">
              The Haitian Family Relief Project ("we," "our," or "us") is
              committed to protecting your privacy. This Privacy Policy explains
              how we collect, use, disclose, and safeguard your information when
              you visit our website or make a donation.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              Information We Collect
            </h2>
            <h3 className="text-xl font-medium text-gray-800 mb-3">
              Personal Information
            </h3>
            <p className="mb-4 text-gray-700 leading-relaxed">
              We may collect personal information that you voluntarily provide
              to us when you:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Make a donation</li>
              <li>Subscribe to our newsletter</li>
              <li>Contact us through our contact form</li>
              <li>Volunteer with our organization</li>
              <li>Create an account on our website</li>
            </ul>
            <p className="mb-6 text-gray-700 leading-relaxed">
              This information may include your name, email address, phone
              number, mailing address, payment information, and any other
              information you choose to provide.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3">
              Automatically Collected Information
            </h3>
            <p className="mb-6 text-gray-700 leading-relaxed">
              When you visit our website, we may automatically collect certain
              information about your device and usage patterns, including:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>IP address and location data</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Pages visited and time spent on our site</li>
              <li>Referring website</li>
              <li>Device information</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              How We Use Your Information
            </h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Process donations and send receipts</li>
              <li>Communicate with you about our programs and impact</li>
              <li>Send newsletters and updates (with your consent)</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Improve our website and services</li>
              <li>Comply with legal obligations</li>
              <li>Prevent fraud and ensure security</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              Information Sharing and Disclosure
            </h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              We do not sell, trade, or otherwise transfer your personal
              information to third parties except in the following
              circumstances:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>
                <strong>Service Providers:</strong> We may share information
                with trusted third-party service providers who assist us in
                operating our website, processing donations, or conducting our
                business
              </li>
              <li>
                <strong>Legal Requirements:</strong> We may disclose information
                when required by law or to protect our rights, property, or
                safety
              </li>
              <li>
                <strong>Business Transfers:</strong> In the event of a merger,
                acquisition, or sale of assets, your information may be
                transferred
              </li>
              <li>
                <strong>Consent:</strong> We may share information with your
                explicit consent
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              Data Security
            </h2>
            <p className="mb-6 text-gray-700 leading-relaxed">
              We implement appropriate technical and organizational security
              measures to protect your personal information against unauthorized
              access, alteration, disclosure, or destruction. However, no method
              of transmission over the internet or electronic storage is 100%
              secure.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              Your Rights and Choices
            </h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>
                <strong>Access:</strong> Request access to your personal
                information
              </li>
              <li>
                <strong>Correction:</strong> Request correction of inaccurate
                information
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your personal
                information
              </li>
              <li>
                <strong>Opt-out:</strong> Unsubscribe from marketing
                communications
              </li>
              <li>
                <strong>Data Portability:</strong> Request a copy of your data
                in a portable format
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              Cookies and Tracking Technologies
            </h2>
            <p className="mb-6 text-gray-700 leading-relaxed">
              Our website uses cookies and similar tracking technologies to
              enhance your browsing experience, analyze website traffic, and
              understand user preferences. You can control cookie settings
              through your browser preferences.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              Third-Party Links
            </h2>
            <p className="mb-6 text-gray-700 leading-relaxed">
              Our website may contain links to third-party websites. We are not
              responsible for the privacy practices or content of these external
              sites. We encourage you to review the privacy policies of any
              third-party sites you visit.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              Children's Privacy
            </h2>
            <p className="mb-6 text-gray-700 leading-relaxed">
              Our website is not intended for children under 13 years of age. We
              do not knowingly collect personal information from children under
              13. If we become aware that we have collected such information, we
              will take steps to delete it promptly.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              Changes to This Privacy Policy
            </h2>
            <p className="mb-6 text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the "Last updated" date. Your continued use
              of our website after any changes constitutes acceptance of the
              updated policy.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              Contact Us
            </h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              If you have any questions about this Privacy Policy or our privacy
              practices, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-2">
                <strong>Haitian Family Relief Project</strong>
              </p>
              <p className="text-gray-700 mb-2">
                Email: contact@familyreliefproject7.org
              </p>
              <p className="text-gray-700 mb-2">Phone: (224) 217-0230</p>
              <p className="text-gray-700">
                Website:{" "}
                <Link
                  href="/contact"
                  className="text-red-600 hover:text-red-700"
                >
                  Contact Form
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

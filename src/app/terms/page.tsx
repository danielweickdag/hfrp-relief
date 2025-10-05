"use client";

import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
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
              Agreement to Terms
            </h2>
            <p className="mb-6 text-gray-700 leading-relaxed">
              By accessing and using the Haitian Family Relief Project website ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              Description of Service
            </h2>
            <p className="mb-6 text-gray-700 leading-relaxed">
              The Haitian Family Relief Project is a charitable organization dedicated to providing aid, support, and resources to Haitian families and orphans. Our website provides information about our mission, programs, and facilitates donations to support our cause.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              Use License
            </h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              Permission is granted to temporarily download one copy of the materials on the Haitian Family Relief Project website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on the website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              Donations and Financial Transactions
            </h2>
            <h3 className="text-xl font-medium text-gray-800 mb-3">
              Donation Policy
            </h3>
            <p className="mb-4 text-gray-700 leading-relaxed">
              All donations made through our website are voluntary contributions to support our charitable mission. By making a donation, you agree that:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Donations are non-refundable except as required by law</li>
              <li>You are authorized to use the payment method provided</li>
              <li>All information provided is accurate and complete</li>
              <li>Donations will be used to further our charitable mission</li>
              <li>You will receive a receipt for tax-deductible donations</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">
              Payment Processing
            </h3>
            <p className="mb-6 text-gray-700 leading-relaxed">
              We use third-party payment processors to handle financial transactions. By making a donation, you agree to the terms and conditions of our payment processors. We do not store your complete payment information on our servers.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3">
              Recurring Donations
            </h3>
            <p className="mb-6 text-gray-700 leading-relaxed">
              If you set up recurring donations, you authorize us to charge your payment method on the specified schedule until you cancel. You may cancel recurring donations at any time by contacting us or through your donor account.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              User Accounts and Registration
            </h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Safeguarding your account password</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
              <li>Maintaining accurate account information</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              Prohibited Uses
            </h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              You may not use our service:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
              <li>To upload or transmit viruses or any other type of malicious code</li>
              <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
              <li>For any obscene or immoral purpose</li>
              <li>To interfere with or circumvent the security features of the service</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              Content and Intellectual Property
            </h2>
            <p className="mb-6 text-gray-700 leading-relaxed">
              The content on this website, including but not limited to text, graphics, images, logos, and software, is the property of the Haitian Family Relief Project and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              User-Generated Content
            </h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              If you submit content to our website (such as comments, testimonials, or feedback), you grant us a non-exclusive, royalty-free, perpetual, and worldwide license to use, modify, and display such content. You represent that:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>You own or have the necessary rights to the content</li>
              <li>The content does not violate any third-party rights</li>
              <li>The content is not defamatory, obscene, or otherwise objectionable</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              Privacy Policy
            </h2>
            <p className="mb-6 text-gray-700 leading-relaxed">
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices. By using our service, you agree to the collection and use of information in accordance with our Privacy Policy.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              Disclaimers and Limitation of Liability
            </h2>
            <h3 className="text-xl font-medium text-gray-800 mb-3">
              Service Disclaimer
            </h3>
            <p className="mb-6 text-gray-700 leading-relaxed">
              The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, this organization excludes all representations, warranties, and conditions relating to our website and the use of this website.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3">
              Limitation of Liability
            </h3>
            <p className="mb-6 text-gray-700 leading-relaxed">
              In no event shall the Haitian Family Relief Project, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, punitive, consequential, or special damages arising out of or related to your use of the service.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              Indemnification
            </h2>
            <p className="mb-6 text-gray-700 leading-relaxed">
              You agree to defend, indemnify, and hold harmless the Haitian Family Relief Project and its affiliates from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including but not limited to attorney's fees).
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              Termination
            </h2>
            <p className="mb-6 text-gray-700 leading-relaxed">
              We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including but not limited to a breach of the Terms.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              Governing Law
            </h2>
            <p className="mb-6 text-gray-700 leading-relaxed">
              These Terms shall be interpreted and governed by the laws of the United States and the state in which our organization is registered, without regard to its conflict of law provisions.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              Changes to Terms
            </h2>
            <p className="mb-6 text-gray-700 leading-relaxed">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              Contact Information
            </h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-2">
                <strong>Haitian Family Relief Project</strong>
              </p>
              <p className="text-gray-700 mb-2">
                Email: haitianfamilyrelief@gmail.com
              </p>
              <p className="text-gray-700 mb-2">
                Phone: (224) 217-0230
              </p>
              <p className="text-gray-700">
                Website: <Link href="/contact" className="text-red-600 hover:text-red-700">Contact Form</Link>
              </p>
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> By using our website and services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
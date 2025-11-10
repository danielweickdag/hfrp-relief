"use client";

import ContactForm from "../_components/ContactForm";
import { BackToHome } from "../_components/BackNavigation";
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  GlobeAltIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-red-600 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center">
            <BackToHome className="mb-6 text-white hover:text-white/80" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-white/90">
              We'd love to hear from you! Whether you have questions about our
              programs, want to volunteer, or need assistance, our team is here
              to help.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all hover:shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <HeartIcon className="w-6 h-6 text-red-500 mr-2" />
                Send Us a Message
              </h2>
              <ContactForm />
            </div>
          </div>

          {/* Contact Information */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            {/* Main Contact Info */}
            <div className="bg-white rounded-xl shadow-lg p-8 h-fit transform transition-all hover:shadow-xl mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <GlobeAltIcon className="w-6 h-6 text-blue-600 mr-2" />
                Get in Touch
              </h2>

              <div className="space-y-6">
                {/* Email */}
                <div className="flex items-start">
                  <EnvelopeIcon className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <p>
                      <a
                        href="mailto:haitianfamilyrelief@gmail.com"
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        haitianfamilyrelief@gmail.com
                      </a>
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start">
                  <PhoneIcon className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                    <p className="text-gray-600">
                      <a
                        href="tel:+12242170230"
                        className="hover:text-blue-600 transition-colors"
                      >
                        (224) 217-0230
                      </a>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">United States</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all hover:shadow-xl">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Follow Our Impact
              </h2>
              <div className="flex space-x-4">
                <a
                  href="https://facebook.com/familyreliefproject"
                  className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors hover:scale-105 transform"
                  aria-label="Follow us on Facebook"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com/familyreliefproject"
                  className="bg-pink-600 text-white p-3 rounded-lg hover:bg-pink-700 transition-colors hover:scale-105 transform"
                  aria-label="Follow us on Instagram"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
                <a
                  href="https://twitter.com/familyreliefproject"
                  className="bg-blue-400 text-white p-3 rounded-lg hover:bg-blue-500 transition-colors hover:scale-105 transform"
                  aria-label="Follow us on Twitter"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all">
              <h3 className="text-xl font-bold text-blue-900 mb-4">
                How quickly will I receive a response?
              </h3>
              <p className="text-blue-800 mb-4">
                We typically respond to all inquiries within 24 hours during
                business days. For urgent matters, please call our emergency
                line.
              </p>
              <ul className="text-blue-700 space-y-2">
                <li className="flex items-start">
                  <div className="text-blue-500 mr-2">•</div>
                  <span>General inquiries: 1 business day</span>
                </li>
                <li className="flex items-start">
                  <div className="text-blue-500 mr-2">•</div>
                  <span>Volunteer applications: 2-3 business days</span>
                </li>
                <li className="flex items-start">
                  <div className="text-blue-500 mr-2">•</div>
                  <span>Media inquiries: Same day</span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all">
              <h3 className="text-xl font-bold text-blue-900 mb-4">
                Can I visit your offices in Haiti?
              </h3>
              <p className="text-blue-800 mb-4">
                We welcome visitors to our Haiti offices. Please schedule an
                appointment in advance to ensure someone is available to meet
                with you.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-900 font-medium">
                  Scheduled visits include:
                </p>
                <ul className="text-blue-700 mt-2 space-y-1">
                  <li className="flex items-start">
                    <div className="text-blue-500 mr-2">•</div>
                    <span>Program site tours</span>
                  </li>
                  <li className="flex items-start">
                    <div className="text-blue-500 mr-2">•</div>
                    <span>Volunteer orientation</span>
                  </li>
                  <li className="flex items-start">
                    <div className="text-blue-500 mr-2">•</div>
                    <span>Community events</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d120611.69014138602!2d-72.36840755!3d18.5872647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8eb9e7962a3cc091%3A0x7f03ec443b1052a7!2sPort-au-Prince%2C%20Haiti!5e0!3m2!1sen!2sus!4v1623956693377!5m2!1sen!2sus"
              className="w-full h-96 border-0"
              allowFullScreen
              loading="lazy"
              title="HFRP Office Location"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

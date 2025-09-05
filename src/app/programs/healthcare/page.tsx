"use client";

import Link from "next/link";
import PhotoGallery from "../../_components/PhotoGallery";

// Healthcare program photos with tags and categories
const healthcareImages = [
  {
    id: "4",
    src: "/gallery/IMG-20250413-WA0006.jpg",
    title: "Healthcare Support",
    description:
      "Medical assistance and health education for community members",
    category: "healthcare",
    tags: ["medical-care", "health-education", "community"],
    date: "April 2025",
  },
  {
    id: "21",
    src: "/gallery/healthcare-17.jpg",
    title: "Child Health Assessment",
    description: "Healthcare worker conducting health assessment on a child",
    category: "healthcare",
    tags: ["child-health", "assessment", "medical-care"],
    date: "June 2025",
  },
  {
    id: "22",
    src: "/gallery/healthcare-18.jpg",
    title: "Medical Team Collaboration",
    description: "Healthcare team working together on medical assessments",
    category: "healthcare",
    tags: ["team-care", "collaboration", "medical-assessment"],
    date: "December 2024",
  },
  {
    id: "23",
    src: "/gallery/healthcare-19.jpg",
    title: "Community Health Outreach",
    description: "Community member during health outreach program",
    category: "healthcare",
    tags: ["community-outreach", "health-access", "medical-care"],
    date: "December 2024",
  },
  {
    id: "24",
    src: "/gallery/healthcare-20.jpg",
    title: "Patient Examination",
    description: "Healthcare worker using stethoscope for patient examination",
    category: "healthcare",
    tags: ["examination", "stethoscope", "patient-care"],
    date: "December 2024",
  },
  {
    id: "25",
    src: "/gallery/healthcare-21.jpg",
    title: "Pediatric Blood Pressure Check",
    description: "Healthcare professional taking blood pressure of young boy",
    category: "healthcare",
    tags: ["pediatric", "blood-pressure", "child-health"],
    date: "December 2024",
  },
  {
    id: "26",
    src: "/gallery/healthcare-22.jpg",
    title: "Child Health Monitoring",
    description:
      "Healthcare worker monitoring child health with medical equipment",
    category: "healthcare",
    tags: ["child-health", "monitoring", "medical-equipment"],
    date: "December 2024",
  },
  {
    id: "27",
    src: "/gallery/healthcare-23.jpg",
    title: "Community Health Day",
    description: "Large gathering of families receiving healthcare services",
    category: "healthcare",
    tags: ["community-health", "health-day", "family-care"],
    date: "December 2024",
  },
  {
    id: "28",
    src: "/gallery/healthcare-24.jpg",
    title: "Youth Health Assessment",
    description: "Young person receiving health assessment and care",
    category: "healthcare",
    tags: ["youth-health", "assessment", "adolescent-care"],
    date: "December 2024",
  },
  {
    id: "29",
    src: "/gallery/healthcare-25.jpg",
    title: "Medical Care for Children",
    description: "Healthcare worker providing medical care to young children",
    category: "healthcare",
    tags: ["child-care", "medical-treatment", "pediatric"],
    date: "December 2024",
  },
  {
    id: "30",
    src: "/gallery/healthcare-26.jpg",
    title: "Healthcare Training Graduates",
    description: "Healthcare workers and trainees with completion certificates",
    category: "healthcare",
    tags: ["training", "certification", "healthcare-education"],
    date: "December 2024",
  },
  {
    id: "31",
    src: "/gallery/healthcare-27.jpg",
    title: "Child Medical Check-up",
    description:
      "Healthcare professional conducting thorough child examination",
    category: "healthcare",
    tags: ["child-exam", "medical-checkup", "pediatric-care"],
    date: "December 2024",
  },
  {
    id: "32",
    src: "/gallery/healthcare-28.jpg",
    title: "Community Health Education",
    description: "Community health education session in progress",
    category: "healthcare",
    tags: ["health-education", "community", "prevention"],
    date: "December 2024",
  },
];

export default function HealthcarePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link href="/impact" className="text-green-600 hover:text-green-700">
            ← Back to Our Impact
          </Link>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🏥</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Healthcare Program
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Making a transformative impact on impoverished communities through
            enhanced healthcare initiatives, accessibility, education, and
            empowerment.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">1,000+</div>
            <div className="text-gray-600">Patients Treated</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">50</div>
            <div className="text-gray-600">Mobile Clinic Visits</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">25</div>
            <div className="text-gray-600">Health Education Sessions</div>
          </div>
        </div>

        {/* Enhanced Photo Gallery */}
        <PhotoGallery
          images={healthcareImages}
          programType="healthcare"
          maxDisplay={12}
        />

        {/* Program Details */}
        <div className="space-y-8">
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Our Approach
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Our organization is committed to making a transformative impact on
              impoverished communities through enhanced healthcare initiatives.
              By focusing on accessibility, education, and empowerment, we aim
              to break down the barriers that prevent underserved individuals
              from accessing quality medical services.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-green-600 mb-3">
                  Mobile Clinics
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">
                      Regular medical camps and health screenings
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">
                      Essential check-ups and preventive care
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">
                      Partnerships with local healthcare professionals
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-green-600 mb-3">
                  Health Education
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">
                      Health awareness workshops
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">
                      Nutrition and hygiene education
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">
                      Disease prevention programs
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Impact Stories
            </h2>
            <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded">
              <p className="text-gray-700 italic mb-4">
                "The mobile clinic came to our village when my son was very
                sick. The doctors provided immediate care and taught us how to
                prevent similar health issues. Today, my son is healthy and
                strong."
              </p>
              <p className="text-green-600 font-semibold">
                — Claudette, Mother from Les Cayes
              </p>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Our Vision
            </h2>
            <p className="text-gray-700 mb-6">
              By fostering a holistic approach to healthcare within these
              communities, we aspire to create a brighter, healthier future for
              all, ultimately breaking the cycle of poverty and improving
              overall quality of life.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  $25
                </div>
                <div className="text-sm text-gray-600">
                  Provides basic medical care
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  $75
                </div>
                <div className="text-sm text-gray-600">
                  Supports a health education workshop
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  $150
                </div>
                <div className="text-sm text-gray-600">
                  Funds a mobile clinic visit
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg shadow-xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">
              Support Healthcare Access
            </h2>
            <p className="mb-6">
              Help us bring essential healthcare services to underserved
              communities in Haiti.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  window.location.href = "/donate";
                }}
                className="bg-white text-green-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition cursor-pointer"
              >
                Donate to Healthcare Program
              </button>
              <Link
                href="/gallery"
                className="bg-green-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-800 transition"
              >
                See Our Impact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

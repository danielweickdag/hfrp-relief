"use client";

import Link from "next/link";
import PhotoGallery from "../../_components/PhotoGallery";

// Education program photos with tags and categories
const educationImages = [
  {
    id: "ed1",
    src: "/gallery/education-01.jpg",
    title: "Community Education Gathering",
    description:
      "Large community gathering under pavilion with families and children participating in educational programs",
    category: "education",
    tags: [
      "community-gathering",
      "families",
      "children",
      "educational-programs",
    ],
    date: "June 2025",
  },
  {
    id: "ed2",
    src: "/gallery/education-02.jpg",
    title: "Educational Activities Under Pavilion",
    description:
      "Families and children gathered under covered pavilion for educational activities and learning sessions",
    category: "education",
    tags: [
      "pavilion",
      "educational-activities",
      "families",
      "learning-sessions",
    ],
    date: "June 2025",
  },
  {
    id: "ed3",
    src: "/gallery/education-03.jpg",
    title: "Children Learning Activities",
    description:
      "Two boys engaged in educational activities with learning materials by concrete structure",
    category: "education",
    tags: ["children", "learning-activities", "educational-materials", "boys"],
    date: "June 2025",
  },
  {
    id: "ed4",
    src: "/gallery/education-04.jpg",
    title: "Educational Event with Books",
    description:
      "Children and families attending educational event with books and learning materials visible",
    category: "education",
    tags: ["educational-event", "books", "children", "learning-materials"],
    date: "June 2025",
  },
  {
    id: "ed5",
    src: "/gallery/education-05.jpg",
    title: "School Supplies Organization",
    description:
      "Comprehensive collection of school supplies including notebooks, pencils, and educational materials ready for distribution",
    category: "education",
    tags: ["school-supplies", "notebooks", "pencils", "educational-materials"],
    date: "June 2025",
  },
  {
    id: "ed6",
    src: "/gallery/education-06.jpg",
    title: "HFRP Staff Educational Presentation",
    description:
      "HFRP staff members in uniform conducting formal educational presentation at community venue",
    category: "education",
    tags: ["hfrp-staff", "presentation", "uniform", "community-venue"],
    date: "June 2025",
  },
  {
    id: "ed7",
    src: "/gallery/education-07.jpg",
    title: "Educational Materials and Textbooks",
    description:
      "Extensive collection of textbooks, notebooks, and pencils organized for educational program distribution",
    category: "education",
    tags: ["textbooks", "notebooks", "pencils", "educational-materials"],
    date: "June 2025",
  },
  {
    id: "ed8",
    src: "/gallery/education-08.jpg",
    title: "HFRP Education Team Member",
    description:
      "HFRP team member wearing official yellow polo shirt with organization logo",
    category: "education",
    tags: ["hfrp-team", "polo-shirt", "organization-logo", "staff"],
    date: "June 2025",
  },
  {
    id: "ed9",
    src: "/gallery/education-09.jpg",
    title: "School Supply Distribution",
    description:
      "HFRP staff member in orange shirt distributing educational materials and books to families with children",
    category: "education",
    tags: ["supply-distribution", "educational-materials", "books", "families"],
    date: "June 2025",
  },
];

export default function EducationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link href="/impact" className="text-blue-600 hover:text-blue-700">
            ← Back to Our Impact
          </Link>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">📚</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Education Program
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Empowering communities through education programs, providing youth
            with the tools and resources they need to succeed in life.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">200+</div>
            <div className="text-gray-600">Children Supported</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">15</div>
            <div className="text-gray-600">Schools Assisted</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">8</div>
            <div className="text-gray-600">Education Programs</div>
          </div>
        </div>

        {/* Enhanced Photo Gallery with Slideshow and Social Sharing */}
        <PhotoGallery
          images={educationImages}
          programType="education"
          maxDisplay={8}
        />

        {/* Program Details */}
        <div className="space-y-8">
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Our Mission
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              At our non-profit, we believe that education is a right, not a
              privilege. That's why we're dedicated to fundraising and donating
              money to families in need so that their children can attend
              school. We strive to help every child have access to quality
              education regardless of their background or financial standing.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-3">
                  School Support
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">
                      School fees and tuition assistance
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">
                      School supplies and learning materials
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">
                      Uniform and transportation support
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-3">
                  Community Education
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">
                      Adult literacy programs
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">
                      Vocational training workshops
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">
                      Computer and technology literacy
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Our Vision
            </h2>
            <p className="text-gray-700 mb-6">
              Our ultimate goal is to build a school in each community we serve.
              Education is a privilege that not everyone has access to, but we
              believe in empowering communities across the globe through
              comprehensive education programs.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded">
              <p className="text-gray-700 italic mb-4">
                "Thanks to HFRP's education program, my daughter can now attend
                school. She dreams of becoming a teacher to help other children
                in our community. Education has given our family hope for a
                better future."
              </p>
              <p className="text-blue-600 font-semibold">
                — Jean-Baptiste, Father from Cap-Haïtien
              </p>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How You Can Help
            </h2>
            <p className="text-gray-700 mb-6">
              Your support directly impacts a child's ability to receive quality
              education. Every donation helps us provide school supplies, pay
              tuition fees, and create learning opportunities.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">$30</div>
                <div className="text-sm text-gray-600">
                  Provides school supplies for one child
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  $100
                </div>
                <div className="text-sm text-gray-600">
                  Covers school fees for one semester
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  $500
                </div>
                <div className="text-sm text-gray-600">
                  Supports a full year of education
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Invest in Education</h2>
            <p className="mb-6">
              Help us provide quality education opportunities for children in
              Haiti.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  window.location.href = "/donate";
                }}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition cursor-pointer"
              >
                Donate to Education Program
              </button>
              <Link
                href="/gallery"
                className="bg-blue-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-800 transition"
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

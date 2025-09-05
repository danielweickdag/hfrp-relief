"use client";

import Link from "next/link";
import PhotoGallery from "../../_components/PhotoGallery";

// Housing program photos with tags and categories
const housingImages = [
  {
    id: "17",
    src: "/gallery/IMG-20250413-WA0039.jpg",
    title: "Housing Support",
    description: "Assistance with housing and shelter needs for families",
    category: "housing",
    tags: ["housing-assistance", "shelter", "families"],
    date: "April 2025",
  },
];

const shelterStats = [
  {
    id: "individuals",
    number: "150+",
    label: "Individuals Housed",
    icon: "🏠",
  },
  {
    id: "families",
    number: "45",
    label: "Families Assisted",
    icon: "👨‍👩‍👧‍👦",
  },
  { id: "homes", number: "12", label: "Homes Built/Repaired", icon: "🔨" },
  { id: "shelters", number: "8", label: "Emergency Shelters", icon: "⛺" },
];

const programs = [
  {
    id: "emergency-shelter",
    title: "Emergency Shelter",
    description:
      "Immediate temporary housing for families displaced by natural disasters, evictions, or other emergencies, providing safety and basic necessities.",
    icon: "🚨",
    beneficiaries: "Families in crisis situations",
  },
  {
    id: "safe-housing",
    title: "Safe Housing for Children",
    description:
      "Secure, stable housing for orphaned and vulnerable children, providing them with a loving environment and basic needs.",
    icon: "👶",
    beneficiaries: "Orphaned and vulnerable children",
  },
  {
    id: "home-repair",
    title: "Home Repair & Improvement",
    description:
      "Structural repairs, roof fixes, and basic improvements to make existing homes safer and more livable for families.",
    icon: "🔧",
    beneficiaries: "Families with damaged homes",
  },
  {
    id: "disaster-response",
    title: "Disaster Response Housing",
    description:
      "Rapid deployment of temporary shelter solutions during hurricanes, earthquakes, and other natural disasters.",
    icon: "🌪️",
    beneficiaries: "Disaster-affected communities",
  },
  {
    id: "community-development",
    title: "Community Development",
    description:
      "Long-term neighborhood improvement projects including infrastructure, sanitation, and community building initiatives.",
    icon: "🏘️",
    beneficiaries: "Entire communities",
  },
  {
    id: "construction-training",
    title: "Construction Training",
    description:
      "Skills training programs teaching construction trades to provide employment opportunities while building community capacity.",
    icon: "👷",
    beneficiaries: "Young adults seeking employment",
  },
];

export default function ShelterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link
            href="/impact"
            className="text-purple-600 hover:text-purple-700"
          >
            ← Back to Our Impact
          </Link>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🏠</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Housing & Shelter Program
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Providing safe, secure housing solutions for vulnerable families and
            communities affected by disasters, poverty, and displacement in
            Haiti.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {shelterStats.map((stat) => (
            <div
              key={stat.id}
              className="bg-white rounded-lg shadow-lg p-6 text-center"
            >
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Enhanced Photo Gallery with Slideshow and Social Sharing */}
        <PhotoGallery
          images={housingImages}
          programType="housing"
          maxDisplay={8}
        />

        {/* Our Programs Section */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Our Housing Programs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <div
                key={program.id}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="text-4xl mb-4">{program.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {program.title}
                </h3>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {program.description}
                </p>
                <div className="bg-purple-100 rounded-lg p-3">
                  <p className="text-sm font-medium text-purple-800">
                    <span className="font-bold">Beneficiaries:</span>{" "}
                    {program.beneficiaries}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Impact Stories */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Impact Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-purple-50 border-l-4 border-purple-400 p-6 rounded">
              <p className="text-gray-700 italic mb-4">
                "After the hurricane destroyed our home, HFRP provided us with
                temporary shelter and then helped us rebuild. We now have a
                safe, strong home for our children."
              </p>
              <p className="text-purple-600 font-semibold">
                — Marie-Claire, Mother of 3
              </p>
            </div>
            <div className="bg-pink-50 border-l-4 border-pink-400 p-6 rounded">
              <p className="text-gray-700 italic mb-4">
                "The construction training program gave me skills to support my
                family. Now I help build homes for other families in need while
                earning a living."
              </p>
              <p className="text-pink-600 font-semibold">
                — Jean-Marc, Construction Trainee
              </p>
            </div>
          </div>
        </section>

        {/* How You Can Help */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            How You Can Help
          </h2>
          <p className="text-gray-700 mb-6">
            Your support directly provides safe housing and shelter for
            vulnerable families. Every donation helps us build homes, provide
            emergency shelter, and create sustainable housing solutions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                $100
              </div>
              <div className="text-sm text-gray-600">
                Provides emergency shelter for one family
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                $500
              </div>
              <div className="text-sm text-gray-600">
                Funds home repairs and improvements
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                $2,000
              </div>
              <div className="text-sm text-gray-600">
                Helps build a permanent home
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow-xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Build Hope, Build Homes</h2>
            <p className="mb-6">
              Help us provide safe, secure housing for families in need across
              Haiti.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  window.location.href = "/donate";
                }}
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition cursor-pointer"
              >
                Donate to Housing Program
              </button>
              <Link
                href="/gallery"
                className="bg-purple-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-800 transition"
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

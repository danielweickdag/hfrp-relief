"use client";

import Link from "next/link";
import PhotoGallery from "../../_components/PhotoGallery";

// Enhanced feeding program photos with tags and categories
const feedingImages = [
  {
    id: "1",
    src: "/gallery/IMG-20250413-WA0001.jpg",
    title: "Community Kitchen Food Preparation",
    description:
      "Local volunteers preparing nutritious meals for families in the community kitchen",
    category: "feeding",
    tags: ["community-kitchen", "food-prep", "volunteers"],
    date: "April 2025",
  },
  {
    id: "2",
    src: "/gallery/IMG-20250413-WA0004.jpg",
    title: "Fresh Food Distribution",
    description:
      "Distributing fresh vegetables and essential food items to families in need",
    category: "feeding",
    tags: ["distribution", "fresh-food", "vegetables"],
    date: "April 2025",
  },
  {
    id: "3",
    src: "/gallery/IMG-20250413-WA0005.jpg",
    title: "Family Meal Program",
    description:
      "Families receiving prepared meals through our feeding program",
    category: "feeding",
    tags: ["family-meals", "nutrition", "community"],
    date: "April 2025",
  },
  {
    id: "5",
    src: "/gallery/IMG-20250413-WA0009.jpg",
    title: "Community Gathering",
    description: "Community members coming together for support and assistance",
    category: "feeding",
    tags: ["community", "gathering", "support"],
    date: "April 2025",
  },
  {
    id: "6",
    src: "/gallery/IMG-20250413-WA0013.jpg",
    title: "Food Preparation Training",
    description:
      "Teaching proper food preparation techniques to community volunteers",
    category: "feeding",
    tags: ["training", "food-prep", "education"],
    date: "April 2025",
  },
  {
    id: "7",
    src: "/gallery/IMG-20250413-WA0014.jpg",
    title: "Daily Meal Service",
    description: "Regular meal service providing nutrition to families in need",
    category: "feeding",
    tags: ["daily-meals", "service", "nutrition"],
    date: "April 2025",
  },
  {
    id: "8",
    src: "/gallery/IMG-20250413-WA0019.jpg",
    title: "Children's Nutrition Program",
    description: "Special focus on ensuring children receive proper nutrition",
    category: "feeding",
    tags: ["children", "nutrition", "health"],
    date: "April 2025",
  },
  {
    id: "9",
    src: "/gallery/IMG-20250413-WA0022.jpg",
    title: "Community Support Network",
    description: "Building strong community connections through our programs",
    category: "feeding",
    tags: ["community", "support", "network"],
    date: "April 2025",
  },
  {
    id: "11",
    src: "/gallery/IMG-20250413-WA0031.jpg",
    title: "Kitchen Operations",
    description: "Daily operations in our community kitchen facility",
    category: "feeding",
    tags: ["kitchen", "operations", "daily"],
    date: "April 2025",
  },
  {
    id: "12",
    src: "/gallery/IMG-20250413-WA0032.jpg",
    title: "Food Distribution Center",
    description:
      "Organized distribution of food supplies to community families",
    category: "feeding",
    tags: ["distribution", "supplies", "organization"],
    date: "April 2025",
  },
  {
    id: "13",
    src: "/gallery/IMG-20250413-WA0033.jpg",
    title: "Community Volunteers",
    description:
      "Local volunteers helping with food preparation and distribution",
    category: "feeding",
    tags: ["volunteers", "local", "helpers"],
    date: "April 2025",
  },
  {
    id: "14",
    src: "/gallery/IMG-20250413-WA0034.jpg",
    title: "Meal Preparation",
    description: "Preparing wholesome meals for the community feeding program",
    category: "feeding",
    tags: ["meal-prep", "wholesome", "community"],
    date: "April 2025",
  },
  {
    id: "15",
    src: "/gallery/IMG-20250413-WA0036.jpg",
    title: "Family Support Services",
    description: "Comprehensive support services for families in need",
    category: "feeding",
    tags: ["family-support", "services", "comprehensive"],
    date: "April 2025",
  },
  {
    id: "16",
    src: "/gallery/IMG-20250413-WA0037.jpg",
    title: "Community Kitchen Supplies",
    description:
      "Essential supplies and equipment for community meal preparation",
    category: "feeding",
    tags: ["supplies", "equipment", "kitchen"],
    date: "April 2025",
  },
  {
    id: "18",
    src: "/gallery/IMG-20250413-WA0040.jpg",
    title: "Food Security Program",
    description:
      "Ensuring consistent access to nutritious food for all families",
    category: "feeding",
    tags: ["food-security", "access", "nutrition"],
    date: "April 2025",
  },
  {
    id: "19",
    src: "/gallery/IMG-20250413-WA0041.jpg",
    title: "Community Outreach",
    description: "Reaching out to families in the community to provide support",
    category: "feeding",
    tags: ["outreach", "families", "support"],
    date: "April 2025",
  },
  {
    id: "20",
    src: "/gallery/IMG-20250413-WA0043.jpg",
    title: "Daily Operations",
    description: "Day-to-day operations of our community support programs",
    category: "feeding",
    tags: ["daily", "operations", "programs"],
    date: "April 2025",
  },
];

export default function FeedingProgramPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link
            href="/impact"
            className="text-orange-600 hover:text-orange-700"
          >
            ← Back to Our Impact
          </Link>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🍽️</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Feeding Program
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Combating hunger and malnutrition through nutritious meals,
            community kitchens, and sustainable food programs across Haiti.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">850+</div>
            <div className="text-gray-600">Daily Meals Served</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              25,000+
            </div>
            <div className="text-gray-600">Total Meals This Year</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">15</div>
            <div className="text-gray-600">Community Kitchens</div>
          </div>
        </div>

        {/* Enhanced Photo Gallery with Slideshow and Social Sharing */}
        <PhotoGallery
          images={feedingImages}
          programType="feeding"
          maxDisplay={8}
        />

        {/* Program Details */}
        <div className="space-y-8">
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Our Approach
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Our feeding program goes beyond simply providing meals. We focus
              on nutrition education, community empowerment, and sustainable
              food systems that help families become self-sufficient while
              ensuring no child goes hungry.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-orange-600 mb-3">
                  Daily Services
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">
                      Hot, nutritious meals for children and families
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">
                      Traditional Haitian cuisine with balanced nutrition
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">
                      Special dietary accommodations for medical needs
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-orange-600 mb-3">
                  Community Programs
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">
                      Cooking classes and nutrition education
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">
                      Community garden development
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">
                      Emergency food distribution during crises
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
            <div className="bg-orange-50 border-l-4 border-orange-400 p-6 rounded">
              <p className="text-gray-700 italic mb-4">
                "Before HFRP's feeding program, my children often went to bed
                hungry. Now they have nutritious meals every day, and I've
                learned how to prepare healthy food for my family. My youngest
                daughter has grown so much stronger."
              </p>
              <p className="text-orange-600 font-semibold">
                — Marie, Mother of 4 from Port-au-Prince
              </p>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How You Can Help
            </h2>
            <p className="text-gray-700 mb-6">
              Your support directly feeds hungry families in Haiti. Every
              donation helps us provide more meals, expand our community
              kitchens, and teach sustainable nutrition practices.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  $0.50
                </div>
                <div className="text-sm text-gray-600">
                  Provides one nutritious meal
                </div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  $15
                </div>
                <div className="text-sm text-gray-600">
                  Feeds a child for one month
                </div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  $50
                </div>
                <div className="text-sm text-gray-600">
                  Supports a family of 4 for one month
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg shadow-xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">
              Help Us Feed More Families
            </h2>
            <p className="mb-6">
              Join our mission to end hunger in Haiti, one meal at a time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  window.location.href = "/donate";
                }}
                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition cursor-pointer"
              >
                Donate to Feeding Program
              </button>
              <Link
                href="/gallery"
                className="bg-orange-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-800 transition"
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

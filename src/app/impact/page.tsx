"use client";

import { useState } from "react";
import Link from "next/link";

interface Program {
  id: string;
  title: string;
  icon: string;
  description: string;
  impact: {
    stat: string;
    description: string;
  };
  details: string[];
  color: string;
  bgColor: string;
}

const programs: Program[] = [
  {
    id: "feeding",
    title: "Feeding Program",
    icon: "🍽️",
    description:
      "Providing nutritious meals to combat hunger and malnutrition among Haitian families and children.",
    impact: {
      stat: "850+",
      description: "Meals served daily",
    },
    details: [
      "Daily hot meals for children and families",
      "Nutritional education and meal planning",
      "Community kitchens and food preparation training",
      "Emergency food distribution during crises",
      "Traditional Haitian cuisine with modern nutrition standards",
    ],
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  {
    id: "healthcare",
    title: "Healthcare Services",
    icon: "🏥",
    description:
      "Essential medical care, health screenings, and preventive healthcare for underserved communities.",
    impact: {
      stat: "300+",
      description: "Patients treated monthly",
    },
    details: [
      "Mobile medical clinics in remote areas",
      "Pediatric care and child health screenings",
      "Maternal health and prenatal care",
      "Vaccination programs and disease prevention",
      "Health education and community wellness programs",
    ],
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    id: "education",
    title: "Education Support",
    icon: "📚",
    description:
      "Educational opportunities, school supplies, and learning programs to empower children through knowledge.",
    impact: {
      stat: "200+",
      description: "Children receiving educational support",
    },
    details: [
      "School supplies and educational materials distribution",
      "After-school tutoring and homework assistance",
      "Literacy programs for children and adults",
      "Vocational training and skill development",
      "Scholarship programs for higher education",
    ],
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    id: "shelter",
    title: "Safe Housing",
    icon: "🏠",
    description:
      "Secure shelter and housing assistance for families in need of safe, stable living conditions.",
    impact: {
      stat: "150+",
      description: "Individuals housed safely",
    },
    details: [
      "Emergency shelter for displaced families",
      "Safe housing for orphaned children",
      "Housing repair and improvement projects",
      "Temporary shelter during natural disasters",
      "Community building and neighborhood development",
    ],
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
];

export default function ImpactPage() {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const totalImpact = {
    mealsServed: "25,000+",
    patientsHelped: "3,600+",
    childrenEducated: "1,200+",
    familiesHoused: "450+",
    volunteersActive: "25+",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our Impact in Haiti
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Through our comprehensive programs, we're transforming lives and
            building hope in Haitian communities. See how your support creates
            lasting change.
          </p>
        </div>

        {/* Overall Impact Statistics */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            By the Numbers
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {totalImpact.mealsServed}
              </div>
              <div className="text-gray-600 text-sm">Meals Served</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {totalImpact.patientsHelped}
              </div>
              <div className="text-gray-600 text-sm">Patients Helped</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {totalImpact.childrenEducated}
              </div>
              <div className="text-gray-600 text-sm">Children Educated</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {totalImpact.familiesHoused}
              </div>
              <div className="text-gray-600 text-sm">Families Housed</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {totalImpact.volunteersActive}
              </div>
              <div className="text-gray-600 text-sm">Active Volunteers</div>
            </div>
          </div>
        </div>

        {/* Programs Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Our Programs Making a Difference
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {programs.map((program) => (
              <div
                key={program.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer"
                onClick={() => setSelectedProgram(program)}
              >
                <div className={`${program.bgColor} p-6`}>
                  <div className="flex items-center mb-4">
                    <span className="text-4xl mr-4">{program.icon}</span>
                    <div>
                      <h3 className={`text-2xl font-bold ${program.color}`}>
                        {program.title}
                      </h3>
                      <div className="flex items-center mt-2">
                        <span
                          className={`text-3xl font-bold ${program.color} mr-2`}
                        >
                          {program.impact.stat}
                        </span>
                        <span className="text-gray-600 text-sm">
                          {program.impact.description}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {program.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    {program.details.slice(0, 3).map((detail) => (
                      <div key={detail} className="flex items-start">
                        <span className="text-green-500 mr-2 mt-1">✓</span>
                        <span className="text-gray-600 text-sm">{detail}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProgram(program);
                      }}
                      className={`px-4 py-2 ${program.color} hover:underline font-medium`}
                    >
                      Learn More →
                    </button>
                    <Link
                      href={`/programs/${program.id}`}
                      className={`px-4 py-2 bg-gray-100 ${program.color} rounded-lg hover:bg-gray-200 transition font-medium`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Visit Program Page
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Join Us in Making a Difference
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Your support helps us expand these vital programs and reach even
            more families in need.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                window.location.href = "/donate";
              }}
              className="bg-white text-red-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all transform hover:scale-105 cursor-pointer"
            >
              Donate Now
            </button>
            <Link
              href="/membership"
              className="bg-red-800 text-white px-8 py-4 rounded-lg font-bold hover:bg-red-900 transition-all transform hover:scale-105"
            >
              Become a Member
            </Link>
          </div>
        </div>

        {/* Program Detail Modal */}
        {selectedProgram && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedProgram(null)}
          >
            <div
              className="bg-white rounded-xl max-w-2xl max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`${selectedProgram.bgColor} p-6`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-5xl mr-4">
                      {selectedProgram.icon}
                    </span>
                    <div>
                      <h2
                        className={`text-3xl font-bold ${selectedProgram.color}`}
                      >
                        {selectedProgram.title}
                      </h2>
                      <div className="flex items-center mt-2">
                        <span
                          className={`text-4xl font-bold ${selectedProgram.color} mr-3`}
                        >
                          {selectedProgram.impact.stat}
                        </span>
                        <span className="text-gray-700">
                          {selectedProgram.impact.description}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedProgram(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                  {selectedProgram.description}
                </p>

                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  What We Provide:
                </h3>
                <div className="space-y-3 mb-6">
                  {selectedProgram.details.map((detail) => (
                    <div key={detail} className="flex items-start">
                      <span className="text-green-500 mr-3 mt-1 text-lg">
                        ✓
                      </span>
                      <span className="text-gray-700">{detail}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center">
                  <Link
                    href={`/programs/${selectedProgram.id}`}
                    className={`px-6 py-3 bg-gradient-to-r ${selectedProgram.color.replace("text-", "from-")} to-gray-600 text-white rounded-lg font-bold hover:shadow-lg transition-all transform hover:scale-105`}
                  >
                    Visit {selectedProgram.title} Page
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

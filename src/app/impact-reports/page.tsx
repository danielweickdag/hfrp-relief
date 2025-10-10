"use client";

import Link from "next/link";
import PrintSectionButton from "../../components/ui/PrintSectionButton";

const reports = [
  {
    id: "april-2024-summary",
    title: "April 2024 Program Summary",
    description:
      "Comprehensive overview of all program activities including feeding, healthcare, education, and housing initiatives.",
    date: "2024-04-30",
    type: "Monthly Report",
    pages: 24,
    photos: 18,
    beneficiaries: "500+",
    downloadUrl: "/reports/HFRP-April-2024-Summary.pdf",
  },
  {
    id: "feeding-program-impact",
    title: "Feeding Program Impact Report",
    description:
      "Detailed analysis of our feeding programs showing meal distribution, nutrition impact, and community outcomes.",
    date: "2024-04-15",
    type: "Program Report",
    pages: 16,
    photos: 11,
    beneficiaries: "350+",
    downloadUrl: "/reports/HFRP-Feeding-Impact.pdf",
  },
  {
    id: "healthcare-outreach",
    title: "Healthcare Outreach Documentation",
    description:
      "Mobile clinic activities, health screenings, and medical care provided to community members.",
    date: "2024-04-20",
    type: "Program Report",
    pages: 12,
    photos: 8,
    beneficiaries: "125+",
    downloadUrl: "/reports/HFRP-Healthcare-Outreach.pdf",
  },
  {
    id: "education-initiatives",
    title: "Education & Community Programs",
    description:
      "School supply distribution, educational support, and community development activities.",
    date: "2024-04-25",
    type: "Program Report",
    pages: 10,
    photos: 6,
    beneficiaries: "200+",
    downloadUrl: "/reports/HFRP-Education-Programs.pdf",
  },
];

const financialData = [
  {
    category: "Feeding Programs",
    percentage: 45,
    amount: "$12,500",
    color: "bg-orange-500",
  },
  {
    category: "Healthcare Services",
    percentage: 25,
    amount: "$6,950",
    color: "bg-green-500",
  },
  {
    category: "Education Support",
    percentage: 20,
    amount: "$5,560",
    color: "bg-blue-500",
  },
  {
    category: "Housing & Infrastructure",
    percentage: 10,
    amount: "$2,780",
    color: "bg-purple-500",
  },
];

export default function ImpactReportsPage() {
  const handleDownload = (reportId: string, title: string) => {
    // In production, this would trigger actual file download
    alert(
      `Downloading: ${title}\n\nNote: This is a demo. In production, this would download the actual PDF report with photos and detailed documentation.`,
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            href="/gallery"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Gallery Overview
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📊 Impact Reports & Documentation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Download detailed reports with photo documentation showing exactly
            how your donations create positive change in Haitian communities.
            All reports include financial transparency and program outcomes.
          </p>
        </div>

        {/* Financial Overview */}
        <div
          className="bg-white rounded-xl shadow-lg p-8 mb-12"
          data-printable
          data-print-title="April 2024 Financial Overview"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            💰 April 2024 Financial Transparency
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Fund Distribution
              </h3>
              {financialData.map((item) => (
                <div key={item.category} className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {item.category}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {item.amount}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${item.color} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.percentage}% of total funds
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                Total Impact
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-blue-800">Total Funds Deployed:</span>
                  <span className="font-bold text-blue-900">$27,790</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-800">Families Served:</span>
                  <span className="font-bold text-blue-900">125+ families</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-800">Total Beneficiaries:</span>
                  <span className="font-bold text-blue-900">
                    500+ individuals
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-800">Meals Provided:</span>
                  <span className="font-bold text-blue-900">2,500+ meals</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-800">Admin Costs:</span>
                  <span className="font-bold text-green-600">&lt; 5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {reports.map((report) => (
            <div
              key={report.id}
              id={`report-card-${report.id}`}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 leading-tight">
                    {report.title}
                  </h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ml-2">
                    {report.type}
                  </span>
                </div>

                <p className="text-gray-600 mb-4 leading-relaxed">
                  {report.description}
                </p>

                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div className="text-center bg-gray-50 rounded-lg p-3">
                    <div className="font-bold text-gray-900">
                      {report.pages}
                    </div>
                    <div className="text-gray-500">Pages</div>
                  </div>
                  <div className="text-center bg-gray-50 rounded-lg p-3">
                    <div className="font-bold text-gray-900">
                      {report.photos}
                    </div>
                    <div className="text-gray-500">Photos</div>
                  </div>
                  <div className="text-center bg-gray-50 rounded-lg p-3">
                    <div className="font-bold text-gray-900">
                      {report.beneficiaries}
                    </div>
                    <div className="text-gray-500">Served</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center text-gray-500 text-sm">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {new Date(report.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleDownload(report.id, report.title)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Download PDF
                    </button>
                    <PrintSectionButton
                      targetId={`report-card-${report.id}`}
                      label="Print"
                      title={report.title}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-green-50 rounded-xl p-6 border-l-4 border-green-600">
            <h3 className="text-xl font-bold text-green-900 mb-3">
              🎯 What's in Each Report
            </h3>
            <ul className="text-green-800 space-y-2 text-sm">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                Detailed program outcomes and beneficiary data
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                High-quality photos with full context and descriptions
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                Financial transparency and fund allocation breakdowns
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                Community feedback and testimonials
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                Geographic impact mapping and demographics
              </li>
            </ul>
          </div>

          <div className="bg-yellow-50 rounded-xl p-6 border-l-4 border-yellow-600">
            <h3 className="text-xl font-bold text-yellow-900 mb-3">
              📧 Get Regular Updates
            </h3>
            <p className="text-yellow-800 text-sm mb-4">
              Subscribe to receive monthly impact reports directly in your
              inbox. Stay connected with the families you're helping.
            </p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full px-3 py-2 border border-yellow-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <button className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium">
                Subscribe to Updates
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <div className="bg-blue-100 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-2">
              📞 Questions About Our Reports?
            </h3>
            <p className="text-blue-800 text-sm mb-4">
              We're committed to complete transparency. If you have any
              questions about our programs, finances, or impact documentation,
              please reach out.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Contact Us
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";

interface GalleryImage {
  id: string;
  src: string;
  title: string;
  description: string;
  category: "feeding" | "healthcare" | "education" | "housing";
  date?: string;
}

const galleryImages: GalleryImage[] = [
  // Original April 2025 Photos (IDs 1-9)
  {
    id: "1",
    src: "/gallery/IMG-20250413-WA0001.jpg",
    title: "Community Kitchen Food Preparation",
    description:
      "Local volunteers preparing nutritious meals for families in the community kitchen",
    category: "feeding",
    date: "April 2025",
  },
  {
    id: "2",
    src: "/gallery/IMG-20250413-WA0004.jpg",
    title: "Fresh Food Distribution",
    description:
      "Distributing fresh vegetables and essential food items to families in need",
    category: "feeding",
    date: "April 2025",
  },
  {
    id: "3",
    src: "/gallery/IMG-20250413-WA0005.jpg",
    title: "Family Meal Program",
    description:
      "Families receiving prepared meals through our feeding program",
    category: "feeding",
    date: "April 2025",
  },
  {
    id: "4",
    src: "/gallery/IMG-20250413-WA0006.jpg",
    title: "Healthcare Support",
    description:
      "Medical assistance and health education for community members",
    category: "healthcare",
    date: "April 2025",
  },
  {
    id: "5",
    src: "/gallery/IMG-20250413-WA0009.jpg",
    title: "Community Gathering",
    description: "Community members coming together for support and assistance",
    category: "feeding",
    date: "April 2025",
  },
  {
    id: "6",
    src: "/gallery/IMG-20250413-WA0013.jpg",
    title: "Food Preparation Training",
    description:
      "Teaching proper food preparation techniques to community volunteers",
    category: "feeding",
    date: "April 2025",
  },
  {
    id: "7",
    src: "/gallery/IMG-20250413-WA0014.jpg",
    title: "Daily Meal Service",
    description: "Regular meal service providing nutrition to families in need",
    category: "feeding",
    date: "April 2025",
  },
  {
    id: "8",
    src: "/gallery/IMG-20250413-WA0019.jpg",
    title: "Children's Nutrition Program",
    description: "Special focus on ensuring children receive proper nutrition",
    category: "feeding",
    date: "April 2025",
  },
  {
    id: "9",
    src: "/gallery/IMG-20250413-WA0022.jpg",
    title: "Community Support Network",
    description: "Building strong community connections through our programs",
    category: "feeding",
    date: "April 2025",
  },

  // New Education Photos (IDs 10-18)
  {
    id: "10",
    src: "/gallery/education-01.jpg",
    title: "Community Education Gathering",
    description:
      "Large community gathering under pavilion with families and children participating in educational programs",
    category: "education",
    date: "June 2025",
  },
  {
    id: "11",
    src: "/gallery/education-02.jpg",
    title: "Educational Activities Under Pavilion",
    description:
      "Families and children gathered under covered pavilion for educational activities and learning sessions",
    category: "education",
    date: "June 2025",
  },
  {
    id: "12",
    src: "/gallery/education-03.jpg",
    title: "Children Learning Activities",
    description:
      "Two boys engaged in educational activities with learning materials by concrete structure",
    category: "education",
    date: "June 2025",
  },
  {
    id: "13",
    src: "/gallery/education-04.jpg",
    title: "Educational Event with Books",
    description:
      "Children and families attending educational event with books and learning materials visible",
    category: "education",
    date: "June 2025",
  },
  {
    id: "14",
    src: "/gallery/education-05.jpg",
    title: "School Supplies Organization",
    description:
      "Comprehensive collection of school supplies including notebooks, pencils, and educational materials ready for distribution",
    category: "education",
    date: "June 2025",
  },
  {
    id: "15",
    src: "/gallery/education-06.jpg",
    title: "HFRP Staff Educational Presentation",
    description:
      "HFRP staff members in uniform conducting formal educational presentation at community venue",
    category: "education",
    date: "June 2025",
  },
  {
    id: "16",
    src: "/gallery/education-07.jpg",
    title: "Educational Materials and Textbooks",
    description:
      "Extensive collection of textbooks, notebooks, and pencils organized for educational program distribution",
    category: "education",
    date: "June 2025",
  },
  {
    id: "17",
    src: "/gallery/education-08.jpg",
    title: "HFRP Education Team Member",
    description:
      "HFRP team member wearing official yellow polo shirt with organization logo",
    category: "education",
    date: "June 2025",
  },
  {
    id: "18",
    src: "/gallery/education-09.jpg",
    title: "School Supply Distribution",
    description:
      "HFRP staff member in orange shirt distributing educational materials and books to families with children",
    category: "education",
    date: "June 2025",
  },

  // Remaining feeding and housing photos (IDs 19-28)
  {
    id: "19",
    src: "/gallery/IMG-20250413-WA0031.jpg",
    title: "Kitchen Operations",
    description: "Daily operations in our community kitchen facility",
    category: "feeding",
    date: "April 2025",
  },
  {
    id: "20",
    src: "/gallery/IMG-20250413-WA0032.jpg",
    title: "Food Distribution Center",
    description:
      "Organized distribution of food supplies to community families",
    category: "feeding",
    date: "April 2025",
  },
  {
    id: "21",
    src: "/gallery/IMG-20250413-WA0033.jpg",
    title: "Community Volunteers",
    description:
      "Local volunteers helping with food preparation and distribution",
    category: "feeding",
    date: "April 2025",
  },
  {
    id: "22",
    src: "/gallery/IMG-20250413-WA0034.jpg",
    title: "Meal Preparation",
    description: "Preparing wholesome meals for the community feeding program",
    category: "feeding",
    date: "April 2025",
  },
  {
    id: "23",
    src: "/gallery/IMG-20250413-WA0036.jpg",
    title: "Family Support Services",
    description: "Comprehensive support services for families in need",
    category: "feeding",
    date: "April 2025",
  },
  {
    id: "24",
    src: "/gallery/IMG-20250413-WA0037.jpg",
    title: "Community Kitchen Supplies",
    description:
      "Essential supplies and equipment for community meal preparation",
    category: "feeding",
    date: "April 2025",
  },
  {
    id: "25",
    src: "/gallery/IMG-20250413-WA0039.jpg",
    title: "Housing Support",
    description: "Assistance with housing and shelter needs for families",
    category: "housing",
    date: "April 2025",
  },
  {
    id: "26",
    src: "/gallery/IMG-20250413-WA0040.jpg",
    title: "Food Security Program",
    description:
      "Ensuring consistent access to nutritious food for all families",
    category: "feeding",
    date: "April 2025",
  },
  {
    id: "27",
    src: "/gallery/IMG-20250413-WA0041.jpg",
    title: "Community Outreach",
    description: "Reaching out to families in the community to provide support",
    category: "feeding",
    date: "April 2025",
  },
  {
    id: "28",
    src: "/gallery/IMG-20250413-WA0043.jpg",
    title: "Daily Operations",
    description: "Day-to-day operations of our community support programs",
    category: "feeding",
    date: "April 2025",
  },

  // Healthcare Photos (IDs 29-59)
  {
    id: "29",
    src: "/gallery/healthcare-17.jpg",
    title: "Child Health Assessment",
    description: "Healthcare worker conducting health assessment on a child",
    category: "healthcare",
    date: "June 2025",
  },
  {
    id: "30",
    src: "/gallery/healthcare-18.jpg",
    title: "Medical Team Collaboration",
    description: "Healthcare team working together on medical assessments",
    category: "healthcare",
    date: "December 2024",
  },
  {
    id: "31",
    src: "/gallery/healthcare-19.jpg",
    title: "Community Health Outreach",
    description: "Community member during health outreach program",
    category: "healthcare",
    date: "December 2024",
  },
  {
    id: "32",
    src: "/gallery/healthcare-20.jpg",
    title: "Patient Examination",
    description: "Healthcare worker using stethoscope for patient examination",
    category: "healthcare",
    date: "December 2024",
  },
  {
    id: "33",
    src: "/gallery/healthcare-21.jpg",
    title: "Pediatric Blood Pressure Check",
    description: "Healthcare professional taking blood pressure of young boy",
    category: "healthcare",
    date: "December 2024",
  },
  {
    id: "34",
    src: "/gallery/healthcare-22.jpg",
    title: "Child Health Monitoring",
    description:
      "Healthcare worker monitoring child health with medical equipment",
    category: "healthcare",
    date: "December 2024",
  },
  {
    id: "35",
    src: "/gallery/healthcare-23.jpg",
    title: "Community Health Day",
    description: "Large gathering of families receiving healthcare services",
    category: "healthcare",
    date: "December 2024",
  },
  {
    id: "36",
    src: "/gallery/healthcare-24.jpg",
    title: "Youth Health Assessment",
    description: "Young person receiving health assessment and care",
    category: "healthcare",
    date: "December 2024",
  },
  {
    id: "37",
    src: "/gallery/healthcare-25.jpg",
    title: "Medical Care for Children",
    description: "Healthcare worker providing medical care to young children",
    category: "healthcare",
    date: "December 2024",
  },
  {
    id: "38",
    src: "/gallery/healthcare-26.jpg",
    title: "Healthcare Training Graduates",
    description: "Healthcare workers and trainees with completion certificates",
    category: "healthcare",
    date: "December 2024",
  },
  {
    id: "39",
    src: "/gallery/healthcare-27.jpg",
    title: "Child Medical Check-up",
    description:
      "Healthcare professional conducting thorough child examination",
    category: "healthcare",
    date: "December 2024",
  },
  {
    id: "40",
    src: "/gallery/healthcare-28.jpg",
    title: "Community Health Education",
    description: "Community health education session in progress",
    category: "healthcare",
    date: "December 2024",
  },
  {
    id: "41",
    src: "/gallery/healthcare-29.jpg",
    title: "Healthcare Access",
    description: "Community members receiving essential healthcare services",
    category: "healthcare",
    date: "December 2024",
  },
  {
    id: "42",
    src: "/gallery/healthcare-30.jpg",
    title: "Child Blood Test",
    description: "Healthcare worker performing blood test on young child",
    category: "healthcare",
    date: "December 2024",
  },
  {
    id: "43",
    src: "/gallery/healthcare-31.jpg",
    title: "Medical Documentation",
    description: "Healthcare professionals reviewing patient documentation",
    category: "healthcare",
    date: "December 2024",
  },
  {
    id: "44",
    src: "/gallery/healthcare-32.jpg",
    title: "Wound Treatment",
    description: "Healthcare professional providing wound care and treatment",
    category: "healthcare",
    date: "December 2024",
  },
  {
    id: "45",
    src: "/gallery/healthcare-33.jpg",
    title: "Youth Medical Consultation",
    description:
      "Young person receiving medical consultation at healthcare facility",
    category: "healthcare",
    date: "December 2024",
  },
  {
    id: "46",
    src: "/gallery/healthcare-34.jpg",
    title: "Medical Team Assessment",
    description:
      "Healthcare team conducting medical assessments and documentation",
    category: "healthcare",
    date: "December 2024",
  },
  {
    id: "47",
    src: "/gallery/healthcare-35.jpg",
    title: "Community Health Support",
    description: "Community member receiving health support and care",
    category: "healthcare",
    date: "December 2024",
  },
  {
    id: "48",
    src: "/gallery/healthcare-36.jpg",
    title: "Patient Examination with Stethoscope",
    description:
      "Healthcare worker using stethoscope for thorough patient examination",
    category: "healthcare",
    date: "December 2024",
  },
  {
    id: "49",
    src: "/gallery/healthcare-37.jpg",
    title: "Pediatric Blood Pressure Monitoring",
    description:
      "Healthcare professional monitoring blood pressure in young patient",
    category: "healthcare",
    date: "December 2024",
  },
  {
    id: "50",
    src: "/gallery/healthcare-38.jpg",
    title: "Healthcare Team Collaboration",
    description:
      "Medical professionals working together on patient assessments",
    category: "healthcare",
    date: "December 2024",
  },
  {
    id: "51",
    src: "/gallery/healthcare-39.jpg",
    title: "Healthcare Training Certification",
    description:
      "Healthcare workers and trainees displaying completion certificates",
    category: "healthcare",
    date: "December 2024",
  },
  {
    id: "52",
    src: "/gallery/healthcare-40.jpg",
    title: "Child Health Assessment",
    description:
      "Healthcare professional conducting comprehensive child health assessment",
    category: "healthcare",
    date: "December 2024",
  },
  {
    id: "53",
    src: "/gallery/healthcare-41.jpg",
    title: "Community Health Day",
    description:
      "Large community gathering for healthcare services and education",
    category: "healthcare",
    date: "December 2024",
  },
  {
    id: "54",
    src: "/gallery/healthcare-42.jpg",
    title: "Youth Healthcare Services",
    description: "Young person receiving healthcare services and medical care",
    category: "healthcare",
    date: "December 2024",
  },
  {
    id: "55",
    src: "/gallery/healthcare-43.jpg",
    title: "Wound Care and Bandaging",
    description:
      "Healthcare professional providing wound care and proper bandaging",
    category: "healthcare",
    date: "December 2024",
  },
  {
    id: "56",
    src: "/gallery/healthcare-44.jpg",
    title: "Community Health Education",
    description: "Healthcare education session with community members",
    category: "healthcare",
    date: "December 2024",
  },
  {
    id: "57",
    src: "/gallery/healthcare-45.jpg",
    title: "Healthcare Services Access",
    description: "Community members receiving essential healthcare services",
    category: "healthcare",
    date: "December 2024",
  },
  {
    id: "58",
    src: "/gallery/healthcare-46.jpg",
    title: "Child Medical Testing",
    description: "Healthcare worker performing medical tests on young child",
    category: "healthcare",
    date: "December 2024",
  },
  {
    id: "59",
    src: "/gallery/healthcare-47.jpg",
    title: "Medical Documentation Review",
    description:
      "Healthcare professionals reviewing and updating medical documentation",
    category: "healthcare",
    date: "December 2024",
  },
];

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Photo Album</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our work in Haiti documented through authentic photos.
          </p>
          <div className="mt-4">
            <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              📸 {galleryImages.length} Photos
            </span>
          </div>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-20">
          {galleryImages.map((image) => (
            <div
              key={image.id}
              className="group cursor-pointer bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
              onClick={() => setSelectedImage(image)}
              title="Click to view full size"
            >
              <div className="aspect-square relative overflow-hidden">
                <Image
                  src={image.src}
                  alt={image.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  quality={95}
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTAwQzE3Mi4zODYgMTAwIDE1MCA3Ny42MTQyIDE1MCA1MFMxNzIuMzg2IDAgMjAwIDBTMjUwIDIyLjM4NTggMjUwIDUwUzIyNy42MTQgMTAwIDIwMCAxMDBaTTIwMCAyNTBDMTcyLjM4NiAyNTAgMTUwIDIyNy42MTQgMTUwIDIwMFMxNzIuMzg2IDE1MCAyMDAgMTUwUzI1MCAxNzIuMzg2IDI1MCAyMDBTMjI3LjYxNCAyNTAgMjAwIDI1MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEwMCAzMDBIMzAwVjM1MEgxMDBWMzAwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white bg-opacity-30 rounded-full p-2 backdrop-blur-sm">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for full-screen image view */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
            <div className="max-w-4xl max-h-full bg-white rounded-lg overflow-hidden">
              <div className="relative">
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                  title="Close"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <Image
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  width={1920}
                  height={1080}
                  className="w-full h-auto max-h-[80vh] object-contain"
                  quality={100}
                  sizes="100vw"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTAwQzE3Mi4zODYgMTAwIDE1MCA3Ny42MTQyIDE1MCA1MFMxNzIuMzg2IDAgMjAwIDBTMjUwIDIyLjM4NTggMjUwIDUwUzIyNy42MTQgMTAwIDIwMCAxMDBaTTIwMCAyNTBDMTcyLjM4NiAyNTAgMTUwIDIyNy42MTQgMTUwIDIwMFMxNzIuMzg2IDE1MCAyMDAgMTUwUzI1MCAxNzIuMzg2IDI1MCAyMDBTMjI3LjYxNCAyNTAgMjAwIDI1MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEwMCAzMDBIMzAwVjM1MEgxMDBWMzAwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Call to Action Section */}
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-red-600 rounded-lg shadow-xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">💝 Support Our Mission</h2>
            <p className="mb-6 text-lg">
              These photos show the real impact of your donations. Help us
              continue making a difference in Haiti.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  window.location.href = "/donate";
                }}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition cursor-pointer"
              >
                Donate Now
              </button>
              <button
                onClick={() => {
                  window.location.href = "/impact";
                }}
                className="bg-blue-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-800 transition cursor-pointer"
              >
                Learn About Our Programs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

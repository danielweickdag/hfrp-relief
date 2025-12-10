"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface PhotoGalleryImage {
  id: string;
  src: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  date?: string;
}

interface PhotoGalleryProps {
  images: PhotoGalleryImage[];
  programType: "feeding" | "healthcare" | "education" | "housing";
  maxDisplay?: number;
}

const programColors = {
  feeding: "orange",
  healthcare: "green",
  education: "blue",
  housing: "purple",
};

const programIcons = {
  feeding: "🍽️",
  healthcare: "🏥",
  education: "📚",
  housing: "🏠",
};

export default function PhotoGallery({
  images,
  programType,
  maxDisplay = 8,
}: PhotoGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<PhotoGalleryImage | null>(
    null,
  );

  const color = programColors[programType];
  const icon = programIcons[programType];

  const displayImages = images.slice(0, maxDisplay);

  return (
    <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {icon} {programType.charAt(0).toUpperCase() + programType.slice(1)}{" "}
          Program Photos
        </h2>
      </div>

      <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
        Photos from our {programType} program activities in Haiti.
      </p>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {displayImages.map((image) => (
          <div
            key={image.id}
            className="group cursor-pointer rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden bg-white"
            onClick={() => setSelectedImage(image)}
            title="Click to view full size"
          >
            <div className="aspect-square relative overflow-hidden">
              <Image
                src={image.src}
                alt={image.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                quality={95}
                onError={(e) => {
                  e.currentTarget.src =
                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNDAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2Yjc0ODQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlPC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iNjAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vdCBBdmFpbGFibGU8L3RleHQ+PC9zdmc+";
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-75 group-hover:scale-100">
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

      {/* View All Photos Button */}
      <div className="text-center">
        <Link
          href="/gallery"
          className={`inline-flex items-center px-6 py-3 bg-${color}-600 text-white rounded-lg hover:bg-${color}-700 transition-colors font-medium`}
        >
          View All {images.length} Photos in Gallery
          <svg
            className="w-5 h-5 ml-2"
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

      {/* Modal for full-screen image view */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="max-w-6xl max-h-full bg-white rounded-lg overflow-hidden">
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
                  e.currentTarget.src =
                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNDUlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2Yjc0ODQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI1NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UGxlYXNlIHRyeSBhZ2FpbiBsYXRlcjwvdGV4dD48L3N2Zz4=";
                }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

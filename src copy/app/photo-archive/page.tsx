'use client';

import { useState } from 'react';
import Link from 'next/link';

interface GalleryImage {
  id: string;
  src: string;
  title: string;
  description: string;
  category: 'feeding' | 'healthcare' | 'education' | 'housing';
  date?: string;
}

const galleryImages: GalleryImage[] = [
  // Healthcare Category
  {
    id: 'healthcare-1',
    src: '/gallery/IMG-20250413-WA0006.jpg',
    title: 'Pediatric Medical Care',
    description: 'A young child receiving vital medical care from our dedicated healthcare team. Our medical professionals provide compassionate care in a safe, child-friendly environment, ensuring proper health screening and treatment for children in our community.',
    category: 'healthcare',
    date: '2024-04-13'
  },
  {
    id: 'healthcare-2',
    src: '/gallery/IMG-20250413-WA0040.jpg',
    title: 'Mobile Medical Clinic - Blood Pressure Monitoring',
    description: 'HFRP healthcare professionals conducting comprehensive medical screenings in our mobile clinic. Our trained medical team provides essential blood pressure checks and health assessments to community members using modern medical equipment.',
    category: 'healthcare',
    date: '2024-04-13'
  },
  {
    id: 'healthcare-3',
    src: '/gallery/IMG-20250413-WA0014.jpg',
    title: 'Community Health Outreach',
    description: 'Healthcare workers conducting health outreach and education in the community, providing essential medical services and health information to families in need.',
    category: 'healthcare',
    date: '2024-04-13'
  },

  // Education Category
  {
    id: 'education-1',
    src: '/gallery/IMG-20250413-WA0023.jpg',
    title: 'School Supply Distribution Program',
    description: 'Carefully organized school supplies including notebooks, textbooks, pencils, and educational materials being prepared for distribution to students. Our education program ensures every child has the tools they need to succeed in school.',
    category: 'education',
    date: '2024-04-13'
  },
  {
    id: 'education-2',
    src: '/gallery/IMG-20250413-WA0019.jpg',
    title: 'Community Gathering and Support',
    description: 'Community members coming together for support services and programs. These gatherings strengthen community bonds and ensure everyone has access to HFRP resources.',
    category: 'education',
    date: '2024-04-13'
  },

  // Feeding Programs Category
  {
    id: 'feeding-1',
    src: '/gallery/IMG-20250413-WA0031.jpg',
    title: 'Traditional Haitian Soup Preparation',
    description: 'Community volunteers preparing traditional Haitian soup in large quantities for our feeding program. The rich, nutritious soup with vegetables and proteins provides essential nutrition for families in need.',
    category: 'feeding',
    date: '2024-04-13'
  },
  {
    id: 'feeding-2',
    src: '/gallery/IMG-20250413-WA0005.jpg',
    title: 'Community Leader Supervising Food Preparation',
    description: 'A distinguished community leader in formal attire overseeing food preparation operations. This demonstrates the community leadership and dedication that makes our feeding programs successful and sustainable.',
    category: 'feeding',
    date: '2024-04-13'
  },
  {
    id: 'feeding-3',
    src: '/gallery/IMG-20250413-WA0009.jpg',
    title: 'Outdoor Community Kitchen Setup',
    description: 'Our outdoor cooking facility where we prepare large quantities of rice and other staple foods. The traditional cooking methods using large metal pots ensure we can feed entire communities.',
    category: 'feeding',
    date: '2024-04-13'
  },
  {
    id: 'feeding-4',
    src: '/gallery/IMG-20250413-WA0043.jpg',
    title: 'Traditional Haitian Rice and Bean Preparation',
    description: 'Close-up view of traditional Haitian rice and beans (diri ak pwa) being prepared in our community kitchen. This nutritious, protein-rich meal is a staple of our feeding program.',
    category: 'feeding',
    date: '2024-04-13'
  },
  {
    id: 'feeding-5',
    src: '/gallery/IMG-20250413-WA0001.jpg',
    title: 'Aerial View of Food Distribution Area',
    description: 'Overhead view of our food preparation and distribution area showing the organized efforts of our team. Community members work together to prepare and distribute meals.',
    category: 'feeding',
    date: '2024-04-13'
  },
  {
    id: 'feeding-6',
    src: '/gallery/IMG-20250413-WA0004.jpg',
    title: 'Traditional Cooking Methods',
    description: 'Using traditional cooking methods and large-capacity equipment to prepare authentic Haitian meals for community feeding programs, maintaining cultural food traditions.',
    category: 'feeding',
    date: '2024-04-13'
  },
  {
    id: 'feeding-7',
    src: '/gallery/IMG-20250413-WA0036.jpg',
    title: 'Children Waiting for Community Meal Service',
    description: 'Children patiently waiting in our covered outdoor dining area for their community meal. This organized feeding program serves dozens of children daily, providing nutrition and a safe community space.',
    category: 'feeding',
    date: '2024-04-13'
  },
  {
    id: 'feeding-8',
    src: '/gallery/IMG-20250413-WA0034.jpg',
    title: 'HFRP Team and Community Members Group Photo',
    description: 'HFRP team members and community beneficiaries gathering for a group photo outside our community center. This shows the diversity of ages and backgrounds we serve, all part of our extended HFRP family.',
    category: 'feeding',
    date: '2024-04-13'
  },
  {
    id: 'feeding-9',
    src: '/gallery/IMG-20250413-WA0013.jpg',
    title: 'Multi-Generational Community Impact',
    description: 'Multiple generations of community members benefiting from HFRP programs, showing the far-reaching impact of our work across all age groups in the communities we serve.',
    category: 'feeding',
    date: '2024-04-13'
  },
  {
    id: 'feeding-10',
    src: '/gallery/IMG-20250413-WA0032.jpg',
    title: 'Daily Community Meal Service',
    description: 'Our daily feeding program in action, serving nutritious meals to community members of all ages. The organized system ensures everyone receives proper nutrition while maintaining dignity.',
    category: 'feeding',
    date: '2024-04-13'
  },
  {
    id: 'feeding-11',
    src: '/gallery/IMG-20250413-WA0037.jpg',
    title: 'Nutritious Meal Distribution',
    description: 'Fresh, hot meals being served to community members through our feeding program. Each meal is carefully prepared to provide balanced nutrition, helping combat malnutrition and food insecurity.',
    category: 'feeding',
    date: '2024-04-13'
  },

  // Housing Category
  {
    id: 'housing-1',
    src: '/gallery/IMG-20250413-WA0033.jpg',
    title: 'Community Kitchen Operations',
    description: 'Behind-the-scenes look at our community kitchen where meals are prepared with care and attention to nutrition. Our kitchen facilities enable us to serve hundreds of community members daily.',
    category: 'housing',
    date: '2024-04-13'
  },
  {
    id: 'housing-2',
    src: '/gallery/IMG-20250413-WA0041.jpg',
    title: 'Community Center Activities',
    description: 'Daily activities and programs taking place at our community center, providing a safe and supportive environment for families and children to access essential services.',
    category: 'housing',
    date: '2024-04-13'
  }
];

const categories = [
  { id: 'all', label: 'All Photos', icon: '📸' },
  { id: 'feeding', label: 'Feeding Programs', icon: '🍽️' },
  { id: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'housing', label: 'Housing', icon: '🏠' }
];

export default function PhotoArchivePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const filteredImages = selectedCategory === 'all'
    ? galleryImages
    : galleryImages.filter(img => img.category === selectedCategory);

  const getCategoryStats = () => {
    const stats = categories.reduce((acc, cat) => {
      if (cat.id === 'all') {
        acc[cat.id] = galleryImages.length;
      } else {
        acc[cat.id] = galleryImages.filter(img => img.category === cat.id).length;
      }
      return acc;
    }, {} as Record<string, number>);
    return stats;
  };

  const stats = getCategoryStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/gallery" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Gallery Overview
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📸 Complete Photo Archive
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Authentic documentation of the Haitian Family Relief Project's work in April 2024.
            Every photo shows real families, real programs, and real impact from your donations.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 shadow'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
                <span className="bg-black/10 text-xs px-2 py-1 rounded-full">
                  {stats[category.id]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map((image) => (
            <button
              key={image.id}
              onClick={() => setSelectedImage(image)}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
              aria-label={`View details for ${image.title}`}
            >
              <div className="aspect-[4/3] overflow-hidden bg-gray-200">
                <img
                  src={image.src}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y1Zjc1YSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjNlbSI+SW1hZ2UgTm90IEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=';
                  }}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="font-bold text-sm mb-1 line-clamp-1">{image.title}</h3>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  image.category === 'feeding' ? 'bg-orange-500' :
                  image.category === 'healthcare' ? 'bg-green-500' :
                  image.category === 'education' ? 'bg-blue-500' :
                  image.category === 'housing' ? 'bg-purple-500' :
                  'bg-gray-500'
                }`}>
                  {categories.find(c => c.id === image.category)?.label}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Modal for Image Details */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="bg-white rounded-xl max-w-5xl max-h-[95vh] overflow-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  className="w-full h-64 md:h-[400px] lg:h-[500px] object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iOTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI2Y1Zjc1YSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjNlbSI+SW1hZ2UgTm90IEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=';
                  }}
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 bg-black bg-opacity-60 text-white p-3 rounded-full hover:bg-opacity-80 transition-all duration-200 shadow-lg"
                  aria-label="Close image details"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 md:p-8">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                    {selectedImage.title}
                  </h2>
                  <span className={`ml-4 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                    selectedImage.category === 'feeding' ? 'bg-orange-100 text-orange-800' :
                    selectedImage.category === 'healthcare' ? 'bg-green-100 text-green-800' :
                    selectedImage.category === 'education' ? 'bg-blue-100 text-blue-800' :
                    selectedImage.category === 'housing' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {categories.find(c => c.id === selectedImage.category)?.label}
                  </span>
                </div>

                <div className="prose prose-gray max-w-none mb-6">
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {selectedImage.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  {selectedImage.date && (
                    <div className="flex items-center text-gray-500">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium">
                        {new Date(selectedImage.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}

                  <div className="text-sm text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                      Photo ID: {selectedImage.id}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Close Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center">
          <div className="bg-blue-50 rounded-xl p-6 max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-blue-900 mb-3">📅 Documentation Period</h3>
            <p className="text-blue-800 mb-4">
              All photos in this archive were taken during our April 2024 program activities in Haiti.
              These images represent authentic, unedited documentation of our ongoing work.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white rounded-lg p-3">
                <div className="font-bold text-orange-600">11 Photos</div>
                <div className="text-gray-600">Feeding Programs</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="font-bold text-green-600">3 Photos</div>
                <div className="text-gray-600">Healthcare</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="font-bold text-blue-600">2 Photos</div>
                <div className="text-gray-600">Education</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="font-bold text-purple-600">2 Photos</div>
                <div className="text-gray-600">Housing</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

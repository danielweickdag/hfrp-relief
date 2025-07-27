'use client';

interface TestimonialsSectionProps {
  title?: string;
  subtitle?: string;
  variant?: 'standard' | 'compact' | 'featured';
  showAll?: boolean;
  filterByProgram?: string;
  className?: string;
}

export default function TestimonialsSection({
  title = "Stories of Hope and Transformation",
  subtitle = "Hear directly from the communities we serve about the real impact of your support",
  variant = 'standard',
  showAll = false,
  filterByProgram,
  className = ''
}: TestimonialsSectionProps) {

  return (
    <section className={`py-16 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <p className="text-gray-700 mb-4 italic text-sm sm:text-base">
                "My children now have full bellies and bright futures. The school supplies and daily meals from HFRP changed everything for our family."
              </p>
              <div className="font-semibold text-gray-900">Wideline Joseph</div>
              <div className="text-gray-500 text-sm">Mother of 3, Cap-Haïtien</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center">
              <p className="text-gray-700 mb-4 italic">
                "When I got sick, HFRP's mobile clinic saved my life. The doctors came to our village when no one else would."
              </p>
              <div className="font-semibold text-gray-900">Jean-Baptiste Pierre</div>
              <div className="text-gray-500 text-sm">Farmer, Artibonite Valley</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center">
              <p className="text-gray-700 mb-4 italic">
                "HFRP doesn't just give food - they teach us dignity. They work with us, not for us. This is real partnership."
              </p>
              <div className="font-semibold text-gray-900">Marie-Claire Duval</div>
              <div className="text-gray-500 text-sm">Community Leader, Port-au-Prince</div>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-blue-600 to-red-600 rounded-xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-6">Our Impact in Numbers</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold mb-2">1,200+</div>
              <div className="text-blue-100 text-sm">Children Fed Monthly</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">50+</div>
              <div className="text-blue-100 text-sm">Families Housed</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">25</div>
              <div className="text-blue-100 text-sm">Communities Served</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">5</div>
              <div className="text-blue-100 text-sm">Years of Service</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

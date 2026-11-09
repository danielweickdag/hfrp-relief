"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
// import StripeButton from "@/app/_components/StripeButton";
import TestimonialsSection from "./_components/TestimonialsSection";

// Extend window interface for gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      action: string,
      parameters: Record<string, unknown>,
    ) => void;
  }
}

export default function HomePage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [showVideo, setShowVideo] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  const handleDonateSuccess = () => {
    console.log("✅ Stripe donation completed successfully!");

    // Track with Google Analytics if available
    if (window.gtag) {
      window.gtag("event", "donate_button_click", {
        event_category: "Donations",
        event_label: "homepage_stripe_payment",
        value: 15,
        donation_type: "recurring",
      });
    }
  };

  const handleDonateError = (error: string) => {
    console.error("❌ Stripe donation error:", error);
    // Fallback to donate page on error
    router.push("/donate");
  };

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <>
      {/* Enhanced Hero Section */}
      <section
        className="relative flex flex-col gap-8 items-center text-center pt-20 min-h-[100vh] justify-center"
        onClick={() => {
          const video = videoRef.current;
          if (video && video.paused) {
            video.play().catch((e) => console.log("📹 Click play failed:", e));
          }
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          src="/downloads/Haitian-Family-Project-2.mp4"
          className="fixed inset-0 w-full h-full object-cover z-[-10]"
        />

        {/* Enhanced overlay with better gradient */}
        <div className="fixed inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 z-[-5] pointer-events-none" />

        <div className="w-full z-10 flex flex-col gap-8 items-center px-4 max-w-6xl mx-auto">
          {/* Enhanced Hero Content */}
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="relative w-[140px] h-[140px] rounded-full border-4 border-white/40 shadow-2xl backdrop-blur-sm overflow-hidden animate-pulse">
              <Image
                src="/hfrp-logo.png"
                alt="HFRP Logo"
                fill
                className="object-cover"
                sizes="140px"
                quality={95}
                priority
              />
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white drop-shadow-2xl">
                Haitian Family Relief Project
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 font-medium drop-shadow-xl">
                Spreading Love • Building Hope • Creating Joy
              </p>
              <p className="mt-4 max-w-2xl text-lg md:text-xl text-gray-100 drop-shadow-xl leading-relaxed">
                Welcome to our family! We're bringing love, hope, and joy to
                beautiful families in Haiti. Every meal, every smile, every
                helping hand makes our world brighter—and you can be part of
                this incredible journey.
              </p>
            </div>
          </div>

          {/* Enhanced Primary CTA */}
          <div className="w-full flex justify-center my-8">
            <div className="bg-gradient-to-r from-red-600/90 to-red-700/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-10 text-center max-w-3xl border border-white/30 transform hover:scale-105 transition-all duration-300">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                🌟 Make an Impact Today
              </h2>
              <p className="text-red-100 text-lg md:text-xl mb-8 leading-relaxed">
                Your donation directly supports families in Haiti with
                nutritious food, quality healthcare, educational opportunities,
                and safe housing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => router.push("/donate")}
                  className="bg-white text-red-600 hover:bg-red-50 px-10 py-5 rounded-xl font-bold text-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-3 cursor-pointer group"
                >
                  <svg
                    className="w-7 h-7 group-hover:animate-pulse"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  Donate Now
                </button>
                <Link
                  href="/programs"
                  className="text-white hover:text-red-100 px-8 py-4 rounded-xl font-semibold text-lg transition-all border-2 border-white/30 hover:border-white/50 backdrop-blur-sm"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Impact Statistics Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              💝 Love in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              See the incredible impact we're making together in Haiti. Every
              number represents a life touched, a family helped, and hope
              restored.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-8 text-center border-t-4 border-blue-500 transform hover:scale-105 transition-all duration-300">
              <div className="text-5xl mb-4">🍽️</div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                2,500+
              </div>
              <div className="text-lg font-semibold text-blue-800 mb-2">
                Meals Shared
              </div>
              <div className="text-sm text-gray-600">
                Bringing families together around nutritious meals daily
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg p-8 text-center border-t-4 border-green-500 transform hover:scale-105 transition-all duration-300">
              <div className="text-5xl mb-4">🏥</div>
              <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-lg font-semibold text-green-800 mb-2">
                Lives Touched
              </div>
              <div className="text-sm text-gray-600">
                Caring healthcare reaching families in their communities
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg p-8 text-center border-t-4 border-purple-500 transform hover:scale-105 transition-all duration-300">
              <div className="text-5xl mb-4">📚</div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                200+
              </div>
              <div className="text-lg font-semibold text-purple-800 mb-2">
                Dreams Nurtured
              </div>
              <div className="text-sm text-gray-600">
                Educational opportunities helping children flourish
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl shadow-lg p-8 text-center border-t-4 border-orange-500 transform hover:scale-105 transition-all duration-300">
              <div className="text-5xl mb-4">🏠</div>
              <div className="text-3xl font-bold text-orange-600 mb-2">15+</div>
              <div className="text-lg font-semibold text-orange-800 mb-2">
                Families at Home
              </div>
              <div className="text-sm text-gray-600">
                Creating safe, loving spaces where families thrive
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Mission Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  💙 Our Heart & Mission
                </h2>
                <p className="text-xl text-gray-700 leading-relaxed mb-6">
                  We're here to bring hope, love, and essential support to
                  families in Haiti. Through building safe homes, providing
                  mobile healthcare, serving nutritious meals, and creating
                  educational opportunities, we're building a brighter future
                  together.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-blue-200">
                <blockquote className="text-center">
                  <div className="text-2xl text-blue-600 mb-4">"</div>
                  <div className="italic text-lg text-gray-700 mb-4 leading-relaxed">
                    The best way to find yourself is to lose yourself in the
                    service of others.
                  </div>
                  <div className="text-right font-semibold text-blue-700">
                    — Mahatma Gandhi
                  </div>
                </blockquote>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-purple-500">
              <h3 className="text-2xl font-bold mb-6 text-purple-700 text-center">
                🤝 Join Our Family
              </h3>
              <p className="text-gray-700 text-lg leading-relaxed mb-8 text-center">
                There's a place for everyone in our mission! Whether through
                donations, volunteering, or simply sharing our story, you can be
                part of bringing hope and joy to families in Haiti.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
                  <span className="text-2xl">💰</span>
                  <div>
                    <div className="font-semibold text-purple-800">Donate</div>
                    <div className="text-sm text-gray-600">
                      Support families with essential needs
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                  <span className="text-2xl">🙋‍♀️</span>
                  <div>
                    <div className="font-semibold text-blue-800">Volunteer</div>
                    <div className="text-sm text-gray-600">
                      Share your time and talents
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl">
                  <span className="text-2xl">📢</span>
                  <div>
                    <div className="font-semibold text-green-800">Share</div>
                    <div className="text-sm text-gray-600">
                      Spread awareness in your community
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Volunteer Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                🌟 Be Part of Something Beautiful
              </h2>
              <p className="text-xl md:text-2xl text-blue-100 leading-relaxed max-w-4xl mx-auto">
                Your heart, your time, and your story can bring sunshine into
                someone's life. Join our amazing community of volunteers who are
                spreading love and making the world a little brighter every day!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
              <Link
                href="/contact"
                className="bg-white text-purple-600 hover:bg-purple-50 px-10 py-5 rounded-xl font-bold text-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-3 group"
              >
                <span className="text-2xl group-hover:animate-bounce">💫</span>
                Join Our Team
              </Link>

              <Link
                href="/programs"
                className="text-white hover:text-blue-100 px-8 py-4 rounded-xl font-semibold text-lg transition-all border-2 border-white/30 hover:border-white/50 backdrop-blur-sm"
              >
                View Programs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Add Testimonials Section */}
      <TestimonialsSection />
    </>
  );
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    gtag?: (
      command: string,
      action: string,
      parameters: Record<string, unknown>,
    ) => void;
  }
}

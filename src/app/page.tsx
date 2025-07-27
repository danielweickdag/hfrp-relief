'use client';
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import DonorboxButton from "./_components/DonorboxButton";
import TestimonialsSection from "./_components/TestimonialsSection";

export default function HomePage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  const handleDonateClick = () => {
    console.log('🔴 HOMEPAGE DONATE BUTTON CLICKED!');
    console.log('Opening Donorbox payment form directly');

    // Open Donorbox form directly with recommended $15 monthly (50¢ daily)
    const isTestMode = process.env.NEXT_PUBLIC_DONATION_TEST_MODE === 'true';
    let donorboxUrl: string;

    if (isTestMode) {
      donorboxUrl = "https://donorbox.org/embed/test-campaign?amount=15&recurring=true&test=true";
    } else {
      const campaignId = process.env.NEXT_PUBLIC_DONORBOX_MAIN_CAMPAIGN || "hfrp-haiti-relief-fund";
      donorboxUrl = `https://donorbox.org/${campaignId}?amount=15&recurring=true`;
    }

    console.log('🌐 Opening payment form:', donorboxUrl);

    // Try to open in new window, fallback to donate page
    const newWindow = window.open(donorboxUrl, '_blank', 'noopener,noreferrer,width=800,height=700');

    if (!newWindow) {
      console.warn('Pop-up blocked, falling back to donate page');
      router.push('/donate');
    } else {
      console.log('✅ Payment form opened successfully');

      // Track with Google Analytics if available
      if (window.gtag) {
        window.gtag('event', 'donate_button_click', {
          event_category: 'Donations',
          event_label: 'homepage_direct_payment',
          value: 15,
          donation_type: 'recurring'
        });
      }
    }
  };

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  // Enhanced video playback management with performance optimization
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Optimize video for mobile devices
    if (window.innerWidth < 768) {
      videoElement.preload = 'none';
    }

    // Function to ensure video is playing
    const ensureVideoPlays = () => {
      if (videoElement.paused) {
        videoElement.play().catch(err => {
          console.log("Video play attempt failed:", err);
        });
      }
    };

    // Check video status periodically
    const videoCheckInterval = setInterval(ensureVideoPlays, 5000);

    // Resume video when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(ensureVideoPlays, 100);
      }
    };

    // Resume video on user interaction (for browsers that require user gesture)
    const handleUserInteraction = () => {
      ensureVideoPlays();
      // Remove listeners after first interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    // Event listeners for video
    const handleLoadedData = () => {
      videoElement.play().catch(err => console.log("Video autoplay failed:", err));
    };

    const handleEnded = () => {
      videoElement.currentTime = 0;
      videoElement.play().catch(err => console.log("Video restart failed:", err));
    };

    const handlePause = () => {
      setTimeout(() => {
        videoElement.play().catch(err => console.log("Video resume failed:", err));
      }, 100);
    };

    const handleCanPlay = () => {
      videoElement.play().catch(err => console.log("Video canplay failed:", err));
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    videoElement.addEventListener('loadeddata', handleLoadedData);
    videoElement.addEventListener('ended', handleEnded);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('canplay', handleCanPlay);

    // Initial play attempt
    setTimeout(ensureVideoPlays, 1000);

    return () => {
      clearInterval(videoCheckInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);

      if (videoElement) {
        videoElement.removeEventListener('loadeddata', handleLoadedData);
        videoElement.removeEventListener('ended', handleEnded);
        videoElement.removeEventListener('pause', handlePause);
        videoElement.removeEventListener('canplay', handleCanPlay);
      }
    };
  }, []);

  return (
    <>
      <section className="relative flex flex-col gap-12 items-center text-center pt-16 min-h-[95vh] justify-center">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          webkit-playsinline="true"
          x5-playsinline="true"
          controls={false}
          disablePictureInPicture
          className="fixed inset-0 w-full h-full object-cover z-[-10] transform-gpu"
          poster="/homepage-poster.jpg"
          onError={(e) => {
            console.log("Video failed to load, using fallback background");
            if (e.currentTarget.parentElement) {
              e.currentTarget.parentElement.style.backgroundColor = "#1f2937";
              e.currentTarget.parentElement.style.backgroundImage = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
            }
          }}
          onLoadStart={() => {
            console.log("Video loading started");
          }}
          onCanPlay={() => {
            console.log("Video can start playing");
          }}
        >
          <source src="/haitian-family-project.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 z-[-5] pointer-events-none" />

        <div className="w-full z-10 flex flex-col gap-12 items-center">
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-[120px] h-[120px] rounded-full border-4 border-white/30 shadow-2xl backdrop-blur-sm overflow-hidden">
              <Image
                src="/hfrp-logo.png"
                alt="HFRP Logo"
                fill
                className="object-cover"
                sizes="120px"
                quality={95}
                priority
              />
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-white drop-shadow-2xl">Haitian Family Relief Project</h2>
            <p className="mt-2 max-w-xl text-lg text-gray-100 drop-shadow-xl font-medium">
              Welcome to our family! We're spreading love, hope, and joy to beautiful families in Haiti. Every meal, every smile, every helping hand makes our world brighter—and you can be part of this incredible journey.
            </p>
          </div>

          {/* Donate Now Section */}
          <div className="w-full flex justify-center my-8">
            <div className="bg-gradient-to-r from-red-600/80 to-red-700/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center max-w-2xl border border-white/20">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Make an Impact Today
              </h3>
              <p className="text-red-100 text-lg mb-6">
                Your donation directly supports families in Haiti with food, healthcare, education, and safe housing.
              </p>
              <button
                onClick={handleDonateClick}
                className="bg-white text-red-600 hover:bg-red-50 px-8 py-4 rounded-lg font-bold text-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto w-fit cursor-pointer"
                type="button"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                Donate Now
              </button>
            </div>
          </div>

          <div className="w-full flex justify-center my-8">
            <blockquote className="border-l-4 border-blue-600 bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-xl max-w-xl text-center mx-auto">
              <div className="italic text-lg text-zinc-700 mb-2">
                "The best way to find yourself is to lose yourself in the service of others."
              </div>
              <div className="text-right font-semibold text-blue-700">— Mahatma Gandhi</div>
            </blockquote>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full max-w-5xl px-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-4 sm:p-6 border-t-4 border-blue-600">
              <h3 className="text-lg font-bold mb-2 text-blue-700">💙 Our Heart & Mission</h3>
              <p className="text-zinc-700">We're here to bring hope, love, and essential support to families in Haiti. Through building safe homes, providing mobile healthcare, serving nutritious meals, and creating educational opportunities, we're building a brighter future together.</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border-t-4 border-red-600">
              <h3 className="text-lg font-bold mb-3 text-red-700">❤️ Love in Action</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🍽️</span>
                  <div>
                    <div className="font-semibold text-red-600">2,500+ Meals Shared</div>
                    <div className="text-sm text-zinc-600">Bringing families together around nutritious meals daily</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🏥</span>
                  <div>
                    <div className="font-semibold text-blue-600">500+ Lives Touched</div>
                    <div className="text-sm text-zinc-600">Caring healthcare reaching families in their communities</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📚</span>
                  <div>
                    <div className="font-semibold text-green-600">200+ Dreams Nurtured</div>
                    <div className="text-sm text-zinc-600">Educational opportunities helping children flourish</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🏠</span>
                  <div>
                    <div className="font-semibold text-orange-600">15+ Families at Home</div>
                    <div className="text-sm text-zinc-600">Creating safe, loving spaces where families thrive</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border-t-4 border-purple-500">
              <h3 className="text-lg font-bold mb-2 text-purple-700">🤝 Join Our Family</h3>
              <p className="text-zinc-700">There's a place for everyone in our mission! Whether through donations, volunteering, or simply sharing our story, you can be part of bringing hope and joy to families in Haiti.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            🌟 Be Part of Something Beautiful
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Your heart, your time, and your story can bring sunshine into someone's life. Join our amazing community of volunteers who are spreading love and making the world a little brighter every day!
          </p>
          <div className="flex justify-center">
            <Link
              href="/contact"
              className="bg-white text-purple-600 hover:bg-purple-50 px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <span>💫</span>
              Join Our Team
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    gtag?: (command: string, action: string, parameters: Record<string, unknown>) => void;
  }
}

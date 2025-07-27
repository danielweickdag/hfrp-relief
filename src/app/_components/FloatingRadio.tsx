'use client';

import { useState, useRef, useEffect } from 'react';

// Audio element with accessibility improvements
export default function FloatingRadio({ className = '' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const audioRef = useRef(null);

  // HFRP radio station for mobile (simpler interface)
  const radioStation = {
    name: 'HFRP Live News',
    url: 'https://edge.mixlr.com/channel/hfrp-haiti-news', // 🔴 UPDATE: Replace with your actual Mixlr URL
    description: 'HFRP Live Updates'
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      console.warn('Radio stream failed');
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        audio.src = radioStation.url;
        await audio.play();
        setIsPlaying(true);
        setIsLoading(false);

        // Track radio usage with analytics
        if (window.gtag) {
          window.gtag('event', 'mobile_radio_stream_start', {
            event_category: 'Audio',
            event_label: radioStation.name,
            device: 'mobile'
          });
        }
      }
    } catch (error) {
      console.error('Radio playback failed:', error);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  // Hide/show based on scroll
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const updateVisibility = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY ? 'down' : 'up';

      if (direction === 'down' && scrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      lastScrollY = scrollY;
    };

    window.addEventListener('scroll', updateVisibility);
    return () => window.removeEventListener('scroll', updateVisibility);
  }, []);

  return (
    <>
      {/* Hidden audio element with accessibility improvements */}
      <audio
        ref={audioRef}
        preload="none"
        volume={0.7}
        crossOrigin="anonymous"
        aria-label="HFRP Live Radio Stream"
      >
        <track kind="captions" src="" label="English Captions" />
        Your browser does not support the audio element.
      </audio>

      {/* Floating Radio Button (Mobile Only) */}
      <div
        className={`fixed bottom-20 right-4 z-40 md:hidden transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : 'translate-y-24'
        } ${className}`}
      >
        <button
          onClick={togglePlayback}
          disabled={isLoading}
          className="relative flex items-center justify-center w-14 h-14 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
          title="Live Haiti News Radio"
          aria-label="Toggle live radio"
        >
          {isLoading ? (
            <svg className="animate-spin w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ) : isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zM14 4h4v16h-4V4z"/>
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              {/* Modern Live Radio Icon */}
              <rect x="3" y="9" width="18" height="10" rx="2" fill="currentColor"/>
              <circle cx="7" cy="13" r="1.5" fill="white"/>
              <rect x="10" y="11" width="8" height="1" fill="white"/>
              <rect x="10" y="13" width="6" height="1" fill="white"/>
              <rect x="10" y="15" width="4" height="1" fill="white"/>
              {/* Antenna */}
              <line x1="12" y1="9" x2="12" y2="5" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="4" r="1" fill="currentColor"/>
            </svg>
          )}

          {/* Live indicator */}
          {isPlaying && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
          )}

          {/* Radio waves animation when playing */}
          {isPlaying && (
            <div className="absolute inset-0">
              <div className="absolute inset-0 border-2 border-white rounded-full opacity-30 animate-ping animation-delay-100" />
              <div className="absolute inset-2 border-2 border-white rounded-full opacity-20 animate-ping animation-delay-300" />
            </div>
          )}
        </button>

        {/* Station info tooltip */}
        {isPlaying && (
          <div className="absolute bottom-16 right-0 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            🔴 {radioStation.description}
          </div>
        )}
      </div>
    </>
  );
}

// Extend window interface for analytics
declare global {
  interface Window {
    gtag?: (command: string, action: string, parameters: Record<string, unknown>) => void;
  }
}

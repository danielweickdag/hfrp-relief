'use client';

import { useState, useRef, useEffect } from 'react';

interface LiveRadioProps {
  className?: string;
}

export default function LiveRadio({ className = '' }: LiveRadioProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [showControls, setShowControls] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // HFRP's own radio stations - your live stream goes first!
  const radioStations = [
    {
      name: 'HFRP Live News', // 🎙️ Ready for your live broadcast
      url: 'https://edge.mixlr.com/channel/hfrp-haiti-news', // 🔴 UPDATE: Replace with your actual Mixlr URL
      description: 'Live updates and news from Haiti Relief Project'
    },
    {
      name: 'Radio Télé Métropole',
      url: 'https://edge.mixlr.com/channel/bwwqj',
      description: 'Haiti News & Music'
    },
    {
      name: 'Radio Vision 2000',
      url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/VISION2000.mp3',
      description: 'Haiti News Radio'
    },
    {
      name: 'Radio Caraibes',
      url: 'https://live.radiocaraibes.fm/caraibes',
      description: 'Caribbean News & Music'
    },
    {
      name: 'BBC World Service',
      url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service',
      description: 'International News'
    }
  ];

  const [currentStation, setCurrentStation] = useState(radioStations[0]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      console.warn('Radio stream failed, trying next station...');
      // Try next station on error
      const currentIndex = radioStations.findIndex(s => s.url === currentStation.url);
      const nextIndex = (currentIndex + 1) % radioStations.length;
      setCurrentStation(radioStations[nextIndex]);
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [currentStation]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        audio.src = currentStation.url;
        await audio.play();
        setIsPlaying(true);
        setIsLoading(false);

        // Track radio usage with analytics
        if (window.gtag) {
          window.gtag('event', 'radio_stream_start', {
            event_category: 'Audio',
            event_label: currentStation.name,
            stream_url: currentStation.url
          });
        }
      }
    } catch (error) {
      console.error('Radio playback failed:', error);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const switchStation = (station: typeof radioStations[0]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const wasPlaying = isPlaying;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    }

    setCurrentStation(station);

    if (wasPlaying) {
      setTimeout(() => {
        togglePlayback();
      }, 500);
    }

    // Track station changes
    if (window.gtag) {
      window.gtag('event', 'radio_station_change', {
        event_category: 'Audio',
        event_label: station.name,
        previous_station: currentStation.name
      });
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Hidden audio element with accessibility improvements */}
      <audio
        ref={audioRef}
        preload="none"
        volume={volume}
        crossOrigin="anonymous"
        aria-label={`Live Radio: ${currentStation.name}`}
      >
        <track kind="captions" src="" label="English Captions" />
        Your browser does not support the audio element.
      </audio>

      {/* Main Radio Button */}
      <div className="relative">
        <button
          onClick={() => setShowControls(!showControls)}
          className="flex items-center justify-center w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
          title="Live Radio - Haiti News"
          aria-label="Open live radio player"
        >
          {isLoading ? (
            <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ) : (
            <svg className={`w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`} fill="currentColor" viewBox="0 0 24 24">
              {/* Modern Live Radio Icon */}
              <rect x="3" y="9" width="18" height="10" rx="2" fill="currentColor"/>
              <circle cx="7" cy="13" r="1.5" fill="white"/>
              <rect x="10" y="11" width="8" height="1" fill="white"/>
              <rect x="10" y="13" width="6" height="1" fill="white"/>
              <rect x="10" y="15" width="4" height="1" fill="white"/>
              {/* Antenna */}
              <line x1="12" y1="9" x2="12" y2="5" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="4" r="1" fill="currentColor"/>
              {/* Live broadcast waves */}
              {isPlaying && (
                <>
                  <path d="M15 7c1.5 0 3 1 3 3" stroke="white" strokeWidth="1.5" fill="none" opacity="0.8"/>
                  <path d="M16 5c2.5 0 5 1.5 5 5" stroke="white" strokeWidth="1.5" fill="none" opacity="0.6"/>
                  <path d="M17 3c3.5 0 6 2 6 7" stroke="white" strokeWidth="1.5" fill="none" opacity="0.4"/>
                </>
              )}
            </svg>
          )}
        </button>

        {/* Live indicator */}
        {isPlaying && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
        )}
      </div>

      {/* Radio Controls Panel */}
      {showControls && (
        <div className="absolute top-14 right-0 w-80 bg-white rounded-lg shadow-xl border p-4 z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                {/* Modern Live Radio Icon for header */}
                <rect x="3" y="9" width="18" height="10" rx="2" fill="currentColor"/>
                <circle cx="7" cy="13" r="1.5" fill="white"/>
                <rect x="10" y="11" width="8" height="1" fill="white"/>
                <rect x="10" y="13" width="6" height="1" fill="white"/>
                <rect x="10" y="15" width="4" height="1" fill="white"/>
                {/* Antenna */}
                <line x1="12" y1="9" x2="12" y2="5" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="4" r="1" fill="currentColor"/>
              </svg>
              Live Radio
            </h3>
            <button
              onClick={() => setShowControls(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Current Station Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="font-semibold text-gray-900">{currentStation.name}</div>
            <div className="text-sm text-gray-600">{currentStation.description}</div>
            {isPlaying && (
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs text-red-600 font-medium">LIVE</span>
              </div>
            )}
          </div>

          {/* Play/Pause Button */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={togglePlayback}
              disabled={isLoading}
              className="flex items-center justify-center w-12 h-12 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-full transition-colors"
            >
              {isLoading ? (
                <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zM14 4h4v16h-4V4z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            {/* Volume Control */}
            <div className="flex-1">
              <label className="text-xs text-gray-600 mb-1 block">Volume</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Station Selector */}
          <div>
            <label className="text-xs text-gray-600 mb-2 block">Choose Station</label>
            <div className="space-y-2">
              {radioStations.map((station) => (
                <button
                  key={station.url}
                  onClick={() => switchStation(station)}
                  className={`w-full text-left p-2 rounded-lg transition-colors ${
                    currentStation.url === station.url
                      ? 'bg-red-50 border border-red-200 text-red-700'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="font-medium text-sm">{station.name}</div>
                  <div className="text-xs opacity-75">{station.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Stay informed with live news from Haiti and the Caribbean
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Extend window interface for analytics
declare global {
  interface Window {
    gtag?: (command: string, action: string, parameters: Record<string, unknown>) => void;
  }
}

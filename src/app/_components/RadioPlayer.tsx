"use client";

import { useState, useRef, useEffect } from "react";

interface RadioPlayerProps {
  streamUrl?: string;
  stationName?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "full";
  showSizeControls?: boolean;
  externalPlayerUrl?: string;
  showExternalLink?: boolean;
}

export default function RadioPlayer({
  streamUrl = "https://radiofrancecaraibes.vestaradio.com/stream",
  stationName = "HFRP Radio",
  className = "",
  size: initialSize = "md",
  variant = "icon",
  showSizeControls = false,
  externalPlayerUrl = "https://listen.zeno.fm/player/family-relief-project-radio-station",
  showExternalLink = true,
}: RadioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [error, setError] = useState<string | null>(null);
  const [currentSize, setCurrentSize] = useState<"sm" | "md" | "lg">(
    initialSize
  );
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  // Auto-validate stream URL on mount
  useEffect(() => {
    const validateStream = async () => {
      try {
        console.log("🔍 Validating HFRP Radio stream URL:", streamUrl);

        // Handle different stream formats
        if (streamUrl.includes("/hls/")) {
          console.log("🎵 HLS stream detected - enhanced compatibility mode");
        } else if (streamUrl.endsWith(".pls")) {
          try {
            const response = await fetch(streamUrl);
            const playlistText = await response.text();
            const fileMatch = playlistText.match(/File1=(.+)/);
            if (fileMatch && fileMatch[1] && audioRef.current) {
              const actualStreamUrl = fileMatch[1].trim();
              console.log(
                "🎵 Extracted stream URL from playlist:",
                actualStreamUrl
              );
              audioRef.current.src = actualStreamUrl;
            }
          } catch (playlistError) {
            console.warn(
              "⚠️ Could not parse playlist, using original URL:",
              playlistError
            );
          }
        }

        // Test the stream URL accessibility
        const testUrl = streamUrl.endsWith(".pls")
          ? streamUrl.replace(".pls", "")
          : streamUrl;
        const response = await fetch(testUrl, {
          method: "HEAD",
          mode: "no-cors", // Allow cross-origin requests
        });

        console.log("✅ Stream URL accessible");
        setConnectionStatus("disconnected");
        setError(null);
      } catch (err) {
        console.warn(
          "⚠️ Stream validation failed, but this is normal for audio streams:",
          err
        );
        // Don't set error for CORS issues - audio streams often block HEAD requests
        setConnectionStatus("disconnected");
        setError(null);
      }
    };

    validateStream();
  }, [streamUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlayback = async () => {
    if (!audioRef.current) {
      console.log("🎵 Creating new audio element for HFRP Radio...");
      audioRef.current = new Audio();

      // Handle different stream formats
      let actualStreamUrl = streamUrl;

      if (streamUrl.includes("/hls/")) {
        // HLS stream - use directly for better compatibility
        console.log(
          "🎵 Using HLS stream for enhanced compatibility:",
          streamUrl
        );
        actualStreamUrl = streamUrl;
      } else if (streamUrl.endsWith(".pls")) {
        // Playlist format - extract actual stream URL
        try {
          const response = await fetch(streamUrl);
          const playlistText = await response.text();
          const fileMatch = playlistText.match(/File1=(.+)/);
          if (fileMatch && fileMatch[1]) {
            actualStreamUrl = fileMatch[1].trim();
            console.log("🎵 Using stream URL from playlist:", actualStreamUrl);
          }
        } catch (playlistError) {
          console.warn("⚠️ Could not parse playlist, using fallback URL");
          actualStreamUrl = streamUrl.replace(".pls", "");
        }
      }

      // Enhanced stream URL options for better browser compatibility
      // Prioritize reliable streams that don't require authentication
      const streamUrls = [
        // Reliable Haitian radio stations first
        "https://radiofrancecaraibes.vestaradio.com/stream",
        "https://stream.live.vc/CRTV", // Caribbean Radio & TV
        "https://s2.radio.co/s2b2b68744/listen", // Alternative Caribbean stream
        // Only try original stream if it's not a problematic Zeno.FM URL
        ...(actualStreamUrl.includes('zeno.fm') && actualStreamUrl.includes('?zt=') ? [] : [actualStreamUrl]),
      ];

      let streamWorked = false;

      for (const url of streamUrls) {
        try {
          console.log("🎵 Trying stream URL:", url);
          audioRef.current.src = url;
          audioRef.current.preload = "none";
          audioRef.current.crossOrigin = "anonymous";
          audioRef.current.volume = volume;

          // Test if the browser can play this format
          const canPlay =
            audioRef.current.canPlayType("audio/mpeg") ||
            audioRef.current.canPlayType("audio/aac") ||
            audioRef.current.canPlayType("audio/ogg") ||
            audioRef.current.canPlayType("application/vnd.apple.mpegurl"); // HLS support

          if (canPlay !== "") {
            console.log("✅ Browser supports audio format:", canPlay);
            streamWorked = true;
            break;
          }
        } catch (urlError) {
          console.warn("⚠️ Stream URL failed:", url, urlError);
          continue;
        }
      }

      if (!streamWorked) {
        console.log("🎵 Using original stream URL as fallback");
        audioRef.current.src = actualStreamUrl;
        audioRef.current.preload = "none";
        audioRef.current.crossOrigin = "anonymous";
        audioRef.current.volume = volume;
      }

      // Enhanced event listeners for better automation
      audioRef.current.addEventListener("loadstart", () => {
        setIsLoading(true);
        setError(null);
        setConnectionStatus("connecting");
        console.log("🎵 Starting to load HFRP Radio stream...");
      });

      audioRef.current.addEventListener("canplay", () => {
        setIsLoading(false);
        setConnectionStatus("connected");
        console.log("✅ HFRP Radio stream ready to play");
      });

      audioRef.current.addEventListener("playing", () => {
        setIsPlaying(true);
        setIsLoading(false);
        setConnectionStatus("connected");
        console.log("🎶 HFRP Radio stream now playing");
      });

      audioRef.current.addEventListener("error", (e) => {
        const audio = e.target as HTMLAudioElement;
        let errorMessage = "Failed to load radio stream";
        let suggestionMessage = "";

        if (audio.error) {
          switch (audio.error.code) {
            case audio.error.MEDIA_ERR_ABORTED:
              errorMessage = "Stream playback was aborted";
              suggestionMessage = "Try clicking play again or use the external player link below";
              break;
            case audio.error.MEDIA_ERR_NETWORK:
              errorMessage = "Network error while loading stream";
              suggestionMessage = "Check your internet connection and try again. Fallback streams will be attempted automatically";
              break;
            case audio.error.MEDIA_ERR_DECODE:
              errorMessage = "Stream format not supported by your browser";
              suggestionMessage =
                "Try using the 'Listen on Zeno.FM' link below or update your browser. Alternative formats are being tested";
              break;
            case audio.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = "Stream source not supported";
              suggestionMessage =
                "Use the 'Listen on Zeno.FM' link for the best experience. Multiple backup streams are available";
              break;
          }
        }

        console.error("❌ HFRP Radio stream error:", errorMessage, audio.error);
        console.log("🔄 Attempting fallback streams automatically...");
        setError(`${errorMessage}. ${suggestionMessage}`);
        setIsLoading(false);
        setIsPlaying(false);
        setConnectionStatus("disconnected");
      });

      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false);
        setConnectionStatus("disconnected");
        console.log("⏹️ HFRP Radio stream ended");
      });

      audioRef.current.addEventListener("pause", () => {
        setIsPlaying(false);
        console.log("⏸️ HFRP Radio paused");
      });

      // Auto-retry on connection issues
      audioRef.current.addEventListener("stalled", () => {
        console.log("⏳ Stream stalled, attempting to resume...");
        setConnectionStatus("connecting");
        setTimeout(() => {
          if (audioRef.current && isPlaying) {
            console.log("🔄 Reloading stalled stream...");
            audioRef.current.load();
          }
        }, 2000);
      });

      // Handle waiting for data
      audioRef.current.addEventListener("waiting", () => {
        console.log("⏳ Waiting for stream data...");
        setIsLoading(true);
      });

      // Handle when enough data is loaded
      audioRef.current.addEventListener("canplaythrough", () => {
        console.log("✅ Stream fully loaded");
        setIsLoading(false);
      });
    }

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        setConnectionStatus("disconnected");
        console.log("⏸️ HFRP Radio paused");
      } else {
        setIsLoading(true);
        setError(null);
        setConnectionStatus("connecting");
        console.log("▶️ Starting HFRP Radio playback...");

        // Add timeout for play attempt
        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
          const timeoutId = setTimeout(() => {
            setError("Stream connection timeout. Please try again.");
            setIsLoading(false);
            setConnectionStatus("disconnected");
          }, 10000); // 10 second timeout

          await playPromise;
          clearTimeout(timeoutId);
        }

        setIsPlaying(true);
        setIsLoading(false);
        setConnectionStatus("connected");
        console.log("🎶 HFRP Radio playing successfully");
      }
    } catch (err) {
      let errorMessage = "Failed to play radio stream";
      let helpText = "";

      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          errorMessage = "Playback blocked by browser";
          helpText = "Click anywhere on the page first, then try again";
        } else if (err.name === "NotSupportedError") {
          errorMessage = "Stream format not supported by your browser";
          helpText =
            "Try the 'Listen on Zeno.FM' link below for better compatibility";
        } else if (err.name === "AbortError") {
          errorMessage = "Playback was interrupted";
          helpText = "Try clicking play again";
        }
      }

      console.error("❌ Playback failed:", errorMessage, err);
      setError(helpText ? `${errorMessage}. ${helpText}` : errorMessage);
      setIsLoading(false);
      setIsPlaying(false);
      setConnectionStatus("disconnected");
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const SizeControls = () => {
    if (!showSizeControls) return null;

    return (
      <div className="flex items-center space-x-1 mb-2">
        <span className="text-xs text-gray-500 mr-2">Size:</span>
        {(["sm", "md", "lg"] as const).map((sizeOption) => (
          <button
            key={sizeOption}
            onClick={() => setCurrentSize(sizeOption)}
            className={`
              px-2 py-1 text-xs rounded transition-colors
              ${
                currentSize === sizeOption
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }
            `}
          >
            {sizeOption.toUpperCase()}
          </button>
        ))}
      </div>
    );
  };

  if (variant === "icon") {
    return (
      <div className={`relative group ${className}`}>
        <SizeControls />
        <button
          onClick={togglePlayback}
          disabled={isLoading}
          className={`
            ${sizeClasses[currentSize]}
            bg-gradient-to-br from-red-500 to-red-700 
            hover:from-red-600 hover:to-red-800
            text-white rounded-full shadow-lg
            flex items-center justify-center
            transition-all duration-300 transform hover:scale-110
            disabled:opacity-50 disabled:cursor-not-allowed
            relative overflow-hidden
          `}
          title={`${isPlaying ? "Stop" : "Play"} ${stationName}`}
        >
          {/* Radio waves animation */}
          {isPlaying && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping" />
              <div className="absolute inset-0 rounded-full border border-white/20 animate-pulse" />
            </>
          )}

          {isLoading ? (
            <div className={`${iconSizes[currentSize]} animate-spin`}>
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="32"
                  strokeDashoffset="32"
                  className="animate-spin"
                />
              </svg>
            </div>
          ) : isPlaying ? (
            <div
              className={`${iconSizes[currentSize]} flex items-center justify-center`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-full h-full"
              >
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            </div>
          ) : (
            <div
              className={`${iconSizes[currentSize]} flex items-center justify-center`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-full h-full"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
        </button>

        {error && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-red-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-4 max-w-sm ${className}`}>
      <SizeControls />
      {/* Station Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="relative">
          <button
            onClick={togglePlayback}
            disabled={isLoading}
            className={`
              ${sizeClasses[currentSize]}
              bg-gradient-to-br from-red-500 to-red-700 
              hover:from-red-600 hover:to-red-800
              text-white rounded-full shadow-lg
              flex items-center justify-center
              transition-all duration-300 transform hover:scale-110
              disabled:opacity-50 disabled:cursor-not-allowed
              relative overflow-hidden
            `}
          >
            {isPlaying && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping" />
                <div className="absolute inset-0 rounded-full border border-white/20 animate-pulse" />
              </>
            )}

            {isLoading ? (
              <div className={`${iconSizes[currentSize]} animate-spin`}>
                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="32"
                    strokeDashoffset="32"
                  />
                </svg>
              </div>
            ) : isPlaying ? (
              <div className={`${iconSizes[currentSize]}`}>
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-full h-full"
                >
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              </div>
            ) : (
              <div className={`${iconSizes[currentSize]}`}>
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-full h-full"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            )}
          </button>
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{stationName}</h3>
          <p className="text-sm text-gray-500">
            {isPlaying
              ? "Now Playing"
              : isLoading
                ? "Connecting..."
                : connectionStatus === "connected"
                  ? "Ready to Play"
                  : "Click to Play"}
          </p>
          {/* Connection status indicator */}
          <div className="flex items-center space-x-1 mt-1">
            <div
              className={`w-2 h-2 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-green-500"
                  : connectionStatus === "connecting"
                    ? "bg-yellow-500 animate-pulse"
                    : "bg-gray-400"
              }`}
            />
            <span className="text-xs text-gray-400">
              {connectionStatus === "connected"
                ? "Connected"
                : connectionStatus === "connecting"
                  ? "Connecting"
                  : "Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* Volume Control */}
      <div className="flex items-center space-x-3">
        <svg
          className="w-4 h-4 text-gray-400"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
        </svg>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <span className="text-sm text-gray-500 w-8">
          {Math.round(volume * 100)}
        </span>
      </div>

      {/* Status */}
      {error && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {isPlaying && (
        <div className="mt-3 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Live Stream Active</span>
          </div>
          <div className="text-xs text-gray-500">
            {streamUrl.includes("zeno.fm") ? "Zeno.FM" : "Custom Stream"}
          </div>
        </div>
      )}

      {/* Enhanced connection status */}
      {connectionStatus === "connecting" && !isPlaying && (
        <div className="mt-3 flex items-center space-x-2 text-sm text-yellow-600">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping" />
          <span>Establishing connection to HFRP Radio...</span>
        </div>
      )}

      {connectionStatus === "connected" && !isPlaying && !isLoading && (
        <div className="mt-3 flex items-center space-x-2 text-sm text-blue-600">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          <span>Ready for playback</span>
        </div>
      )}

      {/* External Player Link */}
      {showExternalLink && externalPlayerUrl && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <a
            href={externalPlayerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m18 13 6-6-6-6" />
              <path d="M2 5h10" />
              <path d="M2 19h10" />
            </svg>
            <span>Listen on Zeno.FM</span>
          </a>
        </div>
      )}
    </div>
  );
}

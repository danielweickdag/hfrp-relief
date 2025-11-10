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
  streamUrl = "https://stream.zeno.fm/ttq4haexcf9uv",
  stationName = "HFRP Radio",
  className = "",
  size: initialSize = "md",
  variant = "icon",
  showSizeControls = false,
  externalPlayerUrl = "https://listen.zeno.fm/player/family-relief-project-radio-station",
  showExternalLink = true,
}: RadioPlayerProps) {
  const radioEnabled = process.env.NEXT_PUBLIC_ENABLE_RADIO_STREAM !== "false";
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
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [currentStreamUrl, setCurrentStreamUrl] = useState<string>("");
  const [retryCount, setRetryCount] = useState(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxRetries = 3;

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

  // Function to check if a Zeno.fm token is expired
  const isTokenExpired = (url: string): boolean => {
    if (!url.includes("?zt=")) return false;
    
    try {
      const tokenMatch = url.match(/\?zt=([^&]+)/);
      if (!tokenMatch) return false;
      
      const token = tokenMatch[1];
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = payload.exp;
      
      // Consider token expired if it expires within the next 10 seconds
      const isExpired = now >= (expiresAt - 10);
      if (isExpired) {
        console.log("⚠️ Token expired or expiring soon:", new Date(expiresAt * 1000));
      }
      return isExpired;
    } catch (error) {
      console.warn("⚠️ Could not parse token, assuming expired:", error);
      return true;
    }
  };

  // Function to check if a Zeno.fm token needs preemptive refresh (within 15 seconds of expiry)
  const shouldRefreshTokenSoon = (url: string): boolean => {
    if (!url.includes("?zt=")) return false;
    
    try {
      const tokenMatch = url.match(/\?zt=([^&]+)/);
      if (!tokenMatch) return false;
      
      const token = tokenMatch[1];
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = payload.exp;
      
      // Refresh token if it expires within the next 15 seconds
      const shouldRefresh = now >= (expiresAt - 15);
      if (shouldRefresh) {
        console.log("🔄 Token needs preemptive refresh, expires at:", new Date(expiresAt * 1000));
      }
      return shouldRefresh;
    } catch (error) {
      console.warn("⚠️ Could not parse token for preemptive refresh, assuming needs refresh:", error);
      return true;
    }
  };

  // Function to get fresh stream URL with new token
  const getFreshStreamUrl = async (baseUrl: string): Promise<string> => {
    try {
      console.log("🔄 Getting fresh stream URL for:", baseUrl);
      const response = await fetch(baseUrl, {
        method: "HEAD",
        redirect: "manual", // Don't follow redirects automatically
      });
      
      // Zeno.fm returns a 302 redirect with the tokenized URL
      const location = response.headers.get("location");
      if (location) {
        console.log("✅ Got fresh tokenized URL");
        return location;
      }
      
      // Fallback to original URL if no redirect
      return baseUrl;
    } catch (error) {
      console.warn("⚠️ Failed to get fresh URL, using original:", error);
      return baseUrl;
    }
  };

  // Function to retry playback with exponential backoff
  const retryPlayback = async (attempt = 0): Promise<void> => {
    if (attempt >= maxRetries) {
      console.error("❌ Max retry attempts reached");
      setError("Unable to connect to radio stream after multiple attempts. Please try the external player.");
      setIsLoading(false);
      setConnectionStatus("disconnected");
      setRetryCount(0);
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // Exponential backoff, max 10 seconds
    console.log(`🔄 Retrying playback in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
    
    setRetryCount(attempt + 1);
    
    retryTimeoutRef.current = setTimeout(async () => {
      try {
        // For Zeno.fm streams, always get a fresh token before retry
        if (streamUrl.includes("zeno.fm")) {
          console.log("🔄 Getting fresh token for retry...");
          const freshUrl = await getFreshStreamUrl(streamUrl);
          setCurrentStreamUrl(freshUrl);
          
          if (audioRef.current) {
            audioRef.current.src = freshUrl;
            audioRef.current.load();
            await audioRef.current.play();
          }
        } else {
          // For other streams, just retry with current URL
          if (audioRef.current) {
            audioRef.current.load();
            await audioRef.current.play();
          }
        }
        
        // Reset retry count on successful retry
        setRetryCount(0);
        console.log("✅ Retry successful");
      } catch (error) {
         console.warn(`⚠️ Retry attempt ${attempt + 1} failed:`, error);
         await retryPlayback(attempt + 1);
       }
     }, delay);
   };

  // Function to refresh stream URL and update audio source
  const refreshStream = async () => {
    if (!audioRef.current || !isPlaying) return;
    
    try {
      console.log("🔄 Refreshing stream to prevent token expiration...");
      const freshUrl = await getFreshStreamUrl(streamUrl);
      setCurrentStreamUrl(freshUrl);
      
      // Store current playback state
      const wasPlaying = !audioRef.current.paused;
      const currentTime = audioRef.current.currentTime;
      
      // Update source with fresh URL
      audioRef.current.src = freshUrl;
      audioRef.current.load();
      
      // Resume playback if it was playing
      if (wasPlaying) {
        try {
          await audioRef.current.play();
        } catch (playError) {
          console.warn("⚠️ Could not resume playback after refresh:", playError);
        }
      }
    } catch (error) {
      console.error("❌ Failed to refresh stream:", error);
    }
  };

  // Auto-validate stream URL on mount and set up refresh interval
  useEffect(() => {
    if (!radioEnabled) {
      // Skip any network requests in dev when radio is disabled
      setCurrentStreamUrl(streamUrl);
      setConnectionStatus("disconnected");
      setError(null);
      return;
    }
    const validateStream = async () => {
      try {
        console.log("🔍 Validating HFRP Radio stream URL:", streamUrl);

        // Get initial fresh URL for Zeno.fm streams
        if (streamUrl.includes("zeno.fm")) {
          console.log("🔄 Getting initial fresh token for Zeno.fm stream...");
          const freshUrl = await getFreshStreamUrl(streamUrl);
          setCurrentStreamUrl(freshUrl);
          console.log("🎵 Using fresh tokenized URL for initial setup");
        } else {
          setCurrentStreamUrl(streamUrl);
        }

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
              setCurrentStreamUrl(actualStreamUrl);
            }
          } catch (playlistError) {
            console.warn(
              "⚠️ Could not parse playlist, using original URL:",
              playlistError
            );
          }
        }

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
        setCurrentStreamUrl(streamUrl);
      }
    };

    validateStream();
  }, [streamUrl, radioEnabled]);

  // Set up automatic stream refresh for Zeno.fm streams only while playing
  useEffect(() => {
    if (radioEnabled && isPlaying && streamUrl.includes("zeno.fm")) {
      refreshIntervalRef.current = setInterval(async () => {
        console.log("⏰ Proactive token refresh for Zeno.fm stream (playing)...");
        try {
          const freshUrl = await getFreshStreamUrl(streamUrl);
          setCurrentStreamUrl(freshUrl);
          console.log("✅ Token refreshed proactively");
        } catch (error) {
          console.warn("⚠️ Proactive token refresh failed:", error);
        }
      }, 30000);
      console.log("⏰ Set up proactive token refresh every 30 seconds (playing)");
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
        console.log("⏹️ Cleared token refresh");
      }
    }

    // Cleanup on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [streamUrl, radioEnabled, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlayback = async () => {
    if (!audioRef.current) {
      console.log("🎵 Creating new audio element for HFRP Radio...");
      audioRef.current = new Audio();

      // Use the current stream URL (which may be tokenized for Zeno.fm)
      let actualStreamUrl = currentStreamUrl || streamUrl;

      // Ensure we have a fresh token for Zeno.fm streams
      if (streamUrl.includes("zeno.fm")) {
        if (!currentStreamUrl || isTokenExpired(currentStreamUrl) || shouldRefreshTokenSoon(currentStreamUrl)) {
          console.log("🔄 Getting fresh token for playback (expired or expiring soon)...");
          actualStreamUrl = await getFreshStreamUrl(streamUrl);
          setCurrentStreamUrl(actualStreamUrl);
        }
      }

      if (streamUrl.includes("/hls/")) {
        // HLS stream - use directly for better compatibility
        console.log(
          "🎵 Using HLS stream for enhanced compatibility:",
          actualStreamUrl
        );
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
      // Prefer HLS first for Safari/iOS, then MP3/AAC fallbacks
      const zenoIdMatch = streamUrl.match(/zeno\.fm\/(?:hls\/)?([a-z0-9]+)$/);
      const zenoId = zenoIdMatch?.[1] || "ttq4haexcf9uv";
      const isSafari =
        typeof navigator !== "undefined" &&
        /safari/i.test(navigator.userAgent) &&
        !/chrome|android/i.test(navigator.userAgent);

      // For Zeno.fm streams, use the tokenized URL directly
      const streamCandidates = streamUrl.includes("zeno.fm")
        ? [actualStreamUrl] // Use the fresh tokenized URL
        : isSafari
        ? [
            `https://stream.zeno.fm/hls/${zenoId}`,
            `https://stream.zeno.fm/${zenoId}`,
            "https://stream.live.vc/CRTV",
            "https://s2.radio.co/s2b2b68744/listen",
            actualStreamUrl,
          ]
        : [
            `https://stream.zeno.fm/${zenoId}`,
            "https://stream.live.vc/CRTV",
            "https://s2.radio.co/s2b2b68744/listen",
            `https://stream.zeno.fm/hls/${zenoId}`,
            actualStreamUrl,
          ];

      let candidateIndex = 0;

      const tryCandidate = async (index: number) => {
        let url = streamCandidates[index];
        
        // For Zeno.fm URLs, always ensure we have a fresh token
        if (url.includes("zeno.fm")) {
          if (!url.includes("?zt=") || isTokenExpired(url) || shouldRefreshTokenSoon(url)) {
            console.log("🔄 Getting fresh token for Zeno.fm stream (expired or expiring soon)...");
            url = await getFreshStreamUrl(url.includes("?zt=") ? streamUrl : url);
            // Update the current stream URL with the fresh token
            setCurrentStreamUrl(url);
          }
        }
        
        console.log("🎵 Trying stream URL:", url.substring(0, 50) + "...");
        audioRef.current!.src = url;
        audioRef.current!.preload = "none";
        audioRef.current!.crossOrigin = "anonymous";
        audioRef.current!.volume = volume;
        // Attempt playback; browser will raise 'error' if unsupported/network issue
        audioRef.current!.load();
      };

      // Advance to next candidate only on error, avoiding multiple aborted loads
      audioRef.current.addEventListener("error", async () => {
        console.log(`❌ Stream candidate ${candidateIndex + 1} failed`);
        if (candidateIndex < streamCandidates.length - 1) {
          candidateIndex += 1;
          await tryCandidate(candidateIndex);
        } else {
          setIsLoading(false);
          setConnectionStatus("disconnected");
          setError("Unable to play stream. Try external player.");
        }
      });

      // Start with first candidate
      await tryCandidate(candidateIndex);

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

      audioRef.current.addEventListener("error", async (e) => {
        const audio = e.target as HTMLAudioElement;
        let errorMessage = "Failed to load radio stream";
        let suggestionMessage = "";
        let shouldRetry = false;

        if (audio.error) {
          switch (audio.error.code) {
            case audio.error.MEDIA_ERR_ABORTED:
              errorMessage = "Stream playback was aborted";
              if (streamUrl.includes("zeno.fm")) {
                suggestionMessage = "Token may have expired. Retrying with fresh token...";
                shouldRetry = true;
              } else {
                suggestionMessage = "Connection interrupted. Retrying...";
                shouldRetry = true;
              }
              break;
            case audio.error.MEDIA_ERR_NETWORK:
              errorMessage = "Network error while loading stream";
              suggestionMessage = "Connection lost. Attempting to reconnect...";
              shouldRetry = true;
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
        
        // Use the new retry function for better error handling
        if (shouldRetry && retryCount < maxRetries) {
          console.log("🔄 Attempting automatic retry...");
          setError(`${errorMessage}. ${suggestionMessage}`);
          await retryPlayback(retryCount);
          return;
        }
        
        // If we've exhausted retries or shouldn't retry, show final error
        console.log("❌ All retry attempts failed or not retryable error");
        setError(`${errorMessage}. ${suggestionMessage}`);
        setIsLoading(false);
        setIsPlaying(false);
        setConnectionStatus("disconnected");
        setRetryCount(0);
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

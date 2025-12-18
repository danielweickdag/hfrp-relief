"use client";

import { useEffect, useRef, useState } from "react";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "connecting" | "connected" | "error"
  >("idle");
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const currentUrlRef = useRef<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [currentSize, setCurrentSize] = useState<"sm" | "md" | "lg">(
    initialSize
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const retryRef = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const getCandidates = () => {
    const idMatch = streamUrl.match(/([a-z0-9]+)$/i);
    const id = idMatch ? idMatch[1] : "";
    const ts = Date.now();
    const nonHls = `https://stream.zeno.fm/${id}?_t=${ts}`;
    const hlsBase = `https://stream.zeno.fm/hls/${id}`;
    const hlsM3U8 = `${hlsBase}.m3u8?_t=${ts}`;

    const isSafari =
      typeof navigator !== "undefined" &&
      /Safari/.test(navigator.userAgent) &&
      !/Chrome/.test(navigator.userAgent);
    return isSafari ? [hlsM3U8, hlsBase, nonHls] : [nonHls, hlsBase, hlsM3U8];
  };

  const getRefreshUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set("_t", Date.now().toString());
      return urlObj.toString();
    } catch {
      return url;
    }
  };

  const attachAudioEvents = (audio: HTMLAudioElement) => {
    audio.addEventListener("loadstart", () =>
      setConnectionStatus("connecting")
    );
    audio.addEventListener("canplay", () => setConnectionStatus("connected"));
    audio.addEventListener("playing", () => setConnectionStatus("connected"));
    audio.addEventListener("waiting", () => setConnectionStatus("connecting"));
    audio.addEventListener("stalled", async () => {
      if (retryRef.current < maxRetries) {
        retryRef.current += 1;
        setConnectionStatus("connecting");
        try {
          const base = currentUrlRef.current || streamUrl;
          const url = getRefreshUrl(base);
          console.log("Stalled, retrying with:", url);
          audio.src = url;
          await audio.play();
          setConnectionStatus("connected");
          setLastError(null);
          return;
        } catch {}
      }
      setConnectionStatus("error");
    });
    audio.addEventListener("error", async () => {
      const err = audio.error;
      if (err) {
        const code = err.code;
        const map: Record<number, string> = {
          1: "aborted",
          2: "network",
          3: "decode",
          4: "src not supported",
        };
        setLastError(map[code] ?? `code ${code}`);
        if ((code === 1 || code === 2) && retryRef.current < maxRetries) {
          retryRef.current += 1;
          setConnectionStatus("connecting");
          try {
            const base = currentUrlRef.current || streamUrl;
            const url = getRefreshUrl(base);
            console.log("Error, retrying with:", url);
            audio.src = url;
            await audio.play();
            setConnectionStatus("connected");
            setLastError(null);
            return;
          } catch {}
        }
      }
      setConnectionStatus("error");
    });
  };

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        setConnectionStatus("idle");
        retryRef.current = 0;
      } else {
        setIsLoading(true);
        attachAudioEvents(audio);
        setConnectionStatus("connecting");
        const candidates = getCandidates();
        let success = false;
        for (const url of candidates) {
          try {
            setCurrentUrl(url);
            currentUrlRef.current = url;
            audio.src = url;
            await audio.play();
            success = true;
            break;
          } catch (e) {
            console.warn("Radio playback failed", url, e);
            setLastError(e instanceof Error ? e.message : String(e));
            retryRef.current = 0;
          }
        }
        if (success) {
          setIsPlaying(true);
          setIsLoading(false);
          setError(null);
          setConnectionStatus("connected");
          setLastError(null);
          retryRef.current = 0;
        } else {
          setIsLoading(false);
          setIsPlaying(false);
          setError("Failed to play radio stream");
          setConnectionStatus("error");
        }
      }
    } catch (e) {
      setIsLoading(false);
      setIsPlaying(false);
      setError("Failed to play radio stream");
      setConnectionStatus("error");
      setLastError(e instanceof Error ? e.message : String(e));
      retryRef.current = 0;
    }
  };

  const SizeControls = () => {
    if (!showSizeControls) return null;
    return (
      <div className="flex items-center space-x-1 mb-2">
        <span className="text-xs text-gray-500 mr-2">Size:</span>
        {["sm", "md", "lg"].map((sizeOption) => (
          <button
            key={sizeOption}
            onClick={() => setCurrentSize(sizeOption as "sm" | "md" | "lg")}
            className={
              currentSize === sizeOption
                ? "px-2 py-1 text-xs rounded bg-red-600 text-white"
                : "px-2 py-1 text-xs rounded bg-gray-200 text-gray-600 hover:bg-gray-300"
            }
          >
            {sizeOption.toUpperCase()}
          </button>
        ))}
      </div>
    );
  };

  if (variant === "icon") {
    const sizeClasses = {
      sm: "w-8 h-8",
      md: "w-12 h-12",
      lg: "w-16 h-16",
    } as const;
    const iconSizes = {
      sm: "w-4 h-4",
      md: "w-6 h-6",
      lg: "w-8 h-8",
    } as const;
    return (
      <div className={`relative group ${className}`}>
        <audio
          ref={audioRef}
          preload="none"
          crossOrigin="anonymous"
          playsInline
          className="hidden"
        />
        <SizeControls />
        <button
          onClick={togglePlayback}
          disabled={isLoading}
          className={`${sizeClasses[currentSize]} bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden`}
          title={`${isPlaying ? "Stop" : "Play"} ${stationName}`}
        >
          {isLoading ? (
            <svg
              className={iconSizes[currentSize]}
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          ) : isPlaying ? (
            <svg
              className={iconSizes[currentSize]}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg
              className={iconSizes[currentSize]}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
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
      <audio
        ref={audioRef}
        preload="none"
        crossOrigin="anonymous"
        playsInline
        className="hidden"
      />
      <SizeControls />
      <div className="flex items-center space-x-3 mb-4">
        <div className="relative">
          <button
            onClick={togglePlayback}
            disabled={isLoading}
            className={`${currentSize === "sm" ? "w-8 h-8" : currentSize === "md" ? "w-12 h-12" : "w-16 h-16"} bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden`}
          >
            {isLoading ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-6 h-6 animate-spin"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            ) : isPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M8 5v14l11-7z" />
              </svg>
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
                : "Click to Play"}
          </p>
          <div className="mt-1 text-xs">
            {connectionStatus === "connected" && (
              <span className="text-green-600">Connected</span>
            )}
            {connectionStatus === "connecting" && (
              <span className="text-yellow-600">Connecting…</span>
            )}
            {connectionStatus === "error" && (
              <span className="text-red-600">Playback error</span>
            )}
            {currentUrl && (
              <div className="text-gray-400">Source: {currentUrl}</div>
            )}
            {lastError && (
              <div className="text-red-500">Error: {lastError}</div>
            )}
          </div>
        </div>
      </div>
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
          onChange={(e) => {
            const v = Number.parseFloat(e.target.value);
            setVolume(v);
            if (audioRef.current) audioRef.current.volume = v;
          }}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-sm text-gray-500 w-8">
          {Math.round(volume * 100)}
        </span>
      </div>
      {error && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
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

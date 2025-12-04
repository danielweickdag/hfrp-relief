"use client";

import type React from "react";
import { useRef, useEffect } from "react";

interface BackgroundVideoProps {
  src: string;
  fallbackImage?: string;
  overlay?: boolean;
  overlayOpacity?: number;
  className?: string;
  children?: React.ReactNode;
}

export function BackgroundVideo({
  src,
  fallbackImage,
  overlay = true,
  overlayOpacity = 0.5,
  className = "",
  children,
}: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Ensure video plays automatically and loops
      video.play().catch((error) => {
        console.log("Video autoplay prevented:", error);
      });
    }
  }, []);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onError={(e) => {
          console.error("Video failed to load:", e);
          // Hide video element on error
          if (videoRef.current) {
            videoRef.current.style.display = "none";
          }
        }}
      >
        <source src={src} type="video/mp4" />
        {fallbackImage && (
          <img
            src={fallbackImage}
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      {overlay && (
        <div
          className="absolute inset-0 bg-black z-10"
          style={{ opacity: overlayOpacity }}
        />
      )}

      {/* Content */}
      <div className="relative z-20 h-full">{children}</div>
    </div>
  );
}

export default BackgroundVideo;

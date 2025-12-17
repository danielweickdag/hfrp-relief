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
      parameters: Record<string, unknown>
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

  // Enhanced video playback management with improved error handling and performance
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    let userHasInteracted = false;
    let retryCount = 0;
    const maxRetries = 3;

    // Utility: wait for a media event with timeout
    const waitForEvent = (
      target: HTMLVideoElement,
      eventName: keyof HTMLMediaElementEventMap,
      timeoutMs = 1500
    ) => {
      return new Promise<boolean>((resolve) => {
        let done = false as boolean;
        const onEvent = () => {
          if (!done) {
            done = true;
            cleanup();
            resolve(true);
          }
        };
        const timer = setTimeout(() => {
          if (!done) {
            done = true;
            cleanup();
            resolve(false);
          }
        }, timeoutMs);
        const cleanup = () => {
          clearTimeout(timer);
          target.removeEventListener(eventName as string, onEvent);
        };
        target.addEventListener(eventName as string, onEvent, { once: true });
      });
    };

    // Choose a valid source proactively (checks local files & content-type), then test playability
    const chooseSource = async () => {
      const primary = "/downloads/Haitian-Family-Project-2.mp4";
      const alt = "/homepage-video.mp4";
      // Allow explicit local file from public folder via env var
      const preferredLocal = process.env.NEXT_PUBLIC_BG_VIDEO_PATH?.trim();
      // Prefer env-provided remote video if available; otherwise use the provided Zig link
      const preferredRemote =
        process.env.NEXT_PUBLIC_BG_VIDEO_URL?.trim() ??
        "https://video.zig.ht/v/arx7xtmfj2ch5vy8dda2f";
      const remoteSample =
        "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

      const isVideo = (ct: string | null) => !!ct && ct.startsWith("video/");

      const tryCandidate = async (candidate: string): Promise<boolean> => {
        try {
          // For remote sources, allow cross-origin for better compatibility
          if (candidate.startsWith("http")) {
            videoElement.crossOrigin = "anonymous";
          }
          videoElement.src = candidate;
          videoElement.load();
        } catch {}
        // Wait briefly for canplay; if it doesn't arrive, treat as not playable
        const playable = await waitForEvent(videoElement, "canplay", 1600);
        if (!playable) {
          console.log("📹 Candidate did not reach canplay in time:", candidate);
        }
        return playable;
      };

      let chosen: string | null = null;

      try {
        // 0) Try explicit local path if provided (must be served from /public)
        // Avoid HEAD to reduce noisy aborted network logs; trust local asset
        if (preferredLocal) {
          videoElement.src = preferredLocal;
          chosen = preferredLocal;
        }

        // Prefer local primary immediately to avoid remote probes causing abort logs
        if (!chosen) {
          videoElement.src = primary;
          chosen = primary;
        }

        // 1) Try the preferred remote only if a source hasn't been chosen yet and an explicit URL is provided
        if (!chosen) {
          try {
            const resRemote = await fetch(preferredRemote, { method: "HEAD" });
            const ctRemote = resRemote.headers.get("content-type");
            const headSaysVideo = resRemote.ok && isVideo(ctRemote);

            if (headSaysVideo) {
              const remoteOk = await tryCandidate(preferredRemote);
              if (remoteOk) {
                chosen = preferredRemote;
              }
            }

            // If HEAD didn't confirm a direct video, attempt resolver
            if (!headSaysVideo && !chosen) {
              console.log(
                "📹 Preferred remote not confirmed as direct video; attempting resolver",
                preferredRemote,
                ctRemote
              );
              try {
                const resolveRes = await fetch(
                  `/api/video-resolve?viewer=${encodeURIComponent(preferredRemote)}`,
                  { method: "GET" }
                );
                if (resolveRes.ok) {
                  const data = (await resolveRes.json()) as { mp4Url?: string };
                  if (data?.mp4Url) {
                    const ok = await tryCandidate(data.mp4Url);
                    if (ok) {
                      chosen = data.mp4Url;
                    }
                  }
                }
              } catch (e) {
                console.log("📹 Resolver failed:", e);
              }
            }
          } catch (e) {
            // Network/CORS errors on HEAD — still try resolver before falling back
            console.log("📹 HEAD check failed; attempting resolver:", e);
            try {
              const resolveRes = await fetch(
                `/api/video-resolve?viewer=${encodeURIComponent(preferredRemote)}`,
                { method: "GET" }
              );
              if (resolveRes.ok) {
                const data = (await resolveRes.json()) as { mp4Url?: string };
                if (data?.mp4Url) {
                  const ok = await tryCandidate(data.mp4Url);
                  if (ok) {
                    chosen = data.mp4Url;
                  }
                }
              }
            } catch (resolverErr) {
              console.log(
                "📹 Resolver also failed after HEAD error:",
                resolverErr
              );
            }
          }
        }

        if (!chosen) {
          videoElement.src = primary;
          chosen = primary;

          if (!chosen) {
            const resAlt = await fetch(alt, { method: "HEAD" });
            if (resAlt.ok && isVideo(resAlt.headers.get("content-type"))) {
              videoElement.src = alt;
              chosen = alt;
            }
          }

          if (!chosen) {
            console.log(
              "📹 Sources missing/invalid or not playable; using remote sample fallback"
            );
            videoElement.src = remoteSample;
            videoElement.crossOrigin = "anonymous";
            chosen = remoteSample;
          }
        }
      } catch {
        // Network/CORS issues — use remote fallback so we don't stall
        videoElement.src = remoteSample;
        videoElement.crossOrigin = "anonymous";
        chosen = remoteSample;
      } finally {
        try {
          videoElement.load();
          // Nudge playback to start as soon as possible
          setTimeout(() => {
            videoElement
              .play()
              .then(() =>
                console.log("✅ Video play nudged after source selection")
              )
              .catch((e) => console.log("📹 Play nudge failed:", e));
          }, 140);
        } catch {}
        if (chosen) {
          console.log("📹 Final chosen video src:", chosen);
        }
      }
    };
    // Kick off source selection
    void chooseSource();

    // Optimize video loading for mobile devices
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      videoElement.preload = "metadata";
    } else {
      videoElement.preload = "auto";
    }

    // Ensure loop is explicitly set for all browsers
    videoElement.loop = true;
    videoElement.setAttribute("loop", "true");
    // Mute to improve autoplay reliability across browsers
    videoElement.muted = true;
    console.log("📹 Video loop explicitly set:", videoElement.loop);

    // Immediate play attempt
    const immediatePlay = () => {
      videoElement
        .play()
        .then(() => {
          console.log("✅ Video started playing immediately");
        })
        .catch((error) => {
          console.log(
            "📹 Immediate autoplay blocked, will retry after user interaction:",
            error
          );
        });
    };

    // Try to play immediately if possible
    if (videoElement.readyState >= 2) {
      immediatePlay();
    } else {
      videoElement.addEventListener("loadeddata", immediatePlay, {
        once: true,
      });
    }

    // Enhanced play function with retry logic
    const playVideo = async () => {
      if (!videoElement) return;

      try {
        // Ensure video is ready
        if (videoElement.readyState >= 2) {
          await videoElement.play();
          retryCount = 0; // Reset retry count on successful play
          console.log("✅ Video playing successfully");
        } else {
          console.log("📹 Video not ready, waiting...");
          setTimeout(playVideo, 500);
        }
      } catch (error) {
        console.log(`Video play attempt ${retryCount + 1} failed:`, error);

        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(playVideo, 1000 * retryCount); // Exponential backoff
        } else {
          console.warn("Maximum video play retries reached");
        }
      }
    };

    // Function to ensure video is playing with better error handling
    const ensureVideoPlays = () => {
      if (!videoElement) return;

      if (videoElement.paused && !videoElement.ended) {
        playVideo();
      }
    };

    // Check video status with reduced frequency for better performance
    const videoCheckInterval = setInterval(ensureVideoPlays, 10000);

    // Enhanced visibility change handler
    const handleVisibilityChange = () => {
      if (!document.hidden && videoElement) {
        // Reset video position if it's been paused for too long
        if (videoElement.paused && videoElement.currentTime > 0) {
          videoElement.currentTime = 0;
        }
        setTimeout(ensureVideoPlays, 200);
      }
    };

    // Improved user interaction handler
    const handleUserInteraction = () => {
      if (!userHasInteracted) {
        userHasInteracted = true;
        playVideo();

        // Remove listeners after first successful interaction
        document.removeEventListener("click", handleUserInteraction);
        document.removeEventListener("touchstart", handleUserInteraction);
        document.removeEventListener("keydown", handleUserInteraction);

        console.log("✅ User interaction detected, video should now autoplay");
      }
    };

    // Enhanced video event handlers
    const handleLoadedData = () => {
      console.log("📹 Video data loaded");
      if (userHasInteracted || document.visibilityState === "visible") {
        playVideo();
      }
    };

    const handleCanPlay = () => {
      console.log("📹 Video can play");
      if (userHasInteracted || !videoElement.paused) {
        playVideo();
      }
    };

    const handleEnded = () => {
      console.log(
        "📹 Video ended - loop attribute should restart automatically"
      );
      // Don't manually restart - let the loop attribute handle it
      // If for some reason loop fails, restart after a short delay
      setTimeout(() => {
        if (
          videoElement.currentTime === videoElement.duration &&
          videoElement.paused
        ) {
          console.log("📹 Loop failed, manually restarting");
          videoElement.currentTime = 0;
          playVideo();
        }
      }, 100);
    };

    // Note: rely on the <video onError> handler in JSX below to avoid
    // double-handling errors that can cause aborted loads.

    const handlePause = () => {
      // Only restart if not paused intentionally and video should be playing
      if (document.visibilityState === "visible" && userHasInteracted) {
        console.log("📹 Video paused unexpectedly, attempting restart");
        setTimeout(playVideo, 100);
      }
    };

    const handleTimeUpdate = () => {
      // Ensure video continues playing and doesn't get stuck
      if (
        videoElement &&
        videoElement.currentTime > 0 &&
        videoElement.paused &&
        !videoElement.ended
      ) {
        console.log("📹 Video seems stuck, attempting to resume");
        playVideo();
      }
    };

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("touchstart", handleUserInteraction);
    document.addEventListener("keydown", handleUserInteraction);

    if (videoElement) {
      videoElement.addEventListener("loadeddata", handleLoadedData);
      videoElement.addEventListener("canplay", handleCanPlay);
      videoElement.addEventListener("ended", handleEnded);
      // Do not attach a duplicate error handler here; the JSX onError covers fallbacks
      videoElement.addEventListener("pause", handlePause);
      videoElement.addEventListener("timeupdate", handleTimeUpdate);
    }

    // Initial play attempt with delay to ensure DOM is ready
    const initialPlayTimer = setTimeout(() => {
      if (videoElement.readyState >= 2) {
        // HAVE_CURRENT_DATA
        playVideo();
      }
    }, 1500);

    return () => {
      clearInterval(videoCheckInterval);
      clearTimeout(initialPlayTimer);

      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);

      if (videoElement) {
        videoElement.removeEventListener("loadeddata", handleLoadedData);
        videoElement.removeEventListener("canplay", handleCanPlay);
        videoElement.removeEventListener("ended", handleEnded);
        // No error listener attached above
        videoElement.removeEventListener("pause", handlePause);
        videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
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
        {showVideo ? (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            webkit-playsinline="true"
            x5-playsinline="true"
            x5-video-player-type="h5"
            x5-video-player-fullscreen="true"
            controls={false}
            disablePictureInPicture
            className="fixed inset-0 w-full h-full object-cover z-[-10] transform-gpu"
            poster="/hfrp-logo.png"
            style={{
              backgroundColor: "#1f2937",
              backgroundImage:
                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
            onError={(e) => {
              const video = e.currentTarget;
              const mediaError = video.error;
              const currentSrc = video.currentSrc || video.src;
              const hasSrc = !!currentSrc && currentSrc !== "";
              const code = mediaError?.code ?? null;
              const codeName =
                code === 1
                  ? "MEDIA_ERR_ABORTED"
                  : code === 2
                    ? "MEDIA_ERR_NETWORK"
                    : code === 3
                      ? "MEDIA_ERR_DECODE"
                      : code === 4
                        ? "MEDIA_ERR_SRC_NOT_SUPPORTED"
                        : "UNKNOWN";

              console.error(
                `📹 Video failed to load: code=${code ?? "null"} name=${codeName} src=${currentSrc || "(none)"} networkState=${video.networkState} readyState=${video.readyState}`
              );

              // Set fallback background on container
              if (video.parentElement) {
                video.parentElement.style.backgroundColor = "#1f2937";
                video.parentElement.style.backgroundImage =
                  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
              }

              // Prefer remote fallback if no source is set or src not supported
              if (
                !video.dataset.remoteFallbackTried &&
                (!hasSrc || code === 4)
              ) {
                video.dataset.remoteFallbackTried = "true";
                const remoteSrc =
                  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
                console.log(
                  `📹 Using remote fallback due to ${!hasSrc ? "no src" : "SRC_NOT_SUPPORTED"}: ${remoteSrc}`
                );
                // Switch to remote fallback without clearing existing src to avoid
                // triggering unnecessary aborted network errors in dev tools
                video.src = remoteSrc;
                video.crossOrigin = "anonymous";
                try {
                  video.load();
                  setTimeout(() => {
                    video
                      .play()
                      .then(() => console.log("✅ Remote fallback playing"))
                      .catch((e) =>
                        console.log("📹 Remote fallback play failed:", e)
                      );
                  }, 120);
                } catch {}
                return;
              }

              // Try alternative local source once using robust currentSrc detection
              if (!video.dataset.fallbackTried) {
                video.dataset.fallbackTried = "true";
                // Always fall back to the known local homepage video
                const altSrc = "/homepage-video.mp4";
                console.log(
                  "📹 Trying alternative local video source:",
                  altSrc
                );
                video.src = altSrc;
                video.load();
                return; // Wait to see if the alternate source works
              }

              // Try a remote sample video once before disabling
              if (!video.dataset.remoteFallbackTried) {
                video.dataset.remoteFallbackTried = "true";
                const remoteSrc =
                  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
                console.log("📹 Trying remote fallback video:", remoteSrc);
                video.src = remoteSrc;
                video.crossOrigin = "anonymous";
                try {
                  video.load();
                } catch {}
                return; // Let the remote fallback attempt proceed
              }

              // If fallback already attempted, disable video to avoid loops
              setShowVideo(false);
            }}
            onLoadStart={() => {
              console.log("📹 Video loading started");
            }}
            onLoadedMetadata={() => {
              console.log("📹 Video metadata loaded");
            }}
            onLoadedData={() => {
              console.log("📹 Video data loaded - attempting to play");
              const video = videoRef.current;
              if (video) {
                video
                  .play()
                  .catch((e) => console.log("📹 Autoplay prevented:", e));
              }
            }}
            onCanPlay={() => {
              console.log("📹 Video ready to play");
              const video = videoRef.current;
              if (video && video.paused) {
                video
                  .play()
                  .catch((e) => console.log("📹 Play attempt failed:", e));
              }
            }}
            onCanPlayThrough={() => {
              console.log("📹 Video can play through without buffering");
            }}
            onPlaying={() => {
              console.log("📹 Video is playing");
            }}
            onWaiting={() => {
              console.log("📹 Video is buffering");
            }}
            onEnded={() => {
              console.log("📹 Video ended - should loop automatically");
            }}
          >
            {/* Source is set programmatically after HEAD checks; removing static source avoids early load errors */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
              <p className="text-white text-lg font-medium">
                Your browser does not support video playback.
              </p>
            </div>
          </video>
        ) : (
          <div
            className="fixed inset-0 z-[-10]"
            style={{
              backgroundColor: "#1f2937",
              backgroundImage:
                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
            aria-hidden="true"
          />
        )}

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
      parameters: Record<string, unknown>
    ) => void;
  }
}

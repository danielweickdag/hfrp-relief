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
    const waitForEvent = (target: HTMLVideoElement, eventName: keyof HTMLMediaElementEventMap, timeoutMs = 1500) => {
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
      const primary = "/homepage-video.mp4";
      const alt = "/haitian-family-project.mp4";
      // Prefer env-provided remote video if available; otherwise use the provided Zig link
      const preferredRemote =
        (process.env.NEXT_PUBLIC_BG_VIDEO_URL?.trim() ??
          "https://video.zig.ht/v/arx7xtmfj2ch5vy8dda2f");
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
        // 1) Try the preferred remote: use direct video if HEAD reports video
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
            console.log("📹 Resolver also failed after HEAD error:", resolverErr);
          }
        }

        // 2) If not chosen, probe and try local primary
        const res = await fetch(primary, { method: "HEAD" });
        if (res.ok && isVideo(res.headers.get("content-type"))) {
          const ok = await tryCandidate(primary);
          if (ok) chosen = primary;
        }

        if (!chosen) {
          const resAlt = await fetch(alt, { method: "HEAD" });
          if (resAlt.ok && isVideo(resAlt.headers.get("content-type"))) {
            const ok = await tryCandidate(alt);
            if (ok) chosen = alt;
          }
        }

        if (!chosen) {
          console.log("📹 Sources missing/invalid or not playable; using remote sample fallback");
          videoElement.src = remoteSample;
          videoElement.crossOrigin = "anonymous";
          chosen = remoteSample;
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
              .then(() => console.log("✅ Video play nudged after source selection"))
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

    const handleError = (event: Event) => {
      const target = event.target as HTMLVideoElement;
      console.error("📹 Video error:", target.error);

      // Try alternative video source if primary fails
      if (target.src.includes("Hatian family project.mp4")) {
        console.log("📹 Trying alternative video source");
        target.src = "/homepage-video.mp4";
        target.load();
      }
    };

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
      videoElement.addEventListener("error", handleError);
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
        videoElement.removeEventListener("error", handleError);
        videoElement.removeEventListener("pause", handlePause);
        videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
  }, []);

  return (
    <>
      <section
        className="relative flex flex-col gap-12 items-center text-center pt-16 min-h-[95vh] justify-center"
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
              if (!video.dataset.remoteFallbackTried && (!hasSrc || code === 4)) {
                video.dataset.remoteFallbackTried = "true";
                const remoteSrc =
                  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
                console.log(
                  `📹 Using remote fallback due to ${!hasSrc ? "no src" : "SRC_NOT_SUPPORTED"}: ${remoteSrc}`
                );
                try {
                  // Clear failing src to avoid stale errors
                  video.src = "";
                } catch {}
                video.src = remoteSrc;
                video.crossOrigin = "anonymous";
                try {
                  video.load();
                  setTimeout(() => {
                    video
                      .play()
                      .then(() => console.log("✅ Remote fallback playing"))
                      .catch((e) => console.log("📹 Remote fallback play failed:", e));
                  }, 120);
                } catch {}
                return;
              }

              // Try alternative local source once using currentSrc detection
              if (!video.dataset.fallbackTried) {
                video.dataset.fallbackTried = "true";
                const altSrc = currentSrc?.endsWith("/homepage-video.mp4")
                  ? "/haitian-family-project.mp4"
                  : "/homepage-video.mp4";
                console.log("📹 Trying alternative local video source:", altSrc);
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
            <h2 className="text-4xl font-bold tracking-tight text-white drop-shadow-2xl">
              Haitian Family Relief Project
            </h2>
            <p className="mt-2 max-w-xl text-lg text-gray-100 drop-shadow-xl font-medium">
              Welcome to our family! We're spreading love, hope, and joy to
              beautiful families in Haiti. Every meal, every smile, every
              helping hand makes our world brighter—and you can be part of this
              incredible journey.
            </p>
          </div>

          {/* Donate Now Section */}
          <div className="w-full flex justify-center my-8">
            <div className="bg-gradient-to-r from-red-600/80 to-red-700/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center max-w-2xl border border-white/20">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Make an Impact Today
              </h3>
              <p className="text-red-100 text-lg mb-6">
                Your donation directly supports families in Haiti with food,
                healthcare, education, and safe housing.
              </p>
              <button
                onClick={() => router.push('/donate')}
                className="bg-white text-red-600 hover:bg-red-50 px-8 py-4 rounded-lg font-bold text-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto w-fit cursor-pointer"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                Donate Now
              </button>
            </div>
          </div>

          <div className="w-full flex justify-center my-8">
            <blockquote className="border-l-4 border-blue-600 bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-xl max-w-xl text-center mx-auto">
              <div className="italic text-lg text-zinc-700 mb-2">
                "The best way to find yourself is to lose yourself in the
                service of others."
              </div>
              <div className="text-right font-semibold text-blue-700">
                — Mahatma Gandhi
              </div>
            </blockquote>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full max-w-5xl px-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-4 sm:p-6 border-t-4 border-blue-600">
              <h3 className="text-lg font-bold mb-2 text-blue-700">
                💙 Our Heart & Mission
              </h3>
              <p className="text-zinc-700">
                We're here to bring hope, love, and essential support to
                families in Haiti. Through building safe homes, providing mobile
                healthcare, serving nutritious meals, and creating educational
                opportunities, we're building a brighter future together.
              </p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border-t-4 border-red-600">
              <h3 className="text-lg font-bold mb-3 text-red-700">
                ❤️ Love in Action
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🍽️</span>
                  <div>
                    <div className="font-semibold text-red-600">
                      2,500+ Meals Shared
                    </div>
                    <div className="text-sm text-zinc-600">
                      Bringing families together around nutritious meals daily
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🏥</span>
                  <div>
                    <div className="font-semibold text-blue-600">
                      500+ Lives Touched
                    </div>
                    <div className="text-sm text-zinc-600">
                      Caring healthcare reaching families in their communities
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📚</span>
                  <div>
                    <div className="font-semibold text-green-600">
                      200+ Dreams Nurtured
                    </div>
                    <div className="text-sm text-zinc-600">
                      Educational opportunities helping children flourish
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🏠</span>
                  <div>
                    <div className="font-semibold text-orange-600">
                      15+ Families at Home
                    </div>
                    <div className="text-sm text-zinc-600">
                      Creating safe, loving spaces where families thrive
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border-t-4 border-purple-500">
              <h3 className="text-lg font-bold mb-2 text-purple-700">
                🤝 Join Our Family
              </h3>
              <p className="text-zinc-700">
                There's a place for everyone in our mission! Whether through
                donations, volunteering, or simply sharing our story, you can be
                part of bringing hope and joy to families in Haiti.
              </p>
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
            Your heart, your time, and your story can bring sunshine into
            someone's life. Join our amazing community of volunteers who are
            spreading love and making the world a little brighter every day!
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
    gtag?: (
      command: string,
      action: string,
      parameters: Record<string, unknown>
    ) => void;
  }
}

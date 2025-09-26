"use client";

import { useState } from "react";

interface SocialShareProps {
  url?: string;
  title?: string;
  description?: string;
  hashtags?: string[];
  className?: string;
}

export default function SocialShare({
  url = typeof window !== "undefined" ? window.location.href : "",
  title = "Haitian Family Relief Project",
  description = "Fighting hunger, providing hope. Together, we feed and empower Haitian orphans.",
  hashtags = ["HaitianFamilyRelief", "Hope4Haiti", "MakeADifference"],
  className = "",
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const hashtagString = hashtags.map((tag) => `#${tag}`).join(" ");

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=${hashtags.join(",")}`,
    instagram: "https://www.instagram.com/", // Instagram doesn't support direct URL sharing
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${url}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const openShare = (platform: keyof typeof shareLinks) => {
    if (platform === "instagram") {
      // For Instagram, we'll just open their page since they don't support URL sharing
      window.open("https://instagram.com/familyreliefproject", "_blank");
      return;
    }

    window.open(shareLinks[platform], "_blank", "width=600,height=400");
  };

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <span className="text-sm font-medium text-gray-600">Share:</span>

      {/* Facebook */}
      <button
        onClick={() => openShare("facebook")}
        className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all transform hover:scale-105"
        aria-label="Share on Facebook"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        Facebook
      </button>

      {/* Twitter */}
      <button
        onClick={() => openShare("twitter")}
        className="flex items-center gap-2 px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-all transform hover:scale-105"
        aria-label="Share on Twitter"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Twitter
      </button>

      {/* Instagram */}
      <button
        onClick={() => openShare("instagram")}
        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg text-sm font-medium transition-all transform hover:scale-105"
        aria-label="Visit our Instagram"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988c6.62 0 11.987-5.367 11.987-11.988C24.014 5.367 18.637.001 12.017.001zm6.624 13.684c-.003 1.518-.458 2.942-1.314 4.098-.859 1.159-2.051 2.015-3.438 2.468-1.388.452-2.876.452-4.264 0-1.387-.453-2.579-1.309-3.438-2.468-.856-1.156-1.311-2.58-1.314-4.098.003-1.518.458-2.942 1.314-4.098.859-1.159 2.051-2.015 3.438-2.468 1.388-.452 2.876-.452 4.264 0 1.387.453 2.579 1.309 3.438 2.468.856 1.156 1.311 2.58 1.314 4.098z" />
        </svg>
        Instagram
      </button>

      {/* WhatsApp */}
      <button
        onClick={() => openShare("whatsapp")}
        className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-all transform hover:scale-105"
        aria-label="Share on WhatsApp"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.484 3.488" />
        </svg>
        WhatsApp
      </button>

      {/* Copy Link */}
      <button
        onClick={copyToClipboard}
        className="flex items-center gap-2 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-all transform hover:scale-105"
        aria-label="Copy link"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

// Hook for social media integration
export function useSocialMedia() {
  const shareStory = (story: {
    title: string;
    description: string;
    url?: string;
  }) => {
    const shareUrl =
      story.url || (typeof window !== "undefined" ? window.location.href : "");

    return {
      facebook: () =>
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          "_blank",
        ),
      twitter: () =>
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(story.title)}&hashtags=HaitianFamilyRelief,Hope4Haiti`,
          "_blank",
        ),
      instagram: () =>
        window.open(
          "https://instagram.com/familyreliefproject",
          "_blank",
        ),
      whatsapp: () =>
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${story.title} ${shareUrl}`)}`,
          "_blank",
        ),
    };
  };

  const followUs = {
    facebook: () =>
        window.open("https://facebook.com/familyreliefproject", "_blank"),
      twitter: () => window.open("https://twitter.com/familyreliefproject", "_blank"),
      instagram: () =>
        window.open("https://instagram.com/familyreliefproject", "_blank"),
  };

  return { shareStory, followUs };
}

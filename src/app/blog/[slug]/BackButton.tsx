"use client";

import { useState } from "react";
import BackNavigation from "@/app/_components/BackNavigation";

interface PostData {
  [key: string]: string | undefined;
  title?: string;
  summary?: string;
  content?: string;
}

function socialShareLinks({
  title,
  summary,
}: { title?: string; summary?: string }) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  const encodedURL = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title || "");
  const encodedSummary = encodeURIComponent(summary || "");
  return [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedURL}`,
      icon: "🌐",
    },
    {
      label: "X / Twitter",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}%20${encodedURL}`,
      icon: "🐦",
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedURL}`,
      icon: "📱",
    },
    {
      label: "Email",
      href: `mailto:?subject=${encodedTitle}&body=${encodedSummary}%20${encodedURL}`,
      icon: "✉️",
    },
  ];
}

export default function BackButton({ post }: { post: PostData }) {
  const [copied, setCopied] = useState(false);
  const shareLinks = socialShareLinks({
    title: post.title,
    summary: post.summary,
  });

  function handleCopy() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  return (
    <>
      <BackNavigation
        text="← Back to Blog"
        href="/blog"
        className="mb-4"
      />
      <div className="flex gap-3 mb-5 mt-2">
        {shareLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-blue-50 hover:bg-blue-100 border-blue-600 border px-3 py-2 rounded flex items-center gap-1 font-bold text-blue-600 transition"
          >
            <span>{link.icon}</span> <span>{link.label}</span>
          </a>
        ))}
        <button
          className="text-xs bg-pink-100 hover:bg-pink-200 border-pink-600 border px-3 py-2 rounded flex items-center gap-1 font-bold text-pink-600 transition"
          onClick={handleCopy}
          type="button"
          title="Copy post link to clipboard for Instagram Story"
        >
          <span>📸</span> <span>{copied ? "Copied!" : "Instagram"}</span>
        </button>
      </div>
    </>
  );
}

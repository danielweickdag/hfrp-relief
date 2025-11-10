"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

interface BackNavigationProps {
  /** Custom text for the back button. Defaults to "← Back" */
  text?: string;
  /** Custom URL to navigate to instead of using router.back() */
  href?: string;
  /** Additional CSS classes */
  className?: string;
  /** Show as a simple link instead of button styling */
  variant?: "button" | "link";
  /** Custom icon or emoji. Defaults to "←" */
  icon?: string;
}

export default function BackNavigation({
  text = "← Back",
  href,
  className = "",
  variant = "button",
  icon = "←",
}: BackNavigationProps) {
  const router = useRouter();

  const handleBack = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  const baseClasses = variant === "button" 
    ? "inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 hover:underline transition-colors duration-200 font-medium"
    : "inline-flex items-center gap-1 text-gray-600 hover:text-gray-800 hover:underline transition-colors duration-200";

  const combinedClasses = `${baseClasses} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        <span>{icon}</span>
        <span>{text.replace("←", "").trim()}</span>
      </Link>
    );
  }

  return (
    <button
      onClick={handleBack}
      className={combinedClasses}
      type="button"
    >
      <span>{icon}</span>
      <span>{text.replace("←", "").trim()}</span>
    </button>
  );
}

// Specific variants for common use cases
export function BackToHome({ className = "" }: { className?: string }) {
  return (
    <BackNavigation
      text="← Back to Home"
      href="/"
      className={className}
    />
  );
}

export function BackToBlog({ className = "" }: { className?: string }) {
  return (
    <BackNavigation
      text="← Back to Blog"
      href="/blog"
      className={className}
    />
  );
}

export function BackToAdmin({ className = "" }: { className?: string }) {
  return (
    <BackNavigation
      text="← Back to Admin"
      href="/admin"
      className={className}
    />
  );
}

export function BackToDashboard({ className = "" }: { className?: string }) {
  return (
    <BackNavigation
      text="← Back to Dashboard"
      href="/dashboard"
      className={className}
    />
  );
}
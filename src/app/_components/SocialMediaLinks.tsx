"use client";

interface SocialMediaLinksProps {
  variant?: "footer" | "page" | "inline";
  showLabels?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function SocialMediaLinks({
  variant = "footer",
  showLabels = false,
  size = "md",
}: SocialMediaLinksProps) {
  const socialLinks = [
    {
      name: "Facebook",
      url: "https://facebook.com/haitianfamilyreliefproject",
      icon: (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      color: "bg-blue-600 hover:bg-blue-700",
      description: "Follow us for daily updates and stories from Haiti",
    },
    {
      name: "Instagram",
      url: "https://instagram.com/haitianfamilyreliefproject",
      icon: (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988c6.62 0 11.987-5.367 11.987-11.988C24.014 5.367 18.637.001 12.017.001zM8.448 16.988c-1.297 0-2.448-1.151-2.448-2.448s1.151-2.448 2.448-2.448c1.297 0 2.448 1.151 2.448 2.448s-1.151 2.448-2.448 2.448zm7.104 0c-1.297 0-2.448-1.151-2.448-2.448s1.151-2.448 2.448-2.448c1.297 0 2.448 1.151 2.448 2.448s-1.151 2.448-2.448 2.448z" />
        </svg>
      ),
      color:
        "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
      description: "See photos and videos from our programs",
    },
    {
      name: "Twitter",
      url: "https://twitter.com/hfrproject",
      icon: (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      color: "bg-gray-900 hover:bg-gray-800",
      description: "Get real-time updates and news",
    },
    {
      name: "YouTube",
      url: "https://youtube.com/@haitianfamilyreliefproject",
      icon: (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
      color: "bg-red-600 hover:bg-red-700",
      description: "Watch documentaries and impact videos",
    },
    {
      name: "TikTok",
      url: "https://tiktok.com/@hfrproject",
      icon: (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      ),
      color: "bg-black hover:bg-gray-800",
      description: "Short-form content and behind-the-scenes",
    },
  ];

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-8 h-8";
      case "lg":
        return "w-12 h-12";
      default:
        return "w-10 h-10";
    }
  };

  const getContainerClasses = () => {
    switch (variant) {
      case "page":
        return "flex flex-wrap justify-center gap-4";
      case "inline":
        return "flex gap-3";
      default:
        return "flex justify-center gap-4";
    }
  };

  if (variant === "page" && showLabels) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {socialLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 ${link.color} text-white px-4 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg`}
          >
            <div className={getSizeClasses()}>{link.icon}</div>
            <div className="flex-1">
              <div className="font-semibold">{link.name}</div>
              <div className="text-xs opacity-90">{link.description}</div>
            </div>
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className={getContainerClasses()}>
      {socialLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          data-track={`social-${link.name.toLowerCase()}`}
          className={`inline-flex items-center justify-center ${getSizeClasses()} ${
            variant === "footer"
              ? "bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full border border-white/30 text-white"
              : `${link.color} text-white rounded-lg`
          } shadow-lg transition-all transform hover:scale-105`}
          aria-label={`Follow us on ${link.name}`}
          title={link.description}
        >
          {showLabels && variant !== "footer" ? (
            <>
              <div className="w-5 h-5 mr-2">{link.icon}</div>
              {link.name}
            </>
          ) : (
            link.icon
          )}
        </a>
      ))}
    </div>
  );
}

// Hashtags and social media ready content
export const socialHashtags = [
  "#HaitianFamilyRelief",
  "#Hope4Haiti",
  "#FeedingHope",
  "#HaitiChildren",
  "#CommunitySupport",
  "#TransformingLives",
  "#EducationMatters",
  "#HealthcareForAll",
  "#SustainableChange",
  "#TogetherForHaiti",
];

export const socialContent = {
  mission:
    "Fighting hunger, providing hope. Together, we feed and empower Haitian orphans. Join our mission! 🇭🇹❤️",
  impact:
    "Your support transforms lives! 850+ meals served daily, 300+ children in school, 5 community centers strong! 💪",
  donate:
    "16¢ a day = 1 week of meals for a child. Small daily commitment, HUGE impact! Start your daily giving today! 🍽️",
  education:
    "Education breaks the cycle of poverty. See how we're empowering children with knowledge and hope! 📚✨",
  healthcare:
    "Healthcare is a human right. Our mobile clinics bring medical care to those who need it most! 🏥❤️",
};

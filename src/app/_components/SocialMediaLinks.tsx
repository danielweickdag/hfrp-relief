"use client";

interface SocialMediaLinksProps {
  variant?: "footer" | "page" | "inline";
  showLabels?: boolean;
  size?: "sm" | "md" | "lg";
  socialIconSettings?: {
    facebook: boolean;
    instagram: boolean;
    twitter: boolean;
    youtube: boolean;
    tiktok: boolean;
  };
}

export default function SocialMediaLinks({
  variant = "footer",
  showLabels = false,
  size = "md",
  socialIconSettings = {
    facebook: true,
    instagram: true,
    twitter: true,
    youtube: true,
    tiktok: true,
  },
}: SocialMediaLinksProps) {
  const socialLinks = [
    {
      name: "Facebook",
      url: "https://facebook.com/familyreliefproject",
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
      url: "https://instagram.com/familyreliefproject",
      icon: (
        <svg
          className="w-full h-full"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.917 3.917 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.703.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.916 3.916 0 0 0-.923-1.417A3.916 3.916 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.47 2.47 0 0 1-.92-.598 2.47 2.47 0 0 1-.598-.919c-.11-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.232s.008-2.389.046-3.232c.035-.78.166-1.204.275-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.843-.038 1.096-.047 3.232-.047h.001zM8 4.658a3.342 3.342 0 1 0 0 6.684 3.342 3.342 0 0 0 0-6.684zm0 5.431a2.089 2.089 0 1 1 0-4.178 2.089 2.089 0 0 1 0 4.178zM12.64 3.102a.96.96 0 1 1-1.92 0 .96.96 0 0 1 1.92 0z" />
        </svg>
      ),
      color:
        "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
      description: "See photos and videos from our programs",
    },
    {
      name: "Twitter",
      url: "https://twitter.com/familyreliefproject",
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
  ].filter((link) => socialIconSettings[link.name.toLowerCase() as keyof typeof socialIconSettings]);

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

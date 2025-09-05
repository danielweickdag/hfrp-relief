"use client";

import { useEffect } from "react";
import Script from "next/script";

interface GoogleAnalyticsProps {
  measurementId?: string;
}

export default function GoogleAnalytics({
  measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-XXXXXXXXXX",
}: GoogleAnalyticsProps) {
  useEffect(() => {
    // Initialize dataLayer
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: unknown[]) {
        window.dataLayer.push(args);
      }

      // Configure Google Analytics
      gtag("js", new Date());
      gtag("config", measurementId, {
        page_title: document.title,
        page_location: window.location.href,
      });

      // Enhanced event tracking for HFRP website

      // Track donation clicks
      const trackDonationClick = (element: HTMLElement) => {
        const campaign = element.getAttribute("data-campaign") || "unknown";
        const amount = element.getAttribute("data-amount") || 0;

        gtag("event", "donate_button_click", {
          event_category: "Donations",
          event_label: campaign,
          value: Number(amount),
          currency: "USD",
        });

        console.log("📊 Analytics: Donation click tracked", {
          campaign,
          amount,
        });
      };

      // Track contact form submissions
      const trackContactSubmit = () => {
        gtag("event", "contact_form_submit", {
          event_category: "Contact",
          event_label: "website_contact_form",
        });

        console.log("📊 Analytics: Contact form submission tracked");
      };

      // Track gallery interactions
      const trackGalleryView = (imageId: string, category: string) => {
        gtag("event", "gallery_image_view", {
          event_category: "Gallery",
          event_label: category,
          custom_parameters: {
            image_id: imageId,
          },
        });

        console.log("📊 Analytics: Gallery image view tracked", {
          imageId,
          category,
        });
      };

      // Track program page views
      const trackProgramView = (programType: string) => {
        gtag("event", "program_page_view", {
          event_category: "Programs",
          event_label: programType,
        });

        console.log("📊 Analytics: Program page view tracked", { programType });
      };

      // Track newsletter signups
      const trackNewsletterSignup = () => {
        gtag("event", "newsletter_signup", {
          event_category: "Engagement",
          event_label: "footer_newsletter",
        });

        console.log("📊 Analytics: Newsletter signup tracked");
      };

      // Enhanced donation completion tracking
      const trackDonation = (
        amount: number,
        currency = "USD",
        campaign = "general",
      ) => {
        gtag("event", "purchase", {
          transaction_id: `donation_${Date.now()}`,
          value: amount,
          currency: currency,
          items: [
            {
              item_id: "donation",
              item_name: "HFRP Donation",
              item_category: "Charitable Giving",
              item_variant: campaign,
              quantity: 1,
              price: amount,
            },
          ],
        });

        console.log("📊 Analytics: Donation completed tracked", {
          amount,
          currency,
          campaign,
        });
      };

      // Setup event listeners for tracking

      // Track donation button clicks
      document.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        if (target.closest('[data-track="donate"]')) {
          const donateButton = target.closest(
            '[data-track="donate"]',
          ) as HTMLElement;
          trackDonationClick(donateButton);
        }

        // Track gallery image clicks
        if (target.closest('[data-track="gallery-image"]')) {
          const imageElement = target.closest(
            '[data-track="gallery-image"]',
          ) as HTMLElement;
          const imageId =
            imageElement.getAttribute("data-image-id") || "unknown";
          const category =
            imageElement.getAttribute("data-category") || "unknown";
          trackGalleryView(imageId, category);
        }
      });

      // Track form submissions
      document.addEventListener("submit", (e) => {
        const target = e.target as HTMLFormElement;
        if (target.id === "contact-form") {
          trackContactSubmit();
        }
      });

      // Track page views with custom data
      const trackPageView = () => {
        const path = window.location.pathname;
        let pageCategory = "General";

        if (path.includes("/programs/")) {
          pageCategory = "Programs";
          const programType = path.split("/programs/")[1] || "overview";
          trackProgramView(programType);
        } else if (path.includes("/gallery")) {
          pageCategory = "Gallery";
        } else if (path.includes("/donate")) {
          pageCategory = "Donations";
        } else if (path.includes("/contact")) {
          pageCategory = "Contact";
        }

        gtag("event", "page_view", {
          page_title: document.title,
          page_location: window.location.href,
          page_category: pageCategory,
        });
      };

      // Track initial page view
      trackPageView();

      // Make tracking functions globally available
      window.trackDonation = trackDonation;
      window.hfrpAnalytics = {
        trackDonation,
        trackContactSubmit,
        trackGalleryView,
        trackProgramView,
        trackNewsletterSignup,
      };
    }
  }, [measurementId]);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_title: document.title,
            page_location: window.location.href,
          });
        `}
      </Script>
    </>
  );
}

// Window interface extended in /src/types/global.d.ts

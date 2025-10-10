// Global type definitions for HFRP project

// Google Analytics gtag types
type GtagCommand = "js" | "config" | "event" | "get" | "set";
type GtagTarget = string | Date;
type GtagConfigParams = {
  page_title?: string;
  page_location?: string;
  page_path?: string;
  send_page_view?: boolean;
  custom_map?: Record<string, string>;
  [key: string]: unknown;
};
type GtagEventParams = {
  event_category?: string;
  event_label?: string;
  value?: number;
  currency?: string;
  transaction_id?: string;
  items?: unknown[];
  donation_type?: string;
  session_duration?: number;
  load_time?: number;
  scroll_depth?: number;
  form_type?: string;
  field_type?: string;
  [key: string]: unknown;
};

// Next.js Window extensions
interface NextJSWindow {
  next?: unknown;
  __NEXT_DATA__?: unknown;
  __REACT_DEVTOOLS_GLOBAL_HOOK__?: unknown;
}

// Analytics Window extensions
interface AnalyticsWindow {
  dataLayer: unknown[];
  gtag: {
    (command: "js", target: Date, params?: Record<string, unknown>): void;
    (command: "config", target: string, params?: GtagConfigParams): void;
    (command: "event", target: string, params?: GtagEventParams): void;
    (
      command: GtagCommand,
      target: GtagTarget,
      params?: Record<string, unknown>,
    ): void;
  };
  trackDonation?: (
    amount: number,
    currency?: string,
    campaign?: string,
  ) => void;
  hfrpAnalytics?: {
    trackDonation: (
      amount: number,
      currency?: string,
      campaign?: string,
    ) => void;
    trackContactSubmit: () => void;
    trackGalleryView: (imageId: string, category: string) => void;
    trackProgramView: (programType: string) => void;
    trackNewsletterSignup: () => void;
  };
}

// Extend global Window interface
declare global {
  interface Window extends NextJSWindow, AnalyticsWindow {
    hfrpEnablePrintFeatures?: () => void;
    hfrpEnableSiteFeatures?: () => void;
  }
}

export {};

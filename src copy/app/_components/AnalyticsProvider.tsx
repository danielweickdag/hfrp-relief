'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

// Types for analytics events
interface DonationEvent {
  event_name: string;
  amount?: number;
  donation_type?: 'one_time' | 'recurring';
  amount_category?: 'micro' | 'standard' | 'major';
  page_source?: string;
  button_id?: string;
  campaign_id?: string;
  user_journey_stage?: string;
  session_duration?: number;
  load_time?: number;
  scroll_depth?: number;
  form_type?: string;
  field_type?: string;
  conversion_rate?: number;
  dom_content_loaded?: number;
  page?: string;
  page_views_count?: number;
  first_byte?: number;
  donation_intents?: number;
  completed_donations?: number;
}

interface ConversionFunnelStage {
  stage: string;
  timestamp: number;
  page: string;
  data?: Record<string, unknown>;
}

interface UserSession {
  session_id: string;
  start_time: number;
  page_views: string[];
  funnel_stages: ConversionFunnelStage[];
  donation_intents: number;
  completed_donations: number;
  device_type: string;
  is_mobile: boolean;
  source?: string;
  medium?: string;
  campaign?: string;
}

interface AnalyticsContextType {
  trackEvent: (event: DonationEvent) => void;
  trackPageView: (page: string, title?: string) => void;
  trackDonationIntent: (amount: number, type: 'one_time' | 'recurring', source: string) => void;
  trackDonationClick: (amount: number, type: 'one_time' | 'recurring', buttonId: string) => void;
  trackDonationFormOpen: (amount: number, type: 'one_time' | 'recurring') => void;
  trackDonationComplete: (amount: number, type: 'one_time' | 'recurring', transactionId: string) => void;
  trackFunnelStage: (stage: string, data?: Record<string, unknown>) => void;
  getUserSession: () => UserSession;
  isAnalyticsEnabled: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

interface AnalyticsProviderProps {
  children: ReactNode;
  measurementId?: string;
  enableDebugMode?: boolean;
}

export function AnalyticsProvider({
  children,
  measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  enableDebugMode = process.env.NODE_ENV === 'development'
}: AnalyticsProviderProps) {
  const [isAnalyticsEnabled, setIsAnalyticsEnabled] = useState(false);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [funnelData, setFunnelData] = useState<ConversionFunnelStage[]>([]);

  useEffect(() => {
    initializeAnalytics();
    initializeUserSession();

    // Set up performance observers
    setupPerformanceTracking();

    // Set up scroll depth tracking
    setupScrollDepthTracking();

    // Set up form interaction tracking
    setupFormInteractionTracking();
  }, []);

  const initializeAnalytics = () => {
    if (!measurementId) {
      if (enableDebugMode) {
        console.warn('🔍 Google Analytics Measurement ID not provided');
      }
      return;
    }

    // Load Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    script.onload = () => {
      window.dataLayer = window.dataLayer || [];
      window.gtag = (...args: unknown[]) => {
        window.dataLayer.push(args);
      };

      // Initialize gtag with proper typing
      const gtag = window.gtag as (command: string, target: Date | string, params?: Record<string, unknown>) => void;
      gtag('js', new Date(), {});
      window.gtag('config', measurementId || 'G-XXXXXXXXXX', {
        // Enhanced ecommerce settings
        send_page_view: false, // We'll send manually for better control
        custom_map: {
          custom_parameter_1: 'donation_type',
          custom_parameter_2: 'amount_category',
          custom_parameter_3: 'user_journey_stage',
          custom_parameter_4: 'page_source'
        }
      });

      setIsAnalyticsEnabled(true);

      if (enableDebugMode) {
        console.log('✅ Google Analytics initialized');
        // Enable debug mode
        window.gtag('config', measurementId, {
          debug_mode: true
        });
      }
    };

    script.onerror = () => {
      console.error('❌ Failed to load Google Analytics');
    };
  };

  const initializeUserSession = () => {
    const sessionId = generateSessionId();
    const urlParams = new URLSearchParams(window.location.search);

    const session: UserSession = {
      session_id: sessionId,
      start_time: Date.now(),
      page_views: [],
      funnel_stages: [],
      donation_intents: 0,
      completed_donations: 0,
      device_type: getDeviceType(),
      is_mobile: isMobileDevice(),
      source: urlParams.get('utm_source') || document.referrer || 'direct',
      medium: urlParams.get('utm_medium') || 'organic',
      campaign: urlParams.get('utm_campaign') || undefined
    };

    setUserSession(session);

    // Store session in sessionStorage for persistence across page loads
    sessionStorage.setItem('hfrp_analytics_session', JSON.stringify(session));
  };

  const trackEvent = (event: DonationEvent) => {
    if (!isAnalyticsEnabled || !window.gtag) return;

    // Enhance event with session data
    const enhancedEvent = {
      ...event,
      session_id: userSession?.session_id,
      device_type: userSession?.device_type,
      is_mobile: userSession?.is_mobile,
      source: userSession?.source,
      medium: userSession?.medium,
      campaign: userSession?.campaign
    };

    window.gtag('event', event.event_name, enhancedEvent);

    if (enableDebugMode) {
      console.log('📊 Analytics Event:', enhancedEvent);
    }
  };

  const trackPageView = (page: string, title?: string) => {
    if (!isAnalyticsEnabled || !window.gtag) return;

    // Update user session
    if (userSession) {
      const updatedSession = {
        ...userSession,
        page_views: [...userSession.page_views, page]
      };
      setUserSession(updatedSession);
      sessionStorage.setItem('hfrp_analytics_session', JSON.stringify(updatedSession));
    }

    window.gtag('config', measurementId || 'G-XXXXXXXXXX', {
      page_title: title || document.title,
      page_location: window.location.href,
      page_path: page
    });

    // Track page-specific events
    if (page === '/donate') {
      trackFunnelStage('donation_page_view');
    } else if (page === '/') {
      trackFunnelStage('homepage_view');
    }

    if (enableDebugMode) {
      console.log('📄 Page View:', { page, title });
    }
  };

  const trackDonationIntent = (amount: number, type: 'one_time' | 'recurring', source: string) => {
    if (userSession) {
      const updatedSession = {
        ...userSession,
        donation_intents: userSession.donation_intents + 1
      };
      setUserSession(updatedSession);
    }

    trackEvent({
      event_name: 'donation_intent',
      amount,
      donation_type: type,
      amount_category: categorizeAmount(amount),
      page_source: source,
      user_journey_stage: 'intent'
    });

    trackFunnelStage('donation_intent', { amount, type, source });
  };

  const trackDonationClick = (amount: number, type: 'one_time' | 'recurring', buttonId: string) => {
    trackEvent({
      event_name: 'donate_button_click',
      amount,
      donation_type: type,
      amount_category: categorizeAmount(amount),
      button_id: buttonId,
      user_journey_stage: 'button_click'
    });

    trackFunnelStage('donation_button_click', { amount, type, buttonId });

    // Special tracking for daily giving
    if (type === 'recurring') {
      trackEvent({
        event_name: 'daily_giving_selected',
        amount,
        donation_type: type,
        amount_category: categorizeAmount(amount),
        button_id: buttonId
      });
    }
  };

  const trackDonationFormOpen = (amount: number, type: 'one_time' | 'recurring') => {
    trackEvent({
      event_name: 'donation_form_opened',
      amount,
      donation_type: type,
      amount_category: categorizeAmount(amount),
      user_journey_stage: 'form_open'
    });

    trackFunnelStage('donation_form_opened', { amount, type });
  };

  const trackDonationComplete = (amount: number, type: 'one_time' | 'recurring', transactionId: string) => {
    if (userSession) {
      const updatedSession = {
        ...userSession,
        completed_donations: userSession.completed_donations + 1
      };
      setUserSession(updatedSession);
    }

    // Enhanced ecommerce purchase event
    trackEvent({
      event_name: 'purchase',
      amount,
      donation_type: type,
      amount_category: categorizeAmount(amount),
      user_journey_stage: 'completed'
    });

    // Also send ecommerce purchase data
    if (window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: transactionId,
        value: amount,
        currency: 'USD',
        items: [{
          item_id: `donation_${type}`,
          item_name: `HFRP Donation - ${type === 'recurring' ? 'Monthly' : 'One-time'}`,
          category: 'Charitable Giving',
          quantity: 1,
          price: amount
        }]
      });
    }

    trackFunnelStage('donation_completed', { amount, type, transactionId });

    // Calculate and track conversion metrics
    trackConversionMetrics();
  };

  const trackFunnelStage = (stage: string, data?: Record<string, unknown>) => {
    const funnelStage: ConversionFunnelStage = {
      stage,
      timestamp: Date.now(),
      page: window.location.pathname,
      data
    };

    setFunnelData(prev => [...prev, funnelStage]);

    // Store in session storage
    const storedFunnel = sessionStorage.getItem('hfrp_funnel_data');
    const existingFunnel = storedFunnel ? JSON.parse(storedFunnel) : [];
    sessionStorage.setItem('hfrp_funnel_data', JSON.stringify([...existingFunnel, funnelStage]));

    if (enableDebugMode) {
      console.log('🔄 Funnel Stage:', funnelStage);
    }
  };

  const trackConversionMetrics = () => {
    if (!userSession) return;

    const sessionDuration = Date.now() - userSession.start_time;
    const conversionRate = userSession.completed_donations / Math.max(userSession.donation_intents, 1);

    trackEvent({
      event_name: 'conversion_metrics',
      session_duration: sessionDuration,
      conversion_rate: conversionRate,
      page_views_count: userSession.page_views.length,
      donation_intents: userSession.donation_intents,
      completed_donations: userSession.completed_donations
    });
  };

  const setupPerformanceTracking = () => {
    // Core Web Vitals tracking
    if ('web-vital' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            trackEvent({
              event_name: 'page_performance',
              load_time: navEntry.loadEventEnd - navEntry.loadEventStart,
              dom_content_loaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              first_byte: navEntry.responseStart - navEntry.requestStart
            });
          }
        }
      });

      observer.observe({ entryTypes: ['navigation'] });
    }
  };

  const setupScrollDepthTracking = () => {
    let maxScrollDepth = 0;
    const scrollMilestones = [25, 50, 75, 90, 100];
    const trackedMilestones: number[] = [];

    const trackScrollDepth = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );

      if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent;
      }

      // Track milestone achievements
      for (const milestone of scrollMilestones) {
        if (scrollPercent >= milestone && !trackedMilestones.includes(milestone)) {
          trackedMilestones.push(milestone);
          trackEvent({
            event_name: 'scroll_depth',
            scroll_depth: milestone,
            page: window.location.pathname
          });
        }
      }
    };

    let scrollTimeout: NodeJS.Timeout;
    const throttledScrollTracking = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(trackScrollDepth, 100);
    };

    window.addEventListener('scroll', throttledScrollTracking);

    // Track final scroll depth on page unload
    window.addEventListener('beforeunload', () => {
      if (maxScrollDepth > 0) {
        trackEvent({
          event_name: 'final_scroll_depth',
          scroll_depth: maxScrollDepth,
          page: window.location.pathname
        });
      }
    });
  };

  const setupFormInteractionTracking = () => {
    // Track form focus events
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        const form = target.closest('form');
        if (form) {
          trackEvent({
            event_name: 'form_interaction',
            form_type: form.id || form.className || 'unknown',
            field_type: (target as HTMLInputElement).type || target.tagName.toLowerCase(),
            page: window.location.pathname
          });
        }
      }
    });
  };

  // Utility functions
  const categorizeAmount = (amount: number): 'micro' | 'standard' | 'major' => {
    if (amount <= 50) return 'micro';
    if (amount <= 250) return 'standard';
    return 'major';
  };

  const generateSessionId = (): string => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const getDeviceType = (): string => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/tablet|ipad/.test(userAgent)) return 'tablet';
    if (/mobile|android|iphone/.test(userAgent)) return 'mobile';
    return 'desktop';
  };

  const isMobileDevice = (): boolean => {
    return /mobile|android|iphone/.test(navigator.userAgent.toLowerCase());
  };

  const getUserSession = (): UserSession => {
    return userSession || {
      session_id: 'unknown',
      start_time: Date.now(),
      page_views: [],
      funnel_stages: [],
      donation_intents: 0,
      completed_donations: 0,
      device_type: 'unknown',
      is_mobile: false
    };
  };

  const contextValue: AnalyticsContextType = {
    trackEvent,
    trackPageView,
    trackDonationIntent,
    trackDonationClick,
    trackDonationFormOpen,
    trackDonationComplete,
    trackFunnelStage,
    getUserSession,
    isAnalyticsEnabled
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

// HOC for automatic page view tracking
export function withAnalytics<P extends object>(
  Component: React.ComponentType<P>,
  pageName?: string
) {
  return function AnalyticsWrappedComponent(props: P) {
    const { trackPageView } = useAnalytics();

    useEffect(() => {
      const page = pageName || window.location.pathname;
      trackPageView(page);
    }, [trackPageView, pageName]);

    return <Component {...props} />;
  };
}

// Global analytics interface defined in /src/types/global.d.ts

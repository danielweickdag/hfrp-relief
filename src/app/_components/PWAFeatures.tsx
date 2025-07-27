'use client';

import { useEffect, useState } from 'react';

interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface OfflineDonationIntent {
  id: string;
  amount: number;
  recurring: boolean;
  timestamp: string;
}

declare global {
  interface Window {
    deferredPrompt?: PWAInstallPrompt;
  }
}

export default function PWAFeatures() {
  const [isOnline, setIsOnline] = useState(true);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [offlineIntents, setOfflineIntents] = useState<OfflineDonationIntent[]>([]);
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPrompt | null>(null);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia?.('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as unknown as PWAInstallPrompt);
      setCanInstall(true);

      // Show install prompt after user has been on site for 30 seconds
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallPrompt(true);
        }
      }, 30000);
    };

    // Listen for successful app installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setShowInstallPrompt(false);

      // Track installation
      if (window.gtag) {
        window.gtag('event', 'pwa_installed', {
          event_category: 'PWA',
          event_label: 'app_installed'
        });
      }
    };

    // Online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      checkOfflineIntents();

      if (window.gtag) {
        window.gtag('event', 'connection_restored', {
          event_category: 'PWA',
          event_label: 'back_online'
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);

      if (window.gtag) {
        window.gtag('event', 'connection_lost', {
          event_category: 'PWA',
          event_label: 'went_offline'
        });
      }
    };

    // Set initial online status
    setIsOnline(navigator.onLine);

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for offline donation intents on load
    checkOfflineIntents();

    // Register service worker
    registerServiceWorker();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isInstalled]);

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registered:', registration.scope);

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                showUpdateNotification();
              }
            });
          }
        });

        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
          await Notification.requestPermission();
        }

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    }
  };

  const showUpdateNotification = () => {
    if (confirm('A new version of HFRP is available. Would you like to update?')) {
      window.location.reload();
    }
  };

  const installApp = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        console.log('✅ User accepted PWA install');
        setShowInstallPrompt(false);
      } else {
        console.log('❌ User dismissed PWA install');
      }

      setDeferredPrompt(null);
      setCanInstall(false);
    } catch (error) {
      console.error('❌ Error installing PWA:', error);
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);

    // Don't show again for 24 hours
    localStorage.setItem('hfrp_install_dismissed', Date.now().toString());

    if (window.gtag) {
      window.gtag('event', 'pwa_install_dismissed', {
        event_category: 'PWA',
        event_label: 'install_dismissed'
      });
    }
  };

  const checkOfflineIntents = () => {
    try {
      const stored = localStorage.getItem('hfrp_donation_intents');
      if (stored) {
        const intents = JSON.parse(stored);
        setOfflineIntents(intents);
      }
    } catch (error) {
      console.error('Error checking offline intents:', error);
    }
  };

  const processOfflineIntents = () => {
    if (offlineIntents.length > 0) {
      // Redirect to donate page with offline resume flag
      window.location.href = '/donate?resume=offline';
    }
  };

  const clearOfflineIntents = () => {
    localStorage.removeItem('hfrp_donation_intents');
    setOfflineIntents([]);
  };

  const saveOfflineDonationIntent = (amount: number, recurring: boolean) => {
    const intent: OfflineDonationIntent = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      recurring,
      timestamp: new Date().toISOString()
    };

    try {
      const existing = JSON.parse(localStorage.getItem('hfrp_donation_intents') || '[]');
      const updated = [...existing, intent];
      localStorage.setItem('hfrp_donation_intents', JSON.stringify(updated));
      setOfflineIntents(updated);

      // Show notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('HFRP Donation Saved', {
          body: `Your $${amount} donation intent has been saved. We'll remind you to complete it when you're online.`,
          icon: '/icons/icon-192x192.png',
          tag: 'donation-saved'
        });
      }

      return true;
    } catch (error) {
      console.error('Error saving offline intent:', error);
      return false;
    }
  };

  return (
    <>
      {/* PWA Install Prompt */}
      {showInstallPrompt && canInstall && !isInstalled && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 animate-slide-up">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">❤️</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Install HFRP App
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Get quick access to donate and view our impact, even offline!
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={installApp}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Install
                </button>
                <button
                  onClick={dismissInstallPrompt}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Not now
                </button>
              </div>
            </div>
            <button
              onClick={dismissInstallPrompt}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Offline Status Banner */}
      {!isOnline && (
        <div className="fixed top-16 left-0 right-0 bg-yellow-500 text-black p-2 z-40 text-center text-sm font-medium">
          <span className="mr-2">🔌</span>
          You're offline. Some features may be limited, but you can still browse and save donation intents.
        </div>
      )}

      {/* Offline Donation Intents Notification */}
      {isOnline && offlineIntents.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-96 bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">💝</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-green-900 mb-1">
                Complete Your Donations
              </h3>
              <p className="text-sm text-green-700 mb-3">
                You have {offlineIntents.length} saved donation intent{offlineIntents.length > 1 ? 's' : ''} ready to complete.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={processOfflineIntents}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Complete Now
                </button>
                <button
                  onClick={clearOfflineIntents}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connection Status Indicator (for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-20 right-4 z-50">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isOnline ? '🌐 Online' : '🔌 Offline'}
          </div>
        </div>
      )}
    </>
  );
}

// Export utility functions for use in other components
// Note: saveOfflineDonationIntent is exported above as part of the component

// HFRP Service Worker - Enhanced PWA with Offline Donation Capability
const CACHE_NAME = 'hfrp-v1.2.0';
const OFFLINE_CACHE = 'hfrp-offline-v1.0.0';

// Critical resources to cache for offline functionality
const CRITICAL_RESOURCES = [
  '/',
  '/donate',
  '/gallery',
  '/impact',
  '/contact',
  '/offline',
  '/manifest.json',
  '/hfrp-logo.png'
];

// Donation-related resources for offline capability
const DONATION_RESOURCES = [
  '/donate',
  '/_next/static/chunks/app/donate/page.js',
  '/_next/static/css/app/layout.css'
];

// Images and media for offline viewing
const MEDIA_RESOURCES = [
  '/hfrp-logo.png',
  '/gallery/IMG-20250413-WA0006.jpg',
  '/gallery/IMG-20250413-WA0040.jpg',
  '/gallery/IMG-20250413-WA0014.jpg'
];

// Install event - Cache critical resources
self.addEventListener('install', (event) => {
  console.log('🚀 HFRP Service Worker installing...');

  event.waitUntil(
    Promise.all([
      // Cache critical resources
      caches.open(CACHE_NAME).then((cache) => {
        console.log('📦 Caching critical resources');
        return cache.addAll(CRITICAL_RESOURCES);
      }),

      // Cache offline page
      caches.open(OFFLINE_CACHE).then((cache) => {
        console.log('🔌 Caching offline resources');
        return cache.addAll(['/offline']);
      })
    ]).then(() => {
      console.log('✅ HFRP Service Worker installed successfully');
      // Force activation of new service worker
      return self.skipWaiting();
    })
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('⚡ HFRP Service Worker activating...');

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),

      // Take control of all clients
      self.clients.claim()
    ]).then(() => {
      console.log('✅ HFRP Service Worker activated');
    })
  );
});

// Fetch event - Handle offline/online requests with donation support
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle donation form submissions offline
  if (request.method === 'POST' && url.pathname.includes('/api/donate-offline')) {
    event.respondWith(handleOfflineDonation(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle static resources
  if (request.destination === 'image' || request.destination === 'script' || request.destination === 'style') {
    event.respondWith(handleStaticResource(request));
    return;
  }

  // Default fetch strategy
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request);
    })
  );
});

// Handle navigation requests with offline fallback
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('🔌 Network failed, serving from cache');

    // Try to serve from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Serve offline page for navigation requests
    const offlineResponse = await caches.match('/offline');
    return offlineResponse || new Response('Offline', { status: 503 });
  }
}

// Donorbox-specific handling removed; Stripe is the sole payment provider.

// Handle offline donation form submission
async function handleOfflineDonation(request) {
  try {
    const formData = await request.formData();
    const donationData = {
      amount: formData.get('amount'),
      type: formData.get('type'),
      email: formData.get('email'),
      timestamp: new Date().toISOString(),
      status: 'pending_online'
    };

    // Store in IndexedDB for when online
    await storeOfflineDonation(donationData);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Donation saved offline. You will be notified when online to complete payment.',
        id: generateOfflineId()
      }),
      {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to save offline donation' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static resources with cache-first strategy
async function handleStaticResource(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    // Serve from cache and update in background
    fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, networkResponse);
        });
      }
    }).catch(() => {}); // Ignore network errors

    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Return generic offline response for failed static resources
    return new Response('Resource not available offline', { status: 503 });
  }
}

// Store donation intent for offline processing
async function storeDonationIntent(request) {
  const url = new URL(request.url);
  const donationIntent = {
    url: url.toString(),
    amount: url.searchParams.get('amount'),
    recurring: url.searchParams.get('recurring'),
    timestamp: new Date().toISOString(),
    id: generateOfflineId()
  };

  try {
    const db = await openDB();
    const transaction = db.transaction(['donationIntents'], 'readwrite');
    await transaction.objectStore('donationIntents').add(donationIntent);

    // Notify user via notification if permission granted
    if ('Notification' in self && Notification.permission === 'granted') {
      self.registration.showNotification('HFRP Donation Saved', {
        body: 'Your donation intent has been saved. You will be notified when you can complete it online.',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'donation-saved',
        requireInteraction: true,
        actions: [
          {
            action: 'complete',
            title: 'Complete when online'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ]
      });
    }
  } catch (error) {
    console.error('Failed to store donation intent:', error);
  }
}

// Store offline donation data
async function storeOfflineDonation(donationData) {
  try {
    const db = await openDB();
    const transaction = db.transaction(['offlineDonations'], 'readwrite');
    await transaction.objectStore('offlineDonations').add(donationData);
  } catch (error) {
    console.error('Failed to store offline donation:', error);
    throw error;
  }
}

// Open IndexedDB for offline storage
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('HFRPOfflineDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create donation intents store
      if (!db.objectStoreNames.contains('donationIntents')) {
        const intentStore = db.createObjectStore('donationIntents', { keyPath: 'id' });
        intentStore.createIndex('timestamp', 'timestamp');
      }

      // Create offline donations store
      if (!db.objectStoreNames.contains('offlineDonations')) {
        const donationStore = db.createObjectStore('offlineDonations', { keyPath: 'id', autoIncrement: true });
        donationStore.createIndex('timestamp', 'timestamp');
        donationStore.createIndex('status', 'status');
      }
    };
  });
}

// Generate unique offline ID
function generateOfflineId() {
  return 'offline_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'complete') {
    // Open the donation page when user wants to complete
    event.waitUntil(
      clients.openWindow('/donate?resume=offline')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle background sync for offline donations
self.addEventListener('sync', (event) => {
  if (event.tag === 'donation-sync') {
    event.waitUntil(syncOfflineDonations());
  }
});

// Sync offline donations when online
async function syncOfflineDonations() {
  try {
    const db = await openDB();
    const transaction = db.transaction(['offlineDonations'], 'readonly');
    const store = transaction.objectStore('offlineDonations');
    const pendingDonations = await store.getAll();

    for (const donation of pendingDonations) {
      if (donation.status === 'pending_online') {
        try {
          // Attempt to process the donation
          const response = await fetch('/api/process-offline-donation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(donation)
          });

          if (response.ok) {
            // Update status to processed
            const updateTransaction = db.transaction(['offlineDonations'], 'readwrite');
            donation.status = 'processed';
            await updateTransaction.objectStore('offlineDonations').put(donation);

            // Notify user of successful processing
            if ('Notification' in self && Notification.permission === 'granted') {
              self.registration.showNotification('HFRP Donation Processed', {
                body: `Your $${donation.amount} donation has been successfully processed.`,
                icon: '/icons/icon-192x192.png',
                tag: 'donation-processed'
              });
            }
          }
        } catch (error) {
          console.error('Failed to sync donation:', error);
        }
      }
    }
  } catch (error) {
    console.error('Failed to sync offline donations:', error);
  }
}

// Performance monitoring
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log('✅ HFRP Service Worker loaded successfully');

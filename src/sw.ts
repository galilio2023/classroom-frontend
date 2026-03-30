import { precacheAndRoute } from "workbox-precaching";

// This will be replaced by the actual manifest during build
precacheAndRoute(self.__WB_MANIFEST || []);

const CACHE_NAME = "classroom-v1";
const OFFLINE_URL = "/offline.html";

// Assets to cache immediately on install
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/offline.html",
  "/logo.svg",
  "/favicon.ico"
];

self.addEventListener("install", (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event: any) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  (self as any).clients.claim();
});

// --- SMART FETCH STRATEGY ---
self.addEventListener("fetch", (event: any) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Skip non-GET requests and API calls
  if (request.method !== "GET" || url.pathname.startsWith("/api")) {
    return;
  }

  // 2. Stale-While-Revalidate for Static Assets & UI
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        }).catch(() => {
            return cachedResponse || (request.mode === 'navigate' ? cache.match(OFFLINE_URL) : undefined);
        });

        return cachedResponse || fetchPromise;
      });
    })
  );
});

// --- PUSH NOTIFICATIONS ---
self.addEventListener("push", (event: any) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const { title, message, icon, link } = data;

    const options = {
      body: message,
      icon: icon || "/manifest-icon-192.maskable.png",
      badge: "/logo.svg",
      data: {
        url: link || "/",
      },
      vibrate: [100, 50, 100],
    };

    event.waitUntil((self as any).registration.showNotification(title, options));
  } catch (error) {
    console.error("Error showing push notification", error);
  }
});

self.addEventListener("notificationclick", (event: any) => {
  event.notification.close();
  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    (self as any).clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients: any) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      if ((self as any).clients.openWindow) {
        return (self as any).clients.openWindow(urlToOpen);
      }
    })
  );
});

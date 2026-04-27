/// <reference lib="webworker" />

import { precacheAndRoute } from "workbox-precaching";

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: any;
};

// This will be replaced by the actual manifest during build
precacheAndRoute(self.__WB_MANIFEST || []);

const CACHE_NAME = "classroom-v1";
const CURRICULUM_CACHE = "curriculum-v1";
const OFFLINE_URL = "/offline.html";

// Assets to cache immediately on install
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/offline.html",
  "/logo.svg",
  "/favicon.ico",
];

// --- BACKGROUND SYNC ---
self.addEventListener("sync", (event: any) => {
  if (event.tag === "sync-pending-quizzes") {
    console.log("🔄 Background Sync: Syncing quizzes...");
    // The actual sync logic is handled by the useOfflineSync hook in the app context,
    // but the Service Worker can trigger a message to the clients to start syncing.
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => client.postMessage({ type: "SYNC_OFFLINE_DATA" }));
      })
    );
  }
});

// 🚀 SERVICE WORKER UPDATE: Listen for SKIP_WAITING message (Review #25 Fix)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
      caches.open(CURRICULUM_CACHE),
    ])
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== CURRICULUM_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// --- SMART FETCH STRATEGY ---
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Skip non-GET requests and non-http/https schemes
  if (request.method !== "GET" || !["http:", "https:"].includes(url.protocol)) {
    return;
  }

  // 2. 📚 CURRICULUM CACHE STRATEGY: Cache-First for class modules and resources
  // Targeted at rural students with capped/unreliable data
  if (url.pathname.includes("/api/classes/") && url.pathname.includes("/modules")) {
    event.respondWith(
      caches.open(CURRICULUM_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request).then((networkResponse) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 3. UI & API STRATEGY: Stale-While-Revalidate for other API calls and assets
  if (url.pathname.startsWith("/api")) {
    // Standard API calls: Network-First (with timeout) fallback to cache
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const cloned = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          return networkResponse;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 4. UI ASSETS: Stale-While-Revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          })
          .catch(() => {
            return (
              cachedResponse || (request.mode === "navigate" ? cache.match(OFFLINE_URL) : undefined)
            );
          });

        return cachedResponse || fetchPromise;
      });
    })
  );
});

// --- PUSH NOTIFICATIONS ---
self.addEventListener("push", (event) => {
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

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (error) {
    console.error("Error showing push notification", error);
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

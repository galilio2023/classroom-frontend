import { BACKEND_URL } from "@/config";
import { getFreshSession } from "@/providers/auth";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push notifications are not supported in this browser");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    // Check if already subscribed
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      // Even if it exists, we send it to backend to ensure it's synced
      await sendSubscriptionToBackend(existingSubscription);
      return existingSubscription;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    await sendSubscriptionToBackend(subscription);

    return subscription;
  } catch (error) {
    console.error("Failed to subscribe to push notifications", error);
  }
}

async function sendSubscriptionToBackend(subscription: PushSubscription) {
  // Use the authClient singleton to get the session reliably
  const { data: sessionData } = await getFreshSession();
  const token = sessionData?.session?.token || localStorage.getItem("tablawy_auth_token");

  if (!token) {
    console.warn("Attempted to subscribe to push notifications without an active session.");
    return;
  }

  const response = await fetch(`${BACKEND_URL}/notifications/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(subscription),
  });

  if (!response.ok) {
    throw new Error("Failed to send subscription to backend");
  }
}

import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { registerSW } from "virtual:pwa-register";
import { ThemeProvider } from "./components/refine-ui/theme/theme-provider";

// Configure QueryClient with reasonable defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false, // Prevent aggressive refetching
      retry: 1,
    },
  },
});

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);

// Register service worker with automatic updates support
const updateSW = registerSW({
  onNeedRefresh() {
    // Show a toast or non-blocking notification instead of confirm
    console.log("New content available, please refresh.");
  },
  onOfflineReady() {
    console.log("App is ready to work offline!");
  },
});

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="refine-ui-theme">
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

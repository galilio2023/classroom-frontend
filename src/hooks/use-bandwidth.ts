import { useState, useEffect } from "react";

/**
 * 📡 useBandwidth Hook
 * Detects network connection quality for adaptive UI features (e.g. SSE fallback).
 * Uses the Network Information API.
 */
export const useBandwidth = () => {
  const [bandwidth, setBandwidth] = useState<{
    downlink: number; // Mbps
    effectiveType: string; // 'slow-2g', '2g', '3g', '4g'
  }>({
    downlink: (navigator as any).connection?.downlink || 10,
    effectiveType: (navigator as any).connection?.effectiveType || "4g",
  });

  useEffect(() => {
    const conn = (navigator as any).connection;
    if (!conn) return;

    const updateConnection = () => {
      setBandwidth({
        downlink: conn.downlink,
        effectiveType: conn.effectiveType,
      });
    };

    conn.addEventListener("change", updateConnection);
    return () => conn.removeEventListener("change", updateConnection);
  }, []);

  const isPoorBandwidth =
    bandwidth.downlink < 1 ||
    bandwidth.effectiveType.includes("2g") ||
    bandwidth.effectiveType === "3g";

  return { ...bandwidth, isPoorBandwidth };
};

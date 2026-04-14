import {} from "react";
import { useLocation } from "react-router-dom";
import { useCustomMutation } from "@refinedev/core";
import { v4 as uuidv4 } from "uuid";

const TELEMETRY_SESSION_KEY = "tablawy_telemetry_id";

/**
 * 🚀 TELEMETRY HOOK
 * Handles high-performance event tracking for the guest-to-student funnel.
 * Privacy-first: Uses a local UUID that can be stitched during registration.
 */
export const useTelemetry = () => {
  const { mutate } = useCustomMutation();
  const _locationn = useLocation();

  // Get or Generate Telemetry Session ID
  const getSessionId = () => {
    let id = localStorage.getItem(TELEMETRY_SESSION_KEY);
    if (!id) {
      id = uuidv4();
      if (id) {
        localStorage.setItem(TELEMETRY_SESSION_KEY, id);
      }
    }
    return id || "anonymous";
  };

  const trackEvent = (
    classId: number,
    type: "view" | "preview_click" | "registration_attempt" | "enrollment"
  ) => {
    mutate({
      url: "/public/telemetry/event",
      method: "post",
      values: {
        classId,
        type,
        telemetrySessionId: getSessionId(),
      },
    });
  };

  return { trackEvent, telemetrySessionId: getSessionId() };
};

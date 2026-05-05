import { useEffect, useState } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";

/**
 * 🎙️ LIVE CAPTION HOOK (Phase 4.1)
 * Establishes a Server-Sent Events (SSE) connection to receive real-time Arabic captions.
 */
export const useLiveCaptions = (classId?: string, isActive: boolean = false) => {
  const [caption, setCaption] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    if (!classId || !isActive) {
      setCaption("");
      setIsStreaming(false);
      return;
    }

    const ctrl = new AbortController();

    const startStream = async () => {
      try {
        setIsStreaming(true);
        await fetchEventSource(`${import.meta.env.VITE_API_URL}/live-session/${classId}/captions`, {
          signal: ctrl.signal,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Standard Tablawy auth
          },
          onmessage(ev) {
            if (ev.data === "[DONE]") {
              setIsStreaming(false);
              return;
            }
            try {
              const parsed = JSON.parse(ev.data);
              setCaption(parsed.text);

              // Clear caption after 5 seconds of silence
              setTimeout(() => {
                setCaption((current) => (current === parsed.text ? "" : current));
              }, 5000);
            } catch (err) {
              console.error("Failed to parse live caption", err);
            }
          },
          onerror(err) {
            console.error("Caption stream error", err);
            setIsStreaming(false);
          },
        });
      } catch (err) {
        console.error("Caption stream fatal", err);
        setIsStreaming(false);
      }
    };

    startStream();

    return () => {
      ctrl.abort();
      setIsStreaming(false);
    };
  }, [classId, isActive]);

  return { caption, isStreaming };
};

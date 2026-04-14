import { useState, useCallback, useRef, useEffect } from "react";
import { BACKEND_URL } from "@/config";
import { useAiAccess } from "@/features/ai/hooks/use-ai-access";
import { z } from "zod";
import { handleError } from "@/providers/utils/api-errors";

/**
 * ðŸ›¡ï¸ ARCHITECTURAL PATTERN: useAiStream
 * Specialized hook for Server-Sent Events (SSE) and ReadableStream.
 * Bypasses Refine's useCustom for raw stream access while maintaining
 * centralized Auth and Security guardrails.
 */
interface UseAiStreamOptions<T> {
  schema?: z.ZodSchema<T>;
  onChunk?: (chunk: string) => void;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useAiStream<T = unknown>(
  endpoint: string,
  options: UseAiStreamOptions<T> = {}
): {
  stream: (body: unknown) => Promise<T | void>;
  isLoading: boolean;
  error: Error | null;
  abort: () => void;
} {
  const { isAiEnabled, isAllowed, isQuotaExceeded } = useAiAccess();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  // ðŸ›¡ï¸ CLEANUP: Ensure stream is aborted if component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const stream = useCallback(
    async (body: unknown): Promise<T | void> => {
      // ðŸ›¡ï¸ Security Guard: Prevent calls if AI is disabled or unauthorized
      if (!isAiEnabled || !isAllowed || isQuotaExceeded) {
        const message = isQuotaExceeded
          ? "ðŸ›¡ï¸ AI Monthly Quota Exceeded. Please wait for the next billing cycle."
          : "ðŸ›¡ï¸ AI features are currently disabled or restricted for your account.";
        const err = new Error(message);
        setError(err);
        options.onError?.(err);
        return;
      }

      setIsLoading(true);
      setError(null);

      // ðŸš€ ATTACH ABORT CONTROLLER
      abortControllerRef.current = new AbortController();

      try {
        const token = localStorage.getItem("tablawy_auth_token");
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "X-Tablawy-Client": "Tablawy-Frontend",
        };

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        /* eslint-disable-next-line no-restricted-globals */
        const response = await fetch(`${BACKEND_URL}${endpoint}`, {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify(body),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw await handleError(response);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";
        let lineBuffer = ""; // 🛡️ HARDENED SSE LINE BUFFERING
        let isStreamDone = false;

        if (!reader) throw new Error("Response body is null");

        while (!isStreamDone) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          lineBuffer += chunk;

          // 🛡️ Split by \n\n as per Tablawy OS SSE mandate
          const lines = lineBuffer.split("\n\n");
          // Keep the last partial packet in the buffer
          lineBuffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const rawData = line.replace("data: ", "").trim();
              if (!rawData) continue;

              try {
                // If it's a JSON stream, we might want to parse and extract text
                const data = JSON.parse(rawData);
                const chunkText = data.text || (typeof data === "string" ? data : "");

                if (chunkText) {
                  fullContent += chunkText;
                  options.onChunk?.(chunkText);
                }

                if (data.done) {
                  isStreamDone = true;
                  break;
                }
              } catch (e) {
                // Partial JSON or unexpected format - wait for next chunk
                console.warn("Partial SSE JSON buffered:", e);
              }
            } else if (line.trim()) {
              // Fallback for non-standard SSE lines
              fullContent += line;
              options.onChunk?.(line);
            }
          }
        }

        // Process any remaining content in the buffer
        if (lineBuffer.trim()) {
          fullContent += lineBuffer;
          options.onChunk?.(lineBuffer);
        }

        // ðŸ›¡ï¸ Validation: Ensure the final output matches our expected schema
        let finalData: T = fullContent as unknown as T;
        if (options.schema) {
          try {
            // Try to parse if it looks like JSON
            const parsed =
              fullContent.trim().startsWith("{") || fullContent.trim().startsWith("[")
                ? JSON.parse(fullContent)
                : fullContent;
            finalData = options.schema.parse(parsed);
          } catch (e) {
            console.error("ðŸ›¡ï¸ AI Schema Validation Failed:", e);
            throw new Error(
              "AI returned malformed data that does not match the system requirements."
            );
          }
        }

        options.onSuccess?.(finalData);
        return finalData;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          console.log("ðŸ›¡ï¸ AI Stream aborted by user or cleanup.");
          return;
        }
        const errorObject = err instanceof Error ? err : new Error(String(err));
        setError(errorObject);
        options.onError?.(errorObject);
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [endpoint, options, isAiEnabled, isAllowed, isQuotaExceeded]
  );

  return { stream, isLoading, error, abort };
}

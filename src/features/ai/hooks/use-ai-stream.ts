import { useState, useCallback, useRef, useEffect } from "react";
import { useAiAccess } from "@/features/ai/hooks/use-ai-access";
import { z } from "zod";
import { AiStreamClient } from "@/features/ai/lib/ai-stream-client";

/**
 * 🛡️ ARCHITECTURAL PATTERN: useAiStream
 * Specialized hook for Server-Sent Events (SSE) and ReadableStream.
 * Orchestrates AiStreamClient with Refine-aware security guardrails.
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

  // 🛡️ CLEANUP: Ensure stream is aborted if component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const stream = useCallback(
    async (body: unknown): Promise<T | void> => {
      // 🛡️ Security Guard: Prevent calls if AI is disabled or unauthorized
      if (!isAiEnabled || !isAllowed || isQuotaExceeded) {
        const message = isQuotaExceeded
          ? "🛡️ AI Monthly Quota Exceeded. Please wait for the next billing cycle."
          : "🛡️ AI features are currently disabled or restricted for your account.";
        const err = new Error(message);
        setError(err);
        options.onError?.(err);
        return;
      }

      setIsLoading(true);
      setError(null);

      // 🚀 ATTACH ABORT CONTROLLER
      abortControllerRef.current = new AbortController();

      try {
        const fullContent = await AiStreamClient.fetchStream(endpoint, body, {
          onChunk: options.onChunk,
          signal: abortControllerRef.current.signal,
        });

        // 🛡️ Validation: Ensure the final output matches our expected schema
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
            console.error("🛡️ AI Schema Validation Failed:", e);
            throw new Error(
              "AI returned malformed data that does not match the system requirements."
            );
          }
        }

        options.onSuccess?.(finalData);
        return finalData;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          console.log("🛡️ AI Stream aborted by user or cleanup.");
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

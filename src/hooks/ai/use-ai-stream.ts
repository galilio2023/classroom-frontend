import { useState, useCallback } from "react";
import { BACKEND_URL } from "@/config";
import { useAiAccess } from "@/hooks/use-ai-access";
import { z } from "zod";

/**
 * 🛡️ ARCHITECTURAL PATTERN: useAiStream
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
} {
  const { isAiEnabled, isAllowed, isQuotaExceeded } = useAiAccess();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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

      try {
        const token = localStorage.getItem("tablawy_auth_token");
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "X-Tablawy-Client": "Tablawy-Frontend",
        };

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${BACKEND_URL}${endpoint}`, {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to connect to AI service");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";
        let buffer = ""; // 🛡️ SSE LINE BUFFERING

        if (!reader) throw new Error("Response body is null");

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // 🛡️ Split by newline to ensure we process complete SSE lines
          const lines = buffer.split("\n");
          // Keep the last partial line in the buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;
            fullContent += line;
            options.onChunk?.(line);
          }
        }

        // Process any remaining content in the buffer
        if (buffer.trim()) {
          fullContent += buffer;
          options.onChunk?.(buffer);
        }

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
        const errorObject = err instanceof Error ? err : new Error(String(err));
        setError(errorObject);
        options.onError?.(errorObject);
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint, options, isAiEnabled, isAllowed]
  );

  return { stream, isLoading, error };
}

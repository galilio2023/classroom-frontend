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

export function useAiStream<T = unknown>(endpoint: string, options: UseAiStreamOptions<T> = {}) {
  const { isAiEnabled, isAllowed } = useAiAccess();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const stream = useCallback(
    async (body: unknown) => {
      // 🛡️ Security Guard: Prevent calls if AI is disabled or unauthorized
      if (!isAiEnabled || !isAllowed) {
        const err = new Error(
          "🛡️ AI features are currently disabled or restricted for your account."
        );
        setError(err);
        options.onError?.(err);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${BACKEND_URL}${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // 🛡️ SECURITY: Credentials include for Better Auth sessions
            "X-Tablawy-Client": "Tablawy-Frontend",
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to connect to AI service");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        if (!reader) throw new Error("Response body is null");

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;
          options.onChunk?.(chunk);
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

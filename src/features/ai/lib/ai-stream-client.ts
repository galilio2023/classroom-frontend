import { BACKEND_URL } from "@/config";
import { handleError } from "@/providers/utils/api-errors";

/**
 * 🦾 AiStreamClient
 * Specialized client for Server-Sent Events (SSE) and ReadableStream.
 * Handles authentication, line buffering, and stream orchestration.
 */

export interface AiStreamOptions {
  onChunk?: (chunk: string) => void;
  signal?: AbortSignal;
}

export class AiStreamClient {
  private static getHeaders() {
    const token = localStorage.getItem("tablawy_auth_token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Tablawy-Client": "Tablawy-Frontend",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * 🚀 fetchStream
   * Core SSE Streaming Engine with Hardened Line Buffering.
   * 🛡️ BANDWIDTH GUARD: Automatically falls back to standard POST for slow networks.
   */
  static async fetchStream(
    endpoint: string,
    body: unknown,
    options: AiStreamOptions = {}
  ): Promise<string> {
    // 🛡️ BANDWIDTH DETECTION
    const conn = (
      navigator as unknown as { connection?: { effectiveType: string; downlink: number } }
    ).connection;
    const isPoorBandwidth =
      conn && (conn.effectiveType === "2g" || conn.effectiveType === "3g" || conn.downlink < 1); // Less than 1Mbps

    const headers = this.getHeaders();
    if (isPoorBandwidth) {
      headers["X-Tablawy-Bandwidth"] = "poor";
    }

    // eslint-disable-next-line no-restricted-globals
    let response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(body),
      signal: options.signal,
    });

    // 🛡️ RETRY-AFTER: Handle 429 Rate Limits with exponential backoff and jitter
    // Mandate: Max 3 attempts to prevent battery drain (Rural Hardening)
    let attempts = 1;
    const maxAttempts = 3;

    while (response.status === 429 && attempts < maxAttempts) {
      if (options.signal?.aborted) break;

      const retryAfterRaw = response.headers.get("Retry-After");
      const retryAfter = retryAfterRaw ? parseInt(retryAfterRaw, 10) : 5;
      const jitter = Math.floor(Math.random() * 3); // 0-2s jitter
      const waitTime = (retryAfter + jitter) * 1000;

      console.warn(
        `Rate limit reached (Attempt ${attempts}/${maxAttempts}). Retrying after ${retryAfter + jitter}s...`
      );

      // 🛡️ SIGNAL CHECK: Don't sleep if already aborted
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(resolve, waitTime);
        options.signal?.addEventListener("abort", () => {
          clearTimeout(timeout);
          reject(new Error("Stream aborted during backoff"));
        });
      }).catch((err) => {
        if (!options.signal?.aborted) throw err;
      });

      if (options.signal?.aborted) break;

      response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(body),
        signal: options.signal,
      });
      attempts++;
    }

    if (!response.ok) {
      throw await handleError(response);
    }

    // 🛡️ HANDLE NON-STREAMING FALLBACK
    if (isPoorBandwidth) {
      const result = await response.json();
      const content = result.data?.text || "";
      if (content) options.onChunk?.(content);
      return content;
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullContent = "";
    let lineBuffer = ""; // 🛡️ HARDENED SSE LINE BUFFERING
    let isStreamDone = false;

    if (!reader) throw new Error("Response body is null");

    try {
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

            if (rawData === "[DONE]") {
              isStreamDone = true;
              break;
            }

            try {
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

      return fullContent;
    } finally {
      reader.releaseLock();
    }
  }
}

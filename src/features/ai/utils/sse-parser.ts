/**
 * 🛡️ SSE LINE BUFFERING UTILITY
 * Mandate Compliance: Ensures partial JSON packets don't crash the UI.
 * Handles fragmented chunks, different line endings, and malformed data.
 */

export interface SSEParsedResult<T> {
  data: T[];
  remainingBuffer: string;
  isDone: boolean;
}

export function parseSSEChunk<T>(chunk: string, previousBuffer: string = ""): SSEParsedResult<T> {
  const combined = previousBuffer + chunk;

  // 🛡️ SRE: Robust split handling both \n\n (standard) and \r\n\r\n (windows-style)
  const lines = combined.split(/\n\n|\r\n\r\n/);

  // The last element is potentially a partial packet, keep it in buffer
  const remainingBuffer = lines.pop() || "";

  const parsedData: T[] = [];
  let isDone = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // SSE standard: data is prefixed with 'data: '
    if (trimmedLine.startsWith("data: ")) {
      const rawJson = trimmedLine.replace(/^data:\s*/, "").trim();

      if (rawJson === "[DONE]") {
        isDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(rawJson) as T;
        parsedData.push(parsed);
      } catch (e) {
        // 🛡️ RESILIENCE: Log malformed packets but don't crash the entire stream
        console.warn("⚠️  SSE Parser: Received malformed JSON packet", { rawJson, error: e });
      }
    }
  }

  return {
    data: parsedData,
    remainingBuffer,
    isDone,
  };
}

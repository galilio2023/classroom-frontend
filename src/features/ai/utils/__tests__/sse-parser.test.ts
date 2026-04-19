import { describe, it, expect } from "vitest";
import { parseSSEChunk } from "../sse-parser";

describe("SSE Parser Utility", () => {
  it("should parse a simple complete chunk", () => {
    const chunk = 'data: {"text": "hello"}\n\n';
    const result = parseSSEChunk<{ text: string }>(chunk);

    expect(result.data).toHaveLength(1);
    expect(result.data[0].text).toBe("hello");
    expect(result.remainingBuffer).toBe("");
    expect(result.isDone).toBe(false);
  });

  it("should handle fragmented JSON across chunks", () => {
    // Part 1: Half of the first message
    const chunk1 = 'data: {"text": "he';
    const result1 = parseSSEChunk<{ text: string }>(chunk1);
    expect(result1.data).toHaveLength(0);
    expect(result1.remainingBuffer).toBe('data: {"text": "he');

    // Part 2: The rest of the first message and half of the second
    const chunk2 = 'llo"}\n\ndata: {"text": "wo';
    const result2 = parseSSEChunk<{ text: string }>(chunk2, result1.remainingBuffer);
    expect(result2.data).toHaveLength(1);
    expect(result2.data[0].text).toBe("hello");
    expect(result2.remainingBuffer).toBe('data: {"text": "wo');

    // Part 3: The rest of the second message
    const chunk3 = 'rld"}\n\n';
    const result3 = parseSSEChunk<{ text: string }>(chunk3, result2.remainingBuffer);
    expect(result3.data).toHaveLength(1);
    expect(result3.data[0].text).toBe("world");
    expect(result3.remainingBuffer).toBe("");
  });

  it("should handle [DONE] signal", () => {
    const chunk = "data: [DONE]\n\n";
    const result = parseSSEChunk<{ text: string }>(chunk);
    expect(result.isDone).toBe(true);
  });

  it("should ignore malformed JSON but continue parsing", () => {
    const chunk = 'data: {invalid}\n\ndata: {"text": "valid"}\n\n';
    const result = parseSSEChunk<{ text: string }>(chunk);

    expect(result.data).toHaveLength(1);
    expect(result.data[0].text).toBe("valid");
  });

  it("should handle Windows-style line endings", () => {
    const chunk = 'data: {"text": "win"}\r\n\r\ndata: {"text": "style"}\r\n\r\n';
    const result = parseSSEChunk<{ text: string }>(chunk);

    expect(result.data).toHaveLength(2);
    expect(result.data[0].text).toBe("win");
    expect(result.data[1].text).toBe("style");
  });
});

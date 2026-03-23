import { useState, useRef, useEffect, useCallback } from "react";
import { useCustom, useNotification } from "@refinedev/core";
import { BACKEND_URL } from "@/config";

export interface Message {
  id?: string;
  role: "user" | "model";
  parts: { text: string }[];
  sources?: any[];
}

interface UseAIChatProps {
  url: string;
  context?: Record<string, any>;
  classId?: string | number;
}

interface ChatHistoryItem {
  id: string;
  role: "user" | "model";
  content: string;
  createdAt: string;
}

const ERROR_MESSAGE = "I'm having trouble reading the class materials right now. Please try again in a moment.";

/**
 * useAIChat Hook (Refine v5 Pattern)
 * 
 * Optimized for Tablawy OS AI Streaming.
 * Uses Refine's useCustom for history and manual fetch for SSE streaming
 * to maintain the real-time "typing" effect.
 */
export const useAIChat = ({ url, context, classId }: UseAIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [streamingSources, setStreamingSources] = useState<any[] | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const accumulatorRef = useRef("");
  const animationFrameRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { open } = useNotification();

  // 1. 📜 HISTORY: Use Refine v5 Pattern for standard GET requests
  const { data: historyData, isLoading: isHistoryLoading } = useCustom<any>({
    url: `${BACKEND_URL}/ai/chat-history/${classId}`,
    method: "get",
    queryOptions: {
      enabled: !!classId,
      onSuccess: (data) => {
        if (data.data) {
          const history = data.data.map((m: ChatHistoryItem) => ({
            id: String(m.id),
            role: m.role,
            parts: [{ text: m.content }],
          }));
          setMessages(history);
        }
      },
    },
  });

  // 2. 🧹 CLEANUP: Handle component unmount and race conditions
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage, scrollToBottom]);

  const updateStreamingUI = useCallback(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    
    animationFrameRef.current = requestAnimationFrame(() => {
      setStreamingMessage(accumulatorRef.current);
      animationFrameRef.current = null;
    });
  }, []);

  // 3. 🚀 SEND: Specialized fetch for SSE Streaming (Bypasses useCustomMutation for perf)
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Reset previous state
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    const userMessage: Message = {
      role: "user",
      parts: [{ text: input }],
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);
    setStreamingMessage("");
    setStreamingSources(null);
    accumulatorRef.current = "";

    const finalUrl = classId ? "/ai/study-buddy" : url;
    const apiUrl = `${BACKEND_URL}${finalUrl}`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        signal: abortControllerRef.current.signal,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`, 
        },
        body: JSON.stringify({
          message: currentInput,
          history: messages.map(m => ({ role: m.role, parts: m.parts })),
          context,
          classId,
        }),
      });

      if (!response.ok) throw new Error("Failed to connect to Gemini AI");

      // Branch A: Standard JSON (General Assistant)
      if (!classId) {
        const result = await response.json();
        if (result.data?.response) {
          setMessages((prev) => [...prev, { role: "model", parts: [{ text: result.data.response }] }]);
        }
        setIsLoading(false);
        return;
      }

      // Branch B: SSE Streaming (Study Buddy)
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("Stream reader not available");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const rawData = line.replace("data: ", "").trim();
              if (!rawData) continue;
              
              const data = JSON.parse(rawData);

              if (data.text) {
                accumulatorRef.current += data.text;
                updateStreamingUI();
              }

              if (data.sources) {
                setStreamingSources(data.sources);
              }

              if (data.done) break;
            } catch (e) {
              // Ignore partial JSON chunks - they will be caught by next read
            }
          }
        }
      }

      // Final State Push
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          parts: [{ text: accumulatorRef.current }],
          sources: streamingSources || undefined
        }
      ]);
      setStreamingMessage("");
      setStreamingSources(null);

    } catch (error: any) {
      if (error.name === 'AbortError') return;
      
      console.error("Tablawy AI Error:", error);
      open?.({
        type: "error",
        message: "Connection Error",
        description: ERROR_MESSAGE
      });
      
      setMessages((prev) => [...prev, { role: "model", parts: [{ text: ERROR_MESSAGE }] }]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  return {
    messages,
    streamingMessage,
    streamingSources,
    input,
    setInput,
    handleSend,
    isLoading: isLoading || isHistoryLoading,
    scrollAreaRef,
  };
};

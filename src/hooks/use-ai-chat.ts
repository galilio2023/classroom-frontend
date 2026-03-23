import { useState, useRef, useEffect, useCallback } from "react";
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

export const useAIChat = ({ url, context, classId }: UseAIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [streamingSources, setStreamingSources] = useState<any[] | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const accumulatorRef = useRef("");
  const animationFrameRef = useRef<number | null>(null);

  // 📜 MEMORY: Load chat history on mount
  useEffect(() => {
    if (!classId) return;

    const fetchHistory = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/ai/chat-history/${classId}`, {
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`, // Defense in depth
                }
            });
            const data = await response.json();
            if (data.data) {
                const history = data.data.map((m: ChatHistoryItem) => ({
                    id: String(m.id),
                    role: m.role as "user" | "model",
                    parts: [{ text: m.content }],
                }));
                setMessages(history);
            }
        } catch (err) {
            console.error("Failed to fetch chat history:", err);
        }
    };

    fetchHistory();
  }, [classId]);

  // Auto-scroll logic (Optimized)
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

  const updateStreamingMessage = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(() => {
      setStreamingMessage(accumulatorRef.current);
      animationFrameRef.current = null;
    });
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

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

      if (!response.ok) throw new Error("Failed to send message");

      // Non-Streaming Branch
      if (!classId) {
        const data = await response.json();
        if (data.data?.response) {
            setMessages((prev) => [...prev, { role: "model", parts: [{ text: data.data.response }] }]);
        }
        setIsLoading(false);
        return;
      }

      // Streaming Branch
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No reader");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.replace("data: ", ""));

              if (data.text) {
                accumulatorRef.current += data.text;
                updateStreamingMessage();
              }

              if (data.sources) {
                setStreamingSources(data.sources);
              }

              if (data.done) break;
            } catch (e) {
              // Partial JSON handled by next chunk
            }
          }
        }
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setStreamingMessage(accumulatorRef.current);

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

    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, { role: "model", parts: [{ text: ERROR_MESSAGE }] }]);
    } finally {
      setIsLoading(false);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  };

  return {
    messages,
    streamingMessage,
    streamingSources,
    input,
    setInput,
    handleSend,
    isLoading,
    scrollAreaRef,
  };
};

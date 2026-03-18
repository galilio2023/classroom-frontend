import { useState, useRef, useEffect, useCallback } from "react";

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

const ERROR_MESSAGE = "I'm having trouble reading the class materials right now. Please try again in a moment.";
const THROTTLE_MS = 60; // Update UI at roughly 16fps for smooth typing without lag

export const useAIChat = ({ url, context, classId }: UseAIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [streamingSources, setStreamingSources] = useState<any[] | null>(null);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const accumulatorRef = useRef("");
  const lastUpdateRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

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

  const updateUI = useCallback((isFinal = false) => {
    const now = Date.now();
    if (isFinal || now - lastUpdateRef.current > THROTTLE_MS) {
      setStreamingMessage(accumulatorRef.current);
      lastUpdateRef.current = now;
    }
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
    const apiUrl = `${import.meta.env.VITE_API_URL}${finalUrl}`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
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

      if (!classId) {
        const data = await response.json();
        if (data.response) {
            setMessages((prev) => [...prev, { role: "model", parts: [{ text: data.response }] }]);
        }
        setIsLoading(false);
        return;
      }

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
                updateUI();
              }

              if (data.sources) {
                setStreamingSources(data.sources);
              }

              if (data.done) break;
            } catch (e) {
              // Ignore partial JSON chunks
            }
          }
        }
      }

      // Final push to state
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
    streamingMessage, // The "live" message being typed
    streamingSources,
    input,
    setInput,
    handleSend,
    isLoading,
    scrollAreaRef,
  };
};

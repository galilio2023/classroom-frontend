import { useState, useRef, useEffect } from "react";
import { useCustomMutation } from "@refinedev/core";

export interface Message {
  role: "user" | "model";
  parts: { text: string }[];
}

interface UseAIChatProps {
  url: string;
  context?: Record<string, any>;
  classId?: string | number; // New: Support for class-specific knowledge
}

export const useAIChat = ({ url, context, classId }: UseAIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { mutate: sendMessage, mutation } = useCustomMutation<{ response: string }>();
  const isLoading = mutation.isPending;

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      parts: [{ text: input }],
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");

    sendMessage(
      {
        url,
        method: "post",
        values: {
          message: currentInput,
          history: messages,
          context,
          classId, // Pass classId to the backend
        },
      },
      {
        onSuccess: (data) => {
          const aiMessage: Message = {
            role: "model",
            parts: [{ text: data.data.response }],
          };
          setMessages((prev) => [...prev, aiMessage]);
        },
      }
    );
  };

  return {
    messages,
    input,
    setInput,
    handleSend,
    isLoading,
    scrollAreaRef,
  };
};

import { useState, useRef, useEffect } from "react";
import { useCustomMutation } from "@refinedev/core";
import { socket } from "@/lib/socket";

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

export const useAIChat = ({ url, context, classId }: UseAIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Track the ID of the current streaming message to prevent duplicates on reconnection
  const currentStreamId = useRef<string | null>(null);

  const { mutate: sendMessage, mutation } = useCustomMutation<{ success: boolean }>();
  
  const isLoading = mutation.isPending || isStreaming;

  // Auto-scroll logic
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: "smooth"
        });
      }
    }
  }, [messages, isLoading]);

  // Socket streaming listeners
  useEffect(() => {
    if (!socket) return;

    // Use a unique ID for each streaming session (provided by backend or generated locally)
    socket.on("study-buddy:start", (data: { streamId?: string }) => {
      setIsStreaming(true);
      
      const streamId = data?.streamId || `stream-${Date.now()}`;
      
      // If we're already streaming this ID (reconnection), don't create a new bubble
      if (currentStreamId.current === streamId) return;
      
      currentStreamId.current = streamId;

      setMessages((prev) => [
        ...prev,
        { id: streamId, role: "model", parts: [{ text: "" }] }
      ]);
    });

    socket.on("study-buddy:chunk", (data: { text: string, streamId?: string }) => {
      setMessages((prev) => {
        // Find the specific message by ID or fallback to the last one
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.role === "model") {
          const updatedParts = [{ text: lastMessage.parts[0].text + data.text }];
          return [...prev.slice(0, -1), { ...lastMessage, parts: updatedParts }];
        }
        return prev;
      });
    });

    socket.on("study-buddy:end", (data: { sources: any[], streamId?: string }) => {
      setIsStreaming(false);
      currentStreamId.current = null; // Clear the stream tracking
      
      if (data.sources) {
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.role === "model") {
            return [...prev.slice(0, -1), { ...lastMessage, sources: data.sources }];
          }
          return prev;
        });
      }
    });

    const handleError = () => {
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (!lastMessage) return prev;
        
        const errorMessage = "I'm having trouble reading the class materials right now. Please try again in a moment.";
        
        // If the last message is a user message, we never got a response
        if (lastMessage.role === "user") {
          return [...prev, { role: "model", parts: [{ text: errorMessage }] }];
        }
        
        // If the last message is a model message that is still streaming or empty
        if (lastMessage.role === "model" && currentStreamId.current) {
           const existingText = lastMessage.parts[0].text;
           const newText = existingText ? existingText + "\n\n[Error: " + errorMessage + "]" : errorMessage;
           return [...prev.slice(0, -1), { ...lastMessage, parts: [{ text: newText }] }];
        }
        
        return prev;
      });
      setIsStreaming(false);
      currentStreamId.current = null;
    };

    socket.on("study-buddy:error", handleError);
    socket.on("disconnect", handleError);

    return () => {
      socket.off("study-buddy:start");
      socket.off("study-buddy:chunk");
      socket.off("study-buddy:end");
      socket.off("study-buddy:error", handleError);
      socket.off("disconnect", handleError);
    };
  }, []);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      parts: [{ text: input }],
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");

    const finalUrl = classId ? "/ai/study-buddy" : url;

    sendMessage(
      {
        url: finalUrl,
        method: "post",
        values: {
          message: currentInput,
          history: messages.map(m => ({ role: m.role, parts: m.parts })),
          context,
          classId,
        },
      },
      {
        onSuccess: (data) => {
          if (!classId && (data as any).data?.response) {
            const aiMessage: Message = {
              role: "model",
              parts: [{ text: (data as any).data.response }],
            };
            setMessages((prev) => [...prev, aiMessage]);
          }
        },
        onError: () => {
           setMessages((prev) => [
             ...prev, 
             { role: "model", parts: [{ text: "I'm having trouble reading the class materials right now. Please try again in a moment." }] }
           ]);
        }
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

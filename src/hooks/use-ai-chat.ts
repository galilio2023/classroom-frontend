import { useState, useRef, useEffect, useCallback } from "react";
import { useCustom, useNotification, usePermissions } from "@refinedev/core";
import { useTranslation } from "react-i18next";
import { BACKEND_URL } from "@/config";
import { BasePermissions, UserRole } from "@/types";

export interface Message {
  id?: string;
  role: "user" | "model";
  parts: { text: string }[];
  sources?: any[];
}

interface UseAIChatProps {
  url: string;
  context?: Record<string, any>;
  classId?: string | number | null;
}

interface ChatHistoryItem {
  id: string;
  role: "user" | "model";
  content: string;
  createdAt: string;
}

interface ChatHistoryResponse {
  data: ChatHistoryItem[];
}

interface AuthPermissions extends BasePermissions {}

const MAX_INPUT_LENGTH = 4000;

/**
 * useAIChat Hook (Final Production Grade)
 * 
 * Optimized for Tablawy OS AI Streaming.
 * Handles SSE Buffering, History Syncing, and Multi-Class Navigation.
 */
export const useAIChat = ({ url, context, classId }: UseAIChatProps) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  
  // 🛡️ AUTO-DRAFT: AI Assistant Persistence
  useEffect(() => {
      const draftKey = `draft:ai-assistant:${classId || 'global'}`;
      if (input) {
          localStorage.setItem(draftKey, input);
      } else {
          localStorage.removeItem(draftKey);
      }
  }, [input, classId]);

  // 🚀 DRAFT RECOVERY
  useEffect(() => {
      const draftKey = `draft:ai-assistant:${classId || 'global'}`;
      const saved = localStorage.getItem(draftKey);
      if (saved && !input) {
          setInput(saved);
      }
  }, [classId]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [streamingSources, setStreamingSources] = useState<any[] | null>(null);
  const [isDryRun, setIsDryRun] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const accumulatorRef = useRef("");
  const lineBufferRef = useRef(""); 
  const animationFrameRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasLoadedHistoryFor = useRef<string | number | null>(null); 
  
  const { open } = useNotification();
  const { data: permissions, isLoading: isPermissionsLoading, isError: isPermissionsError } = usePermissions<AuthPermissions>({});

  // 1. 📜 HISTORY: Standard Refine v5 GET
  // Task: Context Safety - Fallback to "global" history if no classId provided
  const effectiveClassId = classId || 'global';
  const { result: historyResult, query: historyQuery } = useCustom<ChatHistoryResponse>({
    url: `${BACKEND_URL}/ai/chat-history/${effectiveClassId}`,
    method: "get",
    queryOptions: {
      enabled: hasLoadedHistoryFor.current !== effectiveClassId,
    },
  });

  // Handle Navigation & State Resets
  useEffect(() => {
    if (effectiveClassId !== hasLoadedHistoryFor.current) {
        setMessages([]);
        accumulatorRef.current = "";
        lineBufferRef.current = "";
    }
  }, [effectiveClassId]);

  // Sync history safely
  useEffect(() => {
    const historyData = historyResult?.data?.data;
    if (historyData && hasLoadedHistoryFor.current !== effectiveClassId) {
      const history = historyData.map((m: ChatHistoryItem) => ({
        id: String(m.id),
        role: m.role,
        parts: [{ text: m.content }],
      }));
      setMessages(history);
      hasLoadedHistoryFor.current = effectiveClassId;
    }
  }, [historyResult, effectiveClassId]);

  // 2. 🧹 CLEANUP
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

  // 3. 🚀 SEND: SSE Streaming Engine
  const handleSend = async () => {
    const cleanInput = input.trim();
    if (!cleanInput || isLoading || isPermissionsLoading) return;

    // RBAC & Safety Checks
    if (isPermissionsError) {
        open?.({ type: "error", message: t("common.error"), description: t("auth.errors.permissions" as any) });
        return;
    }

    if (cleanInput.length > MAX_INPUT_LENGTH) {
        open?.({ type: "error", message: t("common.error"), description: t("aiHub.errors.inputTooLong" as any) });
        return;
    }

    const role = permissions?.role;
    if (effectiveClassId && role === UserRole.PARENT) {
        open?.({ type: "error", message: t("common.accessDenied" as any), description: t("aiHub.errors.parentRestricted" as any) });
        return;
    }

    // Initialize Request Lifecycle
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const userMessage: Message = { role: "user", parts: [{ text: cleanInput }] };
    setMessages((prev) => [...prev, userMessage]);
    
    setInput("");
    setIsLoading(true);
    setStreamingMessage("");
    setStreamingSources(null);
    accumulatorRef.current = "";
    lineBufferRef.current = ""; 

    const finalUrl = effectiveClassId ? "/ai/study-buddy" : url;
    const apiUrl = `${BACKEND_URL}${finalUrl}`;

    try {
      const token = localStorage.getItem("token");
      const correlationId = crypto.randomUUID();
      const headers: Record<string, string> = { 
          "Content-Type": "application/json",
          "X-Correlation-ID": correlationId
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        signal: controller.signal,
        credentials: "include",
        headers,
        body: JSON.stringify({
          message: cleanInput,
          history: messages.map(m => ({ role: m.role, parts: m.parts })),
          context,
          classId: effectiveClassId,
          correlationId, // Also pass in body for non-header compliant middle-layers
        }),
      });

      if (response.status === 429) throw new Error("RATE_LIMIT_EXCEEDED");
      if (response.status === 503) throw new Error("AI_SERVICE_OFFLINE");
      if (!response.ok) throw new Error("AI_SERVICE_UNAVAILABLE");

      // General Chat (Non-Streaming)
      if (!effectiveClassId) {
        const result = await response.json();
        if (result.data?.response) {
          setMessages((prev) => [...prev, { role: "model", parts: [{ text: result.data.response }] }]);
        }
        if (result.metadata?.isDryRun) {
            setIsDryRun(true);
        }
        setIsLoading(false);
        return;
      }

      // Study Buddy (Streaming)
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("STREAM_READER_UNAVAILABLE");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const combinedChunk = lineBufferRef.current + chunk;
        const lines = combinedChunk.split("\n\n");

        lineBufferRef.current = lines.pop() || "";

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
              if (data.sources) setStreamingSources(data.sources);
              if (data.done) break;
            } catch (e) {
              // Partial JSON buffered
            }
          }
        }
      }

      // Final State Push (Guard against empty bubbles)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      const finalResponseText = accumulatorRef.current.trim();
      
      if (finalResponseText.length > 0) {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            parts: [{ text: finalResponseText }],
            sources: streamingSources || undefined
          }
        ]);
      } else {
        throw new Error("EMPTY_RESPONSE");
      }

      setStreamingMessage("");
      setStreamingSources(null);

    } catch (error: any) {
      if (error.name === 'AbortError') return;
      
      console.error("Tablawy AI Error:", error);
      
      let description = t("aiHub.errors.serviceUnavailable" as any);
      if (error.message === "RATE_LIMIT_EXCEEDED") description = t("aiHub.errors.rateLimit" as any);
      if (error.message === "AI_SERVICE_OFFLINE") description = t("aiHub.errors.maintenance" as any);

      open?.({ 
        type: "error", 
        message: t("common.error"), 
        description 
      });
      
      setMessages((prev) => [...prev, { 
        role: "model", 
        parts: [{ text: t("aiHub.errors.friendlyFallback" as any) }] 
      }]);
    } finally {
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    }
  };

  return {
    messages,
    streamingMessage,
    streamingSources,
    input,
    setInput,
    handleSend,
    isLoading: isLoading || historyQuery?.isLoading || isPermissionsLoading,
    scrollAreaRef,
    isDryRun,
  };
};

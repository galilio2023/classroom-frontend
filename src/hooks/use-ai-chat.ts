import { useState, useRef, useEffect, useCallback } from "react";
import { useCustom, useNotification, usePermissions, useCustomMutation } from "@refinedev/core";
import { useTranslation } from "react-i18next";
import { BACKEND_URL } from "@/config";
import { BasePermissions, UserRole } from "@/types";

export interface ChatSource {
  title: string;
  url: string;
  type: string;
}

export interface Message {
  id?: string;
  role: "user" | "model";
  parts: { text: string }[];
  sources?: ChatSource[];
}

interface UseAIChatProps {
  url: string;
  context?: Record<string, unknown>;
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

interface StreamData {
  text?: string;
  sources?: ChatSource[];
  done?: boolean;
  metadata?: {
    isDryRun?: boolean;
  };
}

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
    const draftKey = `draft:ai-assistant:${classId || "global"}`;
    if (input) {
      localStorage.setItem(draftKey, input);
    } else {
      localStorage.removeItem(draftKey);
    }
  }, [input, classId]);

  // 🚀 DRAFT RECOVERY
  useEffect(() => {
    const draftKey = `draft:ai-assistant:${classId || "global"}`;
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      setInput((prev) => prev || saved);
    }
  }, [classId]);

  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [streamingSources, setStreamingSources] = useState<ChatSource[] | null>(null);
  const [isDryRun, setIsDryRun] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const accumulatorRef = useRef("");
  const lineBufferRef = useRef("");
  const animationFrameRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasLoadedHistoryFor = useRef<string | number | null>(null);

  const { open } = useNotification();
  const {
    data: permissions,
    isLoading: isPermissionsLoading,
    isError: isPermissionsError,
  } = usePermissions<BasePermissions>({});

  // 1. 📜 HISTORY: Standard Refine v5 GET
  const effectiveClassId = classId || "global";
  const { result: historyResult, query: historyQuery } = useCustom<ChatHistoryResponse>({
    url: `${BACKEND_URL}/ai/chat-history/${effectiveClassId}`,
    method: "get",
    queryOptions: {
      enabled: hasLoadedHistoryFor.current !== effectiveClassId,
    },
  });

  // 1b. 🦾 NON-STREAMING FALLBACK
  const { mutate: sendSimpleChat } = useCustomMutation();

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
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
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
      open?.({
        type: "error",
        message: t("common.error"),
        description: t("auth.errors.permissions"),
      });
      return;
    }

    if (cleanInput.length > MAX_INPUT_LENGTH) {
      open?.({
        type: "error",
        message: t("common.error"),
        description: t("aiHub.errors.inputTooLong"),
      });
      return;
    }

    const role = permissions?.role;
    if (effectiveClassId && role === UserRole.PARENT) {
      open?.({
        type: "error",
        message: t("common.accessDenied"),
        description: t("aiHub.errors.parentRestricted"),
      });
      return;
    }

    // Initialize Request Lifecycle
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const userMessage: Message = {
      role: "user",
      parts: [{ text: cleanInput }],
    };
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

      // General Chat (Non-Streaming) - Use Refine's useCustomMutation
      if (!effectiveClassId || effectiveClassId === "global") {
        sendSimpleChat(
          {
            url: apiUrl,
            method: "post",
            values: {
              message: cleanInput,
              history: messages.map((m) => ({ role: m.role, parts: m.parts })),
              context,
              correlationId,
            },
          },
          {
            onSuccess: (result) => {
              const responseData = result.data as {
                data?: { response?: string };
                metadata?: { isDryRun?: boolean };
              };
              if (responseData.data?.response) {
                setMessages((prev) => [
                  ...prev,
                  {
                    role: "model",
                    parts: [{ text: responseData.data?.response || "" }],
                  },
                ]);
              }
              if (responseData.metadata?.isDryRun) setIsDryRun(true);
              setIsLoading(false);
            },
            onError: (err) => {
              console.error("Simple Chat Error:", err);
              setIsLoading(false);
              open?.({
                type: "error",
                message: t("common.error"),
                description: t("aiHub.errors.serviceUnavailable"),
              });
            },
          }
        );
        return;
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Correlation-ID": correlationId,
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        signal: controller.signal,
        credentials: "include",
        headers,
        body: JSON.stringify({
          message: cleanInput,
          history: messages.map((m) => ({ role: m.role, parts: m.parts })),
          context,
          classId: effectiveClassId,
          correlationId,
        }),
      });

      if (response.status === 429) throw new Error("RATE_LIMIT_EXCEEDED");
      if (response.status === 503) throw new Error("AI_SERVICE_OFFLINE");
      if (!response.ok) throw new Error("AI_SERVICE_UNAVAILABLE");

      // Study Buddy (Streaming)
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("STREAM_READER_UNAVAILABLE");

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const rawData = line.replace("data: ", "").trim();
              if (!rawData) continue;

              const data = JSON.parse(rawData) as StreamData;
              if (data.text) {
                accumulatorRef.current += data.text;
                updateStreamingUI();
              }
              if (data.sources) setStreamingSources(data.sources);
              if (data.done) break;
            } catch (e) {
              console.error("Partial SSE JSON buffered or malformed:", e);
            }
          }
        }
      }

      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      const finalResponseText = accumulatorRef.current.trim();

      if (finalResponseText.length > 0) {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            parts: [{ text: finalResponseText }],
            sources: streamingSources || undefined,
          },
        ]);
      } else {
        throw new Error("EMPTY_RESPONSE");
      }

      setStreamingMessage("");
      setStreamingSources(null);
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === "AbortError") return;

      console.error("Tablawy AI Error:", error);

      let description: string = t("aiHub.errors.serviceUnavailable");
      if (error.message === "RATE_LIMIT_EXCEEDED") description = t("aiHub.errors.rateLimit");
      if (error.message === "AI_SERVICE_OFFLINE") description = t("aiHub.errors.maintenance");

      open?.({
        type: "error",
        message: t("common.error"),
        description,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          parts: [{ text: t("aiHub.errors.friendlyFallback") }],
        },
      ]);
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

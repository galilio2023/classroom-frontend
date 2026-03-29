import { useState, useRef, useEffect, useCallback } from "react";
import {
  useCustom,
  useNotification,
  usePermissions,
  useCustomMutation,
  useGetIdentity,
} from "@refinedev/core";
import { useTranslation } from "react-i18next";
import { BACKEND_URL } from "@/config";
import { BasePermissions, UserRole, User } from "@/types";
import { ChatSource, Message } from "@/types/ai";
import { offlineDB } from "@/lib/offline-db";
import { useAiAccess } from "./use-ai-access";

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
  const { data: identity } = useGetIdentity<User>();
  const { isAiEnabled, isAllowed } = useAiAccess();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const effectiveClassId = String(classId || "global");

  // 🛡️ ADAPTIVE CACHE: Load from local IndexedDB first (Dexie)
  useEffect(() => {
    if (!identity?.id || !isAiEnabled || !isAllowed) return;

    const loadLocalCache = async () => {
      try {
        const cached = await offlineDB.ai_history.get({
          userId: identity.id,
          classId: effectiveClassId,
        });
        // Only use cache if we haven't loaded from server yet
        if (cached && hasLoadedHistoryFor.current !== effectiveClassId) {
          setMessages(cached.messages);
          hasLoadedHistoryFor.current = effectiveClassId;
        }
      } catch (err) {
        console.warn("Failed to load AI cache:", err);
      }
    };

    void loadLocalCache();
  }, [identity?.id, effectiveClassId]);

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
  const { result: historyResult, query: historyQuery } = useCustom<ChatHistoryResponse>({
    url: `${BACKEND_URL}/ai/chat-history/${effectiveClassId}`,
    method: "get",
    queryOptions: {
      enabled: !!identity?.id && hasLoadedHistoryFor.current !== effectiveClassId,
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

  // Sync history safely and update local cache
  useEffect(() => {
    const historyData = historyResult?.data?.data;
    if (historyData && identity?.id && hasLoadedHistoryFor.current !== effectiveClassId) {
      const history = historyData.map((m: ChatHistoryItem) => ({
        id: String(m.id),
        role: m.role,
        parts: [{ text: m.content }],
      }));
      setMessages(history);
      hasLoadedHistoryFor.current = effectiveClassId;

      // Update Dexie Cache
      if (!abortControllerRef.current?.signal.aborted) {
        void offlineDB.ai_history.put({
          userId: identity.id,
          classId: effectiveClassId,
          messages: history,
          timestamp: Date.now(),
        });
      }
    }
  }, [historyResult, effectiveClassId, identity?.id]);

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

    // 🛡️ Global Master Switch & RBAC
    if (!isAiEnabled || !isAllowed) {
      open?.({
        type: "error",
        message: t("common.accessDenied"),
        description: t("aiHub.errors.serviceUnavailable"),
      });
      return;
    }

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
    const messagesBeforeModel = [...messages, userMessage];
    setMessages(messagesBeforeModel);

    setInput("");
    setIsLoading(true);
    setStreamingMessage("");
    setStreamingSources(null);
    accumulatorRef.current = "";
    lineBufferRef.current = "";

    const finalUrl = effectiveClassId && effectiveClassId !== "global" ? "/ai/study-buddy" : url;
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
                const modelMessage: Message = {
                  role: "model",
                  parts: [{ text: responseData.data?.response || "" }],
                };
                const updatedMessages = [...messagesBeforeModel, modelMessage];
                setMessages(updatedMessages);

                // Update Cache
                if (identity?.id && !abortControllerRef.current?.signal.aborted) {
                  void offlineDB.ai_history.put({
                    userId: identity.id,
                    classId: effectiveClassId,
                    messages: updatedMessages,
                    timestamp: Date.now(),
                  });
                }
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

      let streamBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        streamBuffer += chunk;

        const lines = streamBuffer.split("\n\n");
        streamBuffer = lines.pop() || "";

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
        const modelMessage: Message = {
          role: "model",
          parts: [{ text: finalResponseText }],
          sources: streamingSources || undefined,
        };
        const updatedMessages = [...messagesBeforeModel, modelMessage];
        setMessages(updatedMessages);

        // Persistent Cache update
        if (identity?.id && !abortControllerRef.current?.signal.aborted) {
          void offlineDB.ai_history.put({
            userId: identity.id,
            classId: effectiveClassId,
            messages: updatedMessages,
            timestamp: Date.now(),
          });
        }
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

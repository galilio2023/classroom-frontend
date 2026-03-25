import { useState, useRef, useEffect, useCallback } from "react";
import { useNotification, usePermissions } from "@refinedev/core";
import { useTranslation } from "react-i18next";
import { BACKEND_URL } from "@/config";
import { BasePermissions, UserRole } from "@/types";
import { usePersistentLive } from "./use-persistent-live";
import { AI_API } from "@/constants/api";
import { AIVisualState, AI_STREAM_PAYLOAD } from "@/features/ai/types/ai";

interface UseAILiveInteractionProps {
  classId: string;
  language?: string;
  initialVisualCue?: AIVisualState;
  onFinished?: () => void;
}

interface AuthPermissions extends BasePermissions {}

/**
 * 🦾 useAILiveInteraction Hook
 * 
 * Specialized for the AI Co-Teacher (AILiveCompanion).
 * Features:
 * - Hardened SSE Streaming (Line-buffered)
 * - AbortController for network lifecycle safety
 * - Decoupled SpeechSynthesis management (via refs)
 * - Refine v5 Permissions integration
 * - Zustand Session Hydration
 */
export const useAILiveInteraction = ({ 
    classId, 
    language = "English", 
    initialVisualCue = "talking",
    onFinished 
}: UseAILiveInteractionProps) => {
  const { t } = useTranslation();
  const { open } = useNotification();
  const { data: permissions } = usePermissions<AuthPermissions>({});
  
  // Zustand Global State
  const { isJoined: globalJoined, setIsJoined, activeClassId, setActiveClassId } = usePersistentLive();

  // 🛡️ MULTI-INSTANCE SAFETY: Scoped isJoined check
  const isJoined = globalJoined && activeClassId === classId;

  // Local UI State
  const [visualState, setVisualState] = useState<AIVisualState>(initialVisualCue);
  const [isLoading, setIsLoading] = useState(false);
  const [currentScript, setCurrentScript] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Refs for non-reactive state & lifecycle
  const isMounted = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatorRef = useRef("");
  const lineBufferRef = useRef("");
  const animationFrameRef = useRef<number | null>(null);

  // --- 🦾 BATCHED UPDATES (Pattern Adherence: Typing Efficiency) ---
  const updateUI = useCallback((script: string, state?: AIVisualState) => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(() => {
        setCurrentScript(script);
        if (state) setVisualState(state);
        animationFrameRef.current = null;
    });
  }, []);

  // 1. 🎙️ SPEECH SYNTHESIS ENGINE (Hardened)
  const speakText = useCallback((text: string) => {
      if (!isMounted.current || !window.speechSynthesis) return;

      try {
          const synth = window.speechSynthesis;
          
          // Cancel any ongoing speech before starting new one
          synth.cancel();

          const utterance = new SpeechSynthesisUtterance(text);
          const langCode = language === "Arabic" ? "ar-SA" : "en-US";
          utterance.lang = langCode;

          utterance.onstart = () => {
              setIsSpeaking(true);
              setVisualState("talking");
          };

          utterance.onend = () => {
              setIsSpeaking(false);
              setVisualState("listening");
              speechRef.current = null;
              onFinished?.();
          };

          utterance.onerror = (event: any) => {
              console.error("Speech Synthesis Error:", event);
              setIsSpeaking(false);
              setVisualState("talking"); // Revert to talking (default) on error
              speechRef.current = null;
          };

          speechRef.current = utterance;
          synth.speak(utterance);
      } catch (error) {
          console.error("Failed to initialize speech synthesis:", error);
          setIsSpeaking(false);
          setVisualState("talking");
      }
  }, [language, onFinished]);

  // 2. 👂 SPEECH RECOGNITION ENGINE
  const startListening = useCallback(() => {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
          open?.({
              type: "error",
              message: t("aiHub.errors.speechNotSupported" as any),
              description: t("aiHub.errors.chromeRequired" as any),
          });
          return;
      }

      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.abort();

      setIsListening(true);
      setVisualState("listening");

      const recognition = new SpeechRecognition();
      recognition.lang = language === "Arabic" ? "ar-SA" : "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;

      // ⏱️ TIMEOUT LOGIC: Auto-stop if no voice detected
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
          recognition.stop();
          setIsListening(false);
          setVisualState("talking");
          open?.({
              type: "error",
              message: t("aiHub.errors.listeningTimeout" as any),
              description: t("aiHub.errors.tryAgain" as any),
          });
      }, 8000);

      recognition.onresult = (event: any) => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          const transcript = event.results[0][0].transcript;
          interact(transcript);
      };

      recognition.onerror = (event: any) => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setIsListening(false);
          setVisualState("talking");
          if (event.error === 'not-allowed') {
              open?.({
                  type: "error",
                  message: t("auth.errors.micAccessDenied" as any),
                  description: t("auth.errors.micSettings" as any),
              });
          }
      };

      recognition.onend = () => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
  }, [language, open, t]);

  // 🚀 SESSION TOGGLE (Pattern Adherence: Lifecycle Safety)
  const toggleJoin = useCallback((val: boolean) => {
    if (val) setActiveClassId(classId);
    setIsJoined(val);
    if (!val) {
        // Reset local state on leave
        setCurrentScript(null);
        setVisualState("talking");
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        if (recognitionRef.current) recognitionRef.current.abort();
    }
  }, [setIsJoined, setActiveClassId, classId]);

  // 2. 🚀 SSE STREAMING ENGINE
  const interact = async (question: string) => {
    if (!question.trim() || isLoading) return;

    // RBAC: Single Source of Truth
    if (permissions?.role === UserRole.PARENT) {
        open?.({ type: "error", message: t("common.accessDenied" as any), description: t("aiHub.errors.parentRestricted" as any) });
        return;
    }

    // Lifecycle: Abort previous request to prevent "Ghost Updates"
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setVisualState("thinking");
    accumulatorRef.current = "";
    lineBufferRef.current = "";

    const apiUrl = `${BACKEND_URL}${AI_API.INTERACT(classId)}`;

    try {
      const token = localStorage.getItem("token");
      const correlationId = crypto.randomUUID();
      const headers: Record<string, string> = { 
          "Content-Type": "application/json",
          "X-Correlation-ID": correlationId
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(apiUrl, {
        method: "PATCH",
        signal: controller.signal,
        credentials: "include",
        headers,
        body: JSON.stringify({ question, language, correlationId }),
      });

      if (response.status === 429) throw new Error("RATE_LIMIT_EXCEEDED");
      if (response.status === 503) throw new Error("AI_SERVICE_OFFLINE");
      if (!response.ok) throw new Error("AI_SERVICE_UNAVAILABLE");

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
                // Update local UI script immediately for visual feedback
                updateUI(accumulatorRef.current);
              }
              
              // 📊 LOGGING: Performance Metadata
              if (data.latencyMs) {
                  console.debug(`[AI Co-Teacher] Latency: ${data.latencyMs}ms | Tokens:`, data.usage);
              }

              if (data.done) break;
            } catch (e) {
              // Wait for buffer
            }
          }
        }
      }

      // Finalize Interaction: Trigger Voice
      if (isMounted.current && accumulatorRef.current) {
          speakText(accumulatorRef.current);
      }

    } catch (error: any) {
      if (error.name === 'AbortError') return;
      
      console.error("Co-Teacher Error:", error);
      let description = t("aiHub.errors.serviceUnavailable" as any);
      if (error.message === "RATE_LIMIT_EXCEEDED") description = t("aiHub.errors.rateLimit" as any);
      
      open?.({ type: "error", message: t("common.error"), description });
      setVisualState("talking");
    } finally {
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  };

  // 3. 🧹 CLEANUP
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.abort();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return {
    isJoined,
    setIsJoined: toggleJoin,
    visualState,
    setVisualState,
    isLoading,
    currentScript,
    setCurrentScript,
    isSpeaking,
    isListening,
    interact,
    speakText,
    startListening,
  };
};

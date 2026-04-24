import { useState, useRef, useEffect, useCallback } from "react";
import { useNotification, usePermissions, type HttpError } from "@refinedev/core";
import { useTranslation } from "react-i18next";
import { BasePermissions, UserRole } from "@/types";
import { usePersistentLive } from "@/features/classes/hooks/use-persistent-live";
import { AI_API } from "@/constants/api";
import { AIVisualState } from "@/features/ai/types";
import { useAiAccess } from "./use-ai-access";
import { AiStreamClient } from "../lib/ai-stream-client";
import { getCorrelationId } from "@/providers/utils/api-errors";

interface UseAILiveInteractionProps {
  classId: string;
  language?: string;
  initialVisualCue?: AIVisualState;
  onFinished?: () => void;
  onPermissionDenied?: () => void;
}

/**
 * 🦾 useAILiveInteraction Hook
...
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
  onFinished,
  onPermissionDenied,
}: UseAILiveInteractionProps) => {
  const { t } = useTranslation();
  const { open } = useNotification();
  const { data: permissions } = usePermissions<BasePermissions>({});
  const { isAiEnabled, isAllowed } = useAiAccess();

  // Zustand Global State
  const {
    isJoined: globalJoined,
    setIsJoined,
    activeClassId,
    setActiveClassId,
    stopSpeaking,
    setIsSpeaking: setGlobalSpeaking,
  } = usePersistentLive();

  // 🛡️ MULTI-INSTANCE SAFETY: Scoped isJoined check
  const isJoined = globalJoined && activeClassId === classId;

  // Local UI State
  const [visualState, setVisualState] = useState<AIVisualState>(initialVisualCue);
  const [isLoading, setIsLoading] = useState(false);
  const [currentScript, setCurrentScript] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Sync local speaking state to global store
  useEffect(() => {
    setGlobalSpeaking(isSpeaking);
  }, [isSpeaking, setGlobalSpeaking]);

  // Refs for non-reactive state & lifecycle
  const isMounted = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
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
  const speakText = useCallback(
    (text: string) => {
      if (!isMounted.current || !window.speechSynthesis) return;

      try {
        // 🛡️ ARCHITECTURAL: Coordinate via central manager
        stopSpeaking();

        const utterance = new SpeechSynthesisUtterance(text);
        const langCode = language === "Arabic" ? "ar-SA" : "en-US";
        utterance.lang = langCode;

        // 🌐 VOICE LOCALIZATION: Attempt to find a matching voice for the language
        if (window.speechSynthesis.getVoices) {
          const voices = window.speechSynthesis.getVoices();
          const preferredVoice = voices.find((v) => v.lang.startsWith(langCode.split("-")[0]));
          if (preferredVoice) utterance.voice = preferredVoice;
        }

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

        utterance.onerror = (event) => {
          console.error("Speech Synthesis Error:", event);
          if (isMounted.current) {
            setIsSpeaking(false);
            // If it's 'not-allowed', the browser blocked it.
            // We should still allow the UI to finish its "cycle" or wait for user interaction.
            setVisualState("talking");
            speechRef.current = null;
            // Optionally notify parent that we're "done" even if we didn't speak
            if (event.error === "not-allowed") {
              onFinished?.();
            }
          }
        };

        speechRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error("Failed to initialize speech synthesis:", error);
        setIsSpeaking(false);
        setVisualState("talking");
      }
    },
    [language, onFinished, stopSpeaking]
  );

  // 👂 STOP LISTENING ENGINE
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    // 🛡️ PRIVACY: Abort any active SSE streams to stop background processing
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsListening(false);
    setVisualState("talking");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  // 2. 🚀 SEND: SSE STREAMING ENGINE
  const interact = useCallback(
    async (question: string) => {
      if (!question.trim() || isLoading) return;

      // 🛡️ Global Master Switch & RBAC
      if (!isAiEnabled || !isAllowed) {
        open?.({
          type: "error",
          message: t("common.accessDenied"),
          description: t("aiHub.errors.serviceUnavailable"),
        });
        return;
      }

      // RBAC: Single Source of Truth
      if (permissions?.role === UserRole.PARENT) {
        open?.({
          type: "error",
          message: t("common.accessDenied"),
          description: t("aiHub.errors.parentRestricted"),
        });
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

      try {
        const correlationId = crypto.randomUUID();
        const finalUrl = AI_API.INTERACT(classId);

        const finalResponseText = await AiStreamClient.fetchStream(
          finalUrl,
          { question, language, correlationId },
          {
            method: "PATCH",
            signal: controller.signal,
            onChunk: (chunk) => {
              accumulatorRef.current += chunk;
              updateUI(accumulatorRef.current);
            },
          }
        );

        // Finalize Interaction: Trigger Voice
        if (isMounted.current && finalResponseText.trim().length > 0) {
          speakText(finalResponseText.trim());
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;

        console.error("Co-Teacher Error:", err);
        const error = err as HttpError;
        const correlationId = getCorrelationId(err);

        open?.({
          type: "error",
          message: t("common.error"),
          description: `${error.message || t("aiHub.errors.serviceUnavailable")} (Trace: ${correlationId})`,
        });
        setVisualState("talking");
      } finally {
        if (abortControllerRef.current === controller) {
          setIsLoading(false);
        }
      }
    },
    [classId, isLoading, language, open, permissions?.role, speakText, t, updateUI]
  );

  // 2. 👂 SPEECH RECOGNITION ENGINE
  const startListening = useCallback(() => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      open?.({
        type: "error",
        message: t("aiHub.errors.speechNotSupported"),
        description: t("aiHub.errors.chromeRequired"),
      });
      return;
    }

    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (recognitionRef.current) recognitionRef.current.abort();

    setIsListening(true);
    setVisualState("listening");

    const recognition = new (SpeechRecognitionClass as {
      new (): SpeechRecognition;
    })();
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
        message: t("aiHub.errors.listeningTimeout"),
        description: t("aiHub.errors.tryAgain"),
      });
    }, 8000);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      const transcript = event.results[0][0].transcript;
      void interact(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsListening(false);
      setVisualState("talking");
      if (event.error === "not-allowed") {
        onPermissionDenied?.();
        open?.({
          type: "error",
          message: t("auth.errors.micAccessDenied"),
          description: t("auth.errors.micSettings"),
        });
      }
    };

    recognition.onend = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [interact, language, open, t, onPermissionDenied]);

  // 🚀 SESSION TOGGLE (Pattern Adherence: Lifecycle Safety)
  const toggleJoin = useCallback(
    (val: boolean) => {
      if (val) setActiveClassId(classId);
      setIsJoined(val);
      if (!val) {
        // Reset local state on leave
        setCurrentScript(null);
        setVisualState("talking");
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        if (recognitionRef.current) recognitionRef.current.abort();
      }
    },
    [setIsJoined, setActiveClassId, classId]
  );

  // 🛡️ HARDWARE PRIVACY & SAFETY: Stop speech/mic if user leaves the tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (isSpeaking) stopSpeaking();
        if (isListening) stopListening();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isSpeaking, isListening, stopSpeaking, stopListening]);

  // 3. 🧹 CLEANUP
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
      stopSpeaking();
      if (recognitionRef.current) recognitionRef.current.abort();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [stopSpeaking, stopListening]);

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
    stopListening,
  };
};

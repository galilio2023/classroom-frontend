import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Hand, Loader2, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNotification } from "@refinedev/core";
import { Skeleton } from "@/components/ui/skeleton";
import { useAILiveInteraction } from "@/features/ai/hooks/use-ai-live-interaction";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { useCapabilities } from "@/hooks/use-capabilities";
import { AIVisualState } from "@/features/ai/types/ai";

// Atomic Widgets
import { AiCompanionErrorState } from "./companion-widgets/AiCompanionErrorState";
import { AiCompanionOverlay } from "./companion-widgets/AiCompanionOverlay";
import { AiCompanionAvatar } from "./companion-widgets/AiCompanionAvatar";

interface AILiveCompanionProps {
  classId: string;
  photo: string | null;
  script: string | null;
  visualCue: AIVisualState;
  language?: string;
  onFinished?: () => void;
}

/**
 * 🤖 AI LIVE COMPANION (Deconstructed)
 *
 * Orchestrates atomic widgets and manages live AI interaction state.
 * Adheres to:
 * - Rule 1: Capability-Based UI (canInteractWithAiCompanion)
 * - Rule 3: Component Deconstruction (Atomic Widgets)
 * - Rule 5: RTL Support (Logical CSS)
 */
export const AILiveCompanion = React.memo(
  ({
    classId,
    photo,
    script,
    visualCue: initialVisualCue,
    language = "English",
    onFinished,
  }: AILiveCompanionProps) => {
    const { coreData, isIdentityLoading: isAuthLoading } = useDashboard();
    const { isStaff, canInteractWithAiCompanion, isLoading: isAccessLoading } = useCapabilities();

    const {
      isJoined,
      setIsJoined,
      visualState,
      currentScript,
      setCurrentScript,
      isSpeaking,
      isListening,
      speakText,
      startListening,
      stopListening,
    } = useAILiveInteraction({
      classId,
      language,
      initialVisualCue,
      onFinished,
      onPermissionDenied: () => setIsPermissionDenied(true),
    });

    const [isBrowserSupported, setIsBrowserSupported] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const [isPermissionDenied, setIsPermissionDenied] = useState(false);
    const { open } = useNotification();

    // 🛡️ MASTER SWITCH: Global AI Kill-switch enforcement
    const isAiEnabled = coreData?.globalConfig?.enableAiFeatures !== false;

    // 🛡️ NOTIFICATION: Trigger persistent toast on permission denial
    useEffect(() => {
      if (isPermissionDenied) {
        open?.({
          type: "error",
          message: "Microphone Access Required",
          description:
            "Please enable your microphone in browser settings to use the AI Co-Teacher.",
          key: "mic-denied-companion",
        });
      }
    }, [isPermissionDenied, open]);

    // 🛡️ TAB VISIBILITY SAFETY: Stop mic/speech if user leaves tab
    useEffect(() => {
      const handleVisibilityChange = () => {
        if (document.visibilityState === "hidden" && isJoined) {
          if (typeof window !== "undefined" && window.speechSynthesis) {
            window.speechSynthesis.cancel();
          }
          // 🛡️ PRIVACY GUARD: Stop hardware microphone if tab is hidden
          if (isListening) {
            stopListening();
            console.warn("🔐 Tab hidden: Microphone and Speech paused for privacy.");
          }
        }
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [isJoined, isListening, stopListening]);

    // 🛡️ SSR SAFETY: Initialize browser-only features after mount
    useEffect(() => {
      const win = window as unknown as Record<string, unknown>;
      const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
      setIsBrowserSupported(!!SpeechRecognition);
      setIsHydrated(true);
    }, []);

    // 🛡️ AUTO-LEAVE: If AI is disabled mid-session, kick student out
    useEffect(() => {
      if (!isAiEnabled && isJoined) {
        setIsJoined(false);
      }
    }, [isAiEnabled, isJoined, setIsJoined]);

    // Sync initial/parent script
    useEffect(() => {
      if (script && script !== currentScript) {
        setCurrentScript(script);
        // Auto-speak if already joined
        if (isJoined) speakText(script);
      }
    }, [script, isJoined, speakText, currentScript, setCurrentScript]);

    // 🧹 CLEANUP: Stop speaking on unmount
    useEffect(() => {
      return () => {
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      };
    }, []);

    // 🛡️ RULE 1: Use capability flag instead of direct role check
    if (!isHydrated || isAccessLoading || !canInteractWithAiCompanion) return null;

    // 🛡️ MASTER SWITCH: Global Kill-switch UI
    if (!isAiEnabled) {
      return <AiCompanionErrorState />;
    }

    if (isAuthLoading) {
      return (
        <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-black/5 rounded-3xl animate-pulse">
          <Skeleton className="w-40 h-40 md:w-56 md:h-56 rounded-full mb-8" />
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-4 w-32" />
        </div>
      );
    }

    return (
      <div
        className={cn(
          "relative w-full h-full min-h-[400px] flex flex-col items-center justify-center rounded-3xl overflow-hidden border-4 shadow-2xl transition-all duration-700",
          !isJoined
            ? "bg-black/60 border-white/10"
            : visualState === "talking"
              ? "bg-black/90 border-ai-primary/40 shadow-ai-primary/20"
              : visualState === "listening"
                ? "bg-orange-950/20 border-orange-500/40 shadow-orange-500/20"
                : "bg-green-950/20 border-green-500/40 shadow-green-500/20"
        )}
      >
        {!isJoined && (
          <AiCompanionOverlay
            isPermissionDenied={isPermissionDenied}
            isBrowserSupported={isBrowserSupported}
            isHydrated={isHydrated}
            onJoin={() => setIsJoined(true)}
          />
        )}

        <AnimatePresence>
          {isSpeaking && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.3, scale: 1.5 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute inset-0 bg-ai-primary rounded-full blur-[100px]"
            />
          )}
          {isListening && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.4, scale: 1.2 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
              className="absolute inset-0 bg-orange-500 rounded-full blur-[80px]"
            />
          )}
        </AnimatePresence>

        <div className="relative z-10 flex flex-col items-center gap-8 max-w-2xl px-6 text-center">
          <AiCompanionAvatar
            photo={photo}
            visualState={visualState}
            isSpeaking={isSpeaking}
            isListening={isListening}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-ai-primary">
              {visualState === "thinking" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <BrainCircuit className="w-5 h-5" />
              )}
              <span className="font-black uppercase tracking-tighter text-sm">
                {visualState === "listening" ? "Voice Captured" : "Synthesizing Lesson"}
              </span>
            </div>

            <AnimatePresence mode="wait">
              {!currentScript && !photo ? (
                <div className="flex flex-col items-center gap-2 opacity-40 animate-pulse w-full max-w-md mx-auto">
                  <BrainCircuit className="w-8 h-8 text-ai-primary mb-2" />
                  <Skeleton className="h-4 w-full bg-ai-primary/20 rounded-full" />
                  <Skeleton className="h-4 w-3/4 bg-ai-primary/20 rounded-full" />
                  <Skeleton className="h-4 w-1/2 bg-ai-primary/20 rounded-full" />
                </div>
              ) : (
                <motion.p
                  key={currentScript}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xl md:text-2xl font-bold text-white leading-relaxed line-clamp-4"
                >
                  {currentScript || (
                    <div className="flex flex-col items-center gap-2 opacity-20">
                      <Skeleton className="h-6 w-64 bg-white/20 rounded-full" />
                      <Skeleton className="h-6 w-48 bg-white/20 rounded-full" />
                    </div>
                  )}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* 🛡️ RBAC: Only Students (non-staff) can raise hands to interact */}
          {!isStaff && (
            <div className="flex items-center gap-4 pt-6">
              <Button
                size="lg"
                onClick={startListening}
                disabled={isListening || visualState === "thinking"}
                className={cn(
                  "rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-xs gap-3 transition-all shadow-lg",
                  isListening
                    ? "bg-orange-500 hover:bg-orange-600 text-white border-none animate-pulse"
                    : "bg-ai-primary hover:bg-ai-primary/90 text-white border-none ai-gradient-border"
                )}
              >
                {isListening ? <Mic className="w-5 h-5" /> : <Hand className="w-5 h-5" />}
                {isListening ? "Listening..." : "Raise Hand to Ask"}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

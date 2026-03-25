import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, User as UserIcon, Hand, Loader2, BrainCircuit, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNotification } from "@refinedev/core";
import { Skeleton } from "@/components/ui/skeleton";
import { useAILiveInteraction } from "@/hooks/use-ai-live-interaction";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { useAIAuthorization } from "@/hooks/use-ai-authorization";
import { AIVisualState } from "@/features/ai/types/ai";

interface AILiveCompanionProps {
  classId: string;
  photo: string | null;
  script: string | null;
  visualCue: AIVisualState;
  language?: string;
  onFinished?: () => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

/**
 * AILiveCompanion Component (Refactored)
 * 
 * Uses the specialized useAILiveInteraction hook for:
 * - Hardened SSE Streaming
 * - Lifecycle-safe SpeechSynthesis
 * - Global session persistence (Zustand)
 * - Refine v5 Permissions gating
 */
export const AILiveCompanion = ({
  classId,
  photo,
  script,
  visualCue: initialVisualCue,
  language = "English",
  onFinished,
}: AILiveCompanionProps) => {
  const { coreData } = useDashboard();
  const { isParent, isStaff, isLoading: isAuthLoading } = useAIAuthorization();
  
  const {
    isJoined,
    setIsJoined,
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
  } = useAILiveInteraction({ 
      classId, 
      language, 
      initialVisualCue, 
      onFinished 
  });

  const [isBrowserSupported, setIsBrowserSupported] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // 🛡️ MASTER SWITCH: Global AI Kill-switch enforcement
  const isAiEnabled = coreData?.globalConfig?.enableAiFeatures !== false;

  // 🛡️ SSR SAFETY: Initialize browser-only features after mount
  useEffect(() => {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
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
          if (typeof window !== 'undefined' && window.speechSynthesis) {
              window.speechSynthesis.cancel();
          }
      };
  }, []);

  if (!isHydrated || !isAiEnabled || isParent) return null;

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
    <div className={cn(
        "relative w-full h-full min-h-[400px] flex flex-col items-center justify-center rounded-3xl overflow-hidden border-4 shadow-2xl transition-all duration-700",
        !isJoined ? "bg-black/60 border-white/10" :
        visualState === "talking" ? "bg-black/90 border-ai-primary/40 shadow-ai-primary/20" :
        visualState === "listening" ? "bg-orange-950/20 border-orange-500/40 shadow-orange-500/20" :
        "bg-green-950/20 border-green-500/40 shadow-green-500/20"
    )}>
      
      {!isJoined && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md text-center p-8">
              {!isBrowserSupported && isHydrated ? (
                  <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-2xl max-w-xs animate-in fade-in zoom-in duration-300">
                      <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
                      <h4 className="text-white font-bold mb-2">Browser Not Supported</h4>
                      <p className="text-xs text-muted-foreground mb-4">
                          Speech interaction requires a modern browser like Chrome or Edge.
                      </p>
                      <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                          Retry Connection
                      </Button>
                  </div>
              ) : (
                  <>
                    <Sparkles className="w-12 h-12 text-ai-primary mb-4 animate-pulse" />
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Start Interactive AI Session</h3>
                    <p className="text-muted-foreground text-sm mb-8 max-w-xs">Click the button below to allow your AI Co-Teacher to speak and listen for your questions.</p>
                    <Button 
                        size="lg" 
                        onClick={() => setIsJoined(true)}
                        className="rounded-full bg-ai-primary hover:bg-ai-primary/80 text-white font-bold px-12"
                    >
                        Join AI Session
                    </Button>
                  </>
              )}
          </div>
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
          <div className="relative">
              <motion.div 
                animate={isSpeaking ? { 
                    scale: [1, 1.05, 1],
                    boxShadow: ["0 0 0px rgba(99, 102, 241, 0)", "0 0 40px rgba(99, 102, 241, 0.4)", "0 0 0px rgba(99, 102, 241, 0)"]
                } : isListening ? {
                    scale: [1, 0.98, 1],
                    borderColor: ["rgba(249, 115, 22, 0.2)", "rgba(249, 115, 22, 0.8)", "rgba(249, 115, 22, 0.2)"]
                } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className={cn(
                    "w-40 h-40 md:w-56 md:h-56 rounded-full border-4 overflow-hidden shadow-2xl bg-muted relative z-10 transition-colors duration-500",
                    visualState === "talking" ? "border-white/20" :
                    visualState === "listening" ? "border-orange-500/50" :
                    "border-green-500/50"
                )}
              >
                  {photo ? (
                      <img src={photo} alt="Teacher" className="w-full h-full object-cover grayscale-[20%]" />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center bg-ai-primary/10">
                          <UserIcon className="w-20 h-20 text-ai-primary/40" />
                      </div>
                  )}
              </motion.div>

              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 w-max">
                  <Badge className={cn(
                      "px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl border-none",
                      visualState === "talking" ? "bg-ai-primary text-white animate-pulse" :
                      visualState === "listening" ? "bg-orange-500 text-white" :
                      "bg-green-500 text-white"
                  )}>
                      {visualState === "talking" ? "AI Co-Teacher Speaking" : 
                       visualState === "listening" ? "AI is Listening..." : "AI is Thinking..."}
                  </Badge>
              </div>
          </div>

          <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-ai-primary">
                  {visualState === "thinking" ? <Loader2 className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
                  <span className="font-black uppercase tracking-tighter text-sm">
                      {visualState === "listening" ? "Voice Captured" : "Synthesizing Lesson"}
                  </span>
              </div>
              
              <AnimatePresence mode="wait">
                  {!currentScript && !photo ? (
                      <div className="flex flex-col items-center gap-2 opacity-40 animate-pulse">
                          <BrainCircuit className="w-8 h-8 text-ai-primary mb-2" />
                          <div className="h-4 w-48 bg-ai-primary/20 rounded-full" />
                          <div className="h-4 w-32 bg-ai-primary/20 rounded-full" />
                      </div>
                  ) : (
                      <motion.p 
                        key={currentScript}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xl md:text-2xl font-bold text-white leading-relaxed line-clamp-4"
                      >
                          {currentScript || "Preparing to continue the lesson..."}
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
                        isListening ? 
                            "bg-orange-500 hover:bg-orange-600 text-white border-none animate-pulse" : 
                            "bg-ai-primary hover:bg-ai-primary/90 text-white border-none ai-gradient-border"
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
};

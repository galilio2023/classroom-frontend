import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Volume2, BrainCircuit, Play, User as UserIcon, Hand, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, stripMarkdown } from "@/lib/utils";
import { useCustomMutation, useNotification } from "@refinedev/core";
import { useUserRole } from "@/hooks/use-user-role";
import { Skeleton } from "@/components/ui/skeleton";

interface AILiveCompanionProps {
  classId: string;
  photo: string | null;
  script: string | null;
  visualCue: "talking" | "thinking" | "listening";
  language?: string;
  onFinished?: () => void;
}

// 🛡️ SECURITY: Centralized API Endpoints
const AI_INTERACT_URL = (classId: string) => `/live-session/${classId}/interact`;

export const AILiveCompanion = ({
  classId,
  photo,
  script,
  visualCue: initialVisualCue,
  language = "English",
  onFinished,
}: AILiveCompanionProps) => {
  const { isStaff, isParent, isLoading: isIdentityLoading } = useUserRole();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentScript, setCurrentScript] = useState(script);
  const [visualState, setVisualState] = useState(initialVisualCue);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { mutate: askAi } = useCustomMutation();
  const { open } = useNotification();

  const isBrowserSupported = typeof window !== 'undefined' && ('webkitSpeechRecognition' in window);

  // --- 🎙️ TEXT TO SPEECH (AI VOICE) ---
// ... (omitted same as before)
  useEffect(() => {
    if (!currentScript) return;

    const synth = window.speechSynthesis;
    synth.cancel(); // Stop any previous speech

    // 🛡️ SANITIZATION: Ensure we only pass clean text to the speech engine
    const cleanText = stripMarkdown(currentScript);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const langCode = language === "Arabic" ? "ar-SA" : "en-US";
    utterance.lang = langCode;
    
    utterance.onstart = () => {
        setIsSpeaking(true);
        setVisualState("talking");
    };
    utterance.onend = () => {
        setIsSpeaking(false);
        setVisualState("listening");
        onFinished?.();
    };

    speechRef.current = utterance;
    synth.speak(utterance);

    return () => synth.cancel();
  }, [currentScript, language, onFinished]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // --- 👂 SPEECH RECOGNITION (STUDENT EAR) ---
  const startListening = () => {
      if (!isBrowserSupported) {
          open?.({
              type: "error",
              message: "Speech recognition not supported",
              description: "Please use a Chromium-based browser (Chrome/Edge) for AI interaction.",
          });
          return;
      }
// ... (rest of startListening as before)
      window.speechSynthesis.cancel(); // AI stops talking to listen
      setIsSpeaking(false);
      setIsListening(true);
      setVisualState("listening");

      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = language === "Arabic" ? "ar-SA" : "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;

      // 🛡️ TIMEOUT: Reset state if user doesn't speak within 10 seconds
      timeoutRef.current = setTimeout(() => {
          recognition.stop();
          setIsListening(false);
          setVisualState("talking");
          open?.({
              type: "error",
              message: "Listening timed out",
              description: "I didn't hear anything. Please try again.",
          });
      }, 10000);

      recognition.onresult = (event: any) => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          const transcript = event.results[0][0].transcript;
          handleAskAI(transcript);
      };

      recognition.onerror = (event: any) => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setIsListening(false);
          setVisualState("talking");
          
          // 🛡️ PERMISSION PROTECTION: Handle specific rejection states
          if (event.error === 'not-allowed') {
              open?.({
                  type: "error",
                  message: "Microphone Access Denied",
                  description: "Please enable microphone permissions in your browser settings.",
              });
          } else {
              console.warn("Speech recognition error:", event.error);
          }
      };

      recognition.onend = () => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
  };

  const handleAskAI = (question: string) => {
// ... (rest of handleAskAI as before)
      setVisualState("thinking");
      askAi({
          url: AI_INTERACT_URL(classId),
          method: "patch",
          values: { question, language }
      }, {
          onSuccess: (res: any) => {
              setCurrentScript(res.data.script);
              setVisualState("talking");
          },
          onError: () => {
              setVisualState("talking");
              open?.({
                  type: "error",
                  message: "AI Error",
                  description: "I was unable to answer. Please try again.",
              });
          }
      });
  };

  // 🛡️ PARENT GATING: AI interactive features are disabled for Parents
  if (isParent) return null;

  if (isIdentityLoading) {
// ... (Skeleton)
      return (
          <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-black/5 rounded-3xl animate-pulse">
              <Skeleton className="w-40 h-40 md:w-56 md:h-56 rounded-full mb-8" />
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-4 w-32" />
          </div>
      );
  }

  // 🛡️ FALLBACK: Non-supported browsers get a graceful message
  if (!isBrowserSupported && !isStaff) {
      return (
        <div className="relative w-full h-[400px] flex flex-col items-center justify-center rounded-3xl bg-red-950/10 border-4 border-red-500/20 text-center px-8">
            <AlertCircle className="w-16 h-16 text-red-500/40 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">AI Interaction Unavailable</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
                Your browser does not support voice interaction. Please switch to <b>Google Chrome</b> or <b>Microsoft Edge</b> to interact with your AI Co-Teacher.
            </p>
        </div>
      );
  }

  return (
// ... (Rest of return)
    <div className={cn(
        "relative w-full h-full min-h-[400px] flex flex-col items-center justify-center rounded-3xl overflow-hidden border-4 shadow-2xl transition-all duration-700",
        visualState === "talking" ? "bg-black/90 border-ai-primary/40 shadow-ai-primary/20" :
        visualState === "listening" ? "bg-orange-950/20 border-orange-500/40 shadow-orange-500/20" :
        "bg-green-950/20 border-green-500/40 shadow-green-500/20"
    )}>
      
      {/* Dynamic Background Pulse */}
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
          {/* The "Talking Head" Photo */}
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

              {/* Status Indicator */}
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

          {/* AI Transcription / Script */}
          <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-ai-primary">
                  {visualState === "thinking" ? <Loader2 className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
                  <span className="font-black uppercase tracking-tighter text-sm">
                      {visualState === "listening" ? "Voice Captured" : "Synthesizing Lesson"}
                  </span>
              </div>
              
              <AnimatePresence mode="wait">
                  {!currentScript && !photo ? (
                      <div className="space-y-2">
                          <Skeleton className="h-6 w-64 bg-white/10" />
                          <Skeleton className="h-6 w-48 mx-auto bg-white/10" />
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

          {/* Interaction Controls */}
          {/* 🛡️ RBAC: Only Students (non-staff) can raise hands to interact */}
          {!isStaff && (
              <div className="flex items-center gap-4 pt-6">
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={startListening}
                    disabled={isListening || visualState === "thinking"}
                    className={cn(
                        "rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-xs gap-3 transition-all",
                        isListening ? "bg-orange-500 text-white border-none animate-pulse" : "bg-white/5 text-white border-white/10 hover:bg-ai-primary hover:border-none"
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

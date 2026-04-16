import React from "react";
import { motion } from "framer-motion";
import { User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AIVisualState } from "@/features/ai/types";

interface AiCompanionAvatarProps {
  photo: string | null;
  visualState: AIVisualState;
  isSpeaking: boolean;
  isListening: boolean;
}

/**
 * 🛡️ ATOMIC WIDGET: AI Companion Avatar
 * Pure visual component for the animated avatar and its status badge.
 * Adheres to RTL logical positioning for the badge.
 */
export const AiCompanionAvatar = React.memo(
  ({ photo, visualState, isSpeaking, isListening }: AiCompanionAvatarProps) => {
    return (
      <div className="relative">
        <motion.div
          animate={
            isSpeaking
              ? {
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    "0 0 0px rgba(99, 102, 241, 0)",
                    "0 0 40px rgba(99, 102, 241, 0.4)",
                    "0 0 0px rgba(99, 102, 241, 0)",
                  ],
                }
              : isListening
                ? {
                    scale: [1, 0.98, 1],
                    borderColor: [
                      "rgba(249, 115, 22, 0.2)",
                      "rgba(249, 115, 22, 0.8)",
                      "rgba(249, 115, 22, 0.2)",
                    ],
                  }
                : {}
          }
          transition={{ repeat: Infinity, duration: 1.5 }}
          className={cn(
            "w-40 h-40 md:w-56 md:h-56 rounded-full border-4 overflow-hidden shadow-2xl bg-muted relative z-10 transition-colors duration-500",
            visualState === "talking"
              ? "border-white/20"
              : visualState === "listening"
                ? "border-orange-500/50"
                : "border-green-500/50"
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

        {/* 🛡️ RTL COMPLIANCE: Using start-1/2 instead of left-1/2 */}
        <div className="absolute -bottom-2 start-1/2 -translate-x-1/2 z-20 w-max">
          <Badge
            className={cn(
              "px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl border-none",
              visualState === "talking"
                ? "bg-ai-primary text-white animate-pulse"
                : visualState === "listening"
                  ? "bg-orange-500 text-white"
                  : "bg-green-500 text-white"
            )}
          >
            {visualState === "talking"
              ? "AI Co-Teacher Speaking"
              : visualState === "listening"
                ? "AI is Listening..."
                : "AI is Thinking..."}
          </Badge>
        </div>
      </div>
    );
  }
);

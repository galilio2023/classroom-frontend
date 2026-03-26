import React from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export const SparkleLoader = ({ message }: { message?: string }) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="relative">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="p-5 rounded-3xl bg-ai-primary/10 text-ai-primary shadow-xl shadow-ai-primary/20 relative z-10"
        >
          <Sparkles className="h-10 w-10" />
        </motion.div>
        
        {/* Orbiting particles */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              rotate: 360,
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div 
              className="w-1.5 h-1.5 rounded-full bg-ai-primary/40"
              style={{ transform: `translate(${25 + i * 10}px, ${25 + i * 10}px)` }}
            />
          </motion.div>
        ))}
      </div>
      
      <div className="space-y-2 text-center">
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-sm font-black uppercase tracking-[0.3em] text-ai-primary"
        >
          {message || t("aiHub.studyLab.analyzing", "Gemini is thinking...")}
        </motion.p>
        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
            Processing neural patterns
        </p>
      </div>
    </div>
  );
};

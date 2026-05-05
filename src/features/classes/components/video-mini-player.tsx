import React from "react";
import { usePersistentLive } from "@/features/classes/hooks/use-persistent-live";
import { Button } from "@/components/ui/button";
import { X, Play, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLowBandwidth } from "@/hooks/use-low-bandwidth";

export const VideoMiniPlayer = () => {
  const { t, i18n } = useTranslation();
  const { activeVideo, setActiveVideo, isJoined, promotionTrailer } = usePersistentLive();
  const isLowBandwidth = useLowBandwidth();
  const isArr = i18n.language === "ar";

  // 🛡️ PRIORITY GUARD: Live Classes > Promotion > Recorded Videos
  if (isJoined || promotionTrailer.url || !activeVideo.url) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="fixed bottom-6 end-6 w-72 md:w-96 z-[9997] group overflow-hidden rounded-2xl md:rounded-4xl border border-white/20 shadow-2xl bg-black shadow-blue-500/20 backdrop-blur-xl"
      >
        {/* Video Container */}
        <div className="aspect-video relative overflow-hidden bg-black">
          <video
            src={activeVideo.url}
            autoPlay={!isLowBandwidth}
            controls
            className="w-full h-full object-contain"
          />

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveVideo(null)}
            className="absolute top-2 end-2 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/10 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Info Header */}
        <div className="p-4 flex items-center justify-between gap-4 bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-500 shrink-0">
              <Play className="h-4 w-4 fill-blue-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 leading-none mb-1">
                {t("classes.resource.recordedLesson", "Revision Mode")}
              </p>
              <h4 className="text-xs font-bold text-white truncate pe-2">{activeVideo.title}</h4>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-white/10 text-white/60"
            title="Expand View"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

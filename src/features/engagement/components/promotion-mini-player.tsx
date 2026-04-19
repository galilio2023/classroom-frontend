import React from "react";
import { usePersistentLive } from "@/features/classes/hooks/use-persistent-live";
import { Button } from "@/components/ui/button";
import { X, Tv, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {} from "@/lib/utils";

export const PromotionMiniPlayer = () => {
  const { t, i18n } = useTranslation();
  const { promotionTrailer, setPromotionTrailer, isJoined } = usePersistentLive();
  const isArr = i18n.language === "ar";

  // 🛡️ PRIORITY GUARD: Live Classes always take precedence over promotional trailers
  if (isJoined || !promotionTrailer.url) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 20, scale: 0.9 }}
        className="fixed bottom-24 end-6 w-64 md:w-80 z-[9998] group overflow-hidden rounded-2xl md:rounded-3xl border border-white/20 shadow-2xl bg-black shadow-primary/20 backdrop-blur-xl"
      >
        {/* Video Background */}
        <div className="aspect-video relative overflow-hidden bg-black">
          <video
            src={promotionTrailer.url}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPromotionTrailer(null)}
            className="absolute top-2 end-2 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/10 z-20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Info Content */}
        <div className="p-4 space-y-3 relative z-10 bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
              <Tv className="h-3 w-3" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/80 leading-none mb-1">
                {t("teacherChannel.labels.officialChannel", "Promotion")}
              </p>
              <h4 className="text-xs font-bold text-white truncate">
                {promotionTrailer.teacherName}
              </h4>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full h-9 rounded-xl bg-white text-black font-black uppercase tracking-widest text-[9px] gap-2 border-none hover:bg-primary hover:text-white transition-all shadow-lg"
            onClick={() => {
              // Navigate to discovery or teacher profile
              window.location.href = "/discovery";
            }}
          >
            <ExternalLink className="h-3 w-3" />
            {t("buttons.joinClass", "Enroll Now")}
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

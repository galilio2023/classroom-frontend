import React, { useEffect, useState } from "react";
import { useNavigation } from "@refinedev/core";
import { socket } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { Video, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import { cn } from "@/lib/utils";

interface LiveClass {
  id: number;
  name: string;
  subject?: { name: string };
}

export const GlobalLiveIndicator = () => {
  const { t, i18n } = useTranslation();
  const { show } = useNavigation();
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const isAr = i18n.language === "ar";

  useEffect(() => {
    // 1. Initial Load: Fetch already live classes
    const fetchLive = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/classes/live`, { withCredentials: true });
        setLiveClasses(response.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch initial live classes:", err);
      }
    };
    void fetchLive();

    // 2. Real-time Listeners
    const handleStarted = () => {
        // Fetch full class details to get the name
        void fetchLive(); 
    };

    const handleEnded = (data: { classId: number }) => {
        setLiveClasses(prev => prev.filter(c => c.id !== data.classId));
    };

    socket.on("live_session_started", handleStarted);
    socket.on("live_session_ended", handleEnded);

    return () => {
      socket.off("live_session_started", handleStarted);
      socket.off("live_session_ended", handleEnded);
    };
  }, []);

  if (liveClasses.length === 0) return null;

  const currentClass = liveClasses[0]; // Show the most recent one

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="fixed top-20 start-1/2 -translate-x-1/2 z-[100] w-full max-w-xs md:max-w-sm px-4"
      >
        <div className="bg-live-primary text-white rounded-2xl shadow-2xl shadow-live-primary/40 border border-white/20 p-1 flex items-center gap-3 overflow-hidden backdrop-blur-md">
          <div className="bg-white/20 p-2 rounded-xl animate-pulse">
            <Video className="h-4 w-4 md:h-5 md:w-5" />
          </div>
          
          <div className="flex-1 min-w-0 py-1">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none">
              {t("classes.live.indicator.liveNow", "Live Now")}
            </p>
            <h4 className="text-xs md:text-sm font-bold truncate pe-2">
              {currentClass.name}
            </h4>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => show("classes", currentClass.id.toString(), { tab: "live" } as any)}
            className="h-8 md:h-10 rounded-xl bg-white text-live-primary hover:bg-white/90 font-black text-[10px] uppercase tracking-tighter px-3 md:px-4"
          >
            {t("notifications.joinNow", "Join")}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLiveClasses([])}
            className="h-8 w-8 rounded-full hover:bg-white/10 text-white/60"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

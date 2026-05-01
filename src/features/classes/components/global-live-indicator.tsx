import React, { useEffect, useState } from "react";
import { useNavigation } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { socket } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { Video, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import {} from "@/lib/utils";

interface LiveClass {
  id: number;
  name: string;
  subject?: { name: string };
}

export const GlobalLiveIndicator = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const isArr = i18n.language === "ar";

  useEffect(() => {
    // 1. Initial Load: Fetch already live classes
    const fetchLive = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/classes/live`, {
          withCredentials: true,
        });
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
      setLiveClasses((prev) => prev.filter((c) => c.id !== data.classId));
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
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="w-full bg-live-primary text-white overflow-hidden relative z-50 border-b border-white/10 shadow-lg shadow-live-primary/10"
      >
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 animate-pulse shrink-0">
              <Video className="h-4 w-4" />
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-0 md:gap-3 min-w-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/70 whitespace-nowrap">
                {t("classes.live.indicator.liveNow", "Live Session Active")}
              </span>
              <h4 className="text-xs md:text-sm font-bold truncate">{currentClass.name}</h4>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => navigate(`/classes/show/${currentClass.id}?subtab=live`)}
            className="rounded-full bg-white text-live-primary hover:bg-white/90 font-black text-[10px] uppercase tracking-widest h-9 px-6 shadow-xl transition-all active:scale-95 shrink-0"
          >
            {t("notifications.joinNow", "Join Now")}
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

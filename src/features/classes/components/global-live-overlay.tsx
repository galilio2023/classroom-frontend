import { useList, useGetIdentity } from "@refinedev/core";
import { User, Class, UserRole } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { Radio, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { socket } from "@/lib/socket";

/**
 * 🚀 DURABLE LIVE OVERLAY
 * Instead of just listening for pulses, this component reconciles with the
 * durable state of the user's active classes to ensure visibility.
 */
export const GlobalLiveOverlay = () => {
  const { t } = useTranslation();
  const { data: identity } = useGetIdentity<User>();
  const [isDismissed, setIsDismissed] = useState(false);

  // Durable Fetch: What is actually live right now?
  const { query } = useList<Class>({
    resource: "classes/live",
    queryOptions: {
      enabled: !!identity?.id,
      // Re-reconcile every 60 seconds as a safety heartbeat
      refetchInterval: 60000,
    },
  });

  const { data, refetch } = query;
  const liveClasses = data?.data || [];

  useEffect(() => {
    // Re-reconcile on socket events (e.g., if we were offline and just came back)
    socket.on("class:live:started", () => void refetch());
    socket.on("class:live:stopped", () => void refetch());
    socket.on("connect", () => void refetch());

    return () => {
      socket.off("class:live:started");
      socket.off("class:live:stopped");
      socket.off("connect");
    };
  }, [refetch]);

  if (liveClasses.length === 0 || isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 end-6 z-[9999] max-w-sm w-full"
      >
        <div className="bg-primary text-primary-foreground p-5 rounded-[2rem] shadow-2xl shadow-primary/40 relative overflow-hidden group">
          {/* Animated Background Pulse */}
          <div className="absolute inset-0 bg-white/10 scale-0 group-hover:scale-150 transition-transform duration-1000 rounded-full" />

          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-white animate-ping rounded-full opacity-50" />
                  <div className="bg-white p-2 rounded-full relative">
                    <Radio className="h-4 w-4 text-primary animate-pulse" />
                  </div>
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase tracking-widest leading-none">
                    {t("classes.live.liveNow", { defaultValue: "Live Now" })}
                  </h4>
                  <p className="text-[10px] font-bold opacity-70 uppercase tracking-tighter">
                    {t("classes.live.happeningInClass", {
                      defaultValue: "Active Session Detected",
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDismissed(true)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {liveClasses.slice(0, 2).map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-white/10 rounded-2xl border border-white/10 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-xs truncate">{c.name}</p>
                  </div>

                  <Button
                    asChild
                    size="sm"
                    variant="secondary"
                    className="w-full h-8 rounded-xl font-black text-[10px] uppercase tracking-widest bg-white text-primary hover:bg-white/90"
                  >
                    <Link to={`/classes/show/${c.id}?tab=live`}>
                      {t("buttons.joinNow")}
                      <ArrowRight className="h-3 w-3 ms-2" />
                    </Link>
                  </Button>
                </div>
              ))}
              {liveClasses.length > 2 && (
                <p className="text-center text-[10px] font-black uppercase tracking-widest opacity-60">
                  + {liveClasses.length - 2} {t("common.more", { defaultValue: "more" })}
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

import { useEffect, useState } from "react";
import { WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useOfflineSync } from "../hooks/use-offline-sync";
import { offlineDB as db } from "@/lib/offline-db";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function OfflineBanner() {
  const { t } = useTranslation();
  const { isOnline } = useOfflineSync();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // 🛡️ SYNC MONITOR: Track outbox size across all critical tables
  useEffect(() => {
    const updateCount = async () => {
      try {
        const [quizzes, mutations, notes, xp] = await Promise.all([
          db.quizzes.count(),
          db.mutations.count(),
          db.notes.where("isSynced").equals(0).count(), // notes table uses 0/1 for boolean in some Dexie versions
          db.pending_xp.count(),
        ]);
        const total = quizzes + mutations + notes + xp;

        if (total === 0 && pendingCount > 0 && isOnline) {
          // Sync just finished
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        }

        setPendingCount(total);
        setIsSyncing(total > 0 && isOnline);
      } catch (err) {
        console.error("Failed to poll offline outbox:", err);
      }
    };

    const interval = setInterval(updateCount, 3000);
    void updateCount();

    return () => clearInterval(interval);
  }, [isOnline, pendingCount]);

  const showBanner = !isOnline || isSyncing || showSuccess;

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={cn(
          "w-full text-white py-2 px-4 flex items-center justify-center gap-3 text-[10px] md:text-xs font-black uppercase tracking-widest relative z-50 shadow-lg",
          !isOnline
            ? "bg-red-600 shadow-red-900/20"
            : isSyncing
              ? "bg-amber-500 shadow-amber-900/20"
              : "bg-emerald-500 shadow-emerald-900/20"
        )}
      >
        <div className="flex items-center gap-3 max-w-screen-2xl mx-auto">
          {!isOnline ? (
            <>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <WifiOff className="h-3.5 w-3.5" />
              </div>
              <span>{t("common.offline", "Offline Mode: Learning without Limits")}</span>
            </>
          ) : isSyncing ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>
                {t("offline.syncing_banner", {
                  defaultValue: "Syncing {{count}} pending items...",
                  count: pendingCount,
                }).replace("{{count}}", pendingCount.toString())}
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>
                {t("offline.sync_complete", "Reconnection Successful: All data synchronized.")}
              </span>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

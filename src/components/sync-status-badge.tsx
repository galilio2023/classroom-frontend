import { useState, useEffect } from "react";
import { CloudOff, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { offlineDB } from "@/lib/offline-db";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SyncStatusBadgeProps {
  resource: string;
  id: string | number;
  className?: string;
}

/**
 * 🛰️ SyncStatusBadge
 * Lightweight component that visually tracks the offline/online status of a specific record.
 * Subscribes to window 'online/offline' events and polls the offlineDB.
 */
export const SyncStatusBadge = ({ resource, id, className }: SyncStatusBadgeProps) => {
  const [status, setStatus] = useState<"synced" | "pending" | "offline" | "conflict">("synced");
  const [_isOnlinee, setIsOnline] = useState(true);

  const checkSyncStatus = async () => {
    if (!navigator.onLine) {
      setIsOnline(false);
      setStatus("offline");
      return;
    }

    setIsOnline(true);
    const pending = await offlineDB.getPendingById(resource, id);
    setStatus(pending ? "pending" : "synced");
  };

  useEffect(() => {
    checkSyncStatus();

    const handleNetworkChange = () => checkSyncStatus();
    window.addEventListener("online", handleNetworkChange);
    window.addEventListener("offline", handleNetworkChange);

    // Polling interval to catch when flushOutbox finishes
    const interval = setInterval(checkSyncStatus, 3000);

    return () => {
      window.removeEventListener("online", handleNetworkChange);
      window.removeEventListener("offline", handleNetworkChange);
      clearInterval(interval);
    };
  }, [resource, id]);

  const config = {
    synced: {
      icon: CheckCircle2,
      color: "text-green-500/60",
      label: "Synced with server",
    },
    pending: {
      icon: RefreshCw,
      color: "text-primary animate-spin",
      label: "Syncing changes...",
    },
    offline: {
      icon: CloudOff,
      color: "text-muted-foreground/40",
      label: "Offline: Changes saved locally",
    },
    conflict: {
      icon: AlertCircle,
      color: "text-destructive",
      label: "Sync conflict: Click to resolve",
    },
  };

  const { icon: Icon, color, label } = config[status];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center justify-center p-1.5 rounded-full bg-background/50 border border-border/10 shadow-xs transition-all",
              className
            )}
          >
            <Icon className={cn("h-3.5 w-3.5", color)} />
          </div>
        </TooltipTrigger>
        <TooltipContent className="rounded-xl font-bold text-[10px] uppercase tracking-widest border-none shadow-2xl bg-black text-white dark:bg-white dark:text-black">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { socket } from "@/lib/socket";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PresenceUser } from "@/types";

/**
 * 👥 PresenceAvatars
 * Displays real-time active users in the current classroom.
 * Hooks into the 'presence:update' socket event and sends heartbeats.
 */
export const PresenceAvatars = () => {
  const { id } = useParams();
  const { pathname } = useLocation();
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [count, setCount] = useState(0);

  // Extract classId from URL (only show presence in class-specific views)
  const classId = pathname.includes("/classes/show/") ? id : undefined;

  useEffect(() => {
    if (!socket || !classId) {
      setUsers([]);
      setCount(0);
      return;
    }

    // 1. Listen for updates
    const onPresenceUpdate = (data: { classId: string; users: PresenceUser[]; count: number }) => {
      if (String(data.classId) === String(classId)) {
        // Sort: Teachers first, then alphabetical
        const sorted = [...data.users].sort((a, b) => {
          if (a.role === "teacher" && b.role !== "teacher") return -1;
          if (a.role !== "teacher" && b.role === "teacher") return 1;
          return a.name.localeCompare(b.name);
        });
        setUsers(sorted);
        setCount(data.count);
      }
    };

    socket.on("presence:update", onPresenceUpdate);

    // 2. Send Heartbeat immediately and then every 10s
    const sendHeartbeat = () => {
      socket.emit("presence:heartbeat", { classId });
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 10000);

    return () => {
      socket.off("presence:update", onPresenceUpdate);
      clearInterval(interval);
      socket.emit("presence:leave", { classId }); // 🛡️ EXPLICIT LEAVE: Clean up presence immediately
    };
  }, [classId]);

  if (!classId || users.length === 0) return null;

  const displayUsers = users.slice(0, 5);
  const remaining = Math.max(0, count - 5);

  return (
    <div className="flex items-center -space-x-3 hover:space-x-1 transition-all duration-500 ease-in-out px-4 py-2 rounded-2xl bg-muted/20 border border-border/10 backdrop-blur-sm">
      <TooltipProvider delayDuration={0}>
        <AnimatePresence mode="popLayout">
          {displayUsers.map((user, idx) => (
            <Tooltip key={user.id}>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, x: -10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.5, x: 10 }}
                  className={cn(
                    "relative transition-transform hover:z-30 hover:-translate-y-1",
                    idx === 0 ? "z-20" : ""
                  )}
                >
                  <Avatar
                    className={cn(
                      "h-8 w-8 border-2 border-background ring-2 ring-transparent transition-all",
                      user.role === "teacher" ? "ring-primary/40" : "ring-border/20"
                    )}
                  >
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {user.role === "teacher" && (
                    <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-primary rounded-full border-2 border-background flex items-center justify-center">
                      <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" />
                    </div>
                  )}
                </motion.div>
              </TooltipTrigger>
              <TooltipContent className="rounded-xl font-bold text-[10px] uppercase tracking-widest border-none shadow-2xl bg-black text-white p-2 px-3">
                {user.name} {user.role === "teacher" ? "(Teacher)" : ""}
              </TooltipContent>
            </Tooltip>
          ))}
        </AnimatePresence>
      </TooltipProvider>

      {remaining > 0 && (
        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-background border-2 border-muted text-[10px] font-black text-muted-foreground z-10 ps-1">
          +{remaining}
        </div>
      )}

      <div className="ms-4 flex flex-col items-start leading-none gap-0.5">
        <span className="text-[9px] font-black uppercase tracking-widest text-primary animate-pulse">
          Live
        </span>
        <span className="text-[10px] font-bold text-muted-foreground">{count} present</span>
      </div>
    </div>
  );
};

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface XPGain {
  id: number;
  amount: number;
  reason?: string;
}

export function XPGainPopup() {
  const [gains, setGains] = useState<XPGain[]>([]);

  useEffect(() => {
    socket.connect();

    const handleXPGained = (data: { amount: number; reason?: string }) => {
      const id = Date.now();
      setGains((prev) => [...prev, { id, amount: data.amount, reason: data.reason }]);
      
      // Remove after animation (3 seconds)
      setTimeout(() => {
        setGains((prev) => prev.filter((g) => g.id !== id));
      }, 3000);
    };

    const handleLocalXPGained = (event: any) => {
      handleXPGained(event.detail);
    };

    socket.on("xp_gained", handleXPGained);
    window.addEventListener("xp_gained_local", handleLocalXPGained);

    return () => {
      socket.off("xp_gained", handleXPGained);
      window.removeEventListener("xp_gained_local", handleLocalXPGained);
      socket.disconnect();
    };
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-2 pointer-events-none">
      {gains.map((gain) => (
        <div
          key={gain.id}
          className={cn(
            "bg-gold-primary text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border-2 border-white/20 backdrop-blur-md",
            "animate-in slide-in-from-bottom-4 fade-in duration-500 fill-mode-both"
          )}
        >
          <Zap className="h-4 w-4 fill-white" />
          <span className="font-black text-sm">+{gain.amount} XP</span>
          {gain.reason && (
            <span className="text-[10px] font-bold uppercase opacity-80 border-l border-white/20 pl-2">
              {gain.reason}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

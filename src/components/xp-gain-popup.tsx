import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface XPGain {
  id: number;
  amount: number;
  reason?: string;
}

export function XPGainPopup() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [gains, setGains] = useState<XPGain[]>([]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(isArabic ? "ar-EG" : "en-US").format(num);
  };

  useEffect(() => {
    socket.connect();

    const handleXPGained = (data: { amount: number; reason?: string }) => {
      const id = Date.now();
      setGains((prev) => [
        ...prev,
        { id, amount: data.amount, reason: data.reason },
      ]);

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
    <div
      className={cn(
        "fixed bottom-8 z-[100] flex flex-col gap-2 pointer-events-none",
        "end-8",
      )}
    >
      {gains.map((gain) => (
        <div
          key={gain.id}
          className={cn(
            "bg-gold-primary text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border-2 border-white/20 backdrop-blur-md",
            "animate-in slide-in-from-bottom-4 fade-in duration-500 fill-mode-both",
          )}
        >
          <Zap className={cn("h-4 w-4 fill-white", isArabic && "order-last")} />
          <span className="font-black text-sm">
            +{formatNumber(gain.amount)} {t("common.xp")}
          </span>
          {gain.reason && (
            <span
              className={cn(
                "text-[10px] font-bold uppercase opacity-80",
                isArabic
                  ? "border-r border-white/20 pe-2 order-first"
                  : "border-l border-white/20 ps-2",
              )}
            >
              {gain.reason}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

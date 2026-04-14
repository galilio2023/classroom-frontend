import React from "react";
import { CardTitle, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  onClose: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onClose }) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  return (
    <CardHeader className="p-4 md:p-6 border-b border-border/10 ai-header-gradient text-white rounded-t-2xl flex flex-row items-center justify-between space-y-0 relative overflow-hidden">
      {/* Subtle shine effect */}
      <div
        className={cn(
          "absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent pointer-events-none transition-all duration-1000",
          isAr
            ? "translate-x-full animate-[shine-rtl_3s_infinite]"
            : "-translate-x-full animate-[shine_3s_infinite]"
        )}
      />

      <div className="flex items-center gap-3 md:gap-4 relative z-10">
        <div className="p-2 md:p-2.5 bg-white/10 backdrop-blur-md rounded-xl shadow-inner border border-white/20">
          <Sparkles className="h-5 w-5 md:h-6 md:w-6 animate-pulse text-white" />
        </div>
        <div className="flex flex-col text-start">
          <CardTitle className="text-base md:text-xl font-black tracking-tight leading-none text-white">
            {t("aiHub.studyLab.studyBuddy.title")}
          </CardTitle>
          <p className="text-[9px] md:text-[10px] font-bold opacity-90 uppercase tracking-[0.2em] mt-1 text-white/80">
            {t("aiHub.studyLab.studyBuddy.poweredBy")}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 md:h-12 md:w-12 hover:bg-white/20 text-white rounded-full transition-all relative z-10"
        onClick={onClose}
      >
        <X className="h-5 w-5 md:h-6 md:w-6" />
      </Button>
    </CardHeader>
  );
};

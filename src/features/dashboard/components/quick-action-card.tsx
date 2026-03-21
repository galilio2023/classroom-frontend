import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, LucideIcon, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export interface QuickAction {
  title: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  heading: string;
  description: string;
  resource: string;
}

interface QuickActionCardProps {
  action: QuickAction;
  onAction: (resource: string) => void;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({ action, onAction }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const Icon = action.icon;
  
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="h-full w-full"
    >
      <Card 
        className="h-full border border-border/80 dark:border-white/5 shadow-sm hover:shadow-xl group transition-all duration-500 bg-card/40 backdrop-blur-3xl rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden relative cursor-pointer"
        onClick={() => action.resource && onAction(action.resource)}
      >
        {/* Modern Background Icon Glow */}
        <div className={cn(
            "absolute p-4 opacity-[0.02] group-hover:opacity-[0.06] transition-all duration-700 pointer-events-none",
            isRtl ? "-left-6 -top-6 -rotate-12 group-hover:rotate-0" : "-right-6 -top-6 rotate-12 group-hover:rotate-0",
            "group-hover:scale-125 group-hover:text-primary"
        )}>
          <Icon className="h-32 w-32 md:h-48 md:w-48" />
        </div>
        
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 md:p-8 pb-3 md:pb-4 relative z-10">
          <CardTitle className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/50 group-hover:text-primary transition-colors">
            {action.title}
          </CardTitle>
          <div className="p-2.5 md:p-4 rounded-xl md:rounded-[1.25rem] bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 group-hover:rotate-6 shadow-sm">
            <Icon className="h-5 w-5 md:h-7 md:w-7" />
          </div>
        </CardHeader>
        
        <CardContent className="p-5 md:p-8 pt-1 md:pt-2 relative z-10 flex flex-col h-full">
          <div className="mb-2 md:mb-4">
            <div className="text-lg md:text-2xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-tight">
                {action.heading}
            </div>
          </div>
          
          <p className="text-xs md:text-base text-muted-foreground/70 mb-6 md:mb-10 leading-relaxed font-medium line-clamp-2 md:line-clamp-3">
            {action.description}
          </p>
          
          <div className="flex items-center justify-between mt-auto pt-4 md:pt-6 border-t border-border/40">
            <div className="hidden xs:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/40 group-hover:text-primary/60 transition-colors">
              <Sparkles className="h-3 w-3" />
              <span>{t("common.fastTrack")}</span>
            </div>
            <Button 
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-xl transition-all font-black uppercase tracking-widest text-[10px] h-10 md:h-12 px-5 md:px-8 gap-2 shadow-sm ml-auto",
                "bg-primary/10 dark:bg-primary/20 hover:bg-primary hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/20",
                "border border-primary/10 dark:border-primary/20 hover:border-primary"
              )}
            >
              {t("common.explore")}
              {isRtl ? (
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              ) : (
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

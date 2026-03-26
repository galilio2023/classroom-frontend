import React from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@refinedev/core";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  BookOpen,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
} from "lucide-react";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface HelpStep {
  title: string;
  description: string;
  actionId?: string;
}

export const HelpHub = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { list } = useNavigation();
  const [isOpen, setIsOpen] = React.useState(false);
  const path = location.pathname;
  const hash = location.hash;

  // Logic to determine help content based on route
  const getPathKey = () => {
    if (path === "/dashboard") return "dashboard";
    if (path.startsWith("/classes/")) {
      if (hash === "#curriculum") return "classCurriculum";
      if (hash === "#attendance") return "classAttendance";
      return "classHub";
    }
    if (path === "/assignments/create") return "createAssignment";
    if (path === "/ai-study-lab") return "studyLab";
    return "general";
  };

  const key = getPathKey();

  // FIX: Use 'as any' to bypass the complex i18next union type issues with returnObjects
  const steps = t(`help.pages.${key}.steps` as any, {
    returnObjects: true,
  }) as unknown as HelpStep[];
  const tips = t(`help.pages.${key}.tips` as any, {
    returnObjects: true,
  }) as unknown as string[];

  const handleAskAi = () => {
    setIsOpen(false);
    list("ai-assistant");
  };

  const handleStepClick = (actionId?: string) => {
    if (!actionId) return;

    setIsOpen(false);

    // Small delay to let the sheet close
    setTimeout(() => {
      const element = document.getElementById(actionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });

        // Visual feedback
        element.classList.add(
          "ring-4",
          "ring-primary",
          "ring-offset-4",
          "transition-all",
          "duration-500",
          "z-50",
        );

        // Trigger click if it's a button
        if (element.tagName === "BUTTON") {
          (element as HTMLButtonElement).click();
        }

        setTimeout(() => {
          element.classList.remove("ring-4", "ring-primary", "ring-offset-4");
        }, 3000);
      }
    }, 400);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 md:h-10 md:w-10 rounded-full bg-primary/5 hover:bg-primary/10 text-primary transition-all duration-300 group"
        >
          <HelpCircle className="h-5 w-5 md:h-6 md:w-6 transition-transform group-hover:scale-110" />
          <span className="sr-only">Help</span>
          <span className="absolute -top-1 -end-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-20"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary/40"></span>
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md border-l border-border/40 bg-white dark:bg-[#09090b] opacity-100 backdrop-blur-none p-0 shadow-2xl">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-8">
            <SheetHeader className="text-start">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Lightbulb className="h-5 w-5 animate-pulse" />
                </div>
                <SheetTitle className="text-2xl font-black tracking-tight">
                  {t(`help.pages.${key}.title` as any, {
                    defaultValue: t("help.pages.general.title" as any),
                  })}
                </SheetTitle>
              </div>
              <SheetDescription className="text-base font-medium text-muted-foreground">
                {t(`help.pages.${key}.description` as any, {
                  defaultValue: t("help.pages.general.description" as any),
                })}
              </SheetDescription>
            </SheetHeader>

            {/* How-to Steps */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/60 flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5" />
                  {t("help.common.howTo")}
                </h3>
                <span className="text-[10px] font-bold text-muted-foreground/40 italic">
                  {t("help.common.clickToTry")}
                </span>
              </div>
              <div className="space-y-3">
                {Array.isArray(steps) &&
                  steps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 4 }}
                      onClick={() => handleStepClick(step.actionId)}
                      className={cn(
                        "p-4 rounded-2xl bg-muted/30 border border-border/20 flex gap-4 group transition-all cursor-pointer",
                        step.actionId
                          ? "hover:bg-primary/3 hover:border-primary/30"
                          : "hover:bg-muted/50",
                      )}
                    >
                      <div
                        className={cn(
                          "flex-shrink-0 h-6 w-6 rounded-full border shadow-sm flex items-center justify-center text-xs font-black transition-colors",
                          step.actionId
                            ? "bg-primary/10 border-primary/20 text-primary group-hover:bg-primary group-hover:text-white"
                            : "bg-background border-border/50 text-muted-foreground",
                        )}
                      >
                        {index + 1}
                      </div>
                      <div className="space-y-1 text-start">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm group-hover:text-primary transition-colors">
                            {step.title}
                          </h4>
                          {step.actionId && (
                            <Sparkles className="h-3 w-3 text-ai-primary animate-pulse" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>

            {/* Pro Tips Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-ai-primary/60 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                {t("help.common.proTips")}
              </h3>
              <div className="grid gap-3">
                {Array.isArray(tips) &&
                  tips.map((tip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-ai-primary/5 text-ai-primary/80 border border-ai-primary/10 italic text-xs font-medium text-start"
                    >
                      <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{tip}</span>
                    </motion.div>
                  ))}
              </div>
            </div>

            {/* AI Assistant Call to Action */}
            <div className="pt-4">
              <div className="p-6 rounded-4xl bg-linear-to-br from-primary/10 via-ai-primary/5 to-transparent border border-primary/10 relative overflow-hidden group">
                <div className="absolute top-0 end-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-12 w-12" />
                </div>
                <h4 className="text-sm font-black mb-2 flex items-center gap-2 text-start">
                  {t("help.common.stillStuck")}
                </h4>
                <p className="text-xs text-muted-foreground mb-4 font-medium leading-relaxed text-start">
                  {t("help.common.aiChatDesc")}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl font-bold bg-background/50 hover:bg-background border-primary/20 text-primary"
                  onClick={handleAskAi}
                >
                  {t("help.common.askAi")}
                  <ArrowRight className="ms-2 h-3.5 w-3.5 rtl:rotate-180" />
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

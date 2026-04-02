import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Module } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  updatedModules: Module[];
}

export const VersionSummaryModal = ({ isOpen, onClose, updatedModules }: Props) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] overflow-hidden border-none shadow-2xl">
        <div className="absolute top-0 inset-x-0 h-2 bg-linear-to-r from-ai-primary to-primary" />

        <DialogHeader className="pt-6">
          <DialogTitle className="flex items-center gap-3 text-2xl font-black tracking-tight">
            <div className="p-2 rounded-xl bg-ai-primary/10 text-ai-primary animate-pulse">
              <Sparkles className="h-6 w-6" />
            </div>
            {t("classes.curriculum.whatsNew", { defaultValue: "What's New?" })}
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-muted-foreground">
            {t("classes.curriculum.updatesSinceLastVisit", {
              defaultValue:
                "New materials and updates have been published in this class since your last visit.",
            })}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[300px] pr-4 mt-4">
          <div className="space-y-4">
            {updatedModules.map((module) => (
              <div
                key={module.id}
                className="p-4 rounded-2xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-black text-sm group-hover:text-primary transition-colors">
                    {module.name}
                  </h4>
                  <Badge
                    variant="outline"
                    className="text-[10px] md:text-[11px] font-black uppercase tracking-tighter bg-background"
                  >
                    v{module.version}
                  </Badge>
                </div>
                {module.description && (
                  <p className="text-[10px] text-muted-foreground font-medium line-clamp-2 leading-relaxed">
                    {module.description}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-2 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-primary/60">
                  <ArrowRight className="h-3 w-3" />
                  {t("common.viewNewContent", { defaultValue: "View Content" })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onClose}
            className="w-full h-12 rounded-xl font-black uppercase tracking-widest gap-2 shadow-lg shadow-primary/20"
          >
            <CheckCircle2 className="h-4 w-4" />
            {t("buttons.iGotIt", { defaultValue: "I'm caught up!" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

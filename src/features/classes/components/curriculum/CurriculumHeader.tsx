import { BookOpen, Wand2, Sparkles, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CanAccess } from "@/components/auth/can-access";
import { useTranslation } from "react-i18next";

interface CurriculumHeaderProps {
  classId: string;
  isTeacher: boolean;
  enableAiFeatures: boolean;
  onMagicClick: () => void;
  onAddModuleClick: () => void;
}

export const CurriculumHeader = ({
  classId,
  isTeacher,
  enableAiFeatures,
  onMagicClick,
  onAddModuleClick,
}: CurriculumHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-start">
      <div className="space-y-1 md:space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <BookOpen className="h-4 w-4 md:h-5 md:w-5" />
          </div>
          <h3 className="text-xl md:text-2xl font-black tracking-tight">
            {t("classes.curriculum.courseCurriculum")}
          </h3>
        </div>
        <p className="text-sm md:text-base text-muted-foreground font-medium max-w-2xl">
          {t("classes.curriculum.curriculumDescription")}
        </p>
      </div>

      {isTeacher && (
        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
          {enableAiFeatures && (
            <CanAccess resource="modules" action="create" params={{ classId }}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      id="guide-magic-builder"
                      variant="outline"
                      className="flex-1 md:flex-none rounded-xl h-10 md:h-12 px-4 md:px-8 border-ai-primary/20 text-ai-primary hover:bg-ai-primary/5 font-black uppercase tracking-widest text-[9px] md:text-[10px] gap-2 relative overflow-hidden group shadow-sm"
                      onClick={onMagicClick}
                    >
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out] pointer-events-none" />
                      <Wand2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      <span className="truncate">{t("buttons.magicBuilder")}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-center border-ai-primary/20 bg-background/95 backdrop-blur-xl p-3 shadow-2xl rounded-xl">
                    <div className="flex items-center justify-center mb-1">
                      <Sparkles className="h-4 w-4 text-ai-primary animate-pulse me-2" />
                      <span className="font-bold">{t("tooltips.magicBuilder.title")}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("tooltips.magicBuilder.description")}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CanAccess>
          )}

          <CanAccess resource="modules" action="create" params={{ classId }}>
            <Button
              id="guide-add-module"
              onClick={onAddModuleClick}
              className="flex-1 md:flex-none rounded-xl h-10 md:h-12 px-4 md:px-8 font-black uppercase tracking-widest text-[9px] md:text-[10px] gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              <PlusCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="truncate">{t("buttons.addModule")}</span>
            </Button>
          </CanAccess>
        </div>
      )}
    </div>
  );
};

import { Resource } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Video,
  Link as LinkIcon,
  PenLine,
  File,
  Eye,
  CheckCircle2,
  Circle,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { AiFeatureGuard } from "@/features/ai/components/AiFeatureGuard";

interface ResourceItemProps {
  resource: Resource;
  isStudent: boolean;
  completed: boolean;
  classId: string;
  onToggleProgress: (id: number) => void;
}

export const ResourceItem = ({
  resource,
  isStudent,
  completed,
  classId,
  onToggleProgress,
}: ResourceItemProps) => {
  const { t } = useTranslation();

  const getResourceIcon = () => {
    switch (resource.type) {
      case "video":
        return { icon: Video, color: "text-blue-500", bg: "bg-blue-500/10" };
      case "link":
        return { icon: LinkIcon, color: "text-success", bg: "bg-success/10" };
      case "note":
        return {
          icon: PenLine,
          color: "text-ai-primary",
          bg: "bg-ai-primary/10",
        };
      default:
        return { icon: File, color: "text-orange-500", bg: "bg-orange-500/10" };
    }
  };

  const { icon: Icon, color, bg } = getResourceIcon();

  return (
    <motion.div
      layout
      className={cn(
        "group flex flex-col p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all duration-300",
        completed
          ? "bg-success/5 border-success/20 shadow-sm"
          : "bg-card/50 border-black/3 dark:border-white/3 hover:border-primary/20 hover:bg-card hover:shadow-md"
      )}
    >
      <div className="flex items-center justify-between gap-3 md:gap-4">
        <div className="flex items-center gap-3 md:gap-4 overflow-hidden flex-1">
          {isStudent && (
            <button
              onClick={() => onToggleProgress(resource.id)}
              className="shrink-0 focus:outline-none group/check"
            >
              <AnimatePresence mode="wait">
                {completed ? (
                  <motion.div
                    key="completed"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                  >
                    <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-success" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="pending"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                  >
                    <Circle className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground/40 group-hover/check:text-primary transition-colors" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          )}

          <div className="flex items-center gap-2.5 md:gap-3 min-w-0">
            <div
              className={cn(
                "p-1.5 md:p-2 rounded-lg md:rounded-xl shrink-0 transition-transform group-hover:scale-110",
                bg
              )}
            >
              <Icon className={cn("h-3.5 w-3.5 md:h-4 md:w-4", color)} />
            </div>

            <div className="flex flex-col min-w-0 text-start">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs md:text-sm font-black tracking-tight truncate transition-all",
                    completed
                      ? "text-success/60 line-through decoration-success/30"
                      : "text-foreground group-hover:text-primary"
                  )}
                >
                  {resource.title}
                </span>
              </div>
              <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-muted-foreground/40 truncate">
                {t(`classes.resource.addDialog.types.${resource.type}`)}{" "}
                {resource.type === "note" && (
                  <AiFeatureGuard>
                    <span>• {t("common.aiAnalyzed")}</span>
                  </AiFeatureGuard>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {resource.type === "note" ? (
            <AiFeatureGuard>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-8 md:h-9 rounded-lg md:rounded-xl px-3 md:px-4 text-[10px] md:text-[11px] font-black uppercase tracking-widest gap-1.5 md:gap-2 text-primary hover:bg-primary/5 transition-all"
              >
                <Link to={`/classes/${classId}/lessons/${resource.id}`}>
                  <Eye className="h-3 w-3 md:h-3.5 md:w-3.5" />
                  <span className="hidden xs:inline">{t("buttons.openLesson")}</span>
                  <ArrowRight className="hidden md:block h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all rtl:rotate-180" />
                </Link>
              </Button>
            </AiFeatureGuard>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-8 md:h-9 rounded-lg md:rounded-xl px-3 md:px-4 text-[10px] md:text-[11px] font-black uppercase tracking-widest gap-1.5 md:gap-2 hover:bg-muted transition-all"
            >
              <a href={resource.url} target="_blank" rel="noreferrer">
                <ExternalLink className="h-3 w-3 md:h-3.5 md:w-3.5" />
                <span className="hidden xs:inline">{t("buttons.view")}</span>
              </a>
            </Button>
          )}
        </div>
      </div>

      {resource.type === "note" && resource.content && (
        <div className="mt-2 md:mt-3 ps-10 md:ps-12 rtl:ps-0 rtl:pe-10 md:rtl:pe-12 text-[10px] md:text-[11px] text-muted-foreground/60 line-clamp-1 italic font-medium text-start">
          <div className="prose prose-xs dark:prose-invert max-w-none pointer-events-none">
            <ReactMarkdown>{resource.content}</ReactMarkdown>
          </div>
        </div>
      )}
    </motion.div>
  );
};

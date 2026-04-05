import React from "react";
import { FileText, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigation, CanAccess } from "@refinedev/core";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import { getSafeUrl } from "@/lib/security";
import { type ChatSource } from "@/types/ai";

interface ChatSourceBadgeProps {
  source: ChatSource;
  index: number;
}

export const ChatSourceBadge = ({ source, index }: ChatSourceBadgeProps) => {
  const { t } = useTranslation();
  const { showUrl } = useNavigation();

  return (
    <div className="flex items-center gap-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="secondary"
              className="text-[9px] md:text-[10px] h-7 px-3 gap-2 bg-primary/5 hover:bg-primary/10 border border-primary/10 text-primary font-bold transition-all cursor-default"
            >
              <FileText className="h-3 w-3 shrink-0" />
              <span className="truncate max-w-[120px]">
                {source.title || `Source #${index + 1}`}
              </span>
              {source.id && (
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="h-4 w-4 p-0 hover:bg-transparent hover:text-primary/70"
                >
                  {source.url && (source.url.startsWith("http") || source.url.startsWith("//")) ? (
                    (() => {
                      const safeUrl = getSafeUrl(source.url);
                      return safeUrl ? (
                        <a href={safeUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      ) : (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-not-allowed opacity-50" aria-disabled="true">
                                <ExternalLink className="h-2.5 w-2.5" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="text-[10px] font-bold bg-destructive text-destructive-foreground"
                            >
                              {t("aiHub.studyLab.studyBuddy.unsafeLink", {
                                defaultValue: "Unsafe or malformed link",
                              })}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })()
                  ) : (
                    <CanAccess
                      resource="resources"
                      action="show"
                      params={{ id: source.id }}
                      fallback={null}
                    >
                      <Link to={showUrl("resources", source.id)}>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </Link>
                    </CanAccess>
                  )}
                </Button>
              )}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-[10px] font-bold">
            {source.title || `Source #${index + 1}`}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  User as UserIcon,
  ArrowRight,
  FileText,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { PendingSubmission } from "@/types/dashboard";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

dayjs.extend(relativeTime);

interface PendingSubmissionCardProps {
  submission: PendingSubmission;
  onGrade: (id: string) => void;
}

export const PendingSubmissionCard: React.FC<PendingSubmissionCardProps> = ({
  submission,
  onGrade,
}) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  // Set dayjs locale for this render
  dayjs.locale(isArabic ? "ar" : "en");

  return (
    <motion.div whileHover={{ x: isArabic ? -5 : 5 }} className="w-full">
      <Card
        className={cn(
          "group overflow-hidden transition-all duration-500 border-none shadow-xl bg-card/50 backdrop-blur-xl rounded-[1.5rem] cursor-pointer",
          "hover:shadow-2xl hover:bg-card/80 border border-transparent hover:border-primary/20 text-left rtl:text-right",
        )}
        onClick={() => onGrade(submission.assignmentId.toString())}
      >
        <div className="flex items-center p-5 gap-5">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Avatar className="h-14 w-14 border-2 border-background shadow-lg relative z-10 transition-transform duration-500 group-hover:scale-110">
              <AvatarImage
                src={submission.student?.image}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary/5 text-primary font-bold">
                {submission.student?.name?.[0] || (
                  <UserIcon className="h-6 w-6" />
                )}
              </AvatarFallback>
            </Avatar>
            {submission.isLate && (
              <div className="absolute -top-1 -right-1 h-5 w-5 bg-destructive rounded-full border-2 border-background flex items-center justify-center z-20 shadow-lg animate-pulse">
                <Clock className="h-2.5 w-2.5 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-3">
              <p
                className={cn(
                  "text-base transition-colors truncate",
                  isArabic ? "font-bold" : "font-black tracking-tight",
                )}
              >
                {submission.student?.name}
              </p>
              {submission.isLate && (
                <Badge
                  variant="destructive"
                  className="text-[9px] h-5 px-2 rounded-full font-black uppercase tracking-widest border-none bg-destructive/10 text-destructive shadow-sm"
                >
                  <AlertCircle className="h-2.5 w-2.5 ltr:mr-1 rtl:ml-1" />
                  {t("dashboard.staff.pendingSubmissions.late")}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                <FileText className="h-3 w-3" />
              </div>
              <p className="text-sm text-muted-foreground font-bold truncate">
                {submission.assignment?.title}
              </p>
            </div>

            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest flex items-center gap-1.5">
                <Clock className="h-2.5 w-2.5" />
                {t("dashboard.staff.pendingSubmissions.submitted", {
                  time: dayjs(submission.createdAt).fromNow(),
                })}
              </span>
              <div className="w-1 h-1 rounded-full bg-muted-foreground/20" />
              <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-ai-primary/60">
                <Sparkles className="h-2.5 w-2.5" />
                {t("dashboard.staff.pendingSubmissions.aiReady")}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="ghost"
              className="h-10 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-primary-foreground shadow-lg shadow-primary/20"
            >
              {t("buttons.grade")}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 rtl:rotate-180 group-hover:rtl:-translate-x-1" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

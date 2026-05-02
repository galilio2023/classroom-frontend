import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@refinedev/core";
import { Clock, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Enrollment } from "@/types";

interface PendingEnrollmentBannerProps {
  enrollments: Enrollment[];
}

export const PendingEnrollmentBanner: React.FC<PendingEnrollmentBannerProps> = ({
  enrollments,
}) => {
  const { t } = useTranslation();
  const { push } = useNavigation() as any;

  const pendingEnrollment = enrollments.find((e) => e.status === "pending");

  if (!pendingEnrollment) return null;

  const className = pendingEnrollment.class?.name || "Class";
  const teacher =
    (pendingEnrollment as any).class?.teachers?.find((t: any) => t.isPrimary)?.teacher ||
    (pendingEnrollment as any).class?.teacher;
  const teacherId = teacher?.id;

  const handleContactTeacher = () => {
    if (teacherId) {
      push(`/messages?userId=${teacherId}`);
    } else {
      push("/messages");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-8"
    >
      <Alert className="border-primary/20 bg-primary/5 animate-pulse-subtle p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-xl shadow-primary/5">
        <Clock className="h-6 w-6 text-primary shrink-0 mt-1" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full ms-3">
          <div className="space-y-1">
            <AlertTitle className="text-primary font-black uppercase tracking-[0.15em] text-[10px]">
              {t("dashboard.enrollment.pendingTitle", "Enrollment Pending")}
            </AlertTitle>
            <AlertDescription className="text-foreground/80 text-sm md:text-base font-medium leading-relaxed">
              {t("dashboard.enrollment.pendingDesc", {
                defaultValue: `Your enrollment in {{className}} is pending approval.`,
                className,
              })}
            </AlertDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl font-black uppercase tracking-widest text-[9px] gap-2 border-primary/20 hover:bg-primary/10 transition-all"
            onClick={handleContactTeacher}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {t("dashboard.enrollment.contactTeacher", "Contact Teacher")}
          </Button>
        </div>
      </Alert>
    </motion.div>
  );
};

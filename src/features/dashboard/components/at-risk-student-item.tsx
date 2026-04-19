import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCreate, useUpdate, useCustom, useCustomMutation } from "@refinedev/core";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatGrade } from "@/lib/numeric";

// Sub-components
import { AtRiskStudentDialog } from "./staff/at-risk/AtRiskStudentDialog";

interface AtRiskStudent {
  id: string;
  name: string;
  image?: string;
  reason: string;
  value: string;
  riskAssessmentId?: number;
  interventionStatus?: string;
  suggestedResources?: { title: string; url: string }[];
  aiAnalysis?: {
    strengths: string[];
    weaknesses: string[];
    improvementPlan: string[];
    summary: string;
  };
}

interface AtRiskStudentItemProps {
  student: AtRiskStudent;
}

export const AtRiskStudentItem: React.FC<AtRiskStudentItemProps> = ({ student }) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"analysis" | "intervention">("analysis");
  const [feedbackSent, setFeedbackSent] = useState<"pos" | "neg" | null>(null);

  const { mutate: sendNotification, mutation } = useCreate();
  const isSending = mutation.isPending;

  const { mutate: updateAssessment } = useUpdate();
  const { mutate: sendFeedback } = useCustomMutation();

  const { query: encouragementQuery } = useCustom({
    url: "/ai/generate-encouragement",
    method: "post",
    config: {
      payload: {
        studentName: student.name,
        reason: student.reason,
        value: student.value,
      },
    },
    queryOptions: {
      enabled: false,
    },
  });

  const handleFeedback = (isPositive: boolean) => {
    setFeedbackSent(isPositive ? "pos" : "neg");
    sendFeedback({
      url: "/ai/feedback",
      method: "post",
      values: {
        actionType: "intervention_suggestion",
        isPositive,
        metadata: {
          studentId: student.id,
          reason: student.reason,
          riskLevel: student.aiAnalysis ? "analyzed" : "basic",
        },
      },
    });
  };

  const handleGenerateEncouragement = async () => {
    setIsGenerating(true);
    setFeedbackSent(null);
    try {
      const { data } = (await encouragementQuery.refetch()) as any;
      if (data?.data?.message) {
        setMessage(data.data.message);
      } else {
        throw new Error("No message returned");
      }
    } catch (error) {
      const fallbacks: Record<string, string> = {
        "Low Grades": t("dashboard.staff.atRiskStudents.fallbacks.lowGrades", {
          name: student.name,
        }),
        "High Absences": t("dashboard.staff.atRiskStudents.fallbacks.highAbsences", {
          name: student.name,
        }),
        Inactivity: t("dashboard.staff.atRiskStudents.fallbacks.inactivity", {
          name: student.name,
        }),
      };
      setMessage(
        fallbacks[student.reason] ||
          t("dashboard.staff.atRiskStudents.fallbacks.general", {
            name: student.name,
          })
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = () => {
    sendNotification(
      {
        resource: "notifications",
        values: {
          userId: student.id,
          title: t("dashboard.staff.atRiskStudents.interventionTitle", {
            name: "",
          })
            .replace(":", "")
            .trim(),
          message: message,
          type: "achievement",
        },
      },
      {
        onSuccess: () => {
          toast.success(
            t("dashboard.staff.atRiskStudents.encouragementSent", {
              name: student.name,
            })
          );

          if (student.riskAssessmentId) {
            updateAssessment({
              resource: "student_risk_assessments",
              id: student.riskAssessmentId,
              values: { interventionStatus: "notified_student" },
            });
          }

          setIsModalOpen(false);
          setMessage("");
        },
      }
    );
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "notified_student":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-none text-[8px] font-bold uppercase">
            {t("dashboard.staff.atRiskStudents.status.studentNotified")}
          </Badge>
        );
      case "notified_parent":
        return (
          <Badge className="bg-purple-500/10 text-purple-600 border-none text-[8px] font-bold uppercase">
            {t("dashboard.staff.atRiskStudents.status.parentNotified")}
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-none text-[8px] font-bold uppercase">
            {t("dashboard.staff.atRiskStudents.status.resolved")}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[8px] font-bold uppercase opacity-40">
            {t("dashboard.staff.atRiskStudents.status.noAction")}
          </Badge>
        );
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ x: isArabic ? -5 : 5 }}
        className="flex items-center justify-between p-4 rounded-2xl bg-background/50 border border-black/3 dark:border-white/3 hover:border-destructive/20 hover:bg-destructive/2 transition-all group cursor-pointer shadow-sm text-start rtl:text-end"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-11 w-11 border-2 border-background shadow-sm group-hover:scale-110 transition-transform duration-500">
              <AvatarImage src={student.image} className="object-cover" />
              <AvatarFallback className="bg-destructive/5 text-destructive font-bold">
                {student.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -end-1 size-4 bg-destructive rounded-full border-2 border-background flex items-center justify-center">
              <TrendingDown className="h-2 w-2 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p
                className={cn(
                  "text-sm transition-colors",
                  isArabic ? "font-bold" : "font-black tracking-tight"
                )}
              >
                {student.name}
              </p>
              {getStatusBadge(student.interventionStatus)}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                {student.reason}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Badge
            variant="destructive"
            className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 border-none bg-destructive/10 text-destructive shadow-sm"
          >
            {formatGrade(student.value)}
          </Badge>
          <div className="p-2 rounded-full bg-muted/50 group-hover:bg-primary group-hover:text-primary-foreground transition-all opacity-0 group-hover:opacity-100">
            <Send className="h-3.5 w-3.5 rtl:rotate-180" />
          </div>
        </div>
      </motion.div>

      <AtRiskStudentDialog
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        student={student}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isArabic={isArabic}
        message={message}
        setMessage={setMessage}
        isGenerating={isGenerating}
        onGenerateEncouragement={handleGenerateEncouragement}
        feedbackSent={feedbackSent}
        onFeedback={handleFeedback}
        onSend={handleSend}
        isSending={isSending}
      />
    </>
  );
};

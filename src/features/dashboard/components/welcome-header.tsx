import { User, UserRole } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ShieldAlert,
  FileUp,
  Loader2,
  CheckCircle2,
  Layout,
  GraduationCap,
  Users,
  Heart,
  ClipboardCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCustomMutation } from "@refinedev/core";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { DashboardData } from "@/types/dashboard";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WelcomeHeaderProps {
  name: string;
  isStudent: boolean;
  user?: User;
  data?: DashboardData;
}

export const WelcomeHeader = ({ name, isStudent, user, data }: WelcomeHeaderProps) => {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const { mutate: requestChange, mutation } = useCustomMutation();
  const isPending = mutation.isPending;

  const isAdmin = user?.role === UserRole.ADMIN;
  const isTeacher = user?.role === UserRole.TEACHER;
  const isParent = user?.role === UserRole.PARENT;

  const getSummaryText = () => {
    // 🛡️ Global Master Switch: Use platform welcome message if set by admin
    if (data?.globalConfig?.welcomeMessage) {
      return data.globalConfig.welcomeMessage;
    }

    if (isStudent) {
      const count = data?.upcomingAssignments?.length || 0;
      const next = data?.upcomingAssignments?.[0]?.title || t("dashboard.student.allCaughtUp");
      return t("dashboard.summary.student", { count, next });
    }
    if (isTeacher) {
      const count = data?.pendingSubmissions?.length || 0;
      const active = data?.todaySchedule?.length || 0;
      return t("dashboard.summary.teacher", { count, active });
    }
    if (isParent) {
      return t("dashboard.summary.parent", { name: "Your children", count: 5 });
    }
    if (isAdmin) {
      const count = data?.stats?.pendingVerifications || 0;
      return t("dashboard.summary.admin", { count });
    }
    return isStudent ? t("dashboard.readyToContinue") : t("dashboard.managementOverview");
  };

  const getSummaryIcon = () => {
    if (isStudent) return GraduationCap;
    if (isTeacher) return Layout;
    if (isAdmin) return Users;
    if (isParent) return Heart;
    return ClipboardCheck;
  };

  const SummaryIcon = getSummaryIcon();

  const handleUploadClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,.pdf";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "classroom_unsigned");

      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`,
          { method: "POST", body: formData }
        );
        const data = await res.json();

        if (data.secure_url) {
          requestChange(
            {
              url: "/profile-requests",
              method: "post",
              values: {
                newData: { verificationDocumentUrl: data.secure_url },
              },
            },
            {
              onSuccess: () => {
                toast.success(t("dashboard.verification.success"));
              },
            }
          );
        }
      } catch (err) {
        toast.error(t("dashboard.verification.error"));
      } finally {
        setIsUploading(false);
      }
    };
    input.click();
  };

  const isUnverifiedTeacher =
    user?.role === UserRole.TEACHER && user?.verificationStatus !== "verified";

  return (
    <div className="mb-6 md:mb-12 space-y-4 md:space-y-6">
      <div className="space-y-1.5 md:space-y-3 max-w-4xl">
        <h1 className="text-3xl xs:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-balance">
          {t("dashboard.welcomeBack", { name: name || "User" })}
        </h1>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-start md:items-center gap-3 text-muted-foreground text-sm xs:text-base md:text-xl font-medium tracking-tight"
        >
          <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5 md:mt-0 shadow-sm border border-primary/5">
            <SummaryIcon className="h-4 w-4 md:h-5 md:w-5" />
          </div>
          <p className="line-clamp-2 md:line-clamp-1 leading-relaxed md:leading-normal">
            {getSummaryText()}
          </p>
        </motion.div>
      </div>

      {isUnverifiedTeacher && (
        <Alert className="border-amber-500/20 bg-amber-500/5 animate-in slide-in-from-top-4 duration-500 p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem]">
          <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0 mt-1" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full ms-3">
            <div className="space-y-1.5">
              <AlertTitle className="text-amber-800 font-black uppercase tracking-[0.15em] text-[10px] md:text-xs">
                {t("dashboard.verification.required")}
              </AlertTitle>
              <AlertDescription className="text-amber-700/80 text-xs md:text-base font-medium leading-relaxed max-w-xl">
                {t("dashboard.verification.requiredDescription")}
              </AlertDescription>
            </div>
            <Button
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white font-black uppercase tracking-widest text-[10px] gap-2 shrink-0 h-12 md:h-14 px-6 md:px-8 rounded-2xl shadow-xl shadow-amber-600/20 transition-all hover:scale-105 active:scale-95"
              onClick={handleUploadClick}
              disabled={isUploading || isPending}
            >
              {isUploading || isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileUp className="h-4 w-4" />
              )}
              {t("buttons.uploadCredentials")}
            </Button>
          </div>
        </Alert>
      )}

      {user?.role === UserRole.TEACHER && user?.verificationStatus === "verified" && (
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-black uppercase tracking-widest shadow-sm">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {t("dashboard.verification.verifiedEducator")}
        </div>
      )}
    </div>
  );
};

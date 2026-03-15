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
import { motion, AnimatePresence } from "framer-motion";

interface WelcomeHeaderProps {
  name: string;
  isStudent: boolean;
  user?: User;
  data?: DashboardData;
}

export const WelcomeHeader = ({
  name,
  isStudent,
  user,
  data,
}: WelcomeHeaderProps) => {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const { mutate: requestChange, mutation } = useCustomMutation();
  const isPending = mutation.isPending;

  const isAdmin = user?.role === UserRole.ADMIN;
  const isTeacher = user?.role === UserRole.TEACHER;
  const isParent = user?.role === UserRole.PARENT;

  const getSummaryText = () => {
    if (isStudent) {
      const count = data?.upcomingAssignments?.length || 0;
      const next =
        data?.upcomingAssignments?.[0]?.title ||
        t("dashboard.student.allCaughtUp");
      return t("dashboard.summary.student", { count, next });
    }
    if (isTeacher) {
      const count = data?.pendingSubmissions?.length || 0;
      const active = data?.todaySchedule?.length || 0;
      return t("dashboard.summary.teacher", { count, active });
    }
    if (isParent) {
      // In a real app we'd get this from data, using placeholders for now
      return t("dashboard.summary.parent", { name: "Your children", count: 5 });
    }
    if (isAdmin) {
      const count = data?.stats?.pendingVerifications || 0;
      return t("dashboard.summary.admin", { count });
    }
    return isStudent
      ? t("dashboard.readyToContinue")
      : t("dashboard.managementOverview");
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
      formData.append("upload_preset", "classroom_unsigned"); // Assuming this preset exists

      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`,
          { method: "POST", body: formData },
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
            },
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

  // Check if user is a teacher and not verified.
  // We use optional chaining and default to false if properties are missing.
  const isUnverifiedTeacher =
    user?.role === UserRole.TEACHER && user?.verificationStatus !== "verified";

  return (
    <div className="mb-8 md:mb-12 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">
          {t("dashboard.welcomeBack", { name: name || "User" })}
        </h1>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-muted-foreground text-lg md:text-xl font-medium tracking-tight"
        >
          <div className="p-1.5 rounded-lg bg-primary/5 text-primary/60">
            <SummaryIcon className="h-4 w-4" />
          </div>
          <p>{getSummaryText()}</p>
        </motion.div>
      </div>

      {isUnverifiedTeacher && (
        <Alert className="border-amber-500/20 bg-amber-500/5 animate-in slide-in-from-top-4 duration-500">
          <ShieldAlert className="h-5 w-5 text-amber-600" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div>
              <AlertTitle className="text-amber-800 font-black uppercase tracking-tight text-xs">
                {t("dashboard.verification.required")}
              </AlertTitle>
              <AlertDescription className="text-amber-700/80 text-sm font-medium">
                {t("dashboard.verification.requiredDescription")}
              </AlertDescription>
            </div>
            <Button
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold gap-2 shrink-0"
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

      {user?.role === UserRole.TEACHER &&
        user?.verificationStatus === "verified" && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 text-[10px] font-black uppercase tracking-widest">
            <CheckCircle2 className="h-3 w-3" />
            {t("dashboard.verification.verifiedEducator")}
          </div>
        )}
    </div>
  );
};

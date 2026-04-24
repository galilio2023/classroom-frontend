import React from "react";
import {
  CheckCircle2,
  Clock,
  FileText,
  LogOut,
  Mail,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { VerificationStatus } from "@/types";
import { VerificationUpload } from "@/features/auth/components/verification-upload";

// Hook
import { useVerificationLogic } from "@/features/auth/hooks/useVerificationLogic";

const PendingVerificationPage = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [uploadedDoc, setUploadedDoc] = React.useState<{ url: string; publicId: string } | null>(
    null
  );

  const { identity, isLoading, handleCheckStatus, logout, submitReverification } =
    useVerificationLogic();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-background">
        <RefreshCcw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isRejected = identity?.verificationStatus === VerificationStatus.REJECTED;

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-background p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] start-[-10%] w-[40%] h-[40%] bg-amber-500/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] end-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />

      <Card className="w-full max-w-2xl shadow-2xl border-none rounded-[2.5rem] bg-card/80 backdrop-blur-xl overflow-hidden text-start z-10">
        <div
          className={cn(
            "absolute top-0 start-0 w-full h-2 animate-pulse",
            isRejected
              ? "bg-linear-to-r from-destructive via-red-500 to-destructive"
              : "bg-linear-to-r from-amber-500 via-yellow-500 to-amber-500"
          )}
        />

        <CardHeader className="text-center space-y-4 pt-10 pb-6">
          <div className="flex justify-center mb-2">
            <div className="relative">
              <div
                className={cn(
                  "p-5 rounded-3xl animate-pulse shadow-xl",
                  isRejected
                    ? "bg-destructive/10 shadow-destructive/20"
                    : "bg-amber-500/10 shadow-amber-500/20"
                )}
              >
                {isRejected ? (
                  <XCircle className="h-12 w-12 text-destructive" />
                ) : (
                  <ShieldAlert className="h-12 w-12 text-amber-600" />
                )}
              </div>
              <div
                className={cn(
                  "absolute -bottom-2 -end-2 bg-background rounded-full p-1.5 border shadow-md",
                  isAr && "-start-2 end-auto"
                )}
              >
                {isRejected ? (
                  <RefreshCcw className="h-5 w-5 text-destructive" />
                ) : (
                  <Clock className="h-5 w-5 text-amber-600 animate-spin-slow" />
                )}
              </div>
            </div>
          </div>
          <CardTitle className="text-4xl font-black tracking-tighter uppercase">
            {isRejected ? t("auth.pending.rejectedTitle") : t("auth.pending.title")}
          </CardTitle>
          <CardDescription className="text-lg font-medium text-muted-foreground/80 max-w-md mx-auto leading-relaxed">
            {isRejected
              ? t("auth.pending.rejectedHello", { name: identity?.name })
              : t("auth.pending.hello", { name: identity?.name })}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 px-8 md:px-12">
          {isRejected ? (
            <div className="bg-destructive/5 border border-destructive/20 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-6 w-6 text-destructive" />
                <p className="font-black uppercase text-xs tracking-widest text-destructive">
                  {t("auth.pending.rejectionReasonTitle")}
                </p>
              </div>
              <p className="text-sm font-medium text-foreground leading-relaxed">
                {identity?.metadata?.rejectionReason || t("auth.pending.defaultRejectionReason")}
              </p>
              <div className="pt-4 border-t border-destructive/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
                  {t("auth.pending.reuploadAction")}
                </p>
                <VerificationUpload
                  url={uploadedDoc?.url}
                  onUpload={(url, publicId) => {
                    setUploadedDoc({ url, publicId });
                    submitReverification(url, publicId);
                  }}
                  onClear={() => setUploadedDoc(null)}
                />
              </div>
            </div>
          ) : (
            <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-900/30 rounded-3xl p-6 flex gap-5 items-start">
              <div className="p-3 bg-white dark:bg-amber-950 rounded-2xl h-fit shadow-sm shrink-0">
                <ShieldCheck className="h-6 w-6 text-amber-600 dark:text-amber-500" />
              </div>
              <div className="space-y-2">
                <p className="font-black uppercase text-xs tracking-widest text-amber-700 dark:text-amber-400 text-start">
                  {t("auth.pending.whyRequired")}
                </p>
                <p className="text-sm font-medium text-amber-900/80 dark:text-amber-200/80 leading-relaxed text-start">
                  {t("auth.pending.reason")}
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="bg-background/50 border rounded-3xl p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow text-start">
              <div className="flex items-center gap-3 text-start">
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {t("auth.pending.currentStatus")}
                </span>
              </div>
              <div className="space-y-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "w-fit font-black px-3 py-1.5 uppercase tracking-wider text-[10px]",
                    isRejected
                      ? "bg-destructive/10 text-destructive border-destructive/20"
                      : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                  )}
                >
                  {isRejected ? t("auth.pending.statusRejected") : t("auth.pending.statusLabel")}
                </Badge>
                <p className="text-[10px] text-muted-foreground font-bold">
                  {t("auth.pending.submittedOn", {
                    date: identity?.createdAt
                      ? new Date(identity.createdAt).toLocaleDateString(
                          isAr ? "ar-EG" : undefined,
                          { dateStyle: "long" }
                        )
                      : "N/A",
                  })}
                </p>
              </div>
            </div>

            <div className="bg-background/50 border rounded-3xl p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow text-start">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-xl text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {t("auth.pending.estimatedTime")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed pt-1 text-start">
                {t("auth.pending.estimatedDescription", {
                  time: t("auth.pending.reviewWindow"),
                })}
              </p>
            </div>
          </div>

          {!isRejected && (
            <div className="text-center space-y-4 pt-4 border-t border-dashed">
              <p className="text-sm text-muted-foreground font-medium">
                {t("auth.pending.questions")}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  variant="outline"
                  className="rounded-2xl h-12 px-6 gap-2 font-bold text-xs uppercase tracking-widest border-2"
                  asChild
                >
                  <a href="mailto:support@classroom.ai">
                    <Mail className="h-4 w-4" />
                    {t("buttons.contactSupport")}
                  </a>
                </Button>
                <Button
                  className="rounded-2xl h-12 px-6 gap-2 font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                  onClick={handleCheckStatus}
                >
                  <RefreshCcw className="h-4 w-4" />
                  {t("buttons.refreshStatus")}
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row items-center gap-6 bg-muted/30 py-8 px-8 md:px-12 border-t text-start">
          <Button
            variant="ghost"
            className="w-full sm:w-auto h-12 rounded-2xl gap-2 font-bold text-xs uppercase tracking-widest text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4" />
            {t("buttons.signOut")}
          </Button>

          <div className="flex-1 hidden sm:block" />

          <div className="flex items-center gap-3 px-4 py-2 bg-background rounded-2xl border shadow-sm w-full sm:w-auto justify-center sm:justify-start">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <div className="flex flex-col text-start">
              <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-0.5">
                {t("auth.pending.loggedInAs")}
              </span>
              <span className="text-[10px] font-bold truncate max-w-[150px]">
                {identity?.email}
              </span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PendingVerificationPage;

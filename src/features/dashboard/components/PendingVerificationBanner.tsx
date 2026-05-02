import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@refinedev/core";
import { ShieldAlert, FileUp } from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { VerificationStatus } from "@/types";

interface PendingVerificationBannerProps {
  status: VerificationStatus;
}

export const PendingVerificationBanner: React.FC<PendingVerificationBannerProps> = ({ status }) => {
  const { t } = useTranslation();
  const { push } = useNavigation() as any;

  // Only show if unverified or pending (rejected is handled by a different flow usually)
  if (status === "verified") return null;

  const isPending = status === "pending";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-8"
    >
      <Alert className="border-amber-500/20 bg-amber-500/5 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-xl shadow-amber-500/5">
        <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0 mt-1" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full ms-3">
          <div className="space-y-1">
            <AlertTitle className="text-amber-600 font-black uppercase tracking-[0.15em] text-[10px]">
              {isPending
                ? t("dashboard.verification.pendingTitle", "Verification in Progress")
                : t("dashboard.verification.requiredTitle", "Verification Required")}
            </AlertTitle>
            <AlertDescription className="text-foreground/80 text-sm md:text-base font-medium leading-relaxed text-start">
              {isPending
                ? t(
                    "dashboard.verification.pendingDesc",
                    "Our team is reviewing your documents. You'll be able to start live sessions once verified."
                  )
                : t(
                    "dashboard.verification.requiredDesc",
                    "Please upload your identification documents to enable full platform capabilities."
                  )}
            </AlertDescription>
          </div>
          {!isPending && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl font-black uppercase tracking-widest text-[9px] gap-2 border-amber-500/20 hover:bg-amber-500/10 text-amber-700 transition-all"
              onClick={() => push("/profile/edit")}
            >
              <FileUp className="h-3.5 w-3.5" />
              {t("buttons.completeProfile", "Complete Profile")}
            </Button>
          )}
        </div>
      </Alert>
    </motion.div>
  );
};

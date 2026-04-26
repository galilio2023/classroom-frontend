import React, { useRef, useEffect, useState } from "react";
import { ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCustomMutation, useGetIdentity, HttpError } from "@refinedev/core";
import { AI_CONSENT_VERSION } from "@/constants/ai";
import { User } from "@/types";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { handleError, getCorrelationId } from "@/providers/utils/api-errors";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * 🛡️ LAW 151: ConsentBarrier Component
 * Blocks AI interactions until the user agrees to the latest AI Governance terms.
 * Handles the server-side persistence of the consent version.
 */
export const ConsentBarrier: React.FC = () => {
  const { t } = useTranslation();
  const isMounted = useRef(true);
  const [isConflicted, setIsConflicted] = useState(false);
  const {
    data: user,
    refetch: refetchIdentity,
    isLoading: isIdentityLoading,
  } = useGetIdentity<User>();
  const { mutate: updateConsent, mutation } = useCustomMutation<User, HttpError>();

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const isLoading = mutation.isPending;

  const handleAccept = () => {
    if (!user) {
      toast.error(
        t("ai.consent.sessionExpired", { defaultValue: "Session expired. Please log in again." })
      );
      return;
    }

    updateConsent(
      {
        url: "users/me",
        method: "patch",
        values: {
          aiConsentVersion: AI_CONSENT_VERSION,
          aiConsent: true,
          version: user.version, // 🛡️ OPTIMISTIC LOCKING
        },
      },
      {
        onSuccess: () => {
          if (!isMounted.current) return;
          toast.success(t("ai.consent.success", { defaultValue: "AI Governance terms accepted." }));
          void refetchIdentity();
        },
        onError: async (err) => {
          if (!isMounted.current) return;
          onError: async (err) => {
                    if (!isMounted.current) return;
                    console.error("Failed to update AI consent:", err);

                    if (err.statusCode === 409) {
                      // 🛡️ OPTIMISTIC LOCKING: Handle background version mismatch gracefully (Review #21)
                      toast.info(t("ai.consent.versionConflict", { defaultValue: "Your session updated. Please try again." }));
                      setIsConflicted(true);
                      void refetchIdentity().then(() => {
                        if(isMounted.current) setTimeout(() => setIsConflicted(false), 1500); // UI cooldown
                      });
                      return;
                    }

                    const correlationId = getCorrelationId(err);
                    const handledError = await handleError(err, correlationId);
                    toast.error(handledError.message, {
                      description: `ID: ${correlationId}`,
                    });
                  },
          });
        },
      }
    );
  };

  if (isIdentityLoading && !user) {
    return (
      <div className="p-8 border-2 border-dashed border-primary/20 rounded-4xl bg-primary/5 flex flex-col items-center gap-6">
        <Skeleton className="h-20 w-20 rounded-2xl" />
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-14 w-48 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-8 border-2 border-dashed border-primary/20 rounded-4xl bg-primary/5 flex flex-col items-center text-center gap-6">
      <div className="p-4 rounded-2xl bg-primary/10 text-primary">
        <ShieldCheck className="h-12 w-12" />
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-black uppercase tracking-tight">
          {t("ai.consent.title", { defaultValue: "AI Governance & Privacy" })}
        </h3>
        <p className="text-muted-foreground font-medium max-w-md">
          {t("ai.consent.description", { 
            defaultValue: "To provide AI-powered insights while complying with Law 151/2020, we need your consent to process academic data through our secure AI partner (Google Gemini)." 
          })}
          {/* TODO: Add a link to a "What's New" modal */}
          <a href="#" className="text-primary font-bold ml-2 underline">What's New?</a>
          </p>
        </p>
      </div>

      <Alert className="max-w-md bg-background/50 border-primary/10">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertTitle className="text-[10px] font-black uppercase tracking-widest text-primary">
          {t("ai.consent.termsTitle", { defaultValue: "Privacy First" })}
        </AlertTitle>
        <AlertDescription className="text-xs font-medium text-muted-foreground">
          {t("ai.consent.termsBody", {
            defaultValue:
              "Your data is anonymized before processing. No PII (names, phone numbers) is sent to external providers.",
          })}
        </AlertDescription>
      </Alert>

      <Button
        size="lg"
        className="rounded-2xl px-12 h-14 bg-ai-primary font-black uppercase tracking-widest gap-3"
        onClick={handleAccept}
        disabled={isLoading || !user || isIdentityLoading || isConflicted}
      >
        <Sparkles className="h-5 w-5" />
        {isLoading
          ? t("common.processing", { defaultValue: "Processing..." })
          : t("ai.consent.acceptButton", { defaultValue: "I Agree & Continue" })}
      </Button>
    </div>
  );
};

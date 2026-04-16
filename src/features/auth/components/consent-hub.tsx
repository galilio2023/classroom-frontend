import React from "react";
import { ShieldCheck, ShieldAlert, Lock, UserCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";

interface ConsentHubProps {
  onConsentChange: (consented: boolean) => void;
  isConsented: boolean;
}

export const ConsentHub: React.FC<ConsentHubProps> = ({ onConsentChange, isConsented }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 py-4 text-start">
      <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[2rem] flex items-start gap-4">
        <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-black uppercase text-sm tracking-tight text-emerald-700 dark:text-emerald-400">
            {t("auth.consent.shieldTitle", "Data Protection Guarantee")}
          </h3>
          <p className="text-xs font-medium text-emerald-600/80 leading-relaxed">
            {t(
              "auth.consent.shieldDesc",
              "Your data is protected under Law 151/2020. We use LLM-based scrubbing to remove names and IDs before any AI processing."
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-4 rounded-2xl flex items-center gap-3 border-none bg-muted/30">
          <Lock className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">
            Encryption At Rest
          </span>
        </div>
        <div className="glass-card p-4 rounded-2xl flex items-center gap-3 border-none bg-muted/30">
          <UserCheck className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">
            PII Redaction Active
          </span>
        </div>
      </div>

      <div className="space-y-6 pt-4">
        <div
          className="flex items-start space-x-3 rtl:space-x-reverse group cursor-pointer"
          onClick={() => onConsentChange(!isConsented)}
        >
          <Checkbox
            id="law151-consent"
            checked={isConsented}
            onCheckedChange={(val) => onConsentChange(!!val)}
            className="mt-1 h-5 w-5 rounded-lg border-2 border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
          />
          <div className="space-y-2">
            <label
              htmlFor="law151-consent"
              className="text-sm font-bold leading-tight cursor-pointer group-hover:text-primary transition-colors"
            >
              {t(
                "auth.consent.mainCheckbox",
                "I explicitly consent to AI-based processing of my educational data for personalized learning."
              )}
            </label>
            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
              {t(
                "auth.consent.finePrint",
                "This consent can be revoked at any time from your profile settings. Data residency is maintained within regional servers."
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

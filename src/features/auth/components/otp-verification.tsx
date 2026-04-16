import React, { useState, useEffect } from "react";
import { MessageSquare, Loader2, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface OtpVerificationProps {
  phoneNumber: string;
  onVerify: (otp: string) => void;
  onResend: () => void;
  isVerifying: boolean;
}

export const OtpVerification: React.FC<OtpVerificationProps> = ({
  phoneNumber,
  onVerify,
  onResend,
  isVerifying,
}) => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  return (
    <div className="space-y-8 py-4 text-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-20 w-20 rounded-[2.5rem] bg-emerald-500/10 flex items-center justify-center text-emerald-500 relative">
          <MessageSquare className="h-10 w-10" />
          <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-4 border-background animate-pulse" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black uppercase tracking-tight">
            {t("auth.otp.title", "WhatsApp Verification")}
          </h3>
          <p className="text-sm text-muted-foreground font-medium px-8">
            {t("auth.otp.desc", "We sent a 6-digit code to your WhatsApp at")} <br />
            <span className="font-black text-foreground">{phoneNumber}</span>
          </p>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            setOtp(val);
            if (val.length === 6) onVerify(val);
          }}
          placeholder="••••••"
          className="h-20 w-full max-w-[280px] text-center text-4xl font-black tracking-[0.5em] rounded-3xl bg-muted/30 border-none shadow-inner focus-visible:ring-primary/20"
        />
      </div>

      <div className="space-y-4">
        <Button
          onClick={() => onVerify(otp)}
          disabled={otp.length !== 6 || isVerifying}
          className="w-full h-16 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/20"
        >
          {isVerifying ? <Loader2 className="h-5 w-5 animate-spin me-2" /> : null}
          {t("buttons.verify", "Verify & Continue")}
        </Button>

        <div className="flex flex-col items-center gap-2">
          {timer > 0 ? (
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
              {t("auth.otp.resendIn", `Resend in ${timer}s`, { seconds: timer })}
            </p>
          ) : (
            <div className="flex flex-col items-center gap-4 w-full">
              <Button
                variant="ghost"
                onClick={() => {
                  setTimer(60);
                  onResend();
                }}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:bg-primary/5 rounded-full"
              >
                {t("auth.otp.resendNow", "Resend Code")}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground rounded-xl border-dashed py-6"
                onClick={() =>
                  toast.info(
                    t("auth.otp.manualRequest", "Manual approval request sent to school admin.")
                  )
                }
              >
                {t("auth.otp.manualButton", "Request Manual Admin Approval")}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
        <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest leading-relaxed">
          {t(
            "auth.otp.tip",
            "Using WhatsApp ensures 99% delivery reliability in Egypt compared to SMS."
          )}
        </p>
      </div>
    </div>
  );
};

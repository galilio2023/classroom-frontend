import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePaymentStatus } from "../hooks/usePaymentStatus";
import { Loader2, CheckCircle2, AlertCircle, Copy, Store } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

interface KioskPaymentModalProps {
  orderId: string | null;
  referenceCode: string | null;
  amount: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const KioskPaymentModal: React.FC<KioskPaymentModalProps> = ({
  orderId,
  referenceCode,
  amount,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { status } = usePaymentStatus(orderId);

  React.useEffect(() => {
    if (status === "paid") {
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    }
  }, [status, onSuccess, onClose]);

  const copyToClipboard = () => {
    if (referenceCode) {
      navigator.clipboard.writeText(referenceCode);
      toast.success(t("payments.kiosk.copied"));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl border-primary/20 bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            {t("payments.kiosk.title")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            {t("payments.kiosk.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          <AnimatePresence mode="wait">
            {status === "pending" ? (
              <motion.div
                key="pending"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full space-y-6"
              >
                <div className="bg-muted/50 rounded-2xl p-6 text-center border border-border/50 relative group">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 mb-2">
                    {t("payments.kiosk.refCode")}
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-4xl md:text-5xl font-black tracking-[0.1em] text-foreground">
                      {referenceCode || "--------"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={copyToClipboard}
                      className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <Copy className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2 text-primary font-bold animate-pulse">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t("payments.kiosk.waiting")}</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-center px-4 leading-relaxed">
                    {t("payments.kiosk.instructions", { amount: amount / 100 })}
                  </p>
                </div>
              </motion.div>
            ) : status === "paid" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center space-y-4"
              >
                <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black uppercase">{t("payments.success")}</h3>
                <p className="text-muted-foreground font-medium">{t("payments.kiosk.activated")}</p>
              </motion.div>
            ) : (
              <motion.div
                key="failed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center space-y-4"
              >
                <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="h-12 w-12 text-destructive" />
                </div>
                <h3 className="text-2xl font-black uppercase">{t("payments.failed")}</h3>
                <Button onClick={onClose} variant="outline" className="rounded-full px-8">
                  {t("buttons.tryAgain")}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-[10px] text-center text-muted-foreground/50 font-medium uppercase tracking-widest pb-4">
          Powered by Paymob & Fawry
        </div>
      </DialogContent>
    </Dialog>
  );
};

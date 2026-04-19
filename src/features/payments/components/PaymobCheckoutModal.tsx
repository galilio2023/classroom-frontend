import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePaymentStatus } from "../hooks/usePaymentStatus";
import { Loader2, CheckCircle2, AlertCircle, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

interface PaymobCheckoutModalProps {
  orderId: string | null;
  iframeUrl: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * 💳 PAYMOB CHECKOUT MODAL
 * Hosts the Paymob iframe for secure card payments.
 * Includes automated status polling for instant pedagogical activation.
 */
export const PaymobCheckoutModal: React.FC<PaymobCheckoutModalProps> = ({
  orderId,
  iframeUrl,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { status } = usePaymentStatus(orderId);

  React.useEffect(() => {
    if (status === "paid") {
      const timer = setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, onSuccess, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl h-[90vh] sm:h-[800px] flex flex-col p-0 rounded-3xl overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 bg-slate-50 border-b">
          <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <CreditCard className="h-5 w-5" />
            </div>
            {t("payments.card.title", { defaultValue: "Secure Card Payment" })}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 relative bg-white">
          <AnimatePresence mode="wait">
            {status === "pending" ? (
              <motion.div
                key="iframe"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                {iframeUrl ? (
                  <iframe
                    src={iframeUrl}
                    className="w-full h-full border-none"
                    title="Paymob Checkout"
                    allow="payment"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                      Initializing secure gateway...
                    </p>
                  </div>
                )}
              </motion.div>
            ) : status === "paid" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full space-y-6 p-8 text-center"
              >
                <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-14 w-12 text-emerald-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black uppercase tracking-tighter">
                    {t("payments.success")}
                  </h3>
                  <p className="text-muted-foreground font-medium text-lg">
                    {t("payments.kiosk.activated", { defaultValue: "Payment confirmed. Your account is now active!" })}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="failed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full space-y-6 p-8 text-center"
              >
                <div className="h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="h-14 w-12 text-destructive" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black uppercase tracking-tighter">
                    {t("payments.failed")}
                  </h3>
                  <p className="text-muted-foreground font-medium">
                    The transaction could not be completed. Please try again or use another card.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 bg-slate-50 border-t flex items-center justify-center gap-6">
           <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all" />
           <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 opacity-50 grayscale hover:grayscale-0 transition-all" />
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
             PCI-DSS Compliant • Powered by Paymob
           </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

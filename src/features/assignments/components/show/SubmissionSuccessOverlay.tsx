import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SubmissionSuccessOverlayProps {
  isVisible: boolean;
  message: string;
}

export const SubmissionSuccessOverlay = ({ isVisible, message }: SubmissionSuccessOverlayProps) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 rounded-2xl"
        >
          <motion.div
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            className="p-4 rounded-full bg-success/10 text-success"
          >
            <CheckCircle2 className="h-12 w-12 stroke-3" />
          </motion.div>
          <h3 className="text-2xl font-black tracking-tight text-start">{message}</h3>
          <p className="text-muted-foreground font-medium text-start">
            {t("assignments.form.successRedirecting")}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

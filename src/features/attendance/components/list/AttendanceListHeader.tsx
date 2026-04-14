import { motion } from "framer-motion";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { QrCode, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface AttendanceListHeaderProps {
  isStaff: boolean;
  onStartQr: () => void;
  onScanQr: () => void;
}

export const AttendanceListHeader = ({
  isStaff,
  onStartQr,
  onScanQr,
}: AttendanceListHeaderProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 text-start"
    >
      <Breadcrumb />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-start">
          <h1 className="text-4xl font-black tracking-tight">
            {t("classes.attendance.governance.title")}
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            {isStaff
              ? t("classes.attendance.governance.descriptionStaff")
              : t("classes.attendance.governance.descriptionStudent")}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {isStaff ? (
            <Button
              onClick={onStartQr}
              className="flex-1 md:flex-none rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
            >
              <QrCode className="h-5 w-5" />
              {t("classes.attendance.governance.startQrSession", "Live QR Session")}
            </Button>
          ) : (
            <Button
              onClick={onScanQr}
              className="flex-1 md:flex-none rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
            >
              <ScanLine className="h-5 w-5" />
              {t("classes.attendance.scanQR", "Scan to Check-in")}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

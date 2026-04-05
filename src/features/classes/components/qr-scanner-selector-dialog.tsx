import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useList } from "@refinedev/core";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScanLine, ArrowRight, Camera } from "lucide-react";
import { QRScannerModal } from "./qr-scanner-modal";
import { Class } from "@/types";
import { useTerm } from "@/contexts/term-context";

interface QRScannerSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QRScannerSelectorDialog = ({ open, onOpenChange }: QRScannerSelectorDialogProps) => {
  const { t } = useTranslation();
  const { selectedTerm } = useTerm();
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [showScanner, setShowScanner] = useState(false);

  // Fetch classes for the current student in the selected term
  const { data: classesData, isLoading } = useList<Class>({
    resource: "my-classes",
    filters: selectedTerm
      ? [
          {
            field: "termId",
            operator: "eq",
            value: selectedTerm.id,
          },
        ]
      : [],
    pagination: { mode: "off" },
    queryOptions: {
      enabled: open && !showScanner,
    }
  });

  const classes = (classesData?.data as any) || [];

  const handleNext = () => {
    if (selectedClassId) {
      setShowScanner(true);
    }
  };

  const handleClose = (val: boolean) => {
    onOpenChange(val);
    if (!val) {
      setTimeout(() => {
        setShowScanner(false);
        setSelectedClassId("");
      }, 300);
    }
  };

  if (showScanner && selectedClassId) {
    return (
      <QRScannerModal
        isOpen={open}
        onClose={() => handleClose(false)}
        classId={selectedClassId}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px] rounded-4xl border-none shadow-2xl p-0 overflow-hidden bg-card/95 backdrop-blur-2xl">
        <div className="p-8 space-y-6">
          <DialogHeader className="space-y-3 text-start">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/5">
                <ScanLine className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black tracking-tight">
                  {t("classes.attendance.scanQR", "Scan QR Attendance")}
                </DialogTitle>
                <DialogDescription className="font-bold text-muted-foreground/80">
                  {t("classes.attendance.selectClassToScan", "Select the class you are attending to open the scanner.")}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                {t("classes.attendance.targetClass", "Target Class")}
              </label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger className="h-14 rounded-2xl border-none bg-muted/50 shadow-inner font-bold focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder={isLoading ? t("common.loading") : t("classes.attendance.selectPlaceholder", "Select a class...")} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  {classes.map((item: any) => {
                    const c = item.class || item;
                    return (
                      <SelectItem key={c.id} value={c.id.toString()} className="rounded-xl py-3 font-bold">
                        {c.name}
                      </SelectItem>
                    );
                  })}
                  {classes.length === 0 && !isLoading && (
                    <div className="p-4 text-center text-xs font-bold text-muted-foreground">
                      {t("classes.attendance.noClassesFound", "No classes found for this term.")}
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <Button
              disabled={!selectedClassId || isLoading}
              onClick={handleNext}
              className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 mt-2"
            >
              {t("buttons.openScanner", "Open Scanner")}
              <Camera className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

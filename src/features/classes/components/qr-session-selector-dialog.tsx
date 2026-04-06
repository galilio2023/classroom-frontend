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
import { QrCode, Play } from "lucide-react";
import { QRAttendanceModal } from "./qr-attendance-modal";
import { Class } from "@/types";
import { useTerm } from "@/contexts/term-context";

interface QRSessionSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QRSessionSelectorDialog = ({ open, onOpenChange }: QRSessionSelectorDialogProps) => {
  const { t } = useTranslation();
  const { selectedTerm } = useTerm();
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [showQR, setShowQR] = useState(false);

  // Fetch classes for the current teacher in the selected term
  const { query } = useList<Class>({
    resource: "classes",
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
      enabled: open && !showQR,
    },
  });

  const classes = query.data?.data || [];
  const isLoading = query.isLoading;

  const handleStart = () => {
    if (selectedClassId) {
      setShowQR(true);
    }
  };

  const handleClose = (val: boolean) => {
    onOpenChange(val);
    if (!val) {
      setTimeout(() => {
        setShowQR(false);
        setSelectedClassId("");
      }, 300);
    }
  };

  if (showQR && selectedClassId) {
    return (
      <QRAttendanceModal
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
                <QrCode className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black tracking-tight">
                  {t("classes.attendance.startQrSession" as any, "Start QR Session")}
                </DialogTitle>
                <DialogDescription className="font-bold text-muted-foreground/80">
                  {t(
                    "classes.attendance.selectClassToStart" as any,
                    "Choose a class to display the live attendance QR code."
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                {t("classes.attendance.targetClass" as any, "Target Class")}
              </label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger className="h-14 rounded-2xl border-none bg-muted/50 shadow-inner font-bold focus:ring-2 focus:ring-primary/20">
                  <SelectValue
                    placeholder={
                      isLoading
                        ? (t("common.loading" as any) as string)
                        : (t(
                            "classes.attendance.selectPlaceholder" as any,
                            "Select a class..."
                          ) as string)
                    }
                  />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  {classes.map((c: Class) => (
                    <SelectItem
                      key={c.id}
                      value={c.id.toString()}
                      className="rounded-xl py-3 font-bold"
                    >
                      {c.name}
                    </SelectItem>
                  ))}
                  {classes.length === 0 && !isLoading && (
                    <div className="p-4 text-center text-xs font-bold text-muted-foreground">
                      {t(
                        "classes.attendance.noClassesFound" as any,
                        "No classes found for this term."
                      )}
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <Button
              disabled={!selectedClassId || isLoading}
              onClick={handleStart}
              className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 mt-2"
            >
              {t("buttons.startSession" as any, "Start Session")}
              <Play className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

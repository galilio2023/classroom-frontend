import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCheck, Search, ShieldCheck, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface LinkChildDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  studentEmail: string;
  setStudentEmail: (email: string) => void;
  onLink: () => void;
  isLinking: boolean;
}

export const LinkChildDialog = ({
  isOpen,
  onOpenChange,
  studentEmail,
  setStudentEmail,
  onLink,
  isLinking,
}: LinkChildDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl max-w-lg p-0 overflow-hidden text-start">
        <div className="p-8 md:p-12 space-y-8">
          <DialogHeader className="space-y-4 text-start">
            <div className="p-5 rounded-2xl bg-primary/10 text-primary w-fit mx-auto">
              <UserCheck className="h-10 w-10" />
            </div>
            <div className="space-y-2 text-center">
              <DialogTitle className="text-3xl font-black tracking-tight text-balance">
                {t("dashboard.parent.linkStudentAccount")}
              </DialogTitle>
              <DialogDescription className="font-medium text-base text-muted-foreground text-balance">
                {t("dashboard.parent.linkDescription")}
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-3">
              <Label
                htmlFor="email"
                className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ms-2"
              >
                {t("dashboard.parent.studentEmail")}
              </Label>
              <div className="relative group">
                <Search
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors",
                    "start-6"
                  )}
                />
                <Input
                  id="email"
                  placeholder="student@example.com"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className={cn(
                    "h-16 rounded-3xl bg-muted/30 border-none shadow-inner text-lg font-black placeholder:text-muted-foreground/30 focus-visible:ring-primary/20",
                    "ps-14 pe-8"
                  )}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button
              variant="ghost"
              size="lg"
              className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-8"
              onClick={() => onOpenChange(false)}
            >
              {t("buttons.cancel")}
            </Button>
            <Button
              size="lg"
              className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-12 shadow-xl shadow-primary/20"
              onClick={onLink}
              disabled={isLinking}
            >
              {isLinking ? (
                <Loader2 className="h-5 w-5 me-3 animate-spin" />
              ) : (
                <ShieldCheck className="h-5 w-5 me-3" />
              )}
              {t("dashboard.parent.linkAccount")}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

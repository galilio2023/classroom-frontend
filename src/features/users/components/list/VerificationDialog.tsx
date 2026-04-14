import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, FileText, ExternalLink, XCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VerificationStatus, User } from "@/types";

interface VerificationDialogProps {
  target: User | null;
  onClose: () => void;
  onVerify: (id: string, approved: boolean) => void;
  isUpdating: boolean;
}

export const VerificationDialog = ({
  target,
  onClose,
  onVerify,
  isUpdating,
}: VerificationDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl p-0">
        <div className="p-8 md:p-12 space-y-8">
          <DialogHeader className="space-y-4">
            <div className="p-5 rounded-2xl bg-primary/10 text-primary w-fit mx-auto">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <div className="space-y-2 text-center">
              <DialogTitle className="text-3xl font-black">
                {t("users.governance.verification.title")}
              </DialogTitle>
              <DialogDescription className="font-medium text-base px-6 text-balance text-center">
                {t("users.governance.verification.description", {
                  name: target?.name,
                })}
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/30 p-8 rounded-4xl border border-border/40 text-start">
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground/60">
                  {t("users.governance.verification.fullName")}
                </p>
                <p className="font-black text-lg">{target?.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground/60">
                  {t("users.governance.verification.email")}
                </p>
                <p className="font-black text-lg">{target?.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground/60">
                  {t("users.governance.verification.status")}
                </p>
                <Badge
                  variant={
                    target?.verificationStatus === VerificationStatus.VERIFIED
                      ? "default"
                      : "secondary"
                  }
                  className="h-7 uppercase text-[10px] font-black"
                >
                  {target?.verificationStatus === VerificationStatus.VERIFIED
                    ? t("users.governance.verification.verified")
                    : t("users.governance.verification.pending")}
                </Badge>
              </div>
            </div>

            {target?.verificationDocumentUrl && (
              <div className="border-2 border-primary/10 rounded-4xl p-8 flex flex-col items-center gap-6 bg-card relative overflow-hidden text-start">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                  <div className="p-4 bg-primary/10 rounded-2xl shrink-0">
                    <FileText className="h-10 w-10 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-black">
                      {t("users.governance.verification.proofTitle")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("users.governance.verification.proofDesc")}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-2xl font-black uppercase text-[10px] h-12"
                    asChild
                  >
                    <a href={target.verificationDocumentUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4 me-2" /> {t("buttons.viewFull")}
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-4 pt-8 border-t border-border/40">
            <Button
              variant="outline"
              size="lg"
              className="text-destructive border-destructive/20 h-12 rounded-2xl"
              onClick={() => onVerify(target!.id, false)}
              disabled={isUpdating}
            >
              <XCircle className="h-4 w-4 me-2" /> {t("buttons.reject")}
            </Button>
            <Button
              size="lg"
              className="h-12 rounded-2xl shadow-xl shadow-primary/20"
              onClick={() => onVerify(target!.id, true)}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin me-2" />
              ) : (
                <CheckCircle2 className="h-4 w-4 me-2" />
              )}{" "}
              {t("buttons.approveVerify")}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

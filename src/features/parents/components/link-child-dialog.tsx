import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { useCustomMutation } from "@refinedev/core";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const LinkChildDialog = () => {
  const { t } = useTranslation();
  const [inviteCode, setInviteCode] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { mutate, mutation } = useCustomMutation();
  const isLoading = mutation.isPending;

  const handleLink = () => {
    if (!inviteCode || inviteCode.length < 6) {
      toast.error("Please enter a valid invite code.");
      return;
    }

    mutate(
      {
        url: "parent/link-child",
        method: "post",
        values: { inviteCode },
      },
      {
        onSuccess: (data: any) => {
          toast.success(data?.message || "Child linked successfully!");
          setIsOpen(false);
          setInviteCode("");
          // Refine will automatically invalidate the guardian-portal list if configured
        },
        onError: (error: any) => {
          toast.error(error?.message || "Failed to link child. Check the code and try again.");
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-2xl font-black uppercase tracking-widest gap-2 shadow-xl shadow-primary/20 hover:scale-105 transition-all">
          <UserPlus className="h-4 w-4" />
          {t("guardian.dashboard.linkChild", { defaultValue: "Link New Child" })}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] border-none shadow-2xl p-8">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Sparkles className="h-32 w-32 text-primary" />
        </div>

        <DialogHeader className="space-y-4">
          <div className="p-3 rounded-2xl bg-primary/10 w-fit">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
            <DialogTitle className="text-2xl font-black tracking-tight uppercase">
              {t("guardian.linkDialog.title", { defaultValue: "Connect to Student" })}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium">
              {t("guardian.linkDialog.desc", {
                defaultValue:
                  "Enter your child's unique invite code to link their academic profile.",
              })}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="py-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              {t("guardian.linkDialog.codeLabel", { defaultValue: "Invite Code" })}
            </label>
            <Input
              placeholder="e.g. STU-XXXX-XXXX"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="h-14 rounded-2xl border-2 focus-visible:ring-primary/20 font-mono text-lg tracking-widest uppercase text-center"
              maxLength={15}
            />
          </div>

          <div className="p-4 rounded-2xl bg-muted/30 border border-dashed space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              How to find the code?
            </div>
            <p className="text-[10px] font-bold text-muted-foreground/80 leading-relaxed">
              Ask your child to log in to their account and navigate to
              <span className="text-primary mx-1 font-black">Settings &gt; Profile</span> to
              generate their parent invite code.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleLink}
            disabled={isLoading || !inviteCode}
            className="w-full h-14 rounded-2xl font-black uppercase tracking-widest gap-2 shadow-lg shadow-primary/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Linking...
              </>
            ) : (
              <>
                Confirm Connection
                <Sparkles className="h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

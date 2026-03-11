import { useState } from "react";
import { useCustomMutation } from "@refinedev/core";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Send, Sparkles } from "lucide-react";

interface ApplyTeacherDialogProps {
  classId: number;
  className: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const ApplyTeacherDialog = ({
  classId,
  className,
  isOpen,
  onOpenChange,
  onSuccess,
}: ApplyTeacherDialogProps) => {
  const [message, setMessage] = useState("");
  const { mutate, mutation } = useCustomMutation();
  const isLoading = mutation.isPending;

  const handleApply = () => {
    mutate(
      {
        url: "/teacher-applications",
        method: "post",
        values: {
          classId,
          message,
        },
      },
      {
        onSuccess: () => {
          toast.success("Application submitted successfully!");
          onOpenChange(false);
          setMessage("");
          onSuccess?.();
        },
        onError: (error: any) => {
          toast.error(error?.data?.message || "Failed to submit application");
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl max-w-lg">
        <DialogHeader className="space-y-4">
          <div className="p-4 rounded-2xl bg-primary/10 text-primary w-fit">
            <Send className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <DialogTitle className="text-3xl font-black tracking-tight">
              Apply to Teach
            </DialogTitle>
            <DialogDescription className="font-medium text-base">
              You are requesting to manage and teach <strong>{className}</strong>. 
              The administrator will review your request.
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="space-y-6 py-6">
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              Introduction / Proposal (Optional)
            </Label>
            <div className="relative group">
              <Textarea
                placeholder="Briefly explain your experience or plan for this class..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[150px] rounded-[2rem] bg-muted/30 border-none focus-visible:ring-primary p-6 text-base leading-relaxed font-medium resize-none shadow-inner"
              />
              <div className="absolute bottom-4 right-4 opacity-10 group-focus-within:opacity-30 transition-opacity">
                <Sparkles className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-3">
          <Button
            variant="ghost"
            className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-8"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-12 shadow-xl shadow-primary/20"
            onClick={handleApply}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Submit Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

import { AlertTriangle, RefreshCcw, History, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";

interface ConflictDialogProps {
  isOpen: boolean;
  onRefresh: () => void;
  onOverwrite: () => void;
}

/**
 * 🛡️ ConflictDialog
 * Displayed when useOptimisticVersion detects a significant version jump
 * or the dataProvider catches a 409 conflict during a live edit.
 */
export const ConflictDialog = ({ isOpen, onRefresh, onOverwrite }: ConflictDialogProps) => {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="rounded-[2.5rem] border-none shadow-3xl bg-card/95 backdrop-blur-xl">
        <AlertDialogHeader className="space-y-6">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-6 rounded-3xl bg-amber-500/10 text-amber-600 w-fit mx-auto"
          >
            <AlertTriangle className="h-12 w-12" />
          </motion.div>
          <div className="space-y-2 text-center">
            <AlertDialogTitle className="text-3xl font-black tracking-tight">
              Collision Detected
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium px-4 leading-relaxed">
              Another teacher has just updated this class. If you save now, you might overwrite
              their changes.
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        <div className="grid grid-cols-1 gap-4 py-6">
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 flex items-center gap-4">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <RefreshCcw className="h-5 w-5" />
            </div>
            <div className="text-start">
              <p className="text-sm font-bold">Refresh & Merge</p>
              <p className="text-[10px] text-muted-foreground font-medium">
                Get the latest server version and keep your edits.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/10 flex items-center gap-4">
            <div className="p-2 rounded-xl bg-destructive/10 text-destructive">
              <History className="h-5 w-5" />
            </div>
            <div className="text-start">
              <p className="text-sm font-bold text-destructive">Force Overwrite</p>
              <p className="text-[10px] text-destructive/60 font-medium">
                Ignore the other update and push your version anyway.
              </p>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="sm:justify-center gap-3 pt-4">
          <Button
            variant="ghost"
            onClick={onOverwrite}
            className="rounded-2xl px-8 h-12 font-black uppercase tracking-widest text-[10px] text-destructive hover:bg-destructive/10"
          >
            Overwrite
          </Button>
          <Button
            onClick={onRefresh}
            className="rounded-2xl px-10 h-14 font-black uppercase tracking-widest text-[10px] bg-primary text-primary-foreground shadow-xl shadow-primary/20"
          >
            <RefreshCcw className="h-4 w-4 me-2" />
            Refresh Now
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

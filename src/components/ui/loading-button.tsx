import * as React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
  isSuccess?: boolean;
  loadingText?: React.ReactNode;
  successText?: React.ReactNode;
  icon?: React.ReactNode;
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ isLoading, isSuccess, loadingText, successText, icon, children, className, disabled, ...props }, ref) => {
    return (
      <Button
        className={cn("gap-2 relative overflow-hidden transition-all duration-300", className)}
        disabled={isLoading || isSuccess || disabled}
        ref={ref}
        {...props}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              <span>{successText || "Done"}</span>
            </motion.div>
          ) : isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{loadingText || "Loading..."}</span>
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
              {icon && <span className="shrink-0">{icon}</span>}
              <span>{children}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    );
  }
);
LoadingButton.displayName = "LoadingButton";

export { LoadingButton };

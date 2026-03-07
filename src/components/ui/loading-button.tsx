import React from "react";
import { Button, ButtonProps } from "./button";
import { Loader2, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
  isSuccess?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  isSuccess,
  loadingText,
  icon,
  children,
  className,
  disabled,
  ...props
}) => {
  return (
    <Button
      className={cn("gap-2 relative overflow-hidden min-w-[100px]", className)}
      disabled={isLoading || isSuccess || disabled}
      {...props}
    >
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            <span>Done</span>
          </motion.div>
        ) : isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{loadingText || children}</span>
          </motion.div>
        ) : (
          <motion.div
            key="default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            {icon}
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
};

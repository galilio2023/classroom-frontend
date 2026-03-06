import React from "react";
import { Button, ButtonProps } from "./button";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  loadingText,
  icon,
  children,
  className,
  disabled,
  ...props
}) => {
  return (
    <Button
      className={cn("gap-2 relative overflow-hidden", className)}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="absolute inset-0 bg-primary/10 animate-pulse" />
          <Loader2 className="h-4 w-4 animate-spin relative z-10" />
          <span className="relative z-10 flex items-center gap-2">
            {loadingText || children}
            <Sparkles className="h-3 w-3 animate-bounce" />
          </span>
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </Button>
  );
};

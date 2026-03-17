import React from "react";
import { LoadingButton } from "../ui/loading-button";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIActionButtonProps {
  onClick: () => void;
  isLoading: boolean;
  loadingText: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const AIActionButton: React.FC<AIActionButtonProps> = ({
  onClick,
  isLoading,
  loadingText,
  children,
  className,
  icon = <Sparkles className="h-4 w-4" />,
}) => {
  return (
    <LoadingButton
      className={cn(
        "w-full h-11 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/20",
        className
      )}
      onClick={onClick}
      isLoading={isLoading}
      loadingText={loadingText}
      icon={icon}
    >
      {children}
    </LoadingButton>
  );
};

import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center w-full h-full min-h-[400px] p-8 text-center border-2 border-dashed rounded-[2.5rem] bg-muted/5 border-primary/10 text-muted-foreground animate-in fade-in zoom-in duration-500",
      className
    )}>
      <div className="p-6 rounded-3xl bg-primary/5 mb-6">
        <Icon className="h-12 w-12 text-primary/40" />
      </div>
      <h3 className="text-2xl font-black tracking-tight text-foreground mb-2">{title}</h3>
      <p className="text-sm font-medium max-w-sm px-4 leading-relaxed">{description}</p>
      {action && (
        <Button 
          onClick={action.onClick} 
          className="mt-8 h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

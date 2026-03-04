import React from "react";
import { GraduationCap } from "lucide-react";

interface ChatEmptyStateProps {
  subject?: string;
}

export const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({ subject }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 text-center space-y-6">
      <div className="relative">
        <div className="absolute -inset-4 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="relative p-5 bg-primary/5 rounded-full border border-primary/10">
          <GraduationCap className="h-12 w-12 text-primary opacity-40" />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-base font-bold text-foreground">Your Personal Tutor</p>
        <p className="text-xs text-muted-foreground px-10 leading-relaxed">
          I'm here to help you master <span className="text-primary font-semibold">{subject || "your subjects"}</span>. What should we explore today?
        </p>
      </div>
    </div>
  );
};

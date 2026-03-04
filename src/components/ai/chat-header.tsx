import React from "react";
import { CardTitle, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Sparkles, X } from "lucide-react";

interface ChatHeaderProps {
  onClose: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onClose }) => {
  return (
    <CardHeader className="p-5 border-b ai-header-gradient text-primary-foreground rounded-t-[calc(var(--radius)-1px)] flex flex-row items-center justify-between space-y-0">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl shadow-inner">
          <Sparkles className="h-5 w-5 animate-pulse" />
        </div>
        <div>
          <CardTitle className="text-base font-bold tracking-tight">AI Study Buddy</CardTitle>
          <p className="text-[10px] font-medium opacity-90 uppercase tracking-widest">Powered by Gemini</p>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 hover:bg-white/20 text-primary-foreground rounded-full"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>
    </CardHeader>
  );
};

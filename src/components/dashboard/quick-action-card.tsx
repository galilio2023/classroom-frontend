import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, LucideIcon, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface QuickAction {
  title: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  heading: string;
  description: string;
  resource: string;
}

interface QuickActionCardProps {
  action: QuickAction;
  onAction: (resource: string) => void;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({ action, onAction }) => {
  const Icon = action.icon;
  
  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="h-full"
    >
      <Card 
        className="h-full border-none shadow-xl hover:shadow-2xl group transition-all duration-500 bg-card/50 backdrop-blur-2xl rounded-[2rem] overflow-hidden relative cursor-pointer"
        onClick={() => action.resource && onAction(action.resource)}
      >
        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shine_2s_infinite] pointer-events-none" />
        
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-8 pb-4 relative z-10">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 group-hover:text-primary transition-colors">{action.title}</CardTitle>
          <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 group-hover:rotate-12 shadow-sm">
            <Icon className="h-6 w-6" />
          </div>
        </CardHeader>
        
        <CardContent className="p-8 pt-2 relative z-10 flex flex-col h-[calc(100%-80px)]">
          {/* Background Icon for Depth */}
          <div className="absolute -right-4 -bottom-4 p-2 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 rotate-12 group-hover:rotate-0 group-hover:scale-110">
            <Icon className="h-32 w-32" />
          </div>

          <div className="mb-4">
            <div className="text-xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors">{action.heading}</div>
          </div>
          
          <p className="text-sm text-muted-foreground/80 mb-8 leading-relaxed font-medium flex-1">
            {action.description}
          </p>
          
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-black/[0.03] dark:border-white/[0.03]">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/40 group-hover:text-primary/60 transition-colors">
              <Sparkles className="h-3 w-3" />
              <span>Quick Access</span>
            </div>
            <Button 
              variant="ghost"
              className="rounded-xl bg-primary/5 hover:bg-primary hover:text-primary-foreground transition-all font-black uppercase tracking-widest text-[10px] h-10 px-5 gap-2 shadow-sm group-hover:shadow-lg group-hover:shadow-primary/20"
            >
              Explore
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

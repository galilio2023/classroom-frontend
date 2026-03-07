import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

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
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card 
        className="border-none shadow-lg hover:shadow-2xl group transition-all duration-500 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl"
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-primary/60">{action.title}</CardTitle>
          <div className="p-2.5 bg-primary/5 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 group-hover:rotate-12">
            <Icon className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-3">
            <div className="text-sm font-bold mt-1 text-foreground/80">{action.heading}</div>
          </div>
          <p className="text-xs text-muted-foreground mb-8 leading-relaxed font-medium">
            {action.description}
          </p>
          <Button 
            variant="ghost"
            className="w-full justify-between rounded-xl bg-primary/5 hover:bg-primary hover:text-primary-foreground transition-all font-bold group-hover:shadow-lg group-hover:shadow-primary/20"
            onClick={() => action.resource && onAction(action.resource)}
          >
            Explore
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

import { motion } from "framer-motion";
import { Users, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface NoChildrenEmptyStateProps {
  onLinkClick: () => void;
}

export const NoChildrenEmptyState = ({ onLinkClick }: NoChildrenEmptyStateProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="px-2"
    >
      <Card className="border-2 border-dashed border-border/40 bg-card/20 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden">
        <CardContent className="flex flex-col items-center justify-center py-20 md:py-32 text-center space-y-6">
          <div className="p-8 rounded-4xl bg-primary/5 text-primary/30">
            <Users className="h-16 w-16" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl md:text-3xl font-black tracking-tight">
              {t("dashboard.parent.noChildren")}
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto text-base font-medium text-balance">
              {t("dashboard.parent.noChildrenDescription")}
            </p>
          </div>
          <Button
            size="lg"
            onClick={onLinkClick}
            className="rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 mt-4"
          >
            <Plus className="h-4 w-4 me-2" />
            {t("dashboard.parent.linkChild")}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

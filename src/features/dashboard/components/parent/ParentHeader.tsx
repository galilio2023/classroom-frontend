import { motion } from "framer-motion";
import { Users, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface ParentHeaderProps {
  childrenCount: number;
  onLinkClick: () => void;
}

export const ParentHeader = ({ childrenCount, onLinkClick }: ParentHeaderProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2 text-start"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="p-3 lg:p-4 rounded-2xl lg:rounded-3xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
            <Users className="h-6 w-6 lg:h-8 lg:w-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-none text-balance">
              {t("dashboard.parent.familyOverview")}
            </h2>
            <p className="text-muted-foreground font-medium max-w-xl text-balance">
              {t("dashboard.parent.familyDescription")}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <Badge className="bg-primary/10 text-primary border-none font-black px-5 py-2 rounded-full text-[10px] tracking-[0.2em] shadow-sm uppercase">
          {childrenCount === 1
            ? t("dashboard.parent.childLinked", { count: childrenCount })
            : t("dashboard.parent.childrenLinked", {
                count: childrenCount,
              })}
        </Badge>
        <Button
          size="lg"
          className="flex-1 md:flex-none rounded-2xl h-12 md:h-14 px-8 font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          onClick={onLinkClick}
        >
          <Plus className="h-5 w-5" />
          {t("dashboard.parent.linkChild")}
        </Button>
      </div>
    </motion.div>
  );
};

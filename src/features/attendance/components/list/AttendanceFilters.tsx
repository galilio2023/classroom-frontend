import { Card } from "@/components/ui/card";
import { Search, Filter, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { AcademicTerm } from "@/types";

interface AttendanceFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTerm?: AcademicTerm | null;
}

export const AttendanceFilters = ({
  searchQuery,
  setSearchQuery,
  selectedTerm,
}: AttendanceFiltersProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card className="p-4 border-primary/5 bg-muted/30 rounded-4xl backdrop-blur-sm text-start">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              type="text"
              placeholder={t("classes.attendance.governance.searchPlaceholder")}
              className="ps-11 h-14 rounded-2xl border-none bg-background shadow-sm font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 bg-background px-4 rounded-2xl shadow-sm border border-primary/5">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {t("classes.attendance.governance.historyFilter")}
            </span>
          </div>
        </div>
      </Card>

      <AnimatePresence>
        {selectedTerm?.status === "archived" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-amber-500/10 border border-amber-500/20 text-amber-700 p-6 rounded-4xl shadow-sm flex items-start gap-4 backdrop-blur-sm text-start"
          >
            <div className="p-3 rounded-2xl bg-amber-500/20">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="font-black uppercase tracking-widest text-xs">
                {t("dashboard.archiveViewActive")}
              </p>
              <p className="text-sm font-medium">
                {t("dashboard.archiveViewDescription", {
                  termName: selectedTerm.name,
                })}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

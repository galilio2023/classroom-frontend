import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FileText, Share2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/refine/layout/breadcrumb";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Assignment } from "@/types";

interface Props {
  assignment: Assignment;
  isStaff: boolean;
}

export const AssignmentHeader = ({ assignment, isStaff }: Props) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 md:space-y-6 text-start"
    >
      <Breadcrumb />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/5">
            <FileText className="h-6 w-6 md:h-8 md:w-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight">
              {t("assignments.show.assignmentDetails")}
            </h1>
            <p className="text-muted-foreground font-medium max-w-xl text-balance">
              {t("assignments.show.description")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            size="lg"
            className="w-full md:w-auto rounded-2xl font-bold uppercase tracking-widest text-[10px] h-12 md:h-14 px-6 md:px-8 gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success(t("assignments.show.toast.linkCopied"));
            }}
          >
            <Share2 className="w-4 h-4" />
            {t("buttons.share")}
          </Button>
          {isStaff && (
            <Button
              size="lg"
              className="w-full md:w-auto rounded-2xl font-bold uppercase tracking-widest text-[10px] h-12 md:h-14 px-8 md:px-10 shadow-lg shadow-primary/25"
              asChild
            >
              <Link to={`/assignments/edit/${assignment.id}`}>
                <Pencil className="w-4 h-4 me-2" />
                {t("buttons.editTask")}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

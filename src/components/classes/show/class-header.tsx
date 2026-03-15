import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Share2, Pencil, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { toast } from "sonner";

interface ClassHeaderProps {
  classId: string;
  isOwner: boolean;
}

export const ClassHeader = ({ classId, isOwner }: ClassHeaderProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Breadcrumb />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 text-start">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-sm">
            <LayoutDashboard className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              {t("classes.show.classroomHub")}
            </h1>
            <p className="text-muted-foreground font-medium">
              {t("classes.show.hubDescription")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-6 gap-2 border-primary/10 bg-card/50 backdrop-blur-sm"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success(t("classes.show.toast.linkCopied"));
            }}
          >
            <Share2 className="w-4 h-4" />
            {t("buttons.share")}
          </Button>
          {isOwner && (
            <Button
              className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-8 shadow-xl shadow-primary/20"
              asChild
            >
              <Link to={`/classes/edit/${classId}`}>
                <Pencil className="w-4 h-4 mr-2" />
                {t("buttons.editClass")}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

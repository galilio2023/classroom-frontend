import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { Copy, Pencil, Share2, Check, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CanAccess } from "@/components/auth/can-access";

interface ClassHeaderProps {
  classId: string;
  isOwner: boolean;
}

export const ClassHeader = ({ classId, isOwner }: ClassHeaderProps) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success(t("classes.show.toast.linkCopied"));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 md:space-y-6 text-start"
    >
      <Breadcrumb />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
            <LayoutDashboard className="h-6 w-6 md:h-8 md:w-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-balance">
              {t("classes.show.details.classInfo")}
            </h1>
            <p className="text-muted-foreground font-medium text-balance mt-1">
              {t("classes.show.description")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            size="lg"
            className="w-full md:w-auto rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 md:h-14 px-6 md:px-8 gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 shadow-sm transition-all"
            onClick={handleCopyLink}
          >
            {copied ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
            {copied ? t("buttons.copied") : t("buttons.share")}
          </Button>

          <CanAccess resource="classes" action="edit" id={classId}>
            {isOwner && (
              <Button
                size="lg"
                className="w-full md:w-auto rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 md:h-14 px-8 md:px-10 shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all"
                asChild
              >
                <Link to={`/classes/edit/${classId}`}>
                  <Pencil className="w-4 h-4 me-2" />
                  {t("buttons.editClass")}
                </Link>
              </Button>
            )}
          </CanAccess>
        </div>
      </div>
    </motion.div>
  );
};

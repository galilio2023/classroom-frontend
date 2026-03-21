import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Loader2, XCircle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const ClassLoadingView = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center h-[85vh] gap-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative"
      >
        <div className="absolute inset-[-20px] rounded-full bg-primary/5 animate-ping duration-[3000ms]" />
        <Loader2 className="h-20 w-20 animate-spin text-primary/10 stroke-[1]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <BookOpen className="h-8 w-8 text-primary/30" />
        </div>
      </motion.div>
      <div className="text-center space-y-2">
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary/60 animate-pulse">
          {t("classes.show.assembling")}
        </h2>
        <p className="text-xs font-medium text-muted-foreground/60 italic">Preparing your immersive classroom...</p>
      </div>
    </div>
  );
};

export const ClassErrorView = () => {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto py-32 text-center space-y-8">
      <div className="p-8 rounded-[2.5rem] bg-destructive/5 text-destructive w-fit mx-auto border border-destructive/10">
        <XCircle className="h-20 w-20" />
      </div>
      <div className="space-y-3">
        <h2 className="text-4xl font-black tracking-tight">
          {t("classes.show.notFound")}
        </h2>
        <p className="text-muted-foreground font-medium max-w-md mx-auto text-lg">
          {t("classes.show.notFoundDescription")}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          asChild
          size="lg"
          variant="outline"
          className="rounded-2xl h-14 px-10 font-bold uppercase tracking-widest text-[10px]"
        >
          <Link to="/">{t("dashboard.title")}</Link>
        </Button>
        <Button
          asChild
          size="lg"
          className="rounded-2xl h-14 px-10 font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
        >
          <Link to="/classes">{t("buttons.goBack")}</Link>
        </Button>
      </div>
    </div>
  );
};

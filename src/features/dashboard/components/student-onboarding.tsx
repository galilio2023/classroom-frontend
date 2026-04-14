import React from "react";
import { GraduationCap, PlusCircle, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@refinedev/core";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {} from "@/lib/utils";

export const StudentOnboarding = () => {
  const { t } = useTranslation();
  const { list } = useNavigation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-12"
    >
      <Card className="border-border/40 bg-primary/5 backdrop-blur-xl shadow-2xl rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden relative group border-2 border-dashed">
        {/* Background Effects - Refined */}
        <div className="absolute top-0 start-0 w-full h-1.5 bg-linear-to-r from-primary via-ai-primary to-primary opacity-20 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -top-24 -end-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] animate-pulse opacity-50" />
        <div className="absolute -bottom-24 -start-24 w-64 h-64 bg-ai-primary/10 rounded-full blur-[80px] animate-pulse delay-700 opacity-50" />

        <CardHeader className="text-center pt-12 md:pt-16 pb-8 md:pb-10 relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="mx-auto p-5 md:p-6 bg-primary/10 text-primary rounded-[1.5rem] md:rounded-3xl w-fit mb-6 md:mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-primary/5 border border-primary/5"
          >
            <GraduationCap className="h-10 w-10 md:h-12 md:w-12 text-primary drop-shadow-lg" />
          </motion.div>
          <div className="space-y-3 max-w-2xl mx-auto px-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] border border-primary/20 shadow-sm">
                {t("dashboard.onboarding.getStarted")}
              </span>
            </div>
            <CardTitle className="text-3xl md:text-5xl font-black tracking-tighter text-foreground leading-tight text-balance">
              {t("dashboard.onboarding.student.welcome")}
            </CardTitle>
            <CardDescription className="text-base md:text-xl font-medium text-muted-foreground/80 leading-relaxed text-balance">
              {t("dashboard.onboarding.student.description")}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col items-center pb-12 md:pb-16 relative z-10 px-6 md:px-12">
          <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 max-w-4xl w-full">
            <motion.div
              whileHover={{ y: -8 }}
              className="bg-background/40 backdrop-blur-md p-8 md:p-10 rounded-4xl md:rounded-[2.5rem] border border-border/40 shadow-xl flex flex-col items-center text-center group/card hover:border-primary/20 transition-all duration-500"
            >
              <div className="p-4 rounded-2xl mb-6 group-hover/card:scale-110 transition-transform duration-500 bg-blue-500/10 text-blue-500 border border-blue-500/5 shadow-sm">
                <PlusCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl md:text-2xl font-black tracking-tight mb-3">
                {t("dashboard.onboarding.student.joinClass.title")}
              </h3>
              <p className="text-sm md:text-base font-medium text-muted-foreground/70 mb-8 leading-relaxed">
                {t("dashboard.onboarding.student.joinClass.description")}
              </p>
              <Button
                size="lg"
                className="w-full h-12 md:h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => list("classes")}
              >
                {t("buttons.joinClass")}
                <ArrowRight className="h-4 w-4 ms-2 rtl:rotate-180" />
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="bg-background/40 backdrop-blur-md p-8 md:p-10 rounded-4xl md:rounded-[2.5rem] border border-border/40 shadow-xl flex flex-col items-center text-center group/card hover:border-purple-500/20 transition-all duration-500"
            >
              <div className="p-4 rounded-2xl mb-6 group-hover/card:scale-110 transition-transform duration-500 bg-purple-500/10 text-purple-500 border border-purple-500/5 shadow-sm">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-xl md:text-2xl font-black tracking-tight mb-3">
                {t("dashboard.onboarding.student.exploreResources.title")}
              </h3>
              <p className="text-sm md:text-base font-medium text-muted-foreground/70 mb-8 leading-relaxed">
                {t("dashboard.onboarding.student.exploreResources.description")}
              </p>
              <Button
                variant="outline"
                size="lg"
                className="w-full h-12 md:h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border-2 border-purple-500/20 hover:bg-purple-500/5 hover:text-purple-600 transition-all hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => list("resources")}
              >
                {t("buttons.viewResources")}
                <ArrowRight className="h-4 w-4 ms-2 rtl:rotate-180" />
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

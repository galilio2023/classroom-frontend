import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface Props {
  isAr: boolean;
}

export const LandingHero = ({ isAr: _isAr }: Props) => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Designer Background: Noise + Aurora - SEND TO BACK */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="noise-overlay" />
        <div className="absolute top-0 start-1/2 -translate-x-1/2 w-full max-w-300 h-125 bg-primary/10 rounded-full blur-[120px] opacity-40" />
      </div>

      <div className="container-center relative z-20 text-center">
        {/* The Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1 rounded-full glass-card mb-10"
        >
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-foreground/60">
            {t("landing.hero.badge")}
          </span>
        </motion.div>

        <div className="max-w-250 mx-auto space-y-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-[7.5rem] font-black leading-[0.9] tracking-tighter uppercase text-gradient"
          >
            {t("landing.hero.titlePart1")}
            <br />
            <span className="text-primary">{t("landing.hero.titlePart2")}</span>
            <br />
            {t("landing.hero.titlePart3")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-xl lg:text-2xl text-muted-foreground/80 font-medium max-w-xl mx-auto leading-relaxed"
          >
            {t("landing.hero.description")}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12"
        >
          <Button
            size="lg"
            className="h-14 md:h-20 w-full sm:w-auto px-12 rounded-full text-lg font-black uppercase tracking-widest shadow-2xl shadow-primary/20 bg-primary hover:scale-105 active:scale-95 transition-all duration-500"
            asChild
          >
            <Link to="/register">
              {t("buttons.getStarted")}
              <ArrowRight className="ms-3 h-5 w-5 rtl:rotate-180" />
            </Link>
          </Button>

          <Button
            size="lg"
            variant="ghost"
            className="h-14 md:h-20 w-full sm:w-auto px-12 rounded-full text-lg font-black uppercase tracking-widest hover:bg-muted/50 transition-all duration-500"
            asChild
          >
            <Link to="/login">{t("buttons.signIn")}</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

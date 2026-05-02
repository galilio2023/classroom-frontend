import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface Props {
  isAr: boolean;
}

export const LandingHero = ({ isAr: _isAr }: Props) => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
      {/* 🌈 VIBRANT DESIGNER BACKGROUND: Multicolored Aurora + Magic Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="noise-overlay opacity-30" />
        <div className="absolute top-[-10%] start-[10%] w-[70%] h-[60%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] end-[10%] w-[60%] h-[50%] bg-purple-500/20 rounded-full blur-[120px] [animation-delay:1s] animate-pulse" />
        <div className="absolute top-[20%] end-[-5%] w-[40%] h-[40%] bg-emerald-400/10 rounded-full blur-[100px] animate-pulse" />

        {/* ✨ MAGIC PARTICLES */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.4, 0],
              scale: [0, 1, 0.5],
              y: [0, -100 - Math.random() * 200],
              x: [0, (Math.random() - 0.5) * 200],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "easeInOut",
            }}
            className="absolute top-1/2 left-1/2 h-2 w-2 bg-primary/30 rounded-full blur-[1px]"
            style={{
              marginLeft: `${(Math.random() - 0.5) * 100}%`,
              marginTop: `${(Math.random() - 0.5) * 50}%`,
            }}
          />
        ))}
      </div>

      <div className="container-center relative z-20 text-center">
        {/* The Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full border border-primary/30 bg-white/10 backdrop-blur-2xl shadow-[0_0_40px_rgba(var(--primary-rgb),0.1)] mb-14 group cursor-default"
        >
          <div className="relative">
            <Sparkles className="h-4 w-4 text-amber-400 animate-spin-slow" />
            <motion.div
              animate={{ opacity: [0, 1, 0], scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 text-amber-400/50"
            >
              <Sparkles className="h-4 w-4" />
            </motion.div>
          </div>
          <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">
            {t("landing.hero.badge")}
          </span>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-8">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: "circOut" }}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black leading-[0.9] tracking-tight uppercase"
          >
            <span className="bg-clip-text text-transparent bg-linear-to-r from-primary via-purple-500 to-primary bg-[length:200%_auto] animate-gradient block">
              {t("landing.hero.titlePart1")}
            </span>
            <span className="italic font-serif normal-case text-foreground/90 tracking-normal block mt-2">
              {t("landing.hero.titlePart2")}
            </span>
            <span className="text-primary block mt-2">{t("landing.hero.titlePart3")}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="text-lg md:text-xl text-muted-foreground/70 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            {t("landing.hero.description")}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8, ease: "circOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12"
        >
          <Button
            size="lg"
            className="h-16 md:h-18 w-full sm:w-auto px-12 rounded-2xl text-base font-black uppercase tracking-widest shadow-[0_20px_50px_-10px_rgba(var(--primary-rgb),0.5)] bg-linear-to-r from-primary via-purple-600 to-primary bg-[length:200%_auto] animate-gradient hover:scale-105 active:scale-95 transition-all duration-500 group relative overflow-hidden text-white border-none"
            asChild
          >
            <Link to="/register">
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-[-20deg]" />
              <span className="relative z-10 flex items-center gap-3">
                {t("buttons.getStarted")}
                <ArrowRight className="h-5 w-5 rtl:rotate-180 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </Button>

          <Button
            size="lg"
            variant="ghost"
            className="h-16 md:h-18 w-full sm:w-auto px-10 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-primary/5 border-2 border-primary/20 text-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.05)] hover:shadow-[0_0_40px_rgba(var(--primary-rgb),0.15)] transition-all duration-500"
            asChild
          >
            <Link to="/discovery/classes">
              {t("buttons.browseClasses", { defaultValue: "Browse Classes" })}
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

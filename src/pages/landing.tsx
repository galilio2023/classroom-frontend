import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Zap,
  ChevronRight,
  Sparkles,
  Users,
  GraduationCap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LandingHero } from "@/components/landing/hero";
import { cn } from "@/lib/utils";

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const pillars = [
    {
      title: t("landing.pillars.ai.title"),
      desc: t("landing.pillars.ai.desc"),
      icon: Sparkles,
      color: "text-ai-primary",
      bg: "bg-ai-primary/10",
      colSpan: "col-span-12 md:col-span-7",
      visual: (
        <div className="relative h-48 w-full mt-8 bg-ai-primary/5 rounded-4xl border border-ai-primary/10 overflow-hidden flex flex-col p-6">
          <div className="flex gap-2 mb-4">
            <div className="h-2 w-2 rounded-full bg-ai-primary animate-bounce" />
            <div className="h-2 w-2 rounded-full bg-ai-primary animate-bounce [animation-delay:0.2s]" />
            <div className="h-2 w-2 rounded-full bg-ai-primary animate-bounce [animation-delay:0.4s]" />
          </div>
          <div className="space-y-3">
            <div className="h-3 w-full bg-ai-primary/10 rounded-full" />
            <div className="h-3 w-4/5 bg-ai-primary/10 rounded-full" />
            <div className="h-3 w-2/3 bg-ai-primary/10 rounded-full" />
          </div>
        </div>
      ),
    },
    {
      title: t("landing.pillars.manage.title"),
      desc: t("landing.pillars.manage.desc"),
      icon: Zap,
      color: "text-primary",
      bg: "bg-primary/10",
      colSpan: "col-span-12 md:col-span-5",
      visual: (
        <div className="relative h-48 w-full mt-8 bg-primary/5 rounded-4xl border border-primary/10 p-6 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-3 w-full">
            <div className="h-12 bg-primary/10 rounded-xl" />
            <div className="h-12 bg-primary/10 rounded-xl" />
            <div className="h-12 bg-primary/10 rounded-xl" />
            <div className="h-12 bg-primary/10 rounded-xl" />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/10 selection:text-primary overflow-x-hidden">
      <div className="noise-overlay" />

      {/* Designer Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 start-0 w-full h-full bg-primary/1 blur-[140px]" />
      </div>

      <div className="relative z-10">
        <LandingHero isAr={isAr} />

        {/* Bento Grid Features - CONSTRAINED */}
        <section id="features" className="section-wrapper">
          <div className="container-center">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 md:mb-24 gap-8">
              <div className="max-w-2xl text-start">
                <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase mb-6 leading-[0.9]">
                  {t("landing.bento.title1")} <br />
                  <span className="text-primary">
                    {t("landing.bento.title2")}
                  </span>
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground font-medium">
                  {t("landing.bento.desc")}
                </p>
              </div>
              <div className="hidden md:block h-px flex-1 bg-border/50 mx-12 mb-6" />
            </div>

            <div className="grid grid-cols-12 gap-6 md:gap-8">
              {pillars.map((pillar, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.8 }}
                  viewport={{ once: true }}
                  className={cn(
                    "p-6 sm:p-10 rounded-4xl sm:rounded-[3rem] glass-card group flex flex-col relative overflow-hidden",
                    pillar.colSpan,
                  )}
                >
                  <div className="absolute top-0 end-0 p-10 opacity-[0.02] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                    <pillar.icon className="h-64 w-64" />
                  </div>
                  <div
                    className={`p-5 rounded-2xl ${pillar.bg} w-fit transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${pillar.color}`}
                  >
                    <pillar.icon className="h-8 w-8" />
                  </div>
                  <div className="mt-8 sm:mt-10 space-y-4 flex-1 text-start relative z-10">
                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                      {pillar.title}
                    </h3>
                    <p className="text-base sm:text-lg text-muted-foreground font-medium leading-relaxed max-w-md">
                      {pillar.desc}
                    </p>
                  </div>
                  {pillar.visual}
                </motion.div>
              ))}

              {/* Final Bento Growth Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                viewport={{ once: true }}
                className="col-span-12 p-8 sm:p-10 rounded-4xl sm:rounded-[3rem] bg-primary text-primary-foreground flex flex-col md:flex-row items-center gap-8 md:gap-12 relative overflow-hidden group shadow-2xl shadow-primary/20"
              >
                <div className="absolute inset-0 bg-linear-to-r from-primary via-primary to-ai-primary opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="flex-1 text-start relative z-10">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-4 block">
                    {t("landing.growth.badge")}
                  </span>
                  <h3 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter mb-6 leading-none">
                    {t("landing.growth.title1")} <br />
                    {t("landing.growth.title2")}
                  </h3>
                  <p className="text-base sm:text-lg text-white/70 font-medium leading-relaxed max-w-lg">
                    {t("landing.growth.desc")}
                  </p>
                </div>
                <div className="relative z-10 h-48 w-full md:w-96 bg-white/10 rounded-4xl border border-white/10 p-8 flex items-end gap-3 backdrop-blur-md">
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: "40%" }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="flex-1 bg-white/20 rounded-t-xl"
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: "60%" }}
                    transition={{ delay: 0.6, duration: 1 }}
                    className="flex-1 bg-white/40 rounded-t-xl"
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: "90%" }}
                    transition={{ delay: 0.7, duration: 1 }}
                    className="flex-1 bg-white/60 rounded-t-xl"
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: "100%" }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="flex-1 bg-white rounded-t-xl shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Role Selection - CONSTRAINED */}
        <section className="section-wrapper">
          <div className="container-center">
            <div className="flex flex-col md:flex-row gap-8 items-stretch max-w-6xl mx-auto">
              <Link to="/register" className="flex-1 group">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="h-full p-6 sm:p-12 md:p-20 rounded-[2.5rem] sm:rounded-[4rem] bg-card border border-border/40 transition-all duration-500 hover:shadow-3xl text-start relative overflow-hidden"
                >
                  <div className="absolute top-[-10%] end-[-10%] opacity-[0.02] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                    <Users className="h-96 w-96 text-primary" />
                  </div>
                  <h2 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-none">
                    {t("landing.roles.student.title")}
                    <br />
                    <span className="text-primary/40">
                      {t("landing.roles.student.portal")}
                    </span>
                  </h2>
                  <div className="flex items-center gap-3 font-black uppercase tracking-widest text-xs mt-12 bg-primary/10 text-primary w-fit px-6 py-3 rounded-full group-hover:bg-primary group-hover:text-white transition-all">
                    {t("buttons.joinNow")}{" "}
                    <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                  </div>
                </motion.div>
              </Link>

              <Link to="/register" className="flex-1 group">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="h-full p-6 sm:p-12 md:p-20 rounded-[2.5rem] sm:rounded-[4rem] bg-card border border-border/40 transition-all duration-500 hover:shadow-3xl text-start relative overflow-hidden"
                >
                  <div className="absolute top-[-10%] end-[-10%] opacity-[0.02] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                    <GraduationCap className="h-96 w-96 text-primary" />
                  </div>
                  <h2 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-none">
                    {t("landing.roles.teacher.title")}
                    <br />
                    <span className="text-primary/40">
                      {t("landing.roles.teacher.portal")}
                    </span>
                  </h2>
                  <div className="flex items-center gap-3 font-black uppercase tracking-widest text-xs mt-12 bg-foreground text-background w-fit px-6 py-3 rounded-full group-hover:bg-primary group-hover:text-white transition-all">
                    {t("buttons.applyToTeach")}{" "}
                    <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                  </div>
                </motion.div>
              </Link>
            </div>
          </div>
        </section>

        {/* Final Statement - CONSTRAINED */}
        <section className="section-wrapper text-center py-12! md:py-48!">
          <div className="container-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6 md:space-y-16 max-w-5xl mx-auto"
            >
              <h2 className="text-3xl sm:text-6xl md:text-8xl lg:text-[10rem] xl:text-[12rem] font-black tracking-[-0.06em] leading-[0.9] uppercase text-gradient">
                {t("landing.cta.evolved1")} <br />
                <span className="text-primary">
                  {t("landing.cta.evolved2")}
                </span>
              </h2>
              <div className="pt-6 md:pt-12 flex justify-center">
                <Button
                  size="lg"
                  className="h-14 sm:h-24 px-6 sm:px-20 rounded-full text-sm xs:text-base sm:text-2xl font-black uppercase tracking-widest shadow-2xl shadow-primary/30 bg-primary hover:scale-110 active:scale-95 transition-all duration-500 group max-w-full w-auto"
                  asChild
                >
                  <Link to="/register">
                    <span className="truncate">{t("landing.cta.launch")}</span>
                    <Sparkles className="ms-2 sm:ms-4 h-5 w-5 sm:h-8 sm:w-8 animate-pulse shrink-0" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap, ChevronRight, Sparkles, Users, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LandingHero } from "../components/hero";
import { cn } from "@/lib/utils";
import { Helmet } from "react-helmet-async";

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const pillars = [
    {
      title: t("landing.pillars.ai.title"),
      desc: t("landing.pillars.ai.desc"),
      icon: Sparkles,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      colSpan: "col-span-12 md:col-span-7",
      visual: (
        <div className="relative h-48 w-full mt-8 bg-linear-to-br from-amber-500/10 to-purple-500/10 rounded-4xl border border-white/10 overflow-hidden flex flex-col p-6 group-hover:shadow-[0_0_50px_rgba(245,158,11,0.15)] transition-shadow duration-700">
          <div className="flex gap-2 mb-4">
            <div className="h-2 w-2 rounded-full bg-amber-400 animate-bounce" />
            <div className="h-2 w-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]" />
            <div className="h-2 w-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
          </div>
          <div className="space-y-3">
            <div className="h-3 w-full bg-amber-500/20 rounded-full" />
            <div className="h-3 w-4/5 bg-purple-500/20 rounded-full" />
            <div className="h-3 w-2/3 bg-amber-500/20 rounded-full" />
          </div>
          {/* Magic Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-amber-500/20 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </div>
      ),
    },
    {
      title: t("landing.pillars.manage.title"),
      desc: t("landing.pillars.manage.desc"),
      icon: Zap,
      color: "text-sky-500",
      bg: "bg-sky-500/10",
      colSpan: "col-span-12 md:col-span-5",
      visual: (
        <div className="relative h-48 w-full mt-8 bg-linear-to-br from-sky-500/10 to-emerald-500/10 rounded-4xl border border-white/10 p-6 flex items-center justify-center group-hover:shadow-[0_0_50px_rgba(14,165,233,0.15)] transition-shadow duration-700">
          <div className="grid grid-cols-2 gap-3 w-full">
            <div className="h-12 bg-sky-500/20 rounded-xl animate-pulse" />
            <div className="h-12 bg-emerald-500/20 rounded-xl [animation-delay:0.5s] animate-pulse" />
            <div className="h-12 bg-emerald-500/20 rounded-xl [animation-delay:0.3s] animate-pulse" />
            <div className="h-12 bg-sky-500/20 rounded-xl [animation-delay:0.7s] animate-pulse" />
          </div>
        </div>
      ),
    },
    {
      title: t("landing.roles.teacher.title"),
      desc: t("landing.roles.teacher.f1"),
      icon: GraduationCap,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      colSpan: "col-span-12",
      visual: (
        <div className="relative h-48 w-full mt-8 bg-linear-to-r from-purple-500/10 via-primary/5 to-purple-500/10 rounded-4xl border border-white/10 p-8 flex items-center justify-between overflow-hidden group-hover:shadow-[0_0_50px_rgba(168,85,247,0.15)] transition-shadow duration-700">
          <div className="space-y-4 relative z-10">
            <div className="h-4 w-64 bg-purple-500/20 rounded-full" />
            <div className="h-4 w-48 bg-primary/20 rounded-full" />
            <div className="h-4 w-56 bg-purple-500/20 rounded-full" />
          </div>
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="h-16 w-16 rounded-full bg-purple-500 flex items-center justify-center text-white shadow-xl shadow-purple-500/40 group-hover:scale-110 transition-transform duration-500">
              <GraduationCap className="h-8 w-8" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-500/60">
              Verified Professional
            </span>
          </div>
          {/* Background Gradient Pulse */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </div>
      ),
    },
  ];

  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/10 selection:text-primary overflow-x-hidden font-sans">
      <Helmet>
        <title>Tablawy OS | Unlock the Magic of AI Learning</title>
        <meta
          name="description"
          content="Empowering the next generation with joyful, AI-assisted classrooms and real-time live sessions. Discover the future of education in Egypt."
        />
      </Helmet>

      <div className="noise-overlay" />

      {/* 🌈 VIBRANT DESIGNER BACKGROUND */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 start-0 w-full h-full bg-primary/2 blur-[140px]" />
        <div className="absolute top-[10%] end-[-5%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] start-[-5%] w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        <LandingHero isAr={isAr} />

        {/* Bento Grid Features - CONSTRAINED */}
        <section id="features" className="section-wrapper">
          <div className="container-center px-4 md:px-0">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 md:mb-24 gap-8">
              <div className="max-w-2xl text-start">
                <h2 className="text-4xl md:text-7xl font-black tracking-tight uppercase mb-6 leading-[0.85]">
                  <span className="text-primary">{t("landing.bento.title1")}</span> <br />
                  {t("landing.bento.title2")}
                </h2>
                <p className="text-lg md:text-2xl text-muted-foreground/80 font-medium">
                  {t("landing.bento.desc")}
                </p>
              </div>
              <div className="hidden md:block h-px flex-1 bg-linear-to-r from-transparent via-border to-transparent mx-12 mb-6" />
            </div>

            <div className="grid grid-cols-12 gap-6 md:gap-10">
              {pillars.map((pillar, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.8 }}
                  viewport={{ once: true }}
                  className={cn(
                    "p-8 sm:p-12 rounded-[3.5rem] glass-card group flex flex-col relative overflow-hidden border-white/5",
                    pillar.colSpan
                  )}
                >
                  <div className="absolute top-0 end-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000 pointer-events-none group-hover:opacity-[0.05]">
                    <pillar.icon className="h-64 w-64" />
                  </div>
                  <div
                    className={`p-6 rounded-3xl ${pillar.bg} w-fit transition-all duration-700 group-hover:scale-110 group-hover:rotate-12 ${pillar.color} shadow-lg group-hover:shadow-current/20`}
                  >
                    <pillar.icon className="h-10 w-10" />
                  </div>
                  <div className="mt-12 space-y-6 flex-1 text-start relative z-10">
                    <h3 className="text-3xl sm:text-4xl font-black tracking-tight">
                      {pillar.title}
                    </h3>
                    <p className="text-lg sm:text-xl text-muted-foreground/90 font-medium leading-relaxed max-w-md">
                      {pillar.desc}
                    </p>
                  </div>
                  {pillar.visual}
                </motion.div>
              ))}

              {/* Final Bento Growth Card - VIBRANT GRADIENT */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                viewport={{ once: true }}
                className="col-span-12 p-10 sm:p-14 rounded-[4rem] bg-linear-to-r from-primary via-purple-600 to-ai-primary text-primary-foreground flex flex-col lg:flex-row items-center gap-12 lg:gap-20 relative overflow-hidden group shadow-3xl shadow-primary/30"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] opacity-20" />
                <div className="flex-1 text-start relative z-10">
                  <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-md mb-8">
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80">
                      {t("landing.growth.badge")}
                    </span>
                  </div>
                  <h3 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.85] uppercase">
                    {t("landing.growth.title1")} <br />
                    {t("landing.growth.title2")}
                  </h3>
                  <p className="text-xl sm:text-2xl text-white/80 font-medium leading-relaxed max-w-xl">
                    {t("landing.growth.desc")}
                  </p>
                </div>
                <div className="relative z-10 h-64 w-full lg:w-[32rem] bg-white/10 rounded-[3rem] border border-white/20 p-10 flex items-end gap-5 backdrop-blur-xl group-hover:scale-105 transition-transform duration-700">
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: "40%" }}
                    transition={{ delay: 0.5, duration: 1.2, ease: "circOut" }}
                    className="flex-1 bg-white/20 rounded-t-2xl"
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: "60%" }}
                    transition={{ delay: 0.6, duration: 1.2, ease: "circOut" }}
                    className="flex-1 bg-white/40 rounded-t-2xl"
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: "90%" }}
                    transition={{ delay: 0.7, duration: 1.2, ease: "circOut" }}
                    className="flex-1 bg-white/60 rounded-t-2xl"
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: "100%" }}
                    transition={{ delay: 0.8, duration: 1.2, ease: "circOut" }}
                    className="flex-1 bg-white rounded-t-2xl shadow-[0_0_50px_rgba(255,255,255,0.4)]"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Role Selection - JOYFUL & INVITING */}
        <section className="section-wrapper">
          <div className="container-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 items-stretch max-w-[90rem] mx-auto">
              <Link to="/register" className="group">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="h-full p-10 rounded-[3rem] bg-linear-to-br from-card to-background border border-border/40 transition-all duration-700 hover:shadow-3xl text-start relative overflow-hidden"
                >
                  <div className="absolute top-[-5%] end-[-5%] opacity-[0.03] group-hover:scale-110 transition-transform duration-1000 pointer-events-none group-hover:opacity-[0.06]">
                    <Users className="h-72 w-72 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight mb-4 leading-none uppercase">
                    {t("landing.roles.student.title")}
                    <br />
                    <span className="text-primary/40 text-xl font-bold">
                      {t("landing.roles.student.portal")}
                    </span>
                  </h2>
                  <ul className="space-y-3 mb-10 relative z-10">
                    {[
                      t("landing.roles.student.f1"),
                      t("landing.roles.student.f2"),
                      t("landing.roles.student.f3"),
                    ].map((f, i) => (
                      <li
                        key={i}
                        className="text-sm font-medium text-muted-foreground/80 flex items-center gap-3"
                      >
                        <div className="h-1 w-1 rounded-full bg-primary" /> {f}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-3 font-bold uppercase tracking-widest text-[10px] bg-linear-to-r from-primary to-blue-500 text-white w-fit px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all group-hover:scale-105">
                    {t("buttons.joinNow")}{" "}
                    <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              </Link>

              <Link to="/register/teacher" className="group">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="h-full p-10 rounded-[3rem] bg-linear-to-br from-card to-background border border-border/40 transition-all duration-700 hover:shadow-3xl text-start relative overflow-hidden"
                >
                  <div className="absolute top-[-5%] end-[-5%] opacity-[0.03] group-hover:scale-110 transition-transform duration-1000 pointer-events-none group-hover:opacity-[0.06]">
                    <GraduationCap className="h-72 w-72 text-purple-500" />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight mb-4 leading-none uppercase">
                    {t("landing.roles.teacher.title")}
                    <br />
                    <span className="text-purple-500/40 text-xl font-bold">
                      {t("landing.roles.teacher.portal")}
                    </span>
                  </h2>
                  <ul className="space-y-3 mb-10 relative z-10">
                    {[
                      t("landing.roles.teacher.f1"),
                      t("landing.roles.teacher.f2"),
                      t("landing.roles.teacher.f3"),
                    ].map((f, i) => (
                      <li
                        key={i}
                        className="text-sm font-medium text-muted-foreground/80 flex items-center gap-3"
                      >
                        <div className="h-1 w-1 rounded-full bg-purple-500" /> {f}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-3 font-bold uppercase tracking-widest text-[10px] bg-linear-to-r from-purple-500 to-indigo-600 text-white w-fit px-8 py-4 rounded-2xl shadow-xl shadow-purple-500/20 transition-all group-hover:scale-105">
                    {t("buttons.applyToTeach")}{" "}
                    <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              </Link>

              <Link to="/register/institution" className="group">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="h-full p-10 rounded-[3rem] bg-linear-to-br from-card to-background border border-border/40 transition-all duration-700 hover:shadow-3xl text-start relative overflow-hidden"
                >
                  <div className="absolute top-[-5%] end-[-5%] opacity-[0.03] group-hover:scale-110 transition-transform duration-1000 pointer-events-none group-hover:opacity-[0.06]">
                    <Zap className="h-72 w-72 text-amber-500" />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight mb-4 leading-none uppercase">
                    {t("landing.roles.institution.title")}
                    <br />
                    <span className="text-amber-500/40 text-xl font-bold">
                      {t("landing.roles.institution.portal")}
                    </span>
                  </h2>
                  <ul className="space-y-3 mb-10 relative z-10">
                    {[
                      t("landing.roles.institution.f1"),
                      t("landing.roles.institution.f2"),
                      t("landing.roles.institution.f3"),
                    ].map((f, i) => (
                      <li
                        key={i}
                        className="text-sm font-medium text-muted-foreground/80 flex items-center gap-3"
                      >
                        <div className="h-1 w-1 rounded-full bg-amber-500" /> {f}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-3 font-bold uppercase tracking-widest text-[10px] bg-linear-to-r from-amber-500 to-orange-500 text-white w-fit px-8 py-4 rounded-2xl shadow-xl shadow-amber-500/20 transition-all group-hover:scale-105">
                    {t("landing.cta.launch")}{" "}
                    <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              </Link>
            </div>
          </div>
        </section>

        {/* Final Statement - EXPLOSIVE JOY (Education Architected) */}
        <section className="section-wrapper text-center py-32 md:py-48 relative overflow-hidden">
          {/* 🌈 VIBRANT FINALE BACKGROUND */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_70%)] opacity-[0.08] animate-pulse" />
            <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-transparent via-primary/5 to-transparent" />
          </div>

          <div className="container-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-10 md:space-y-16 max-w-6xl mx-auto"
            >
              <div className="space-y-6">
                <h2 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight leading-[0.85] uppercase italic">
                  <span className="bg-clip-text text-transparent bg-linear-to-br from-foreground via-foreground to-primary/40">
                    {t("landing.cta.evolved1")}
                  </span>
                  <br />
                  <span className="bg-clip-text text-transparent bg-linear-to-r from-primary via-purple-500 to-ai-primary animate-gradient block mt-2">
                    {t("landing.cta.evolved2")}
                  </span>
                </h2>
                <p className="text-lg md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                  Join the educational revolution. Tablawy OS is your gateway to a joyful, agentic
                  learning journey where every student thrives.
                </p>
              </div>

              <div className="pt-8 flex flex-col items-center gap-10">
                <Button
                  size="lg"
                  className="h-20 sm:h-28 px-12 sm:px-24 rounded-[2.5rem] text-xl sm:text-2xl font-black uppercase tracking-widest shadow-[0_30px_90px_-10px_hsla(var(--primary-hsl),0.6)] bg-linear-to-r from-primary via-purple-600 to-primary bg-[length:200%_auto] animate-gradient hover:scale-105 active:scale-95 transition-all duration-700 group w-full sm:w-auto relative overflow-hidden text-white"
                  asChild
                >
                  <Link to="/register/institution">
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <span className="relative z-10 flex items-center gap-4">
                      {t("landing.cta.launch")}
                      <Sparkles className="h-8 w-8 animate-pulse text-amber-300" />
                    </span>
                  </Link>
                </Button>

                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col items-center gap-4"
                >
                  <p className="text-muted-foreground font-bold uppercase tracking-[0.5em] text-[10px] opacity-60">
                    {t("landing.growth.badge")}
                  </p>
                  <div className="h-px w-24 bg-linear-to-r from-transparent via-primary/30 to-transparent" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;

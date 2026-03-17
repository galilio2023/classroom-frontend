import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Zap,
  Globe,
  ArrowRight,
  Play,
  ShieldCheck,
  PenTool,
  Award,
  Users,
  BrainCircuit,
  PieChart,
  QrCode,
  CheckCircle2,
  LayoutDashboard,
  GraduationCap,
  MessageSquare,
  Rocket,
  ChevronRight,
  Shield,
  Activity,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  const features = [
    {
      title: t("landing.features.whiteboard.title"),
      description: t("landing.features.whiteboard.desc"),
      icon: <PenTool className="h-6 w-6 md:h-8 md:w-8" />,
      color: "bg-blue-500",
    },
    {
      title: t("landing.features.aiLab.title"),
      description: t("landing.features.aiLab.desc"),
      icon: <BrainCircuit className="h-6 w-6 md:h-8 md:w-8" />,
      color: "bg-purple-500",
    },
    {
      title: t("landing.features.gamification.title"),
      description: t("landing.features.gamification.desc"),
      icon: <Award className="h-6 w-6 md:h-8 md:w-8" />,
      color: "bg-yellow-500",
    },
    {
      title: t("landing.features.qr.title"),
      description: t("landing.features.qr.desc"),
      icon: <QrCode className="h-6 w-6 md:h-8 md:w-8" />,
      color: "bg-green-500",
    },
    {
      title: t("landing.features.smartClassroom.title"),
      description: t("landing.features.smartClassroom.desc"),
      icon: <LayoutDashboard className="h-6 w-6 md:h-8 md:w-8" />,
      color: "bg-pink-500",
    },
    {
      title: t("landing.features.community.title"),
      description: t("landing.features.community.desc"),
      icon: <MessageSquare className="h-6 w-6 md:h-8 md:w-8" />,
      color: "bg-indigo-500",
    },
  ];

  return (
    <div className="relative overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* Background Decorative Elements - Mobile Optimized */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] start-[-10%] w-[60%] md:w-[40%] h-[40%] bg-primary/5 blur-[80px] md:blur-[120px] rounded-full opacity-50" />
        <div className="absolute bottom-[-10%] end-[-10%] w-[60%] md:w-[40%] h-[40%] bg-purple-500/5 blur-[80px] md:blur-[120px] rounded-full opacity-50" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]" />
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-32 md:pt-44 pb-20 md:pb-32 flex flex-col items-center text-center space-y-8 md:space-y-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-5 md:px-6 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] md:text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/5"
        >
          <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4" />
          {t("landing.hero.badge")}
        </motion.div>

        <div className="space-y-6 max-w-5xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={cn(
              "text-4xl xs:text-5xl md:text-8xl lg:text-9xl font-black leading-[0.9] md:leading-[0.85] uppercase text-balance",
              !isAr && "tracking-tighter",
            )}
          >
            {t("landing.hero.titlePart1")}{" "}
            <span className="text-primary italic">
              {t("landing.hero.titlePart2")}
            </span>{" "}
            <br />
            {t("landing.hero.titlePart3")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-xl lg:text-2xl text-muted-foreground font-medium max-w-3xl mx-auto leading-relaxed px-4 md:px-0"
          >
            {t("landing.hero.description")}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 pt-4 w-full sm:w-auto"
        >
          <Button
            size="lg"
            className="h-16 md:h-20 w-full sm:w-auto px-10 md:px-12 rounded-2xl md:rounded-[2rem] text-lg md:text-xl font-black uppercase tracking-widest shadow-2xl shadow-primary/30 group bg-primary hover:scale-105 transition-all active:scale-95"
            asChild
          >
            <Link to="/register">
              {t("buttons.getStarted")}
              <Rocket className="ms-3 h-5 w-5 md:h-6 md:w-6 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-16 md:h-20 w-full sm:w-auto px-10 md:px-12 rounded-2xl md:rounded-[2rem] text-lg md:text-xl font-black uppercase tracking-widest border-2 border-primary/10 bg-card/50 backdrop-blur-md hover:bg-primary/5 transition-all shadow-sm"
            asChild
          >
            <Link to="/login">{t("buttons.signIn")}</Link>
          </Button>
        </motion.div>

        {/* Floating Stats - Mobile Responsive */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pt-16 md:pt-24 flex flex-wrap justify-center gap-6 md:gap-24 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700"
        >
          {[
            { icon: ShieldCheck, label: t("landing.stats.secure") },
            { icon: Globe, label: t("landing.stats.global") },
            { icon: Zap, label: t("landing.stats.fast") },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              <span className="font-black text-[10px] md:text-xs uppercase tracking-[0.2em]">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* App Showcase Preview - Highly Responsive */}
      <section className="container mx-auto px-4 py-16 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="relative max-w-6xl mx-auto group"
        >
          <div className="absolute -inset-4 bg-linear-to-tr from-primary/20 via-purple-500/20 to-blue-500/20 blur-[60px] md:blur-3xl rounded-[3rem] md:rounded-[4rem] opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="relative bg-card border-2 md:border-4 border-primary/10 rounded-[2.5rem] md:rounded-[3.5rem] p-3 md:p-4 shadow-2xl overflow-hidden bg-grid-black dark:bg-grid-white">
            <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] pointer-events-none" />
            <div className="relative z-10">
              {/* Browser Header */}
              <div className="absolute top-0 left-0 right-0 h-10 md:h-12 bg-muted/50 border-b border-primary/5 flex items-center px-4 md:px-8 gap-2">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/40" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/40" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500/40" />
                </div>
                <div className="mx-auto bg-background/50 px-3 md:px-4 py-0.5 md:py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 border border-primary/5 truncate max-w-[150px] md:max-w-none">
                  app.classroom.ai/dashboard
                </div>
              </div>
              <div className="pt-14 md:pt-16 pb-6 px-4 md:px-12 grid grid-cols-12 gap-6 md:gap-8">
                {/* Sidebar Placeholder */}
                <div className="hidden md:block col-span-3 space-y-6 border-e border-primary/5 pe-8">
                  <div className="h-10 w-full bg-primary/10 rounded-xl animate-pulse" />
                  <div className="space-y-3">
                    <div className="h-8 w-full bg-muted/40 rounded-lg" />
                    <div className="h-8 w-3/4 bg-muted/20 rounded-lg" />
                    <div className="h-8 w-full bg-muted/20 rounded-lg" />
                  </div>
                </div>
                {/* Main Content Placeholder */}
                <div className="col-span-12 md:col-span-9 space-y-6 md:space-y-8">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2 text-start">
                      <div className="h-6 md:h-8 w-32 md:w-48 bg-primary/10 rounded-lg" />
                      <div className="h-3 md:h-4 w-24 md:w-32 bg-muted/30 rounded-md" />
                    </div>
                    <div className="h-10 w-10 md:h-12 md:w-12 bg-primary rounded-xl md:rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center text-primary-foreground">
                      <Zap className="h-5 w-5 md:h-6 md:w-6 fill-current" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 md:gap-6">
                    <div className="h-24 md:h-32 bg-muted/20 rounded-2xl md:rounded-3xl border border-primary/5 shadow-sm" />
                    <div className="h-24 md:h-32 bg-muted/20 rounded-2xl md:rounded-3xl border border-primary/5 shadow-sm" />
                    <div className="h-24 md:h-32 bg-primary/5 rounded-2xl md:rounded-3xl border border-primary/20 shadow-sm" />
                  </div>
                  <div className="h-48 md:h-64 bg-muted/10 rounded-[2rem] md:rounded-[2.5rem] border border-primary/5 relative overflow-hidden group/chart shadow-inner">
                    <div className="absolute inset-x-6 md:inset-x-8 bottom-8 md:bottom-12 h-24 md:h-32 flex items-end gap-1.5 md:gap-2">
                      {[40, 70, 45, 90, 65, 80, 50, 85].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          whileInView={{ height: `${h}%` }}
                          transition={{ delay: i * 0.05, duration: 1 }}
                          className="flex-1 bg-primary/20 rounded-t-md group-hover/chart:bg-primary/40 transition-colors"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating UI Elements - Tablet & Up */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -top-10 -right-6 hidden md:flex bg-background/80 backdrop-blur-xl border-2 border-primary/20 p-5 rounded-[2rem] shadow-2xl items-center gap-4 z-20"
          >
            <div className="h-10 w-10 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center">
              <QrCode className="h-5 w-5" />
            </div>
            <div className="text-start">
              <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-wider">
                {t("landing.showcase.attendance")}
              </p>
              <p className="text-sm font-black">
                {t("landing.showcase.verified")}
              </p>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            className="absolute -bottom-6 -left-6 hidden md:flex bg-background/80 backdrop-blur-xl border-2 border-primary/20 p-5 rounded-[2rem] shadow-2xl items-center gap-4 z-20"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="text-start">
              <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-wider">
                {t("landing.showcase.ai")}
              </p>
              <p className="text-sm font-black">{t("landing.showcase.draft")}</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section
        id="features"
        className="container mx-auto px-4 py-20 md:py-32 text-start"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 md:gap-12 mb-16 md:mb-24">
          <div className="space-y-4 md:space-y-6 max-w-3xl">
            <h2
              className={cn(
                "text-4xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.95] md:leading-[0.9]",
                !isAr && "tracking-tighter",
              )}
            >
              {t("landing.features.sectionTitle")}{" "}
              <span className="text-primary italic">
                {t("landing.features.sectionTitleItalic")}
              </span>
            </h2>
            <p className="text-muted-foreground font-medium text-lg md:text-xl leading-relaxed text-balance">
              {t("landing.features.sectionDesc")}
            </p>
          </div>
          <Button
            variant="ghost"
            className="font-black uppercase tracking-widest text-[10px] md:text-xs gap-3 h-14 md:h-16 px-8 md:px-10 rounded-2xl hover:bg-primary/5 group border border-primary/10 transition-all w-fit"
          >
            {t("landing.features.exploreAll")}
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
          </Button>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              whileHover={{ y: -8, scale: 1.01 }}
              className="p-8 md:p-12 bg-card/40 hover:bg-card border-2 border-transparent hover:border-primary/20 rounded-[2.5rem] md:rounded-[3.5rem] shadow-xl transition-all group relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
              <div
                className={cn(
                  "h-16 w-16 md:h-20 md:w-20 rounded-2xl md:rounded-3xl flex items-center justify-center text-white mb-8 md:mb-10 shadow-xl group-hover:scale-110 transition-transform duration-500",
                  feature.color,
                )}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl md:text-2xl font-black mb-3 md:mb-4 uppercase tracking-tight">
                {feature.title}
              </h3>
              <p className="text-sm md:text-lg text-muted-foreground/80 font-medium leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* AI Hub Section - Reimagined */}
      <section id="ai" className="relative py-24 md:py-44 overflow-hidden px-4">
        <div className="absolute inset-0 bg-primary/5 -skew-y-3 origin-right scale-110" />
        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: isAr ? 60 : -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8 md:space-y-10 text-start"
            >
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-xl bg-primary/10 text-primary text-[10px] md:text-xs font-black uppercase tracking-widest border border-primary/10">
                <BrainCircuit className="h-4 w-4" />
                Gemini 2.0 FLASH Powered
              </div>
              <h2 className="text-4xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.95] md:leading-[0.85]">
                {t("landing.ai.title1")} <br />
                <span className="text-primary italic">
                  {t("landing.ai.title2")}
                </span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-xl text-balance">
                {t("landing.ai.desc")}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {[
                  t("landing.ai.list.assistant"),
                  t("landing.ai.list.quiz"),
                  t("landing.ai.list.summary"),
                  t("landing.ai.list.paths"),
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3.5 group">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-sm">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <span className="font-black text-xs md:text-sm uppercase tracking-wider text-muted-foreground/70 group-hover:text-foreground transition-colors">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                className="rounded-2xl h-14 md:h-16 px-8 md:px-10 font-black uppercase tracking-widest text-[10px] md:text-xs shadow-xl shadow-primary/20 hover:scale-105 transition-all w-full sm:w-auto"
                asChild
              >
                <Link to="/ai-study-lab">
                  {t("landing.ai.exploreButton")}
                  <Sparkles className="ms-3 h-4 w-4 md:h-5 md:w-5" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-linear-to-r from-primary/20 to-purple-500/20 blur-[80px] md:blur-[120px] rounded-full animate-pulse" />

              <div className="relative bg-card border-2 md:border-4 border-primary/10 rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-10 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between mb-8 md:mb-10 border-b border-border/40 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                      <BrainCircuit className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <div className="text-start">
                      <p className="text-xs md:text-sm font-black uppercase tracking-widest">
                        {t("landing.ai.chat.header")}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">
                          Active Now
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 md:space-y-6 text-start">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="bg-muted/40 p-5 md:p-6 rounded-[1.5rem] md:rounded-3xl rounded-ss-none max-w-[90%] border border-border/40 shadow-sm"
                  >
                    <p className="text-sm md:text-base font-bold leading-relaxed italic opacity-80">
                      {t("landing.ai.chat.msg1")}
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-primary p-5 md:p-6 rounded-[1.5rem] md:rounded-3xl rounded-ee-none max-w-[90%] ms-auto text-primary-foreground shadow-xl shadow-primary/20"
                  >
                    <p className="text-sm md:text-base font-bold leading-relaxed">
                      {t("landing.ai.chat.msg2")}
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 }}
                    className="bg-muted/40 p-5 md:p-6 rounded-[1.5rem] md:rounded-3xl rounded-ss-none max-w-[95%] border border-border/40 shadow-sm"
                  >
                    <p className="text-sm md:text-base font-bold leading-relaxed italic opacity-80">
                      {t("landing.ai.chat.msg3")}
                    </p>
                    <div className="mt-6 space-y-3">
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-primary">
                        <span>Analysis Processing</span>
                        <span>84%</span>
                      </div>
                      <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "84%" }}
                          transition={{ duration: 2, delay: 1.5 }}
                          className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Role Switcher Section */}
      <section className="container mx-auto px-4 py-24 md:py-40">
        <div className="text-center space-y-4 md:space-y-6 mb-16 md:mb-24">
          <h2 className="text-4xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter italic">
            Tailored for{" "}
            <span className="text-primary not-italic underline decoration-primary/20 underline-offset-8 md:underline-offset-[16px]">
              Everyone
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto text-balance">
            Whether you are leading a global class or mastering a specific subject, we provide the tools to excel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Student Role Card */}
          <motion.div
            whileHover={{ y: -10 }}
            className="bg-card border border-border/40 p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] shadow-xl hover:shadow-primary/5 transition-all relative overflow-hidden group text-start"
          >
            <div className="absolute top-0 right-0 p-8 md:p-12 pointer-events-none">
              <GraduationCap className="h-20 w-20 md:h-32 md:w-32 text-primary/5 group-hover:text-primary/10 transition-colors rotate-12" />
            </div>
            <div className="space-y-8 relative z-10">
              <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm border border-primary/5">
                <Users className="h-7 w-7 md:h-8 md:w-8" />
              </div>
              <h3 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">
                {t("roles.student")}
              </h3>
              <ul className="space-y-4">
                {[
                  t("landing.roles.student.f1"),
                  t("landing.roles.student.f2"),
                  t("landing.roles.student.f3"),
                  t("landing.roles.student.f4"),
                ].map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-4 text-base md:text-lg font-bold text-muted-foreground/80 group-hover:text-foreground transition-colors"
                  >
                    <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                size="lg"
                className="h-12 md:h-14 w-full sm:w-auto rounded-2xl px-8 md:px-10 border-2 font-black uppercase tracking-widest group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all shadow-sm"
              >
                Join as Student
              </Button>
            </div>
          </motion.div>

          {/* Teacher Role Card */}
          <motion.div
            whileHover={{ y: -10 }}
            className="bg-primary text-primary-foreground p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl shadow-primary/20 transition-all relative overflow-hidden group text-start"
          >
            <div className="absolute top-0 right-0 p-8 md:p-12 pointer-events-none">
              <Shield className="h-20 w-20 md:h-32 md:w-32 text-white/5 group-hover:text-white/10 transition-colors -rotate-12" />
            </div>
            <div className="space-y-8 relative z-10">
              <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-white/10 text-white flex items-center justify-center shadow-sm border border-white/10">
                <Activity className="h-7 w-7 md:h-8 md:w-8" />
              </div>
              <h3 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">
                {t("roles.teacher")}
              </h3>
              <ul className="space-y-4">
                {[
                  t("landing.roles.teacher.f1"),
                  t("landing.roles.teacher.f2"),
                  t("landing.roles.teacher.f3"),
                  t("landing.roles.teacher.f4"),
                ].map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-4 text-base md:text-lg font-bold text-primary-foreground/80 group-hover:text-primary-foreground transition-colors"
                  >
                    <div className="h-2 w-2 rounded-full bg-white shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant="secondary"
                size="lg"
                className="h-12 md:h-14 w-full sm:w-auto rounded-2xl px-8 md:px-10 font-black uppercase tracking-widest bg-white text-primary hover:bg-white/90 transition-all shadow-xl shadow-black/10"
              >
                Apply to Teach
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container mx-auto px-4 py-24 md:py-40">
        <div className="bg-primary rounded-[3rem] md:rounded-[5rem] p-10 md:p-32 text-primary-foreground text-center space-y-10 md:space-y-12 relative overflow-hidden shadow-[0_40px_80px_-15px_rgba(var(--primary),0.4)] group">
          {/* Background elements */}
          <div className="absolute top-0 start-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
          <div className="absolute -top-24 -start-24 rtl:-end-24 rtl:-start-auto w-96 h-96 bg-white/10 rounded-full blur-[120px] pointer-events-none group-hover:bg-white/20 transition-all duration-1000" />
          <div className="absolute -bottom-24 -end-24 rtl:-start-24 rtl:-end-auto w-96 h-96 bg-white/10 rounded-full blur-[120px] pointer-events-none group-hover:bg-white/20 transition-all duration-1000" />

          <div className="relative space-y-6 md:space-y-8 max-w-4xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="text-4xl md:text-7xl lg:text-9xl font-black uppercase leading-[0.95] md:leading-[0.85] italic tracking-tighter"
            >
              {t("landing.cta.title")}
            </motion.h2>
            <p className="text-primary-foreground/80 font-medium text-lg md:text-2xl max-w-2xl mx-auto leading-relaxed text-balance">
              {t("landing.cta.desc")}
            </p>
          </div>

          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-8 pt-6 md:pt-8">
            <Button
              size="lg"
              variant="secondary"
              className="h-16 md:h-20 w-full sm:w-auto px-10 md:px-14 rounded-2xl md:rounded-[2rem] text-lg md:text-xl font-black uppercase tracking-widest group shadow-2xl shadow-black/20 bg-white text-primary hover:scale-105 transition-all"
              asChild
            >
              <Link to="/register" className="flex items-center">
                {t("landing.cta.launch")}
                <Zap className="ms-3 h-5 w-5 md:h-6 md:w-6 fill-current animate-pulse" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-16 md:h-20 w-full sm:w-auto px-10 md:px-14 rounded-2xl md:rounded-[2rem] text-lg md:text-xl font-black uppercase tracking-widest border-2 md:border-4 border-white/20 bg-transparent text-white hover:bg-white/10 hover:border-white transition-all shadow-sm"
            >
              <Play className="me-3 h-5 w-5 md:h-6 md:w-6 rtl:-scale-x-100 fill-current" />
              {t("landing.cta.watchDemo")}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

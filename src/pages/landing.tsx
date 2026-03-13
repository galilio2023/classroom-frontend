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
      icon: <PenTool className="h-6 w-6" />,
      color: "bg-blue-500",
    },
    {
      title: t("landing.features.aiLab.title"),
      description: t("landing.features.aiLab.desc"),
      icon: <BrainCircuit className="h-6 w-6" />,
      color: "bg-purple-500",
    },
    {
      title: t("landing.features.gamification.title"),
      description: t("landing.features.gamification.desc"),
      icon: <Award className="h-6 w-6" />,
      color: "bg-yellow-500",
    },
    {
      title: t("landing.features.qr.title"),
      description: t("landing.features.qr.desc"),
      icon: <QrCode className="h-6 w-6" />,
      color: "bg-green-500",
    },
    {
      title: t("landing.features.smartClassroom.title"),
      description: t("landing.features.smartClassroom.desc"),
      icon: <LayoutDashboard className="h-6 w-6" />,
      color: "bg-pink-500",
    },
    {
      title: t("landing.features.community.title"),
      description: t("landing.features.community.desc"),
      icon: <MessageSquare className="h-6 w-6" />,
      color: "bg-indigo-500",
    },
  ];

  return (
    <div className="relative overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] start-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] end-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-44 pb-32 flex flex-col items-center text-center space-y-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/5"
        >
          <Sparkles className="h-4 w-4" />
          {t("landing.hero.badge")}
        </motion.div>

        <div className="space-y-6 max-w-5xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={cn(
              "text-6xl md:text-9xl font-black leading-[0.85] uppercase",
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
            className="text-lg md:text-2xl text-muted-foreground font-medium max-w-3xl mx-auto leading-relaxed"
          >
            {t("landing.hero.description")}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-6 pt-4"
        >
          <Button
            size="lg"
            className="h-20 px-12 rounded-[2rem] text-xl font-black uppercase tracking-widest shadow-2xl shadow-primary/30 group bg-primary hover:scale-105 transition-all active:scale-95"
            asChild
          >
            <Link to="/register">
              {t("buttons.getStarted")}
              <Rocket className="ms-3 h-6 w-6 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-20 px-12 rounded-[2rem] text-xl font-black uppercase tracking-widest border-2 border-primary/10 bg-card/50 backdrop-blur-md hover:bg-primary/5 transition-all"
            asChild
          >
            <Link to="/login">{t("buttons.signIn")}</Link>
          </Button>
        </motion.div>

        {/* Floating Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pt-20 flex flex-wrap justify-center gap-8 md:gap-24 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700"
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="font-black text-xs uppercase tracking-[0.2em]">
              {t("landing.stats.secure")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Globe className="h-6 w-6 text-primary" />
            <span className="font-black text-xs uppercase tracking-[0.2em]">
              {t("landing.stats.global")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-black text-xs uppercase tracking-[0.2em]">
              {t("landing.stats.fast")}
            </span>
          </div>
        </motion.div>
      </section>

      {/* App Showcase Preview */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", bounce: 0.2, duration: 1 }}
            className="relative max-w-6xl mx-auto"
        >
            <div className="absolute -inset-4 bg-linear-to-tr from-primary/20 via-purple-500/20 to-blue-500/20 blur-3xl rounded-[4rem] opacity-50" />
            <div className="relative bg-card border-4 border-primary/10 rounded-[3.5rem] p-4 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-12 bg-muted/50 border-b border-primary/5 flex items-center px-8 gap-2">
                    <div className="flex gap-1.5">
                        <div className="h-3 w-3 rounded-full bg-red-500/20" />
                        <div className="h-3 w-3 rounded-full bg-yellow-500/20" />
                        <div className="h-3 w-3 rounded-full bg-green-500/20" />
                    </div>
                    <div className="mx-auto bg-background/50 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground border border-primary/5">
                        app.classroom.ai/dashboard
                    </div>
                </div>
                <div className="pt-16 pb-8 px-4 md:px-12 grid grid-cols-12 gap-8">
                    {/* Sidebar Placeholder */}
                    <div className="hidden md:block col-span-3 space-y-6 border-e border-primary/5 pe-8">
                        <div className="h-10 w-full bg-primary/10 rounded-xl" />
                        <div className="space-y-3">
                            <div className="h-8 w-full bg-muted/50 rounded-lg" />
                            <div className="h-8 w-3/4 bg-muted/30 rounded-lg" />
                            <div className="h-8 w-full bg-muted/30 rounded-lg" />
                        </div>
                    </div>
                    {/* Main Content Placeholder */}
                    <div className="col-span-12 md:col-span-9 space-y-8">
                        <div className="flex justify-between items-center">
                            <div className="space-y-2">
                                <div className="h-8 w-48 bg-primary/10 rounded-lg" />
                                <div className="h-4 w-32 bg-muted/30 rounded-md" />
                            </div>
                            <div className="h-12 w-12 bg-primary rounded-2xl shadow-lg shadow-primary/20" />
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                            <div className="h-32 bg-muted/20 rounded-3xl border border-primary/5" />
                            <div className="h-32 bg-muted/20 rounded-3xl border border-primary/5" />
                            <div className="h-32 bg-primary/5 rounded-3xl border border-primary/20" />
                        </div>
                        <div className="h-64 bg-muted/10 rounded-[2.5rem] border border-primary/5 relative overflow-hidden">
                            <div className="absolute top-6 left-6 h-6 w-32 bg-muted/30 rounded-md" />
                            <div className="absolute bottom-6 right-6 h-10 w-10 bg-primary/20 rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating UI Elements */}
            <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-12 -right-12 hidden lg:flex bg-background border-2 border-primary/20 p-6 rounded-[2rem] shadow-2xl items-center gap-4 z-20"
            >
                <div className="h-12 w-12 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center">
                    <QrCode className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground">{t("landing.showcase.attendance")}</p>
                    <p className="text-sm font-bold">{t("landing.showcase.verified")}</p>
                </div>
            </motion.div>

            <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-8 -left-12 hidden lg:flex bg-background border-2 border-primary/20 p-6 rounded-[2rem] shadow-2xl items-center gap-4 z-20"
            >
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Sparkles className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground">{t("landing.showcase.ai")}</p>
                    <p className="text-sm font-bold">{t("landing.showcase.draft")}</p>
                </div>
            </motion.div>
        </motion.div>
      </section>

      {/* Trust Section */}
      <section className="container mx-auto px-4 py-32 border-y border-primary/5">
        <div className="flex flex-col items-center gap-12 text-center">
          <p className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground/60">
            {t("landing.trust.title")}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-16 md:gap-32 opacity-40 hover:opacity-100 transition-all duration-500">
            <div className="flex items-center gap-3 text-3xl font-black italic tracking-tighter grayscale hover:grayscale-0 hover:text-primary transition-all cursor-default">
              <Zap className="h-8 w-8 text-primary fill-primary" /> ACADEMY
            </div>
            <div className="flex items-center gap-3 text-3xl font-black tracking-tighter grayscale hover:grayscale-0 hover:text-primary transition-all cursor-default">
              <BrainCircuit className="h-8 w-8 text-primary" /> EDU-TECH
            </div>
            <div className="flex items-center gap-3 text-3xl font-black italic tracking-tighter grayscale hover:grayscale-0 hover:text-primary transition-all cursor-default">
              <Globe className="h-8 w-8 text-primary" /> GLOBAL-U
            </div>
            <div className="flex items-center gap-3 text-3xl font-black tracking-tighter grayscale hover:grayscale-0 hover:text-primary transition-all cursor-default">
              <Award className="h-8 w-8 text-primary" /> PRESTIGE
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-4 py-32 text-start">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-24">
          <div className="space-y-6 max-w-3xl">
            <h2 className={cn("text-5xl md:text-7xl font-black uppercase leading-[0.9]", !isAr && "tracking-tighter")}>
              {t("landing.features.sectionTitle")}{" "}
              <span className="text-primary italic">
                {t("landing.features.sectionTitleItalic")}
              </span>
            </h2>
            <p className="text-muted-foreground font-medium text-xl leading-relaxed">
              {t("landing.features.sectionDesc")}
            </p>
          </div>
          <Button
            variant="ghost"
            className="font-black uppercase tracking-widest text-xs gap-3 h-16 px-10 rounded-2xl hover:bg-primary/5 group border border-primary/5 transition-all"
          >
            {t("landing.features.exploreAll")}
            <ChevronRight className="h-5 w-5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
          </Button>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              className="p-12 bg-card/40 hover:bg-card border-2 border-transparent hover:border-primary/20 rounded-[3.5rem] shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
              <div
                className={cn(
                  "h-20 w-20 rounded-3xl flex items-center justify-center text-white mb-10 shadow-xl group-hover:scale-110 transition-transform duration-500",
                  feature.color,
                )}
              >
                {feature.icon}
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">
                {feature.title}
              </h3>
              <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* AI Hub Section - Reimagined */}
      <section id="ai" className="relative py-40 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -skew-y-3 origin-right scale-110" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: isAr ? 100 : -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-10"
            >
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-primary/10 text-primary text-xs font-black uppercase tracking-widest">
                <BrainCircuit className="h-5 w-5" />
                Gemini 2.0 FLASH Powered
              </div>
              <h2 className="text-5xl md:text-8xl font-black uppercase leading-[0.85]">
                {t("landing.ai.title1")} <br />
                <span className="text-primary italic">
                  {t("landing.ai.title2")}
                </span>
              </h2>
              <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-xl">
                {t("landing.ai.desc")}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                    t("landing.ai.list.assistant"),
                    t("landing.ai.list.quiz"),
                    t("landing.ai.list.summary"),
                    t("landing.ai.list.paths")
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <span className="font-black text-sm uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                className="rounded-2xl h-16 px-10 font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                asChild
              >
                <Link to="/ai-study-lab">
                    {t("landing.ai.exploreButton")}
                    <Sparkles className="ms-3 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Decorative AI Glow */}
              <div className="absolute inset-0 bg-linear-to-r from-primary/30 to-purple-500/30 blur-[120px] rounded-full animate-pulse" />
              
              <div className="relative bg-card border-4 border-primary/20 rounded-[4rem] p-10 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between mb-10 border-b border-primary/5 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                        <BrainCircuit className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-black uppercase tracking-widest">{t("landing.ai.chat.header")}</p>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Now</span>
                        </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6 text-start">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="bg-muted/50 p-6 rounded-3xl rounded-ss-none max-w-[85%] border border-primary/5"
                  >
                    <p className="text-base font-bold leading-relaxed italic">
                      {t("landing.ai.chat.msg1")}
                    </p>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-primary p-6 rounded-3xl rounded-ee-none max-w-[85%] ms-auto text-primary-foreground shadow-xl shadow-primary/20"
                  >
                    <p className="text-base font-bold leading-relaxed">
                      {t("landing.ai.chat.msg2")}
                    </p>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 }}
                    className="bg-muted/50 p-6 rounded-3xl rounded-ss-none max-w-[90%] border border-primary/5"
                  >
                    <p className="text-base font-bold leading-relaxed italic">
                      {t("landing.ai.chat.msg3")}
                    </p>
                    <div className="mt-6 space-y-3">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                            <span>Processing Summary</span>
                            <span>84%</span>
                        </div>
                        <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
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
      <section className="container mx-auto px-4 py-40">
        <div className="text-center space-y-6 mb-24">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic">
                Tailored for <span className="text-primary not-italic underline decoration-primary/20">Everyone</span>
            </h2>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                Whether you are leading a class or mastering a subject, we provide the tools to excel.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Student Role Card */}
            <motion.div 
                whileHover={{ y: -10 }}
                className="bg-card border-2 border-primary/5 p-12 rounded-[4rem] shadow-xl hover:shadow-primary/5 transition-all relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-8">
                    <GraduationCap className="h-20 w-20 text-primary/5 group-hover:text-primary/10 transition-colors rotate-12" />
                </div>
                <div className="space-y-8 relative z-10">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <Users className="h-8 w-8" />
                    </div>
                    <h3 className="text-4xl font-black uppercase italic tracking-tighter">{t("roles.student")}</h3>
                    <ul className="space-y-4">
                        {[
                            t("landing.roles.student.f1"),
                            t("landing.roles.student.f2"),
                            t("landing.roles.student.f3"),
                            t("landing.roles.student.f4")
                        ].map((f, i) => (
                            <li key={i} className="flex items-center gap-4 text-lg font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                                <div className="h-2 w-2 rounded-full bg-primary" />
                                {f}
                            </li>
                        ))}
                    </ul>
                    <Button variant="outline" className="h-14 rounded-2xl px-8 border-2 font-black uppercase tracking-widest group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                        Join as Student
                    </Button>
                </div>
            </motion.div>

            {/* Teacher Role Card */}
            <motion.div 
                whileHover={{ y: -10 }}
                className="bg-primary text-primary-foreground p-12 rounded-[4rem] shadow-2xl shadow-primary/20 transition-all relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-8">
                    <Shield className="h-20 w-20 text-white/5 group-hover:text-white/10 transition-colors -rotate-12" />
                </div>
                <div className="space-y-8 relative z-10">
                    <div className="h-16 w-16 rounded-2xl bg-white/10 text-white flex items-center justify-center">
                        <Activity className="h-8 w-8" />
                    </div>
                    <h3 className="text-4xl font-black uppercase italic tracking-tighter">{t("roles.teacher")}</h3>
                    <ul className="space-y-4">
                        {[
                            t("landing.roles.teacher.f1"),
                            t("landing.roles.teacher.f2"),
                            t("landing.roles.teacher.f3"),
                            t("landing.roles.teacher.f4")
                        ].map((f, i) => (
                            <li key={i} className="flex items-center gap-4 text-lg font-bold text-primary-foreground/80 group-hover:text-primary-foreground transition-colors">
                                <div className="h-2 w-2 rounded-full bg-white" />
                                {f}
                            </li>
                        ))}
                    </ul>
                    <Button variant="secondary" className="h-14 rounded-2xl px-8 font-black uppercase tracking-widest bg-white text-primary hover:bg-white/90 transition-all">
                        Apply to Teach
                    </Button>
                </div>
            </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container mx-auto px-4 py-40">
        <div className="bg-primary rounded-[4rem] p-16 md:p-32 text-primary-foreground text-center space-y-12 relative overflow-hidden shadow-2xl shadow-primary/40 group">
          {/* Background elements */}
          <div className="absolute top-0 start-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
          <div className="absolute -top-24 -start-24 rtl:-end-24 rtl:-start-auto w-96 h-96 bg-white/10 rounded-full blur-[120px] pointer-events-none group-hover:bg-white/20 transition-all duration-1000" />
          <div className="absolute -bottom-24 -end-24 rtl:-start-24 rtl:-end-auto w-96 h-96 bg-white/10 rounded-full blur-[120px] pointer-events-none group-hover:bg-white/20 transition-all duration-1000" />

          <div className="relative space-y-8 max-w-4xl mx-auto">
            <motion.h2 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="text-5xl md:text-8xl font-black uppercase leading-[0.85] italic"
            >
              {t("landing.cta.title")}
            </motion.h2>
            <p className="text-primary-foreground/80 font-medium text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed">
              {t("landing.cta.desc")}
            </p>
          </div>

          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-8 pt-8">
            <Button
              size="lg"
              variant="secondary"
              className="h-20 px-14 rounded-[2rem] text-xl font-black uppercase tracking-widest group shadow-2xl shadow-black/20 bg-white text-primary hover:scale-105 transition-all"
              asChild
            >
              <Link to="/register" className="flex items-center">
                {t("landing.cta.launch")}
                <Zap className="ms-3 h-6 w-6 fill-current animate-pulse" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-20 px-14 rounded-[2rem] text-xl font-black uppercase tracking-widest border-4 border-white/20 bg-transparent text-white hover:bg-white/10 hover:border-white transition-all"
            >
              <Play className="me-3 h-6 w-6 rtl:-scale-x-100 fill-current" />
              {t("landing.cta.watchDemo")}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

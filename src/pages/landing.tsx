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
      title: t("landing.features.whiteboard.title", "Interactive Whiteboard"),
      description: t(
        "landing.features.whiteboard.desc",
        "Collaborate in real-time with our advanced digital canvas.",
      ),
      icon: <PenTool className="h-6 w-6" />,
      color: "bg-blue-500",
      delay: 0,
    },
    {
      title: t("landing.features.aiLab.title", "AI Learning Hub"),
      description: t(
        "landing.features.aiLab.desc",
        "Personalized learning paths powered by artificial intelligence.",
      ),
      icon: <BrainCircuit className="h-6 w-6" />,
      color: "bg-purple-500",
      delay: 0.1,
    },
    {
      title: t("landing.features.gamification.title", "Gamified Progress"),
      description: t(
        "landing.features.gamification.desc",
        "Earn badges and compete on leaderboards to stay motivated.",
      ),
      icon: <Award className="h-6 w-6" />,
      color: "bg-yellow-500",
      delay: 0.2,
    },
    {
      title: t("landing.features.qr.title", "Smart Attendance"),
      description: t(
        "landing.features.qr.desc",
        "Quick and secure attendance tracking using dynamic QR codes.",
      ),
      icon: <QrCode className="h-6 w-6" />,
      color: "bg-green-500",
      delay: 0.3,
    },
    {
      title: t("landing.features.analytics.title", "Deep Analytics"),
      description: t(
        "landing.features.analytics.desc",
        "Comprehensive insights into student performance and engagement.",
      ),
      icon: <PieChart className="h-6 w-6" />,
      color: "bg-pink-500",
      delay: 0.4,
    },
    {
      title: t("landing.features.collaboration.title", "Team Workspaces"),
      description: t(
        "landing.features.collaboration.desc",
        "Dedicated spaces for group projects and peer-to-peer learning.",
      ),
      icon: <Users className="h-6 w-6" />,
      color: "bg-indigo-500",
      delay: 0.5,
    },
  ];

  const aiFeaturesList = [
    t("landing.ai.list.assistant", "AI Study Assistant available 24/7"),
    t("landing.ai.list.quiz", "Automated Quiz Generation"),
    t("landing.ai.list.summary", "Smart Content Summarization"),
    t("landing.ai.list.paths", "Personalized Learning Paths"),
  ];

  return (
    <div className="relative">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] start-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] end-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-32 flex flex-col items-center text-center space-y-12 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/5"
        >
          <Sparkles className="h-4 w-4" />
          {t("landing.hero.badge", "Welcome to the Future of Education")}
        </motion.div>

        <div className="space-y-6 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={cn(
              "text-6xl md:text-8xl font-black leading-[0.9] uppercase",
              !isAr && "tracking-tighter",
            )}
          >
            {t("landing.hero.titlePart1", "Upgrade Your")}{" "}
            <span className="text-primary italic">
              {t("landing.hero.titlePart2", "Learning")}
            </span>{" "}
            <br />
            {t("landing.hero.titlePart3", "Experience")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed"
          >
            {t(
              "landing.hero.description",
              "The next generation of education. AI-powered tools, collaborative environments, and enterprise-grade classroom management.",
            )}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Button
            size="lg"
            className="h-16 px-10 rounded-2xl text-lg font-black uppercase tracking-widest shadow-2xl shadow-primary/20 group"
            asChild
          >
            <Link to="/register">
              {t("buttons.getStarted", "Get Started")}
              <ArrowRight className="ms-2 h-5 w-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:-scale-x-100 transition-transform" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-16 px-10 rounded-2xl text-lg font-black uppercase tracking-widest border-2 border-primary/10 bg-card/50 backdrop-blur-md"
            asChild
          >
            <Link to="/login">{t("buttons.signIn", "Sign In")}</Link>
          </Button>
        </motion.div>

        {/* Floating Stats or Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pt-12 flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-700"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            <span className="font-bold text-xs uppercase tracking-widest">
              {t("landing.stats.secure", "100% SECURE")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            <span className="font-bold text-xs uppercase tracking-widest">
              {t("landing.stats.global", "GLOBAL REACH")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            <span className="font-bold text-xs uppercase tracking-widest">
              {t("landing.stats.fast", "LIGHTNING FAST")}
            </span>
          </div>
        </motion.div>
      </section>

      {/* Trust Section */}
      <section className="container mx-auto px-4 py-20 border-y border-primary/5">
        <div className="flex flex-col items-center gap-10">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/60">
            {t("landing.trust.title", "Empowering Modern Classrooms")}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2 text-2xl font-black italic tracking-tighter grayscale">
              <Zap className="h-6 w-6 text-primary fill-primary" /> ACADEMY
            </div>
            <div className="flex items-center gap-2 text-2xl font-black tracking-tighter grayscale">
              <BrainCircuit className="h-6 w-6 text-primary" /> EDU-TECH
            </div>
            <div className="flex items-center gap-2 text-2xl font-black italic tracking-tighter grayscale">
              <Globe className="h-6 w-6 text-primary" /> GLOBAL-U
            </div>
            <div className="flex items-center gap-2 text-2xl font-black tracking-tighter grayscale">
              <Award className="h-6 w-6 text-primary" /> PRESTIGE
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section
        id="features"
        className="container mx-auto px-4 py-32 text-start"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="space-y-4 max-w-2xl">
            <h2
              className={cn(
                "text-4xl md:text-5xl font-black uppercase leading-none",
                !isAr && "tracking-tighter",
              )}
            >
              {t("landing.features.sectionTitle", "Explore Our")}{" "}
              <span className="text-primary italic">
                {t("landing.features.sectionTitleItalic", "Features")}
              </span>
            </h2>
            <p className="text-muted-foreground font-medium text-lg leading-relaxed">
              {t(
                "landing.features.sectionDesc",
                "Everything you need to manage your classroom, engage your students, and track their progress.",
              )}
            </p>
          </div>
          <Button
            variant="ghost"
            className="font-black uppercase tracking-widest text-[10px] gap-2 h-12 px-6 rounded-xl hover:bg-primary/5 group"
          >
            {t("landing.features.exploreAll", "Explore All")}
            <ArrowRight className="h-4 w-4 rtl:-scale-x-100 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
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
              className="p-10 bg-card/40 hover:bg-card border-2 border-transparent hover:border-primary/20 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all group"
            >
              <div
                className={cn(
                  "h-16 w-16 rounded-[1.2rem] flex items-center justify-center text-white mb-8 shadow-lg",
                  feature.color,
                )}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-black mb-4 uppercase">
                {feature.title}
              </h3>
              <p className="text-muted-foreground font-medium leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* AI Section */}
      <section id="ai" className="bg-primary/5 py-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              // RTL FIX: Slide from right in Arabic, left in English
              initial={{ opacity: 0, x: isAr ? 50 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="text-4xl md:text-6xl font-black uppercase leading-none">
                {t("landing.ai.title1", "AI Powered")} <br />
                <span className="text-primary italic">
                  {t("landing.ai.title2", "Learning Hub")}
                </span>
              </h2>
              <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                {t(
                  "landing.ai.desc",
                  "Revolutionize your education with our integrated AI features. From automated grading to personalized study plans, we bring the future to your classroom.",
                )}
              </p>
              <div className="space-y-4">
                {aiFeaturesList.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="font-bold text-sm uppercase tracking-wider">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                size="lg"
                className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest"
              >
                {t("landing.ai.exploreButton", "Explore AI Lab")}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full animate-pulse" />
              <div className="relative bg-card border-2 border-primary/20 rounded-[3rem] p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8 border-b border-primary/5 pb-4">
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500/50" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
                    <div className="h-3 w-3 rounded-full bg-green-500/50" />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {t("landing.ai.chat.header", "AI Study Assistant")}
                  </div>
                </div>
                <div className="space-y-4 text-start">
                  <div className="bg-muted/50 p-4 rounded-2xl rounded-ss-none max-w-[80%]">
                    <p className="text-sm font-medium">
                      {t(
                        "landing.ai.chat.msg1",
                        "Hello! How can I help you with your lessons today?",
                      )}
                    </p>
                  </div>
                  <div className="bg-primary p-4 rounded-2xl rounded-ee-none max-w-[80%] ms-auto text-primary-foreground">
                    <p className="text-sm font-medium">
                      {t(
                        "landing.ai.chat.msg2",
                        "Can you summarize the main points of Chapter 4?",
                      )}
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-2xl rounded-ss-none max-w-[90%]">
                    <p className="text-sm font-medium">
                      {t(
                        "landing.ai.chat.msg3",
                        "Of course! Chapter 4 focuses on Advanced Thermodynamics. The key takeaways are...",
                      )}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[60%] rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-32">
        <div className="bg-primary rounded-[3rem] p-12 md:p-24 text-primary-foreground text-center space-y-8 relative overflow-hidden shadow-2xl shadow-primary/40">
          {/* Background elements */}
          <div className="absolute top-0 start-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
          <div className="absolute -top-24 -start-24 rtl:-end-24 rtl:-start-auto w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -end-24 rtl:-start-24 rtl:-end-auto w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative space-y-6 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black uppercase leading-none italic">
              {t("landing.cta.title", "Ready to Start?")}
            </h2>
            <p className="text-primary-foreground/80 font-medium text-lg">
              {t(
                "landing.cta.desc",
                "Join thousands of students and teachers already using our platform to revolutionize their educational experience.",
              )}
            </p>
          </div>

          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button
              size="lg"
              variant="secondary"
              className="h-16 px-10 rounded-2xl text-lg font-black uppercase tracking-widest group shadow-xl shadow-black/10"
              asChild
            >
              <Link to="/register" className="flex items-center">
                {t("landing.cta.launch", "Launch App")}
                <Zap className="ms-2 h-5 w-5 fill-current" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-16 px-10 rounded-2xl text-lg font-black uppercase tracking-widest border-2 border-primary-foreground/20 bg-transparent text-black hover:bg-primary-foreground/10 hover:text-black"
            >
              <Play className="me-2 h-5 w-5 rtl:-scale-x-100" />
              {t("landing.cta.watchDemo", "Watch Demo")}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

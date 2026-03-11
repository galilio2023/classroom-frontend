import { motion } from "framer-motion";
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
  MessageCircle,
  QrCode
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const LandingPage = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  const features = [
    {
      title: "Collaborative Whiteboard",
      description: "Real-time sync, teacher-lock controls, and automated Cloudinary snapshots.",
      icon: <PenTool className="h-6 w-6" />,
      color: "bg-blue-500",
      delay: 0,
    },
    {
      title: "AI Study Lab",
      description: "Personal student workspace with AI Explainer, Summarizer, and Flashcards.",
      icon: <BrainCircuit className="h-6 w-6" />,
      color: "bg-purple-500",
      delay: 0.1,
    },
    {
      title: "Gamification Engine",
      description: "Dynamic XP Rewards, Badges, and Level-up system integrated in every action.",
      icon: <Award className="h-6 w-6" />,
      color: "bg-yellow-500",
      delay: 0.2,
    },
    {
        title: "QR Attendance",
        description: "Verify physical presence instantly with dynamic QR-code logic.",
        icon: <QrCode className="h-6 w-6" />,
        color: "bg-green-500",
        delay: 0.3,
    },
    {
        title: "Smart Analytics",
        description: "Weighted grading, risk assessments, and real-time student progress tracking.",
        icon: <PieChart className="h-6 w-6" />,
        color: "bg-pink-500",
        delay: 0.4,
    },
    {
        title: "Global Collaboration",
        description: "Class-wide discussions, project groups, and peer review systems.",
        icon: <Users className="h-6 w-6" />,
        color: "bg-indigo-500",
        delay: 0.5,
    }
  ];

  return (
    <div className="relative">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-32 flex flex-col items-center text-center space-y-12 overflow-hidden">
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/5"
        >
            <Sparkles className="h-4 w-4" />
            AI-POWERED EDUCATION PLATFORM
        </motion.div>

        <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] max-w-5xl"
        >
          Elevate your <span className="text-primary">Classroom</span> into the <span className="italic">Future.</span>
        </motion.h1>

        <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-muted-foreground text-xl font-medium max-w-2xl leading-relaxed"
        >
          The enterprise-grade solution for modern learning. We combine real-time collaboration with AI assistance to create a world-class educational experience.
        </motion.p>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-6 pt-6"
        >
          <Link to="/register">
            <Button className="h-16 px-10 rounded-2xl text-md font-black uppercase tracking-widest shadow-xl shadow-primary/30 group">
                Join Now 
                <Zap className="ml-2 h-5 w-5 fill-current group-hover:scale-125 transition-transform" />
            </Button>
          </Link>
          <Button variant="outline" className="h-16 px-10 rounded-2xl text-md font-black uppercase tracking-widest border-2">
            Watch Demo
            <Play className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-12 bg-muted/30 backdrop-blur-xl rounded-[3rem] border-t border-primary/10 shadow-2xl">
              {[
                  { label: "Active Students", value: "10K+" },
                  { label: "AI Quizzes", value: "1M+" },
                  { label: "Classrooms", value: "500+" },
                  { label: "Uptime Rate", value: "99.9%" },
              ].map((stat, i) => (
                  <div key={i} className="text-center space-y-2">
                      <p className="text-3xl font-black tracking-tight">{stat.value}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                  </div>
              ))}
          </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-4 py-32 space-y-24">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h2 className="text-5xl font-black tracking-tighter uppercase">Enterprise Grade Tools.</h2>
            <p className="text-muted-foreground text-lg font-medium">Built with an Atomic & Modular architecture for extreme scalability and performance.</p>
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
              <div className={cn("h-16 w-16 rounded-[1.2rem] flex items-center justify-center text-white mb-8 shadow-lg", feature.color)}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-black tracking-tight mb-4 uppercase">{feature.title}</h3>
              <p className="text-muted-foreground font-medium leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* AI Call to Action */}
      <section id="ai" className="container mx-auto px-4 py-32">
          <div className="relative p-12 md:p-24 bg-primary rounded-[4rem] overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
              <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[100%] bg-white/20 blur-[120px] rounded-full rotate-45" />
              
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div className="space-y-8 text-primary-foreground">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-xs font-black uppercase tracking-widest">
                          <Sparkles className="h-4 w-4" />
                          The AI Study Lab
                      </div>
                      <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9]">Meet your new personal AI Teacher.</h2>
                      <p className="text-primary-foreground/80 text-lg font-medium leading-relaxed max-w-lg">
                          Generate quizzes, summarize entire modules, and ask complex questions to our AI assistant. Every student gets a personal workspace tailored to their learning speed.
                      </p>
                      <Link to="/register">
                        <Button className="bg-white text-primary hover:bg-white/90 h-16 px-10 rounded-2xl text-md font-black uppercase tracking-widest shadow-2xl">
                            Explore Study Lab
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                  </div>
                  <div className="relative hidden lg:block">
                      <motion.div 
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-3xl p-8 shadow-2xl space-y-6"
                      >
                          <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-primary">
                                  <BrainCircuit className="h-6 w-6" />
                              </div>
                              <span className="font-black uppercase tracking-widest text-sm text-white">AI Assistant Running...</span>
                          </div>
                          <div className="space-y-4">
                              <div className="h-4 w-[80%] bg-white/20 rounded-full animate-pulse" />
                              <div className="h-4 w-[60%] bg-white/20 rounded-full animate-pulse" />
                              <div className="h-32 w-full bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center">
                                  <Sparkles className="h-10 w-10 text-white/20" />
                              </div>
                          </div>
                      </motion.div>
                  </div>
              </div>
          </div>
      </section>

      {/* Global Community */}
      <section className="container mx-auto px-4 py-32 text-center space-y-12">
          <Globe className="h-16 w-16 mx-auto text-primary animate-pulse" />
          <h2 className="text-5xl font-black tracking-tighter uppercase max-w-2xl mx-auto">Available Everywhere. Built for Everyone.</h2>
          <div className="flex flex-wrap justify-center gap-12 grayscale opacity-50">
              <div className="font-black text-2xl tracking-tighter flex items-center gap-2">
                  <ShieldCheck className="h-8 w-8 text-green-500" /> ENTERPRISE READY
              </div>
              <div className="font-black text-2xl tracking-tighter flex items-center gap-2">
                  <MessageCircle className="h-8 w-8 text-blue-500" /> PWA SUPPORTED
              </div>
              <div className="font-black text-2xl tracking-tighter flex items-center gap-2 italic">
                  I18N LOCALIZED
              </div>
          </div>
      </section>
    </div>
  );
};

export default LandingPage;

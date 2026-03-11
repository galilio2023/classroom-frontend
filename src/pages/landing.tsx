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

  const item: Variants = {
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

        <div className="space-y-6 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase"
          >
            Empower <span className="text-primary italic">Every</span> <br />
            Student Journey.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Tablawy OS is the next-generation operating system for modern classrooms.
            AI-driven, gamified, and built for ultimate collaboration.
          </motion.p>
        </div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Button size="lg" className="h-16 px-10 rounded-2xl text-lg font-black uppercase tracking-widest shadow-2xl shadow-primary/20 group" asChild>
            <Link to="/register">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl text-lg font-black uppercase tracking-widest border-2 border-primary/10 bg-card/50 backdrop-blur-md" asChild>
            <Link to="/login">
                Sign In
            </Link>
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
                <span className="font-bold text-xs uppercase tracking-widest">Enterprise Secure</span>
            </div>
            <div className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                <span className="font-bold text-xs uppercase tracking-widest">Used Globally</span>
            </div>
            <div className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                <span className="font-bold text-xs uppercase tracking-widest">Lightning Fast</span>
            </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-32 border-t border-primary/5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="space-y-4 max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                    Unmatched <span className="text-primary italic">Intelligence.</span>
                </h2>
                <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                    A comprehensive suite of tools designed to reduce teacher workload and maximize student engagement through AI-driven insights.
                </p>
            </div>
            <Button variant="ghost" className="font-black uppercase tracking-widest text-[10px] gap-2 h-12 px-6 rounded-xl hover:bg-primary/5">
                Explore All Features
                <ArrowRight className="h-4 w-4" />
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

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-32">
        <div className="bg-primary rounded-[3rem] p-12 md:p-24 text-primary-foreground text-center space-y-8 relative overflow-hidden shadow-2xl shadow-primary/40">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative space-y-6 max-w-2xl mx-auto">
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none italic">
                    Ready to build the future?
                </h2>
                <p className="text-primary-foreground/80 font-medium text-lg">
                    Join thousands of educators and students already transforming their learning experience.
                </p>
            </div>

            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                <Button size="lg" variant="secondary" className="h-16 px-10 rounded-2xl text-lg font-black uppercase tracking-widest group shadow-xl shadow-black/10">
                    <Link to="/register" className="flex items-center">
                        Launch Dashboard
                        <Zap className="ml-2 h-5 w-5 fill-current" />
                    </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl text-lg font-black uppercase tracking-widest border-white/20 hover:bg-white/10 text-white">
                    <Play className="mr-2 h-5 w-5" />
                    Watch Demo
                </Button>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-primary/5 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-xs italic">T</div>
            <span className="font-black uppercase tracking-tighter text-xl italic">Tablawy OS</span>
        </div>
        <p className="text-muted-foreground text-sm font-medium">
            &copy; {new Date().getFullYear()} Tablawy OS. All rights reserved.
        </p>
        <div className="flex gap-8">
            <a href="#" className="text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Twitter</a>
            <a href="#" className="text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">GitHub</a>
            <a href="#" className="text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Discord</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

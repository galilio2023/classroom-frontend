import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  PenTool,
  BrainCircuit,
  Award,
  QrCode,
  LayoutDashboard,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface Props {
  isAr: boolean;
}

export const LandingFeatures = ({ isAr }: Props) => {
  const { t } = useTranslation();

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
    <section id="features" className="container mx-auto px-4 py-20 md:py-32 text-start">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 md:gap-12 mb-16 md:mb-24">
        <div className="space-y-4 md:space-y-6 max-w-3xl">
          <h2
            className={cn(
              "text-4xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.95] md:leading-[0.9]",
              !isAr && "tracking-tighter"
            )}
          >
            {t("landing.features.sectionTitle")}{" "}
            <span className="text-primary italic">{t("landing.features.sectionTitleItalic")}</span>
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
            <div className="absolute -top-10 -end-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
            <div
              className={cn(
                "h-16 w-16 md:h-20 md:w-20 rounded-2xl md:rounded-3xl flex items-center justify-center text-white mb-8 md:mb-10 shadow-xl group-hover:scale-110 transition-transform duration-500",
                feature.color
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
  );
};

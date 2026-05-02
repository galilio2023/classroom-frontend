import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BrainCircuit, CheckCircle2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface Props {
  isAr: boolean;
}

export const LandingAIHub = ({ isAr }: Props) => {
  const { t } = useTranslation();

  return (
    <section id="ai" className="relative py-24 md:py-44 overflow-hidden px-4">
      {/* 🌈 VIBRANT DESIGNER BACKGROUND: Skewed Glass Layer */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-purple-500/5 to-emerald-500/5 -skew-y-3 origin-right scale-110" />
      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: isAr ? 60 : -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-10 md:space-y-12 text-start"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-linear-to-r from-primary/10 to-purple-500/10 text-primary text-[10px] md:text-xs font-extrabold uppercase tracking-[0.2em] border border-primary/20 backdrop-blur-md">
              <BrainCircuit className="h-4 w-4 animate-pulse" />
              {t("landing.landing_ai_hub.poweredBy", "Gemini 2.5 Flash Powered", {})}
            </div>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.9] tracking-tight">
              {t("landing.landing_ai_hub.title1", "Magic AI", {})} <br />
              <span className="bg-clip-text text-transparent bg-linear-to-r from-primary via-purple-500 to-ai-primary animate-gradient">
                {t("landing.landing_ai_hub.title2", "Study Hub", {})}
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground/80 font-medium leading-relaxed max-w-xl">
              {t(
                "landing.landing_ai_hub.desc",
                "Your learning, amplified. A cinematic AI experience that turns every lesson into a magical discovery.",
                {}
              )}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              {[
                {
                  text: t(
                    "landing.landing_ai_hub.list.assistant",
                    "24/7 AI Teaching Assistant",
                    {}
                  ),
                  color: "bg-primary",
                },
                {
                  text: t("landing.landing_ai_hub.list.quiz", "Adaptive Quiz Magic", {}),
                  color: "bg-purple-500",
                },
                {
                  text: t("landing.landing_ai_hub.list.summary", "Smart Visual Summaries", {}),
                  color: "bg-emerald-500",
                },
                {
                  text: t("landing.landing_ai_hub.list.paths", "Personalized Quests", {}),
                  color: "bg-amber-500",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-2xl flex items-center justify-center text-white transition-all shadow-lg group-hover:scale-110 group-hover:rotate-3",
                      item.color
                    )}
                  >
                    <CheckCircle2 className="h-5 w-5" strokeWidth={3} />
                  </div>
                  <span className="font-extrabold text-xs md:text-sm uppercase tracking-wider text-muted-foreground/90 group-hover:text-foreground transition-colors">
                    {item.text as React.ReactNode}
                  </span>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              className="rounded-2xl h-16 md:h-20 px-10 md:px-14 font-black uppercase tracking-widest text-xs md:text-sm shadow-2xl shadow-primary/30 bg-primary hover:scale-105 active:scale-95 transition-all w-full sm:w-auto group"
              asChild
            >
              <Link to="/ai-study-lab">
                {t("landing.landing_ai_hub.exploreButton", "Unlock AI Magic", {})}
                <Sparkles className="ms-4 h-5 w-5 md:h-6 md:w-6 group-hover:rotate-12 transition-transform text-amber-300 animate-pulse" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-linear-to-r from-primary/30 via-purple-500/30 to-emerald-500/30 blur-[100px] md:blur-[140px] rounded-full animate-pulse" />
            <div className="relative bg-card/80 border-4 border-white/10 rounded-[3rem] md:rounded-[5rem] p-8 md:p-12 shadow-3xl backdrop-blur-2xl overflow-hidden">
              {/* Animated Floating Bubbles */}
              <div className="absolute top-[-10%] left-[-10%] w-32 h-32 bg-primary/20 blur-[60px] rounded-full animate-pulse" />
              <div className="absolute bottom-[-10%] right-[-10%] w-40 h-40 bg-emerald-500/20 blur-[70px] rounded-full [animation-delay:1.5s] animate-pulse" />

              <div className="flex items-center justify-between mb-10 md:mb-14 border-b border-white/10 pb-8 relative z-10">
                <div className="flex items-center gap-5">
                  <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl md:rounded-3xl bg-linear-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-xl shadow-primary/30">
                    <BrainCircuit className="h-6 w-6 md:h-7 md:w-7" />
                  </div>
                  <div className="text-start">
                    <p className="text-sm md:text-base font-black uppercase tracking-tight">
                      {t("landing.landing_ai_hub.chat.header", "Magic Companion", {})}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                      <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
                        {t("landing.landing_ai_hub.activeNow", "Neural Engine Active", {})}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 md:space-y-8 text-start relative z-10">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="bg-muted/50 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] rounded-ss-none max-w-[90%] border border-white/5 shadow-inner"
                >
                  <p className="text-base md:text-lg font-medium leading-relaxed italic text-foreground/80">
                    {t(
                      "landing.landing_ai_hub.chat.msg1",
                      "Hi! I see you're exploring the stars today. Ready to unlock the secrets of the Universe? ✨",
                      {}
                    )}
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-primary p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] rounded-ee-none max-w-[90%] ms-auto text-primary-foreground shadow-2xl shadow-primary/30"
                >
                  <p className="text-base md:text-lg font-extrabold leading-relaxed">
                    {t(
                      "landing.landing_ai_hub.chat.msg2",
                      "Yes! Tell me about the magic of Black Holes in a way I can understand.",
                      {}
                    )}
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                  className="bg-card/40 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] rounded-ss-none max-w-[95%] border border-white/10 shadow-2xl backdrop-blur-md"
                >
                  <p className="text-base md:text-lg font-medium leading-relaxed italic text-foreground/80">
                    {t(
                      "landing.landing_ai_hub.chat.msg3",
                      "Think of a Black Hole like a giant celestial magnet that's so strong, not even light can escape its joy! Imagine a playground slide that goes on forever...",
                      {}
                    )}
                  </p>
                  <div className="mt-8 space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                      <span>
                        {t(
                          "landing.landing_ai_hub.analysisProcessing",
                          "Synthesizing Knowledge",
                          {}
                        )}
                      </span>
                      <span className="animate-pulse">92%</span>
                    </div>
                    <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden shadow-inner border border-primary/5">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "92%" }}
                        transition={{ duration: 2.5, delay: 1.5, ease: "circOut" }}
                        className="h-full bg-linear-to-r from-primary to-purple-500 rounded-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.6)]"
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
  );
};

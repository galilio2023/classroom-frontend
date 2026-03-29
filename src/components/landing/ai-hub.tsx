import { motion } from "framer-motion";
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
              {t("landing.ai.poweredBy")}
            </div>
            <h2 className="text-4xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.95] md:leading-[0.85]">
              {t("landing.ai.title1")} <br />
              <span className="text-primary italic">{t("landing.ai.title2")}</span>
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
                        {t("landing.ai.activeNow")}
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
                      <span>{t("landing.ai.analysisProcessing")}</span>
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
  );
};

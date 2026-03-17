import { useGetIdentity, useCustomMutation } from "@refinedev/core";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Check,
  Sparkles,
  Zap,
  Crown,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  MessageSquare,
  HelpCircle,
  Plus,
  Minus,
} from "lucide-react";
import { User } from "@/types";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";

const FAQItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-border/40 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group transition-all"
      >
        <span className="text-base md:text-lg font-black tracking-tight group-hover:text-primary transition-colors pr-4">
          {question}
        </span>
        <div
          className={cn(
            "p-2 rounded-xl bg-muted/50 transition-all duration-300 shrink-0",
            isOpen && "rotate-180 bg-primary text-primary-foreground shadow-lg shadow-primary/20",
          )}
        >
          {isOpen ? (
            <Minus className="h-4 w-4 md:h-5 md:w-5" />
          ) : (
            <Plus className="h-4 w-4 md:h-5 md:w-5" />
          )}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-sm md:text-base text-muted-foreground/80 font-medium leading-relaxed italic">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Pricing = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { data: identity } = useGetIdentity<User>();
  const { mutate: createCheckout } = useCustomMutation();
  const navigate = useNavigate();

  const handleUpgrade = (priceId: string) => {
    if (!identity) {
      toast.info(t("pricing.toasts.loginRequired"));
      navigate("/register");
      return;
    }

    if (priceId === "free") return;

    createCheckout(
      {
        url: "/subscriptions/checkout",
        method: "post",
        values: { priceId },
      },
      {
        onSuccess: (data: any) => {
          if (data.data.url) {
            window.location.href = data.data.url;
          }
        },
        onError: () => {
          toast.error(t("pricing.toasts.checkoutError"));
        },
      },
    );
  };

  const plans = [
    {
      name: t("pricing.plans.free.name"),
      price: "0",
      symbol: "$",
      description: t("pricing.plans.free.desc"),
      features: [
        t("pricing.plans.free.f1"),
        t("pricing.plans.free.f2"),
        t("pricing.plans.free.f3"),
        t("pricing.plans.free.f4"),
        t("pricing.plans.free.f5"),
      ],
      cta: identity ? t("pricing.currentPlan") : t("buttons.getStarted"),
      priceId: "free",
      featured: false,
    },
    {
      name: t("pricing.plans.pro.name"),
      price: "9.99",
      symbol: "$",
      period: "/month",
      description: t("pricing.plans.pro.desc"),
      features: [
        t("pricing.plans.pro.f1"),
        t("pricing.plans.pro.f2"),
        t("pricing.plans.pro.f3"),
        t("pricing.plans.pro.f4"),
        t("pricing.plans.pro.f5"),
        t("pricing.plans.pro.f6"),
        t("pricing.plans.pro.f7"),
      ],
      cta: t("pricing.upgrade"),
      priceId: "price_1P2k3l4m5n6o7p8q",
      featured: true,
    },
  ];

  const faqs = [
    {
      question: t("pricing.faq.q1"),
      answer: t("pricing.faq.a1"),
    },
    {
      question: t("pricing.faq.q2"),
      answer: t("pricing.faq.a2"),
    },
    {
      question: t("pricing.faq.q3"),
      answer: t("pricing.faq.a3"),
    },
    {
      question: t("pricing.faq.q4"),
      answer: t("pricing.faq.a4"),
    },
  ];

  return (
    <div className="space-y-24 md:space-y-32 pb-32 max-w-7xl mx-auto px-4 md:px-8">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[20%] right-[-5%] w-[40%] h-[40%] bg-primary/5 blur-[100px] md:blur-[120px] rounded-full opacity-50" />
        <div className="absolute bottom-[10%] left-[-5%] w-[40%] h-[40%] bg-purple-500/5 blur-[100px] md:blur-[120px] rounded-full opacity-50" />
      </div>

      {/* Hero Section */}
      <div className="text-center space-y-6 md:space-y-8 max-w-4xl mx-auto pt-16 md:pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] md:text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/5"
        >
          <Crown className="h-4 w-4" />
          {t("pricing.badge")}
        </motion.div>
        <h1 className="text-4xl xs:text-5xl md:text-8xl font-black tracking-tight leading-[0.95] md:leading-[0.9] uppercase text-balance">
          {t("pricing.titlePart1")}{" "}
          <span className="text-primary italic">{t("pricing.titlePart2")}</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-2xl font-medium max-w-2xl mx-auto text-balance">
          {t("pricing.description")}
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto relative">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="relative h-full"
          >
            <Card
              className={cn(
                "relative h-full flex flex-col border border-border/40 shadow-2xl rounded-[2.5rem] md:rounded-[3rem] overflow-hidden transition-all duration-500 group hover:translate-y-[-8px] hover:shadow-primary/10",
                plan.featured
                  ? "bg-card/60 backdrop-blur-3xl border-primary/20"
                  : "bg-card/40 backdrop-blur-3xl",
              )}
            >
              {plan.featured && (
                <div
                  className={cn(
                    "absolute top-0 px-8 py-3 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] shadow-xl z-10",
                    isAr
                      ? "left-0 rounded-br-[2rem]"
                      : "right-0 rounded-bl-[2rem]",
                  )}
                >
                  {t("pricing.recommended")}
                </div>
              )}
              <CardHeader className="p-8 md:p-12 pb-6 md:pb-8">
                <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-widest flex items-center gap-3">
                  {plan.featured && (
                    <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                  )}
                  {plan.name}
                </CardTitle>
                <div className="mt-8 md:mt-10 flex items-baseline gap-1">
                  <span className="text-3xl md:text-4xl font-black tracking-tight text-muted-foreground/40">
                    {plan.symbol}
                  </span>
                  <span className="text-6xl md:text-8xl font-black tracking-tighter">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground font-black uppercase text-[10px] md:text-xs tracking-[0.2em] ml-2 opacity-60">
                      {plan.period}
                    </span>
                  )}
                </div>
                <CardDescription className="mt-6 md:mt-8 text-base md:text-lg font-medium leading-relaxed italic opacity-80 text-start">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 md:p-12 pt-0 flex-1">
                <div className="space-y-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-6">
                    {t("pricing.whatsIncluded")}
                  </p>
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-4 group/item"
                    >
                      <div className="mt-1 p-1 rounded-full bg-primary/10 text-primary shrink-0 group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-all duration-300 shadow-sm">
                        <Check className="h-3 w-3 md:h-3.5 md:w-3.5" strokeWidth={4} />
                      </div>
                      <span className="text-sm md:text-base font-bold tracking-tight text-foreground/70 group-hover/item:text-primary transition-colors text-start">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="p-8 md:p-12 pt-4 md:pt-0">
                <Button
                  onClick={() => handleUpgrade(plan.priceId)}
                  disabled={identity && plan.priceId === "free"}
                  size="lg"
                  className={cn(
                    "w-full h-16 md:h-20 rounded-2xl md:rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] md:text-xs shadow-2xl transition-all duration-300 group",
                    plan.featured
                      ? "bg-primary text-primary-foreground shadow-primary/30 hover:shadow-primary/50"
                      : "bg-muted/50 text-muted-foreground hover:bg-primary hover:text-white",
                  )}
                >
                  {plan.cta}
                  <ArrowRight
                    className={cn("ml-2 h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform", isAr && "rotate-180")}
                  />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Trust & Features Section */}
      <div className="pt-16 md:pt-24 space-y-24 md:space-y-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {[
            { icon: ShieldCheck, title: t("pricing.features.payments.title"), desc: t("pricing.features.payments.desc"), color: "text-blue-500", bg: "bg-blue-500/10" },
            { icon: BrainCircuit, title: t("pricing.features.credits.title"), desc: t("pricing.features.credits.desc"), color: "text-purple-500", bg: "bg-purple-500/10" },
            { icon: MessageSquare, title: t("pricing.features.support.title"), desc: t("pricing.features.support.desc"), color: "text-green-500", bg: "bg-green-500/10" },
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8 }}
              className="p-8 md:p-10 bg-card/40 backdrop-blur-3xl border border-border/40 rounded-[2.5rem] space-y-6 shadow-xl text-center md:text-start group transition-all duration-500"
            >
              <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg mx-auto md:mx-0 group-hover:scale-110 transition-transform duration-500", feature.bg, feature.color)}>
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-black tracking-tight uppercase">
                {feature.title}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground/80 leading-relaxed font-medium">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto space-y-12 md:space-y-16">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-muted/50 text-muted-foreground/60 text-[10px] font-black uppercase tracking-[0.2em] border border-border/40">
            <HelpCircle className="h-4 w-4" />
            {t("pricing.faq.badge")}
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-tight">
            {t("pricing.faq.title")}
          </h2>
        </div>
        <div className="bg-card/40 backdrop-blur-3xl rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-12 border border-border/40 shadow-2xl">
          {faqs.map((faq, i) => (
            <FAQItem key={i} {...faq} />
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-primary p-10 md:p-24 rounded-[3rem] md:rounded-[5rem] text-center text-primary-foreground space-y-10 md:space-y-12 relative overflow-hidden group shadow-[0_40px_80px_-15px_rgba(var(--primary),0.4)]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        <div className="relative space-y-6 md:space-y-8 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-8xl font-black tracking-tighter italic leading-[0.9] uppercase text-balance">
            {t("pricing.cta.title")}
            </h2>
            <p className="text-primary-foreground/80 font-medium text-lg md:text-2xl max-w-2xl mx-auto leading-relaxed text-balance">
            {t("pricing.cta.desc")}
            </p>
        </div>
        <div className="relative z-10 pt-4 flex justify-center">
          <Link to="/register" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 h-16 md:h-20 px-10 md:px-16 rounded-2xl md:rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] md:text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all group shadow-black/20"
            >
              {t("pricing.cta.start")}
              <Zap className="ml-3 h-5 w-5 md:h-6 md:w-6 fill-current animate-pulse group-hover:scale-125 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Pricing;

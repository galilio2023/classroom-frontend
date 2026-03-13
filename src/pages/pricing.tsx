import { useGetIdentity, useCustomMutation } from "@refinedev/core";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
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
  Minus
} from "lucide-react";
import { User } from "@/types";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-primary/10 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="text-lg font-black tracking-tight group-hover:text-primary transition-colors">{question}</span>
        <div className={cn("p-2 rounded-lg bg-muted transition-transform duration-300", isOpen && "rotate-180 bg-primary text-primary-foreground")}>
          {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-muted-foreground font-medium leading-relaxed">
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
  const isAr = i18n.language === 'ar';
  const { data: identity } = useGetIdentity<User>();
  const { mutate: createCheckout } = useCustomMutation();
  const navigate = useNavigate();

  const handleUpgrade = (priceId: string) => {
    if (!identity) {
      toast.info("Please login or create an account to upgrade.");
      navigate("/register");
      return;
    }

    if (priceId === "free") return;

    createCheckout({
      url: "/subscriptions/checkout",
      method: "post",
      values: { priceId },
    }, {
      onSuccess: (data: any) => {
        if (data.data.url) {
          window.location.href = data.data.url;
        }
      },
      onError: () => {
        toast.error("Failed to start checkout. Please try again.");
      }
    });
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
      priceId: "price_1P2k3l4m5n6o7p8q", // Replace with real Stripe Price ID
      featured: true,
    },
  ];

  const faqs = [
    {
        question: t("pricing.faq.q1"),
        answer: t("pricing.faq.a1")
    },
    {
        question: t("pricing.faq.q2"),
        answer: t("pricing.faq.a2")
    },
    {
        question: t("pricing.faq.q3"),
        answer: t("pricing.faq.a3")
    },
    {
        question: t("pricing.faq.q4"),
        answer: t("pricing.faq.a4")
    }
  ];

  return (
    <div className="container mx-auto py-32 px-4 max-w-6xl space-y-32 text-start">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-primary/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-[10%] left-[-5%] w-[30%] h-[30%] bg-purple-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest"
        >
            <Crown className="h-4 w-4" />
            {t("pricing.badge")}
        </motion.div>
        <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-tight uppercase">
          {t("pricing.titlePart1")} <span className="text-primary italic">{t("pricing.titlePart2")}</span>
        </h1>
        <p className="text-muted-foreground text-xl font-medium">
          {t("pricing.description")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto relative">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative h-full"
          >
            <Card className={cn(
                "relative h-full flex flex-col border-2 shadow-2xl rounded-[3rem] overflow-hidden transition-all duration-500 group hover:translate-y-[-8px]",
                plan.featured 
                  ? "bg-card border-primary/20 shadow-primary/10" 
                  : "bg-card/40 border-transparent backdrop-blur-sm"
            )}>
              {plan.featured && (
                <div className={cn(
                    "absolute top-0 px-8 py-3 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest shadow-xl z-10",
                    isAr ? "left-0 rounded-br-[2rem]" : "right-0 rounded-bl-[2rem]"
                )}>
                  {t("pricing.recommended")}
                </div>
              )}
              <CardHeader className="p-12 pb-8">
                <CardTitle className="text-2xl font-black uppercase tracking-widest flex items-center gap-2">
                    {plan.featured && <Sparkles className="h-6 w-6 text-primary" />}
                    {plan.name}
                </CardTitle>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tight text-muted-foreground">{plan.symbol}</span>
                  <span className="text-7xl font-black tracking-tighter">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground font-black uppercase text-xs tracking-widest ml-2">{plan.period}</span>}
                </div>
                <CardDescription className="mt-6 text-lg font-medium leading-relaxed">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-12 pt-0 flex-1">
                <div className="space-y-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{t("pricing.whatsIncluded")}</p>
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-4 group/item">
                      <div className="mt-1 p-1 rounded-full bg-primary/10 text-primary shrink-0 group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-colors">
                        <Check className="h-3 w-3" strokeWidth={4} />
                      </div>
                      <span className="text-sm font-bold tracking-tight text-foreground/80 group-hover/item:text-foreground transition-colors">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="p-12 pt-0">
                <Button 
                  onClick={() => handleUpgrade(plan.priceId)}
                  disabled={identity && plan.priceId === "free"}
                  className={cn(
                    "w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all",
                    plan.featured 
                      ? "bg-primary text-primary-foreground shadow-primary/20 hover:shadow-primary/40" 
                      : "bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground"
                  )}
                >
                  {plan.cta}
                  <ArrowRight className={cn("ml-2 h-4 w-4", isAr && "rotate-180")} />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Trust & Features Section */}
      <div className="pt-20 space-y-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <motion.div 
                whileHover={{ y: -5 }}
                className="p-10 bg-card border border-primary/5 rounded-[2.5rem] space-y-6 shadow-xl text-center md:text-start"
              >
                  <div className="h-14 w-14 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shadow-lg mx-auto md:mx-0">
                      <ShieldCheck className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight uppercase">{t("pricing.features.payments.title")}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                      {t("pricing.features.payments.desc")}
                  </p>
              </motion.div>
              <motion.div 
                whileHover={{ y: -5 }}
                className="p-10 bg-card border border-primary/5 rounded-[2.5rem] space-y-6 shadow-xl text-center md:text-start"
              >
                  <div className="h-14 w-14 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center shadow-lg mx-auto md:mx-0">
                      <BrainCircuit className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight uppercase">{t("pricing.features.credits.title")}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                      {t("pricing.features.credits.desc")}
                  </p>
              </motion.div>
              <motion.div 
                whileHover={{ y: -5 }}
                className="p-10 bg-card border border-primary/5 rounded-[2.5rem] space-y-6 shadow-xl text-center md:text-start"
              >
                  <div className="h-14 w-14 rounded-2xl bg-green-500/10 text-green-600 flex items-center justify-center shadow-lg mx-auto md:mx-0">
                      <MessageSquare className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight uppercase">{t("pricing.features.support.title")}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                      {t("pricing.features.support.desc")}
                  </p>
              </motion.div>
          </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                  <HelpCircle className="h-4 w-4" />
                  {t("pricing.faq.badge")}
              </div>
              <h2 className="text-5xl font-black tracking-tighter uppercase">{t("pricing.faq.title")}</h2>
          </div>
          <div className="bg-card/40 backdrop-blur-xl rounded-[3rem] p-8 md:p-12 border border-primary/5 shadow-2xl">
              {faqs.map((faq, i) => (
                  <FAQItem key={i} {...faq} />
              ))}
          </div>
      </div>

      {/* Final CTA */}
      <div className="bg-primary p-16 rounded-[4rem] text-center text-primary-foreground space-y-8 relative overflow-hidden group shadow-2xl shadow-primary/20">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter relative z-10 leading-[0.9] italic uppercase">
            {t("pricing.cta.title")}
          </h2>
          <p className="text-primary-foreground/70 font-medium max-w-xl mx-auto relative z-10">
              {t("pricing.cta.desc")}
          </p>
          <div className="relative z-10 pt-4">
            <Link to="/register">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-16 px-12 rounded-2xl font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform">
                    {t("pricing.cta.start")}
                    <Zap className="ml-2 h-5 w-5 fill-current" />
                </Button>
            </Link>
          </div>
      </div>
    </div>
  );
};

export default Pricing;

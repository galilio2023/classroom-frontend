import React, { useState } from "react";
import { useGetIdentity, useCustomMutation } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import {
  Check,
  Zap,
  Crown,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  MessageSquare,
  HelpCircle,
  Plus,
  Minus,
  Store,
} from "lucide-react";
import { User } from "@/types";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { KioskPaymentModal } from "@/features/payments/components/KioskPaymentModal";
import { PaymobCheckoutModal } from "@/features/payments/components/PaymobCheckoutModal";

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-border/40 last:border-0 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-8 flex items-center justify-between text-start group transition-all"
      >
        <span className="text-lg md:text-xl font-bold tracking-tight group-hover:text-primary transition-colors pe-4">
          {question}
        </span>
        <div
          className={cn(
            "p-2.5 rounded-full bg-muted/30 border border-border/50 transition-all duration-500 shrink-0",
            isOpen &&
              "rotate-180 bg-primary text-primary-foreground shadow-lg shadow-primary/20 border-primary"
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
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="pb-8 text-base md:text-lg text-muted-foreground/80 font-medium leading-relaxed max-w-3xl">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Pricing = () => {
  const { t } = useTranslation();
  const { data: identity } = useGetIdentity<User>();
  const { mutate: createOrder } = useCustomMutation<{
    id: string;
    referenceCode?: string;
    iframeUrl?: string;
    amount: number;
  }>();
  const navigate = useNavigate();

  const [kioskOrder, setKioskOrder] = useState<{
    id: string;
    referenceCode: string;
    amount: number;
  } | null>(null);

  const [cardOrder, setCardOrder] = useState<{
    id: string;
    iframeUrl: string;
  } | null>(null);

  const handleUpgrade = (priceId: string) => {
    if (!identity) {
      toast.info(t("pricing.toasts.loginRequired"));
      navigate("/register");
      return;
    }

    if (priceId === "free") return;

    createOrder(
      {
        url: "/payments/create-order",
        method: "post",
        values: { provider: "paymob", amount: 200, priceId }, // 200 EGP for Pro
      },
      {
        onSuccess: (data: any) => {
          if (data.data.iframeUrl) {
            setCardOrder({
              id: data.data.id,
              iframeUrl: data.data.iframeUrl,
            });
          }
        },
        onError: () => {
          toast.error(t("pricing.toasts.checkoutError"));
        },
      }
    );
  };

  const handleKioskUpgrade = (priceId: string) => {
    if (!identity) {
      toast.info(t("pricing.toasts.loginRequired"));
      navigate("/register");
      return;
    }

    createOrder(
      {
        url: "/payments/create-order",
        method: "post",
        values: { provider: "fawry", amount: 200, priceId }, // 200 EGP for Pro
      },
      {
        onSuccess: (data: any) => {
          setKioskOrder(data.data);
        },
        onError: () => {
          toast.error(t("pricing.toasts.checkoutError"));
        },
      }
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
      period: t("pricing.perMonth"),
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
    <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/10 selection:text-primary overflow-x-hidden font-sans">
      <div className="noise-overlay" />

      {/* Cinematic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 start-0 w-full h-full bg-primary/1 blur-[140px]" />
        <div className="absolute top-[20%] end-[-10%] w-150 h-150 bg-primary/5 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-[10%] start-[-10%] w-150 h-150 bg-ai-primary/5 rounded-full blur-[120px] opacity-50" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="section-wrapper pt-32 md:pt-48">
          <div className="container-center text-center space-y-10">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card"
            >
              <Crown className="h-3.5 w-3.5 text-primary animate-pulse" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-foreground/70">
                {t("pricing.badge")}
              </span>
            </motion.div>

            <div className="max-w-250 mx-auto space-y-8">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.8 }}
                className="text-4xl sm:text-6xl md:text-7xl lg:text-[8rem] font-black leading-[0.9] tracking-tighter uppercase text-gradient"
              >
                {t("pricing.titlePart1")}
                <br />
                <span className="text-primary">{t("pricing.titlePart2")}</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-lg md:text-xl lg:text-2xl text-muted-foreground/80 font-medium max-w-2xl mx-auto leading-relaxed"
              >
                {t("pricing.description")}
              </motion.p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="section-wrapper py-0!">
          <div className="container-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto items-stretch">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="h-full"
                >
                  <div
                    className={cn(
                      "relative h-full flex flex-col glass-card p-6 sm:p-8 md:p-12 rounded-4xl sm:rounded-[3.5rem] transition-all duration-500 group hover:-translate-y-2 hover:shadow-3xl",
                      plan.featured &&
                        "border-primary/30 ring-1 ring-primary/10 shadow-primary/5 shadow-2xl bg-white/80 dark:bg-muted/10"
                    )}
                  >
                    {plan.featured && (
                      <div className="absolute top-6 end-6 sm:top-8 sm:end-8 md:top-12 md:end-12">
                        <div className="bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg animate-bounce">
                          {t("pricing.recommended")}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-widest flex items-center gap-3">
                        {plan.name}
                      </h3>
                      <div className="flex items-baseline gap-2 pt-6">
                        <span className="text-xl sm:text-2xl font-bold text-muted-foreground/40">
                          {plan.symbol}
                        </span>
                        <span className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter">
                          {plan.price}
                        </span>
                        {plan.period && (
                          <span className="text-muted-foreground font-black uppercase text-[10px] tracking-[0.3em] opacity-60">
                            {plan.period}
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground font-medium text-base sm:text-lg leading-relaxed pt-6 text-start">
                        {plan.description}
                      </p>
                    </div>

                    <div className="mt-12 space-y-6 flex-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">
                        {t("pricing.whatsIncluded")}
                      </p>
                      <div className="space-y-4">
                        {plan.features.map((feature) => (
                          <div key={feature} className="flex items-start gap-4 group/item">
                            <div className="mt-1 p-1 rounded-full bg-primary/10 text-primary shrink-0 transition-colors group-hover/item:bg-primary group-hover/item:text-white">
                              <Check className="h-3 w-3" strokeWidth={4} />
                            </div>
                            <span className="text-base font-bold tracking-tight text-foreground/70 text-start group-hover/item:text-foreground transition-colors leading-tight">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-border/40 space-y-4">
                      <Button
                        onClick={() => handleUpgrade(plan.priceId)}
                        disabled={identity && plan.priceId === "free"}
                        size="lg"
                        className={cn(
                          "w-full h-20 rounded-full font-black uppercase tracking-widest text-xs transition-all duration-500",
                          plan.featured
                            ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/20 hover:scale-105"
                            : "bg-muted text-muted-foreground hover:bg-foreground hover:text-background"
                        )}
                      >
                        {plan.cta}
                        <ArrowRight className="ms-3 h-5 w-5 rtl:rotate-180" />
                      </Button>

                      {plan.priceId !== "free" && (
                        <Button
                          onClick={() => handleKioskUpgrade(plan.priceId)}
                          variant="outline"
                          className="w-full h-16 rounded-full font-black uppercase tracking-widest text-[10px] border-primary/20 hover:bg-primary/5 transition-all"
                        >
                          <Store className="me-2 h-4 w-4 text-primary" />
                          {t("payments.kiosk.title")}
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <KioskPaymentModal
          isOpen={!!kioskOrder}
          onClose={() => setKioskOrder(null)}
          orderId={kioskOrder?.id || null}
          referenceCode={kioskOrder?.referenceCode || null}
          amount={kioskOrder?.amount || 0}
          onSuccess={() => {
            toast.success(t("payments.success"));
            navigate("/dashboard");
          }}
        />

        <PaymobCheckoutModal
          isOpen={!!cardOrder}
          onClose={() => setCardOrder(null)}
          orderId={cardOrder?.id || null}
          iframeUrl={cardOrder?.iframeUrl || null}
          onSuccess={() => {
            toast.success(t("payments.success"));
            navigate("/dashboard");
          }}
        />

        {/* Features Bento */}
        <section className="section-wrapper">
          <div className="container-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: ShieldCheck,
                  title: t("pricing.features.payments.title"),
                  desc: t("pricing.features.payments.desc"),
                  color: "text-primary",
                },
                {
                  icon: BrainCircuit,
                  title: t("pricing.features.credits.title"),
                  desc: t("pricing.features.credits.desc"),
                  color: "text-ai-primary",
                },
                {
                  icon: MessageSquare,
                  title: t("pricing.features.support.title"),
                  desc: t("pricing.features.support.desc"),
                  color: "text-emerald-500",
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  className="p-10 glass-card rounded-4xl space-y-8 text-start group"
                >
                  <div
                    className={cn(
                      "h-16 w-16 rounded-2xl bg-muted/30 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                      feature.color
                    )}
                  >
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black uppercase tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed font-medium">
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="section-wrapper">
          <div className="container-center">
            <div className="max-w-4xl mx-auto space-y-16">
              <div className="text-center space-y-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/50 text-muted-foreground/60 text-[10px] font-black uppercase tracking-widest border border-border/40"
                >
                  <HelpCircle className="h-4 w-4" />
                  {t("pricing.faq.badge")}
                </motion.div>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
                  {t("pricing.faq.title1")} <br />
                  <span className="text-primary">{t("pricing.faq.title2")}</span>
                </h2>
              </div>
              <div className="glass-card rounded-[4rem] p-8 md:p-16">
                {faqs.map((faq, i) => (
                  <FAQItem key={i} {...faq} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="section-wrapper">
          <div className="container-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-12 max-w-5xl mx-auto p-12 md:p-24 rounded-[5rem] bg-primary text-primary-foreground relative overflow-hidden group shadow-3xl shadow-primary/20"
            >
              <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent pointer-events-none" />
              <div className="relative space-y-8">
                <h2 className="text-5xl md:text-9xl font-black tracking-tighter leading-[0.85] uppercase">
                  {t("pricing.cta.title1")}
                  <br /> {t("pricing.cta.title2")}
                </h2>
                <p className="text-primary-foreground/80 font-medium text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed">
                  {t("pricing.cta.desc")}
                </p>
                <div className="pt-8">
                  <Link to="/register" className="inline-block w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 h-20 px-16 rounded-full text-xl font-black uppercase tracking-widest shadow-2xl hover:scale-110 active:scale-95 transition-all group"
                    >
                      {t("pricing.cta.start")}
                      <Zap className="ms-4 h-6 w-6 fill-current animate-pulse" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Pricing;

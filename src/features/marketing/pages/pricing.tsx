import React, { useState } from "react";
import { useGetIdentity } from "@refinedev/core";
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
  Store,
} from "lucide-react";
import { User } from "@/types";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { KioskPaymentModal } from "@/features/payments/components/KioskPaymentModal";
import { PaymobCheckoutModal } from "@/features/payments/components/PaymobCheckoutModal";
import { useCheckout } from "@/features/payments/hooks/use-checkout";
import { FAQItem } from "../components/faq-item";
import { Helmet } from "react-helmet-async";

const Pricing = () => {
  const { t } = useTranslation();
  const { data: identity } = useGetIdentity<User>();
  const navigate = useNavigate();

  const { handleUpgrade, cardOrder, kioskOrder, isPending, clearOrders } = useCheckout();

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
      amount: 200, // Centralized value
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
    <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/10 selection:text-primary overflow-x-hidden font-sans text-start">
      <Helmet>
        <title>Pricing | Tablawy OS - Flexible Plans for Every Learner</title>
        <meta
          name="description"
          content="Choose the perfect plan to accelerate your learning journey with AI features and joyful learning tools."
        />
      </Helmet>

      <div className="noise-overlay opacity-30" />

      {/* 🌈 VIBRANT DESIGNER BACKGROUND: Multicolored Aurora + Magic Particles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 start-0 w-full h-full bg-primary/2 blur-[140px]" />
        <div className="absolute top-[-10%] start-[10%] w-[70%] h-[60%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] end-[10%] w-[60%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] [animation-delay:1s] animate-pulse" />

        {/* ✨ MAGIC PARTICLES */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.4, 0],
              scale: [0, 1, 0.5],
              y: [0, -150 - Math.random() * 300],
              x: [0, (Math.random() - 0.5) * 200],
            }}
            transition={{
              duration: 12 + Math.random() * 12,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "easeInOut",
            }}
            className="absolute top-1/2 left-1/2 h-2.5 w-2.5 bg-primary/20 rounded-full blur-[1px]"
            style={{
              marginLeft: `${(Math.random() - 0.5) * 100}%`,
              marginTop: `${(Math.random() - 0.5) * 50}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="section-wrapper pt-24 md:pt-32 pb-16 md:pb-24">
          <div className="container-center text-center space-y-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-primary/20 bg-white/10 backdrop-blur-xl shadow-xl shadow-primary/5 mx-auto group hover:scale-105 transition-transform"
            >
              <Crown className="h-4 w-4 text-amber-400 animate-spin-slow" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-primary/80">
                {t("pricing.badge")}
              </span>
            </motion.div>

            <div className="max-w-3xl mx-auto space-y-10">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.8 }}
                className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight leading-[0.9] uppercase"
              >
                <span className="bg-clip-text text-transparent bg-linear-to-r from-primary via-purple-500 to-primary bg-[length:200%_auto] animate-gradient block">
                  {t("pricing.titlePart1")}
                </span>
                <span className="italic font-serif normal-case text-foreground/90 tracking-normal block mt-2">
                  {t("pricing.titlePart2")}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-lg md:text-2xl text-muted-foreground/70 font-medium max-w-2xl mx-auto leading-relaxed"
              >
                {t("pricing.description")}
              </motion.p>
            </div>
          </div>
        </section>

        {/* Pricing Cards - VIBRANT & JOYFUL */}
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
                      "relative h-full flex flex-col p-8 sm:p-10 md:p-14 rounded-[3.5rem] transition-all duration-700 group hover:-translate-y-2 border-2",
                      plan.featured
                        ? "bg-linear-to-br from-card to-purple-500/[0.03] border-primary/30 shadow-[0_40px_100px_-20px_rgba(var(--primary-rgb),0.15)] hover:shadow-[0_40px_120px_-20px_rgba(var(--primary-rgb),0.25)]"
                        : "bg-linear-to-br from-card to-primary/[0.03] border-border/40 hover:border-primary/20 shadow-3xl shadow-black/5"
                    )}
                  >
                    {plan.featured && (
                      <div className="absolute top-10 end-10">
                        <div className="bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.3em] px-6 py-2 rounded-full shadow-2xl animate-pulse">
                          {t("pricing.recommended")}
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <h3
                        className={cn(
                          "text-3xl font-black uppercase tracking-tight",
                          plan.featured ? "text-primary" : "text-foreground/80"
                        )}
                      >
                        {plan.name}
                      </h3>
                      <div className="flex items-baseline gap-2 pt-6">
                        <span className="text-2xl font-bold text-muted-foreground/30">
                          {plan.symbol}
                        </span>
                        <span className="text-6xl md:text-8xl font-black tracking-tighter">
                          {plan.price}
                        </span>
                        {plan.period && (
                          <span className="text-muted-foreground font-black uppercase text-xs tracking-[0.3em] opacity-40">
                            {plan.period}
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground font-medium text-lg leading-relaxed pt-6 text-start max-w-sm">
                        {plan.description}
                      </p>
                    </div>

                    <div className="mt-14 space-y-8 flex-1">
                      <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-border/40" />
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/40">
                          {t("pricing.whatsIncluded")}
                        </p>
                        <div className="h-px flex-1 bg-border/40" />
                      </div>

                      <div className="space-y-5">
                        {plan.features.map((feature) => (
                          <div key={feature} className="flex items-start gap-5 group/item">
                            <div
                              className={cn(
                                "mt-1 p-1.5 rounded-full shrink-0 transition-all group-hover/item:scale-110 shadow-lg",
                                plan.featured
                                  ? "bg-primary text-white"
                                  : "bg-primary/10 text-primary"
                              )}
                            >
                              <Check className="h-3.5 w-3.5" strokeWidth={4} />
                            </div>
                            <span className="text-lg font-bold tracking-tight text-foreground/70 text-start group-hover/item:text-foreground transition-colors leading-tight">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-14 pt-10 border-t border-border/40 space-y-5">
                      <Button
                        onClick={() => handleUpgrade(plan.priceId, plan.amount || 0, "paymob")}
                        disabled={(identity && plan.priceId === "free") || isPending}
                        size="lg"
                        className={cn(
                          "w-full h-18 md:h-22 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm md:text-base transition-all duration-700 shadow-2xl relative overflow-hidden group/btn",
                          plan.featured
                            ? "bg-linear-to-r from-primary via-purple-600 to-primary bg-[length:200%_auto] animate-gradient text-white shadow-primary/30"
                            : "bg-foreground text-background hover:bg-primary hover:text-white"
                        )}
                      >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                        <span className="relative z-10 flex items-center justify-center gap-3">
                          {isPending ? <Loader2 className="h-6 w-6 animate-spin" /> : plan.cta}
                          <ArrowRight className="h-5 w-5 rtl:rotate-180 group-hover/btn:translate-x-2 transition-transform" />
                        </span>
                      </Button>

                      {plan.priceId !== "free" && (
                        <Button
                          onClick={() => handleUpgrade(plan.priceId, plan.amount || 0, "fawry")}
                          variant="outline"
                          disabled={isPending}
                          className="w-full h-16 rounded-2xl font-bold uppercase tracking-widest text-[10px] border-primary/20 bg-white/5 backdrop-blur-md hover:bg-primary/5 transition-all group/fawry"
                        >
                          <Store className="me-3 h-5 w-5 text-primary group-hover/fawry:scale-110 transition-transform" />
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
          onClose={clearOrders}
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
          onClose={clearOrders}
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
                    <h3 className="text-2xl font-extrabold uppercase tracking-tight">
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
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/50 text-muted-foreground/60 text-[10px] font-extrabold uppercase tracking-widest border border-border/40"
                >
                  <HelpCircle className="h-4 w-4" />
                  {t("pricing.faq.badge")}
                </motion.div>
                <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter uppercase leading-[0.9]">
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
                <h2 className="text-5xl md:text-9xl font-extrabold tracking-tighter leading-[0.85] uppercase">
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
                      className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 h-20 px-16 rounded-full text-xl font-extrabold uppercase tracking-widest shadow-2xl hover:scale-110 active:scale-95 transition-all group"
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

import { Loader2 } from "lucide-react";

export default Pricing;

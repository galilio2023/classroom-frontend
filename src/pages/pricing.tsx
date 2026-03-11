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
      name: "Free",
      price: "$0",
      description: "Perfect for students and casual learners.",
      features: [
        "Join up to 5 Classes",
        "Unlimited Quiz Attempts",
        "Public Study Groups",
        "Basic AI Concept Explainer",
        "Standard Video Quality",
      ],
      cta: identity ? "Current Plan" : "Get Started",
      priceId: "free",
      featured: false,
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "/month",
      description: "For serious students and elite teachers.",
      features: [
        "Unlimited Classes",
        "Full AI Study Lab Access",
        "Advanced Risk Assessment",
        "Whiteboard Snapshots",
        "Stripe Invoice Management",
        "Priority Support",
        "Gold Crown Badge",
      ],
      cta: "Upgrade to Pro",
      priceId: "price_1P2k3l4m5n6o7p8q", // Replace with real Stripe Price ID
      featured: true,
    },
  ];

  const faqs = [
    {
        question: "How does the AI Study Lab work?",
        answer: "The AI Study Lab uses advanced machine learning models to analyze your course material and generate personalized summaries, flashcards, and practice quizzes. Pro members get unlimited credits for these tools."
    },
    {
        question: "Can I cancel my Pro subscription at any time?",
        answer: "Yes, you can cancel your subscription at any time through the Billing Portal in your account settings. You will continue to have access to Pro features until the end of your current billing cycle."
    },
    {
        question: "Is there a discount for educational institutions?",
        answer: "We offer special volume licensing for schools and universities. Please contact our sales team for a custom quote tailored to your institution's needs."
    },
    {
        question: "Are my payments secure?",
        answer: "Absolutely. All payments are processed through Stripe, the gold standard in online payments. We never store your credit card information on our servers."
    }
  ];

  return (
    <div className="container mx-auto py-32 px-4 max-w-6xl space-y-32">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-primary/5 blur-[100px] rounded-full" />
      </div>

      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest"
        >
            <Crown className="h-4 w-4" />
            Pricing Plans
        </motion.div>
        <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-tight">
          Supercharge Your <span className="text-primary">Learning.</span>
        </h1>
        <p className="text-muted-foreground text-xl font-medium">
          Choose the plan that best fits your educational goals. Upgrade or downgrade anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={cn(
                "relative h-full flex flex-col border-none shadow-2xl rounded-[3rem] overflow-hidden transition-all hover:scale-[1.02] group",
                plan.featured ? "bg-card/40 backdrop-blur-xl border-t-4 border-primary/50" : "bg-muted/20"
            )}>
              {plan.featured && (
                <div className="absolute top-0 right-0 px-8 py-3 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-bl-[2rem] shadow-xl">
                  Recommended
                </div>
              )}
              <CardHeader className="p-12 pb-8">
                <CardTitle className="text-2xl font-black uppercase tracking-widest flex items-center gap-2">
                    {plan.name === "Pro" && <Sparkles className="h-6 w-6 text-primary group-hover:animate-pulse" />}
                    {plan.name}
                </CardTitle>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-6xl font-black tracking-tighter">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground font-black uppercase text-sm tracking-widest">{plan.period}</span>}
                </div>
                <CardDescription className="mt-6 text-lg font-medium leading-relaxed">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-12 pt-0 flex-1">
                <div className="space-y-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">What's Included</p>
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-4">
                      <div className="mt-1 p-1 rounded-full bg-primary/10 text-primary">
                        <Check className="h-3 w-3" strokeWidth={4} />
                      </div>
                      <span className="text-sm font-bold tracking-tight">{feature}</span>
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
                      ? "bg-primary text-primary-foreground shadow-primary/20 hover:scale-[1.05]" 
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {plan.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Feature Grid Section */}
      <div className="pt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="p-10 bg-muted/20 rounded-[2.5rem] space-y-6">
                  <div className="h-14 w-14 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shadow-lg">
                      <ShieldCheck className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight uppercase">Secure Payments</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                      All transactions are processed via **Stripe**. We prioritize your security and never store credit card data.
                  </p>
              </div>
              <div className="p-10 bg-muted/20 rounded-[2.5rem] space-y-6">
                  <div className="h-14 w-14 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center shadow-lg">
                      <BrainCircuit className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight uppercase">AI Credits</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                      Pro members get unlimited access to all AI tools, including Magic Course Builder and AI Study Lab.
                  </p>
              </div>
              <div className="p-10 bg-muted/20 rounded-[2.5rem] space-y-6">
                  <div className="h-14 w-14 rounded-2xl bg-green-500/10 text-green-600 flex items-center justify-center shadow-lg">
                      <MessageSquare className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight uppercase">Priority Support</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                      Pro subscribers get access to a dedicated support channel and faster response times for all inquiries.
                  </p>
              </div>
          </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                  <HelpCircle className="h-4 w-4" />
                  Common Questions
              </div>
              <h2 className="text-5xl font-black tracking-tighter uppercase">Frequently Asked Questions</h2>
          </div>
          <div className="bg-card/40 backdrop-blur-xl rounded-[3rem] p-8 md:p-12 border border-primary/5 shadow-2xl">
              {faqs.map((faq, i) => (
                  <FAQItem key={i} {...faq} />
              ))}
          </div>
      </div>

      {/* Final CTA */}
      <div className="bg-primary p-16 rounded-[4rem] text-center text-primary-foreground space-y-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter relative z-10 leading-[0.9]">Ready to transform your learning experience?</h2>
          <p className="text-primary-foreground/70 font-medium max-w-xl mx-auto relative z-10">
              Join thousands of students and teachers already using Classroom CMS to achieve more.
          </p>
          <div className="relative z-10 pt-4">
            <Link to="/register">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-16 px-12 rounded-2xl font-black uppercase tracking-widest shadow-2xl">
                    Get Started Now
                    <Zap className="ml-2 h-5 w-5 fill-current" />
                </Button>
            </Link>
          </div>
      </div>
    </div>
  );
};

export default Pricing;

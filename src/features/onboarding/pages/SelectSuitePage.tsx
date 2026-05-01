import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Sparkles, Building2, Library, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useOnboarding } from "../hooks/use-onboarding";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const SUITES = [
  {
    id: "private",
    icon: Sparkles,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
  },
  {
    id: "school",
    icon: Building2,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  {
    id: "faculty",
    icon: Library,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
  },
  {
    id: "corporate",
    icon: ShieldCheck,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
  },
] as const;

export const SelectSuitePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { handleSuiteSelection, handleCorporateActivation, isSelecting } = useOnboarding();
  const [selectedSuite, setSelectedSuite] = React.useState<(typeof SUITES)[number]["id"] | null>(
    null
  );

  const [isCorporateDialogOpen, setIsCorporateDialogOpen] = React.useState(false);
  const [corporateData, setCorporateData] = React.useState({
    organizationName: "",
    hrContactName: "",
    employeeCount: "",
  });

  const handleConfirm = () => {
    if (selectedSuite === "corporate") {
      setIsCorporateDialogOpen(true);
    } else if (selectedSuite) {
      handleSuiteSelection(selectedSuite);
    }
  };

  const onCorporateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCorporateActivation({
      organizationName: corporateData.organizationName,
      hrContactName: corporateData.hrContactName,
      employeeCount: parseInt(corporateData.employeeCount) || 0,
    });
  };

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
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Immersive Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] start-[-10%] w-[60%] h-[40%] bg-primary/10 blur-[80px] md:blur-[120px] rounded-full opacity-50" />
        <div className="absolute bottom-[-10%] end-[-10%] w-[60%] h-[40%] bg-purple-500/10 blur-[80px] md:blur-[120px] rounded-full opacity-50" />
      </div>

      <div className="w-full max-w-5xl z-10 space-y-8">
        <div className="text-center space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold tracking-tight"
          >
            {t("onboarding.title", "Choose your Tablawy Suite")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            {t(
              "onboarding.subtitle",
              "Every organization has its own DNA. Select the suite that fits your structure best."
            )}
          </motion.p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {SUITES.map((suite) => (
            <motion.div key={suite.id} variants={item}>
              <Card
                className={cn(
                  "relative h-full cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden group border-2",
                  selectedSuite === suite.id
                    ? cn(
                        "ring-2 ring-primary border-primary",
                        suite.borderColor.replace("/20", "/50")
                      )
                    : "border-border/50 hover:border-primary/50"
                )}
                onClick={() => setSelectedSuite(suite.id)}
              >
                {selectedSuite === suite.id && (
                  <div className="absolute top-3 end-3 z-20">
                    <CheckCircle2 className="w-6 h-6 text-primary animate-in zoom-in" />
                  </div>
                )}

                <CardHeader className="relative pb-2">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-500",
                      suite.bgColor,
                      suite.color
                    )}
                  >
                    <suite.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl">
                    {t(
                      `onboarding.suites.${suite.id}.title`,
                      suite.id.charAt(0).toUpperCase() + suite.id.slice(1)
                    )}
                  </CardTitle>
                  <CardDescription className="min-h-[3rem]">
                    {t(`onboarding.suites.${suite.id}.tagline`)}
                  </CardDescription>
                </CardHeader>

                <CardContent className="text-sm text-muted-foreground">
                  <ul className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                        <span>{t(`onboarding.suites.${suite.id}.feature${i}` as any)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                {/* Animated gradient bottom border */}
                <div
                  className={cn(
                    "absolute bottom-0 inset-x-0 h-1 transition-opacity duration-500",
                    selectedSuite === suite.id ? "opacity-100" : "opacity-0",
                    "bg-gradient-to-r from-transparent via-primary to-transparent"
                  )}
                />
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center pt-8"
        >
          <Button
            size="lg"
            className="h-14 px-10 text-lg rounded-full shadow-lg hover:shadow-primary/20 group transition-all duration-500 gap-2"
            disabled={!selectedSuite || isSelecting}
            onClick={handleConfirm}
          >
            {isSelecting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
            ) : (
              <>
                {t("onboarding.confirm", "Activate My Suite")}
                <ArrowRight
                  className={cn(
                    "w-5 h-5 transition-transform group-hover:translate-x-1",
                    isAr && "rotate-180 group-hover:-translate-x-1"
                  )}
                />
              </>
            )}
          </Button>
        </motion.div>
      </div>

      {/* CORPORATE ACTIVATION DIALOG */}
      <Dialog open={isCorporateDialogOpen} onOpenChange={setIsCorporateDialogOpen}>
        <DialogContent className="max-w-md rounded-[2rem] border-none shadow-2xl bg-card/60 backdrop-blur-3xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">
              Corporate Suite Activation
            </DialogTitle>
            <DialogDescription className="text-sm font-medium">
              Please provide your organizational details to complete the setup.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onCorporateSubmit} className="space-y-6 pt-4">
            <div className="space-y-2 text-start">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ps-1">
                Organization Name
              </Label>
              <Input
                required
                value={corporateData.organizationName}
                onChange={(e) =>
                  setCorporateData({ ...corporateData, organizationName: e.target.value })
                }
                placeholder="e.g. Tablawy Tech Inc."
                className="h-12 rounded-xl bg-muted/30 border-none px-4"
              />
            </div>

            <div className="space-y-2 text-start">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ps-1">
                HR / Admin Contact Name
              </Label>
              <Input
                required
                value={corporateData.hrContactName}
                onChange={(e) =>
                  setCorporateData({ ...corporateData, hrContactName: e.target.value })
                }
                placeholder="e.g. Sarah Ahmed"
                className="h-12 rounded-xl bg-muted/30 border-none px-4"
              />
            </div>

            <div className="space-y-2 text-start">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ps-1">
                Estimated Employee Count
              </Label>
              <Input
                required
                type="number"
                value={corporateData.employeeCount}
                onChange={(e) =>
                  setCorporateData({ ...corporateData, employeeCount: e.target.value })
                }
                placeholder="e.g. 50"
                className="h-12 rounded-xl bg-muted/30 border-none px-4"
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="submit"
                disabled={isSelecting}
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-500/20"
              >
                {isSelecting ? <Loader2 className="animate-spin mr-2" /> : null}
                Finalize Activation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <footer className="mt-auto py-8 text-sm text-muted-foreground/60 text-center">
        {t("onboarding.footer", "Tablawy OS · Hub Suite Selection · 2026")}
      </footer>
    </div>
  );
};

export default SelectSuitePage;

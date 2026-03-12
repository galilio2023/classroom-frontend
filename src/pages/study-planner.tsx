import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  Sparkles,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Clock,
  BookOpen,
  Zap,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useCustomMutation } from "@refinedev/core";
import { useTranslation } from "react-i18next";

interface StudyBlock {
  day: string;
  timeSlot: "Morning" | "Afternoon" | "Evening";
  task: string;
  assignmentId?: number;
  duration: string;
  completed?: boolean;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_SLOTS = ["Morning", "Afternoon", "Evening"];

const StudyPlanner = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [plan, setPlan] = useState<StudyBlock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [completedBlocks, setCompletedBlocks] = useState<Record<string, boolean>>({});

  const { mutate: generatePlanMutation } = useCustomMutation();

  useEffect(() => {
    const savedPlan = localStorage.getItem("study-plan");
    const savedCompleted = localStorage.getItem("study-plan-completed");
    
    if (savedPlan) {
      try {
        setPlan(JSON.parse(savedPlan));
      } catch (e) {
        console.error("Error parsing saved plan", e);
      }
    }
    if (savedCompleted) {
      try {
        setCompletedBlocks(JSON.parse(savedCompleted));
      } catch (e) {
        console.error("Error parsing saved completed blocks", e);
      }
    }
  }, []);

  const generatePlan = async () => {
    setIsLoading(true);
    
    generatePlanMutation({
        url: "ai/generate-study-plan",
        method: "post",
        values: {
            action: "generate" 
        },
        successNotification: () => ({
            message: t("studyPlanner.toasts.generated"),
            type: "success",
        }),
        errorNotification: (error: any) => ({
            message: error?.response?.data?.message || error?.message || t("studyPlanner.toasts.error"),
            type: "error",
        }),
    }, {
        onSuccess: (data: any) => {
            const newPlan = data.data.plan;
            setPlan(newPlan);
            localStorage.setItem("study-plan", JSON.stringify(newPlan));
            setIsLoading(false);
        },
        onError: () => {
            setIsLoading(false);
        }
    });
  };

  const toggleComplete = (day: string, slot: string) => {
    const key = `${day}-${slot}`;
    const isNowCompleted = !completedBlocks[key];
    
    const newCompleted = { ...completedBlocks, [key]: isNowCompleted };
    setCompletedBlocks(newCompleted);
    localStorage.setItem("study-plan-completed", JSON.stringify(newCompleted));

    if (isNowCompleted) {
      toast.success(t("studyPlanner.toasts.completed"), {
        icon: <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />,
      });
      // Frontend-only XP reward
      const event = new CustomEvent("xp_gained_local", { 
        detail: { amount: 20, reason: t("studyPlanner.labels.blockCompleted") } 
      });
      window.dispatchEvent(event);
    }
  };

  const getBlock = (day: string, slot: string) => {
    return plan.find((b) => b.day === day && b.timeSlot === slot);
  };

  return (
    <div className="container mx-auto py-6 md:py-10 px-4 md:px-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <CalendarIcon className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
            {t("resources.study-planner.label")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("studyPlanner.description")}
          </p>
        </div>
        <Button 
          onClick={generatePlan} 
          disabled={isLoading}
          className="gap-2 w-full md:w-auto shadow-lg shadow-primary/20"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {plan.length > 0 ? t("studyPlanner.buttons.regenerate") : t("studyPlanner.buttons.generate")}
        </Button>
      </div>

      {plan.length === 0 && !isLoading ? (
        <Card className="border-dashed border-2 bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 bg-primary/10 rounded-full mb-4">
              <BookOpen className="h-10 w-10 text-primary opacity-50" />
            </div>
            <h3 className="text-xl font-bold">{t("studyPlanner.empty.title")}</h3>
            <p className="text-muted-foreground max-w-sm mt-2">
              {t("studyPlanner.empty.desc")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {DAYS.map((day) => (
            <div key={day} className="space-y-4">
              <div className="text-center">
                <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground">
                  {t(`days.${day.substring(0, 3)}`)}
                </h3>
              </div>
              <div className="space-y-3">
                {TIME_SLOTS.map((slot) => {
                  const block = getBlock(day, slot);
                  const isCompleted = completedBlocks[`${day}-${slot}`];

                  return (
                    <Card 
                      key={slot}
                      className={cn(
                        "relative overflow-hidden transition-all duration-300 group flex flex-col",
                        block ? "min-h-[10rem] border-primary/20 shadow-sm hover:shadow-md" : "h-24 border-dashed opacity-40 bg-muted/10",
                        isCompleted && "bg-primary/5 border-primary/40"
                      )}
                    >
                      {block ? (
                        <CardContent className="p-3 flex flex-col h-full">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider text-primary/80 border-primary/20 bg-primary/5">
                              {t(`studyPlanner.slots.${slot.toLowerCase()}`)}
                            </Badge>
                            <button
                              onClick={() => toggleComplete(day, slot)}
                              className={cn(
                                "p-1 rounded-full transition-all duration-200",
                                isCompleted 
                                  ? "bg-primary text-primary-foreground shadow-sm scale-110" 
                                  : "bg-muted hover:bg-primary/20 text-muted-foreground hover:text-primary"
                              )}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <p className={cn(
                            "text-xs font-bold leading-snug flex-grow break-words",
                            isCompleted && "line-through opacity-50 decoration-primary/50"
                          )}>
                            {block.task}
                          </p>

                          <div className="mt-3 pt-3 border-t border-border/50 flex flex-col gap-2">
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                              <Clock className="h-3 w-3 text-primary/60" />
                              {block.duration}
                            </div>
                            
                            {block.assignmentId && (
                              <Link 
                                to={`/assignments/show/${block.assignmentId}`}
                                className="flex items-center gap-1.5 text-[10px] text-primary font-bold hover:underline group/link"
                              >
                                <ExternalLink className="h-3 w-3 transition-transform group-hover/link:translate-x-0.5" />
                                {t("assignments.show.assignmentDetails")}
                              </Link>
                            )}
                          </div>

                          {isCompleted && (
                            <div className="absolute inset-0 bg-primary/5 pointer-events-none flex items-center justify-center">
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-background/80 backdrop-blur-sm p-2 rounded-full shadow-lg border border-primary/20"
                              >
                                <CheckCircle2 className="h-8 w-8 text-primary" />
                              </motion.div>
                            </div>
                          )}
                        </CardContent>
                      ) : (
                        <CardContent className="p-3 flex items-center justify-center h-full">
                          <span className="text-[10px] font-bold uppercase text-muted-foreground/30 select-none">
                            {t("studyPlanner.labels.free")}
                          </span>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {plan.length > 0 && (
        <div className="flex justify-center">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/10 max-w-2xl w-full shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                {t("studyPlanner.labels.coachTip")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground italic font-medium">
                {t("studyPlanner.labels.tipText")}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

const Badge = ({ children, variant, className, ...props }: any) => {
    return (
        <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className)} {...props}>
            {children}
        </div>
    )
}

export default StudyPlanner;

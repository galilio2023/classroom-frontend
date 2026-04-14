import { motion } from "framer-motion";
import {
  Rocket,
  ArrowRight,
  Timer,
  BookOpen,
  BrainCircuit,
  Radio,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useCustomMutation, useInvalidate } from "@refinedev/core";
import { Skeleton } from "@/components/ui/skeleton";

export interface MissionAction {
  type: "assignment" | "lesson" | "quiz" | "study_block" | "live_session";
  id: string | number;
  title: string;
  context: string;
  urgency: "critical" | "high" | "medium" | "low";
  link: string;
  className?: string;
  dueDate?: string;
}

interface Props {
  mission: MissionAction | null;
  isLoading: boolean;
}

export const MissionControlHero = ({ mission, isLoading }: Props) => {
  const { t } = useTranslation();
  const { mutate: completeBlock } = useCustomMutation();
  const invalidate = useInvalidate();

  if (isLoading) {
    return <Skeleton className="w-full h-48 rounded-[2.5rem]" />;
  }

  if (!mission) {
    return (
      <Card className="border-none shadow-xl rounded-[2.5rem] bg-linear-to-br from-success/5 to-success/10 overflow-hidden">
        <CardContent className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="p-4 rounded-3xl bg-success/20 text-success">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">All Missions Complete!</h2>
              <p className="text-muted-foreground font-medium">
                You're completely caught up. Great job!
              </p>
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            className="rounded-xl font-black uppercase tracking-widest text-[10px]"
          >
            <Link to="/ai-study-lab">Explore Study Lab</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const urgencyConfig = {
    critical: "bg-destructive text-white border-none shadow-lg shadow-destructive/20 animate-pulse",
    high: "bg-orange-500 text-white border-none shadow-lg shadow-orange-500/20",
    medium: "bg-primary text-primary-foreground border-none",
    low: "bg-muted text-muted-foreground border-none",
  };

  const IconMap = {
    assignment: Timer,
    lesson: BookOpen,
    quiz: Sparkles,
    study_block: BrainCircuit,
    live_session: Radio,
  };

  const Icon = IconMap[mission.type] || Rocket;

  const handleLaunchMission = () => {
    if (mission.type === "study_block") {
      completeBlock(
        {
          url: "/study-planner/complete-block",
          method: "patch",
          values: { blockId: mission.id },
        },
        {
          onSuccess: () => {
            void invalidate({
              resource: "dashboard/mission",
              invalidates: ["detail"],
            });
          },
        }
      );
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-card relative group">
        {/* Decorative Background Glow */}
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700">
          <Icon className="h-64 w-64 rotate-12" />
        </div>

        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Left Side: Status & Label */}
            <div
              className={cn(
                "md:w-1/3 p-8 flex flex-col justify-between transition-colors duration-500",
                mission.urgency === "critical" ? "bg-destructive/5" : "bg-primary/5"
              )}
            >
              <div className="space-y-4">
                <Badge
                  className={cn(
                    "px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]",
                    urgencyConfig[mission.urgency]
                  )}
                >
                  {mission.urgency === "critical" && (
                    <Radio className="h-3 w-3 me-1.5 animate-pulse" />
                  )}
                  {t(`mission.urgency.${mission.urgency}`, { defaultValue: mission.urgency })}{" "}
                  Mission
                </Badge>

                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Next Action
                  </p>
                  <h3 className="text-3xl font-black tracking-tighter leading-none uppercase">
                    Mission <br />
                    Control
                  </h3>
                </div>
              </div>

              <div className="hidden md:block">
                <div className="p-4 rounded-2xl bg-background/50 border border-border/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3 text-primary">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      AI Optimized
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: The Action */}
            <div className="md:w-2/3 p-10 flex flex-col justify-center gap-6 text-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px]">
                  <Icon className="h-4 w-4" />
                  {mission.className || "General"}
                </div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                  {mission.title}
                </h2>
                <p className="text-muted-foreground font-medium text-lg max-w-lg">
                  {mission.context}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto h-14 px-8 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 group/btn"
                  onClick={handleLaunchMission}
                >
                  <Link to={mission.link}>
                    Launch Mission
                    <ArrowRight className="h-4 w-4 ms-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>

                {mission.dueDate && (
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    <Timer className="h-3 w-3" />
                    Deadline Approaching
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MissionControlHero;

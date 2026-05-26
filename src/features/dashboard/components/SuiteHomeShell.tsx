import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Zap,
  Calendar,
  Users,
  ShieldCheck,
  Sparkles,
  Building2,
  Library,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Flame,
} from "lucide-react";
import { useCapabilities } from "@/hooks/use-capabilities";
import { useSuiteHome } from "../hooks/use-suite-home";
import { DashboardHeader } from "./dashboard-header";
import { QuickActions } from "./quick-actions";
import { EmptyState } from "@/components/empty-state";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WelcomeHeaderSkeleton } from "./dashboard-skeletons";
import { cn } from "@/lib/utils";

export const SuiteHomeShell: React.FC = () => {
  const { t } = useTranslation();
  const { suiteType, identity, isOwner } = useCapabilities();
  const { data, isLoading, isError } = useSuiteHome();

  if (isLoading) return <WelcomeHeaderSkeleton />;

  // 🛡️ DNA-SPECIFIC CONFIG
  const SUITE_CONFIGS = {
    private: {
      icon: Sparkles,
      accent: "text-amber-500",
      bg: "bg-amber-500/10",
      emptyTitle: t("dashboard.empty.private.title", "Ready to Start Teaching?"),
      emptyDesc: t(
        "dashboard.empty.private.desc",
        "Create your first class and invite students to start your AI-powered journey."
      ),
      action: t("dashboard.empty.private.action", "Create First Class"),
    },
    school: {
      icon: Building2,
      accent: "text-blue-500",
      bg: "bg-blue-500/10",
      emptyTitle: t("dashboard.empty.school.title", "School Infrastructure Ready"),
      emptyDesc: t(
        "dashboard.empty.school.desc",
        "Add your departments and staff to begin managing your school hierarchy."
      ),
      action: t("dashboard.empty.school.action", "Add Department"),
    },
    faculty: {
      icon: Library,
      accent: "text-purple-500",
      bg: "bg-purple-500/10",
      emptyTitle: t("dashboard.empty.faculty.title", "Academic Portal Active"),
      emptyDesc: t(
        "dashboard.empty.faculty.desc",
        "Set up your credit hours and lecture sections to enable student enrollment."
      ),
      action: t("dashboard.empty.faculty.action", "Setup Sections"),
    },
    corporate: {
      icon: ShieldCheck,
      accent: "text-emerald-500",
      bg: "bg-emerald-500/10",
      emptyTitle: t("dashboard.empty.corporate.title", "Compliance Dashboard Live"),
      emptyDesc: t(
        "dashboard.empty.corporate.desc",
        "Upload your training programs and employee directory to start monitoring."
      ),
      action: t("dashboard.empty.corporate.action", "Import Employees"),
    },
  };

  const suiteConfig =
    SUITE_CONFIGS[suiteType as keyof typeof SUITE_CONFIGS] || SUITE_CONFIGS.private;

  const renderWidgetContent = (widget: any) => {
    if (!widget.data && !widget.content && !widget.average) {
      return (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 rounded-full bg-muted/5 border border-dashed border-border/60">
            <Plus className="w-8 h-8 text-muted-foreground/20" />
          </div>
          <p className="text-xs font-medium text-muted-foreground italic">
            {t("dashboard.widget.comingSoon", "Syncing real-time data...")}
          </p>
        </div>
      );
    }

    switch (widget.type) {
      case "today_classes":
      case "bell_schedule":
      case "lectures":
        return (
          <div className="space-y-3">
            {widget.data?.length > 0 ? (
              widget.data.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/40"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold truncate max-w-[150px]">{item.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">
                      {item.todaySchedule?.startTime} - {item.todaySchedule?.endTime}
                    </span>
                  </div>
                  <div className="px-2 py-1 rounded-md bg-background text-[10px] font-black uppercase">
                    {item.todaySchedule?.room || "Online"}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-center text-muted-foreground py-4 italic">
                No sessions today
              </p>
            )}
          </div>
        );

      case "student_streaks":
        return (
          <div className="space-y-4">
            {widget.data?.map((s: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black">
                  {idx + 1}
                </div>
                <div className="flex-1 text-xs font-bold">{s.name}</div>
                <div className="flex items-center gap-1 text-amber-500 font-black text-xs">
                  <Flame className="w-3 h-3" />
                  {s.currentStreak}
                </div>
              </div>
            ))}
          </div>
        );

      case "class_health":
        return (
          <div className="space-y-4">
            {widget.data?.map((h: any, idx: number) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                  <span>{h.name}</span>
                  <span
                    className={cn(
                      h.status === "Green"
                        ? "text-emerald-500"
                        : h.status === "Yellow"
                          ? "text-amber-500"
                          : "text-rose-500"
                    )}
                  >
                    {h.label}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-1000",
                      h.status === "Green"
                        ? "bg-emerald-500"
                        : h.status === "Yellow"
                          ? "bg-amber-500"
                          : "bg-rose-500"
                    )}
                    style={{ width: `${100 - h.score}%` }} // Lower score is better health in our logic? No, check logic.
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case "enrollment_status":
        return (
          <div className="space-y-3">
            {widget.data?.map((e: any) => (
              <div key={e.classId} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="truncate max-w-[120px]">{e.className}</span>
                  <span>
                    {e.count} / {e.capacity}
                  </span>
                </div>
                <div className="h-1 w-full bg-muted rounded-full">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${(e.count / e.capacity) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case "gpa_stats":
        return (
          <div className="flex flex-col items-center justify-center py-4 space-y-2">
            <div className="text-4xl font-black text-primary">{widget.average}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Institutional GPA Average
            </div>
          </div>
        );

      case "ai_insight":
        return (
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 relative overflow-hidden group">
            <Sparkles className="absolute -bottom-2 -right-2 w-12 h-12 text-primary/10 group-hover:scale-125 transition-transform" />
            <p className="text-xs font-medium leading-relaxed italic relative z-10">
              "{widget.content}"
            </p>
          </div>
        );

      default:
        return (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <p className="text-xs font-medium text-muted-foreground italic">
              {widget.status || t("dashboard.widget.syncing", "Syncing real-time data...")}
            </p>
          </div>
        );
    }
  };

  const renderWidget = (widget: any) => {
    return (
      <Card
        key={widget.type}
        className="border-border/40 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <div className={cn("p-1.5 rounded-lg", suiteConfig.bg, suiteConfig.accent)}>
              {widget.type === "ai_insight" ? (
                <Sparkles className="w-3.5 h-3.5" />
              ) : (
                <TrendingUp className="w-3.5 h-3.5" />
              )}
            </div>
            {widget.title}
          </CardTitle>
        </CardHeader>
        <CardContent>{renderWidgetContent(widget)}</CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-12">
      <DashboardHeader identity={identity} isStudent={false} analyticsData={null as any} />

      <div className="space-y-16">
        {/* SUITE DNA HERO SECTION */}
        <section className="relative overflow-hidden rounded-[3rem] p-8 md:p-12 border border-primary/5 shadow-2xl bg-gradient-to-br from-background to-muted/20">
          <div className="absolute top-0 end-0 p-12 opacity-5 pointer-events-none">
            <suiteConfig.icon className="w-64 h-64" />
          </div>

          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em]",
                  suiteConfig.bg,
                  suiteConfig.accent
                )}
              >
                <suiteConfig.icon className="w-3.5 h-3.5" />
                Tablawy {suiteType.charAt(0).toUpperCase() + suiteType.slice(1)} Mode
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1]">
                {t(`dashboard.welcome.${suiteType}` as any, {
                  name: identity?.name,
                  defaultValue: `Welcome to Tablawy ${suiteType}`,
                })}
              </h1>
              <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-lg">
                {t(`dashboard.welcome.${suiteType}.desc` as any, {
                  defaultValue: "Manage your academic journey with autonomous precision.",
                })}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/20">
                  {suiteConfig.action}
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] border-border/60"
                >
                  {t("dashboard.tour", "Take the Hub Tour")}
                </Button>
              </div>
            </div>

            <div className="hidden md:block">
              {/* Suite Metric Preview */}
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card
                    key={i}
                    className="bg-background/40 backdrop-blur-xl border-border/40 shadow-sm p-4"
                  >
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">
                      Metric {i}
                    </div>
                    <div className="text-2xl font-black">--</div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* WIDGET GRID */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data?.widgets && data.widgets.length > 0 ? (
            data.widgets.map(renderWidget)
          ) : (
            <div className="col-span-full">
              <EmptyState
                icon={suiteConfig.icon}
                title={suiteConfig.emptyTitle}
                description={suiteConfig.emptyDesc}
                action={{
                  label: suiteConfig.action,
                  onClick: () => {}, // Link to create resource
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

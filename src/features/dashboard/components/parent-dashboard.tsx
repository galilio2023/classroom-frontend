import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetIdentity, useList, useCustomMutation, useGo, useCustom } from "@refinedev/core";
import { User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  GraduationCap,
  Flame,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  Activity,
  Plus,
  Loader2,
  Calendar,
  Clock,
  Sparkles,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { XPProgressBar } from "@/components/xp-progress-bar";
import { ScheduleItemCard } from "./schedule-item-card";
import { DashboardData, ScheduleItem } from "@/types/dashboard";
import { ErrorBoundary } from "@/components/error-boundary";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { StatsSkeleton } from "./dashboard-skeletons";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ParentDashboardProps {
  data: DashboardData;
  isLoading?: boolean;
  show: (resource: string, id: string | number) => void;
}

const ChildSchedule = ({
  childId,
  childName,
  show,
}: {
  childId: string;
  childName: string;
  show: (resource: string, id: string | number) => void;
}) => {
  const { t } = useTranslation();
  const { data: response, isLoading } = useCustom<ScheduleItem[]>({
    url: `/dashboard`,
    method: "get",
    config: {
      query: {
        sections: "schedule",
        studentId: childId,
      },
    },
  }) as any;

  const schedule: ScheduleItem[] = response?.data || [];

  return (
    <Card className="border-border/40 bg-primary/2 rounded-4xl overflow-hidden shadow-inner">
      <CardHeader className="p-6 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">
            {t("dashboard.schedule.child", { name: childName.split(" ")[0] })}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 rounded-lg px-3 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10"
            onClick={() => show("calendar", "")}
          >
            {t("dashboard.schedule.viewFull")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-2 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-primary/40" />
          </div>
        ) : schedule.length > 0 ? (
          <div className="grid gap-3">
            {schedule.slice(0, 2).map((item: ScheduleItem) => (
              <ScheduleItemCard key={item.id} item={item} onClick={(id) => show("classes", id)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 px-4 space-y-2 opacity-40 grayscale text-balance">
            <Calendar className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
              {t("dashboard.schedule.noClasses", {
                name: childName.split(" ")[0],
              })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const ParentDashboard = ({ isLoading, show }: ParentDashboardProps) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { data: identity } = useGetIdentity<User>();
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const go = useGo();

  const {
    result: { data: children },
    query: { isLoading: isLoadingChildren, refetch },
  } = useList<User>({
    resource: "users/children",
    queryOptions: {
      enabled: !!identity?.id,
    },
  });

  const { mutate: linkStudent, mutation: isLinking } = useCustomMutation<any>();

  const handleLinkStudent = () => {
    if (!studentEmail) {
      toast.error(t("dashboard.parent.enterEmailError"));
      return;
    }

    linkStudent(
      {
        url: "/api/users/link-student",
        method: "post",
        values: {
          studentEmail,
        },
      },
      {
        onSuccess: () => {
          toast.success(t("dashboard.parent.linkSuccess"));
          setIsLinkDialogOpen(false);
          setStudentEmail("");
          refetch();
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || t("dashboard.parent.linkError"));
        },
      }
    );
  };

  const handleContactTeachers = (_childId: string) => {
    go({ to: "/messages" });
  };

  if (isLoading || isLoadingChildren) {
    return <StatsSkeleton />;
  }

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Parent Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2 text-start"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-3 lg:p-4 rounded-2xl lg:rounded-3xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
              <Users className="h-6 w-6 lg:h-8 lg:w-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-none text-balance">
                {t("dashboard.parent.familyOverview")}
              </h2>
              <p className="text-muted-foreground font-medium max-w-xl text-balance">
                {t("dashboard.parent.familyDescription")}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Badge className="bg-primary/10 text-primary border-none font-black px-5 py-2 rounded-full text-[10px] tracking-[0.2em] shadow-sm uppercase">
            {children.length === 1
              ? t("dashboard.parent.childLinked", { count: children.length })
              : t("dashboard.parent.childrenLinked", {
                  count: children.length,
                })}
          </Badge>
          <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="flex-1 md:flex-none rounded-2xl h-12 md:h-14 px-8 font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="h-5 w-5" />
                {t("dashboard.parent.linkChild")}
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl max-w-lg p-0 overflow-hidden text-start">
              <div className="p-8 md:p-12 space-y-8">
                <DialogHeader className="space-y-4 text-start">
                  <div className="p-5 rounded-2xl bg-primary/10 text-primary w-fit mx-auto">
                    <UserCheck className="h-10 w-10" />
                  </div>
                  <div className="space-y-2 text-center">
                    <DialogTitle className="text-3xl font-black tracking-tight text-balance">
                      {t("dashboard.parent.linkStudentAccount")}
                    </DialogTitle>
                    <DialogDescription className="font-medium text-base text-muted-foreground text-balance">
                      {t("dashboard.parent.linkDescription")}
                    </DialogDescription>
                  </div>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label
                      htmlFor="email"
                      className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ms-2"
                    >
                      {t("dashboard.parent.studentEmail")}
                    </Label>
                    <div className="relative group">
                      <Search
                        className={cn(
                          "absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors",
                          "start-6"
                        )}
                      />
                      <Input
                        id="email"
                        placeholder="student@example.com"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        className={cn(
                          "h-16 rounded-3xl bg-muted/30 border-none shadow-inner text-lg font-black placeholder:text-muted-foreground/30 focus-visible:ring-primary/20",
                          "ps-14 pe-8"
                        )}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-3">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-8"
                    onClick={() => setIsLinkDialogOpen(false)}
                  >
                    {t("buttons.cancel")}
                  </Button>
                  <Button
                    size="lg"
                    className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-12 shadow-xl shadow-primary/20"
                    onClick={handleLinkStudent}
                    disabled={isLinking.isPending}
                  >
                    {isLinking.isPending ? (
                      <Loader2 className="h-5 w-5 me-3 animate-spin" />
                    ) : (
                      <ShieldCheck className="h-5 w-5 me-3" />
                    )}
                    {t("dashboard.parent.linkAccount")}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {children.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-2"
        >
          <Card className="border-2 border-dashed border-border/40 bg-card/20 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden">
            <CardContent className="flex flex-col items-center justify-center py-20 md:py-32 text-center space-y-6">
              <div className="p-8 rounded-4xl bg-primary/5 text-primary/30">
                <Users className="h-16 w-16" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl md:text-3xl font-black tracking-tight">
                  {t("dashboard.parent.noChildren")}
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto text-base font-medium text-balance">
                  {t("dashboard.parent.noChildrenDescription")}
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => setIsLinkDialogOpen(true)}
                className="rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 mt-4"
              >
                <Plus className="h-4 w-4 me-2" />
                {t("dashboard.parent.linkChild")}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid gap-8 md:gap-12 grid-cols-1 lg:grid-cols-2 pb-6 px-2">
          <AnimatePresence mode="popLayout">
            {children.map((child: any, index: number) => (
              <motion.div
                key={child.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.5,
                  ease: [0.23, 1, 0.32, 1],
                }}
              >
                <Card className="border border-border/40 shadow-2xl bg-card/50 backdrop-blur-3xl rounded-[2.5rem] md:rounded-[3rem] overflow-hidden group hover:shadow-primary/10 hover:border-primary/20 transition-all duration-500 text-start">
                  <CardHeader className="p-8 md:p-10 lg:p-12 pb-4 md:pb-6 flex flex-row items-center gap-6">
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 bg-primary/20 rounded-[1.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <Avatar className="h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 border-4 border-background shadow-xl rounded-[1.5rem] md:rounded-4xl group-hover:scale-105 transition-transform duration-500 relative z-10">
                        <AvatarImage src={child.image ?? ""} className="object-cover" />
                        <AvatarFallback className="bg-primary/5 text-primary font-black text-2xl md:text-3xl">
                          {child.name[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight truncate group-hover:text-primary transition-colors duration-500">
                        {child.name}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <Badge
                          variant="ai"
                          className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm"
                        >
                          {t("dashboard.student.level")} {child.level || 1}
                        </Badge>
                        {child.currentStreak > 0 && (
                          <div className="flex items-center gap-1.5 text-orange-500 font-black text-[10px] uppercase tracking-widest bg-orange-500/5 px-2.5 py-1 rounded-full border border-orange-500/10">
                            <Flame className="h-3.5 w-3.5 fill-orange-500" />
                            {t("dashboard.parent.dayStreak", {
                              count: child.currentStreak,
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-2xl h-12 w-12 md:h-14 md:w-14 bg-muted/30 hover:bg-primary hover:text-white transition-all duration-500 shadow-sm shrink-0"
                      onClick={() => show("users", child.id)}
                    >
                      <ArrowRight className={cn("h-6 w-6 md:h-7 md:w-7", isAr && "rotate-180")} />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-8 md:p-10 lg:p-12 pt-4 md:pt-6 space-y-8 md:space-y-10">
                    {/* Quick Stats Grid - More Sophisticated */}
                    <div className="grid grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                      <div className="p-5 md:p-6 lg:p-8 rounded-[1.75rem] md:rounded-4xl bg-primary/3 border border-primary/10 space-y-3 group/stat hover:bg-primary/6 transition-colors shadow-inner">
                        <div className="flex items-center gap-2.5 text-primary/60">
                          <div className="p-1.5 md:p-2 rounded-xl bg-primary/10">
                            <GraduationCap className="h-4 w-4 md:h-5 md:w-5" />
                          </div>
                          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                            {t("dashboard.parent.gpaAverage")}
                          </span>
                        </div>
                        <p className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter text-primary">
                          {child.gpa || "88%"}
                        </p>
                      </div>
                      <div className="p-5 md:p-6 lg:p-8 rounded-[1.75rem] md:rounded-4xl bg-emerald-500/3 border border-emerald-500/10 space-y-3 group/stat hover:bg-emerald-500/6 transition-colors shadow-inner">
                        <div className="flex items-center gap-2.5 text-emerald-600/60">
                          <div className="p-1.5 md:p-2 rounded-xl bg-emerald-500/10">
                            <ShieldCheck className="h-4 w-4 md:h-5 md:w-5" />
                          </div>
                          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                            {t("dashboard.parent.attendance")}
                          </span>
                        </div>
                        <p className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter text-emerald-600">
                          {child.attendanceRate || "94%"}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar - Re-styled */}
                    <div className="space-y-4 lg:space-y-6">
                      <div className="flex justify-between items-end px-1">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-primary/40" />
                          <span className="text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                            {t("dashboard.parent.levelProgress")}
                          </span>
                        </div>
                        <span className="text-xs lg:text-sm font-black text-primary bg-primary/5 px-3 lg:px-4 py-1 lg:py-1.5 rounded-full shadow-sm">
                          {t("dashboard.parent.totalXp", {
                            count: child.xp || 0,
                          })}
                        </span>
                      </div>
                      <XPProgressBar
                        xp={child.xp || 0}
                        showLabel={false}
                        className="h-3 lg:h-4 rounded-full bg-primary/10 shadow-inner p-0.5 indicatorClassName:shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                      />
                    </div>

                    <ErrorBoundary>
                      <ChildSchedule childId={child.id} childName={child.name} show={show} />
                    </ErrorBoundary>

                    {/* Action Buttons - Fully Polished */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4 lg:pt-6">
                      <Button
                        variant="outline"
                        size="lg"
                        className="flex-1 rounded-[1.25rem] lg:rounded-[1.5rem] font-black uppercase tracking-widest text-[9px] lg:text-[10px] h-14 lg:h-16 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary gap-3 shadow-sm"
                        onClick={() => handleContactTeachers(child.id)}
                      >
                        <MessageSquare className="h-4.5 w-4.5 lg:h-5 lg:w-5" />
                        {t("dashboard.parent.contactTeachers")}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="flex-1 rounded-[1.25rem] lg:rounded-[1.5rem] font-black uppercase tracking-widest text-[9px] lg:text-[10px] h-14 lg:h-16 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary gap-3 shadow-sm"
                        onClick={() => show("users", child.id)}
                      >
                        <Activity className="h-4.5 w-4.5 lg:h-5 lg:w-5" />
                        {t("dashboard.parent.fullReport")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

import { UserCheck } from "lucide-react";

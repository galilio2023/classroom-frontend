import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useGetIdentity,
  useList,
  useCustomMutation,
  useGo,
  useCustom,
} from "@refinedev/core";
import { User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import { motion } from "framer-motion";
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
    <Card className="border-none bg-primary/5 rounded-[2rem] overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-black uppercase tracking-widest text-primary/60">
            {t("dashboard.schedule.child", { name: childName.split(" ")[0] })}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[8px] font-black uppercase tracking-widest text-primary hover:bg-primary/10"
            onClick={() => show("calendar", "")}
          >
            {t("dashboard.schedule.viewFull")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-primary/40" />
          </div>
        ) : schedule.length > 0 ? (
          schedule
            .slice(0, 2)
            .map((item: ScheduleItem) => (
              <ScheduleItemCard
                key={item.id}
                item={item}
                onClick={(id) => show("classes", id)}
              />
            ))
        ) : (
          <p className="text-[10px] text-muted-foreground font-medium text-center py-2 italic">
            {t("dashboard.schedule.noClasses", {
              name: childName.split(" ")[0],
            })}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export const ParentDashboard = ({ isLoading, show }: ParentDashboardProps) => {
  const { t } = useTranslation();
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
          toast.error(
            error?.response?.data?.message || t("dashboard.parent.linkError"),
          );
        },
      },
    );
  };

  const handleContactTeachers = (_childId: string) => {
    // Navigate to messages page.
    // In a real implementation, we would pass the childId to filter conversations or start a new one with the teachers.
    // For now, we'll just go to the messages page.
    go({ to: "/messages" });
  };

  if (isLoading || isLoadingChildren) {
    return <StatsSkeleton />;
  }

  return (
    <div className="space-y-12">
      {/* Parent Welcome Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight">
            {t("dashboard.parent.familyOverview")}
          </h2>
          <p className="text-muted-foreground font-medium">
            {t("dashboard.parent.familyDescription")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-primary/10 text-primary border-none font-black px-4 py-1.5 rounded-xl text-[10px] tracking-widest">
            {children.length === 1
              ? t("dashboard.parent.childLinked", { count: children.length })
              : t("dashboard.parent.childrenLinked", {
                  count: children.length,
                })}
          </Badge>
          <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-xl font-bold gap-2">
                <Plus className="h-4 w-4" />
                {t("dashboard.parent.linkChild")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {t("dashboard.parent.linkStudentAccount")}
                </DialogTitle>
                <DialogDescription>
                  {t("dashboard.parent.linkDescription")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">
                    {t("dashboard.parent.studentEmail")}
                  </Label>
                  <Input
                    id="email"
                    placeholder="student@example.com"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleLinkStudent}
                  disabled={isLinking.isPending}
                >
                  {isLinking.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t("dashboard.parent.linkAccount")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {children.length === 0 ? (
        <Card className="border-none shadow-2xl bg-muted/20 rounded-[2.5rem] p-12 text-center space-y-6">
          <div className="p-6 rounded-full bg-background shadow-xl w-fit mx-auto">
            <Users className="h-12 w-12 text-muted-foreground/40" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black tracking-tight">
              {t("dashboard.parent.noChildren")}
            </h3>
            <p className="text-muted-foreground font-medium max-w-md mx-auto">
              {t("dashboard.parent.noChildrenDescription")}
            </p>
          </div>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-280px)] min-h-[500px] w-full pr-4">
          <div className="grid gap-8 md:grid-cols-2 pb-6">
            {children.map((child: any, index: number) => (
              <motion.div
                key={child.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden group hover:shadow-primary/5 transition-all">
                  <CardHeader className="p-8 pb-4 flex flex-row items-center gap-5">
                    <Avatar className="h-16 w-16 border-4 border-background shadow-xl rounded-2xl group-hover:scale-105 transition-transform">
                      <AvatarImage
                        src={child.image ?? ""}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-primary/5 text-primary font-black text-xl">
                        {child.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-2xl font-black tracking-tight">
                        {child.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md"
                        >
                          Level {child.level || 1}
                        </Badge>
                        {child.currentStreak > 0 && (
                          <div className="flex items-center gap-1 text-orange-500 font-black text-[10px] uppercase tracking-widest">
                            <Flame className="h-3 w-3 fill-orange-500" />
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
                      className="rounded-full h-12 w-12 hover:bg-primary/5 text-primary"
                      onClick={() => show("users", child.id)}
                    >
                      <ArrowRight className="h-6 w-6" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-8 pt-4 space-y-8">
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/5 space-y-1">
                        <div className="flex items-center gap-2 text-primary/60">
                          <GraduationCap className="h-3.5 w-3.5" />
                          <span className="text-[8px] font-black uppercase tracking-widest">
                            {t("dashboard.parent.gpaAverage")}
                          </span>
                        </div>
                        <p className="text-xl font-black tracking-tight">
                          {child.gpa || "88%"}
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-green-500/5 border border-green-500/5 space-y-1">
                        <div className="flex items-center gap-2 text-green-600/60">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span className="text-[8px] font-black uppercase tracking-widest">
                            {t("dashboard.parent.attendance")}
                          </span>
                        </div>
                        <p className="text-xl font-black tracking-tight">
                          {child.attendanceRate || "94%"}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          {t("dashboard.parent.levelProgress")}
                        </span>
                        <span className="text-[10px] font-black text-primary">
                          {t("dashboard.parent.totalXp", {
                            count: child.xp || 0,
                          })}
                        </span>
                      </div>
                      <XPProgressBar
                        xp={child.xp || 0}
                        showLabel={false}
                        className="h-2.5"
                      />
                    </div>

                    <ErrorBoundary>
                      <ChildSchedule
                        childId={child.id}
                        childName={child.name}
                        show={show}
                      />
                    </ErrorBoundary>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        className="flex-1 rounded-xl font-black uppercase tracking-widest text-[9px] h-11 border-primary/10 hover:bg-primary/5 text-primary gap-2"
                        onClick={() => handleContactTeachers(child.id)}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        {t("dashboard.parent.contactTeachers")}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 rounded-xl font-black uppercase tracking-widest text-[9px] h-11 border-primary/10 hover:bg-primary/5 text-primary gap-2"
                        onClick={() => show("users", child.id)}
                      >
                        <Activity className="h-3.5 w-3.5" />
                        {t("dashboard.parent.fullReport")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

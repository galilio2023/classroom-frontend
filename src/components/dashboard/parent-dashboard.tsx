import { DashboardData } from "@/types/dashboard";
import { useGetIdentity, useList, useCustomMutation } from "@refinedev/core";
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
import { StatsSkeleton } from "./dashboard-skeletons";
import { useState } from "react";
import { toast } from "sonner";
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

interface ParentDashboardProps {
  data: DashboardData;
  isLoading?: boolean;
  show: (resource: string, id: string | number) => void;
}

export const ParentDashboard = ({ isLoading, show }: ParentDashboardProps) => {
  const { data: identity } = useGetIdentity<User>();
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");

  // 1. The 100% correct Refine v5 destructuring based on the source code
  const {
    result: { data: children }, // Safely extracts the array
    query: { isLoading: isLoadingChildren, refetch }, // Extracts TanStack states
  } = useList<User>({
    resource: "users/children",
    queryOptions: {
      enabled: !!identity?.id,
    },
  });

  const { mutate: linkStudent, mutation: isLinking } = useCustomMutation<any>();

  const handleLinkStudent = () => {
    if (!studentEmail) {
      toast.error("Please enter a student email address.");
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
          toast.success("Student linked successfully!");
          setIsLinkDialogOpen(false);
          setStudentEmail("");
          refetch();
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              "Failed to link student. Please check the email.",
          );
        },
      },
    );
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
            Family Overview
          </h2>
          <p className="text-muted-foreground font-medium">
            Monitor your children's academic progress and engagement.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-primary/10 text-primary border-none font-black px-4 py-1.5 rounded-xl text-[10px] tracking-widest">
            {children.length} {children.length === 1 ? "Child" : "Children"}{" "}
            Linked
          </Badge>
          <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-xl font-bold gap-2">
                <Plus className="h-4 w-4" />
                Link Child
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Link Student Account</DialogTitle>
                <DialogDescription>
                  Enter the email address your child used to register.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Student Email</Label>
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
                  Link Account
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
              No children linked yet
            </h3>
            <p className="text-muted-foreground font-medium max-w-md mx-auto">
              Click the "Link Child" button above to connect your account with
              your children's student profiles.
            </p>
          </div>
        </Card>
      ) : (
        /* 2. Added ScrollArea to wrap the grid with a custom scrollbar */
        <ScrollArea className="h-[calc(100vh-280px)] min-h-[500px] w-full pr-4">
          <div className="grid gap-8 md:grid-cols-2 pb-6">
            {children.map((child: User, index: number) => (
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
                            {child.currentStreak} Day Streak
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
                            GPA / Average
                          </span>
                        </div>
                        <p className="text-xl font-black tracking-tight">
                          88%{" "}
                          <span className="text-xs text-muted-foreground font-bold">
                            (A-)
                          </span>
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-green-500/5 border border-green-500/5 space-y-1">
                        <div className="flex items-center gap-2 text-green-600/60">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span className="text-[8px] font-black uppercase tracking-widest">
                            Attendance
                          </span>
                        </div>
                        <p className="text-xl font-black tracking-tight">94%</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Level Progress
                        </span>
                        <span className="text-[10px] font-black text-primary">
                          {child.xp || 0} Total XP
                        </span>
                      </div>
                      <XPProgressBar
                        xp={child.xp || 0}
                        showLabel={false}
                        className="h-2.5"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        className="flex-1 rounded-xl font-black uppercase tracking-widest text-[9px] h-11 border-primary/10 hover:bg-primary/5 text-primary gap-2"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Contact Teachers
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 rounded-xl font-black uppercase tracking-widest text-[9px] h-11 border-primary/10 hover:bg-primary/5 text-primary gap-2"
                      >
                        <Activity className="h-3.5 w-3.5" />
                        Full Report
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

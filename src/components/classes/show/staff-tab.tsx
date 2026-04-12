import React, { useMemo } from "react";
import { useCustom, useCustomMutation } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Users,
  GraduationCap,
  BookOpen,
  MonitorPlay,
  Mail,
  MoreVertical,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface ClassTeacher {
  classId: number;
  teacherId: string;
  isPrimary: boolean;
  permissions: {
    canGrade: boolean;
    canManageCurriculum: boolean;
    canManageStudents: boolean;
    canManageLiveSessions: boolean;
  };
  teacher: {
    id: string;
    name: string;
    image: string;
    email: string;
  };
}

interface StaffTabProps {
  classId: string;
  isOwner: boolean;
}

export const StaffTab = ({ classId, isOwner }: StaffTabProps) => {
  const { t } = useTranslation();

  const { result, query } = useCustom<ClassTeacher[]>({
    url: `classes/${classId}/teachers`,
    method: "get",
  });

  const isLoading = query?.isLoading;
  const refetch = query?.refetch;

  const { mutate: updatePermissions, isLoading: isUpdating } = useCustomMutation() as any;

  const teachers = result?.data || [];

  const handleTogglePermission = (
    teacherId: string,
    permissionKey: keyof ClassTeacher["permissions"],
    currentValue: boolean
  ) => {
    const teacher = teachers.find((t: ClassTeacher) => t.teacherId === teacherId);
    if (!teacher) return;

    const newPermissions = {
      ...teacher.permissions,
      [permissionKey]: !currentValue,
    };

    updatePermissions(
      {
        url: `classes/${classId}/teachers/${teacherId}`,
        method: "patch",
        values: {
          permissions: newPermissions,
        },
      },
      {
        onSuccess: () => {
          toast.success("Permissions updated successfully.");
          refetch?.();
        },
        onError: () => {
          toast.error("Failed to update permissions.");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-start space-y-1">
          <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            Class Staff
          </h2>
          <p className="text-muted-foreground font-medium text-sm">
            Manage your teaching assistants and delegate class responsibilities.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {teachers.map((teacherAssignment: ClassTeacher) => (
          <Card
            key={teacherAssignment.teacherId}
            className="rounded-[2rem] border-none shadow-xl bg-card/50 backdrop-blur-xl overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Teacher Info */}
              <div className="lg:col-span-4 p-8 bg-muted/20 border-e border-border/40 flex flex-col items-center justify-center text-center space-y-4">
                <Avatar className="h-24 w-24 rounded-[2rem] border-4 border-background shadow-2xl">
                  <AvatarImage src={teacherAssignment.teacher.image} />
                  <AvatarFallback className="bg-primary/10 text-primary font-black text-xl">
                    {teacherAssignment.teacher.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-black text-lg">{teacherAssignment.teacher.name}</h3>
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    <Mail className="h-3 w-3" />
                    {teacherAssignment.teacher.email}
                  </div>
                </div>
                {teacherAssignment.isPrimary ? (
                  <Badge className="bg-primary text-white border-none px-4 py-1 rounded-full font-black uppercase text-[9px] tracking-widest">
                    Primary Teacher
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="px-4 py-1 rounded-full font-black uppercase text-[9px] tracking-widest border-primary/20 text-primary"
                  >
                    Junior Teacher (TA)
                  </Badge>
                )}
              </div>

              {/* Permissions Grid */}
              <div className="lg:col-span-8 p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-border/40 pb-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Role Delegation Grid
                  </span>
                  {teacherAssignment.isPrimary && (
                    <span className="text-[9px] font-bold text-primary flex items-center gap-1 uppercase">
                      <ShieldCheck className="h-3 w-3" />
                      Full Access (Implicit)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Permission: Grading */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/10 border border-border/40">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-orange-500/10 text-orange-600">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div className="text-start">
                        <p className="font-black text-sm">Grading & Feedback</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                          Correct assignments & give grades
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={
                        teacherAssignment.isPrimary || teacherAssignment.permissions?.canGrade
                      }
                      disabled={teacherAssignment.isPrimary || !isOwner || isUpdating}
                      onCheckedChange={() =>
                        handleTogglePermission(
                          teacherAssignment.teacherId,
                          "canGrade",
                          teacherAssignment.permissions?.canGrade
                        )
                      }
                    />
                  </div>

                  {/* Permission: Curriculum */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/10 border border-border/40">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div className="text-start">
                        <p className="font-black text-sm">Curriculum Management</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                          Manage modules, notes & resources
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={
                        teacherAssignment.isPrimary ||
                        teacherAssignment.permissions?.canManageCurriculum
                      }
                      disabled={teacherAssignment.isPrimary || !isOwner || isUpdating}
                      onCheckedChange={() =>
                        handleTogglePermission(
                          teacherAssignment.teacherId,
                          "canManageCurriculum",
                          teacherAssignment.permissions?.canManageCurriculum
                        )
                      }
                    />
                  </div>

                  {/* Permission: Students */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/10 border border-border/40">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-green-500/10 text-green-600">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="text-start">
                        <p className="font-black text-sm">Roster Control</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                          Approve students & manage groups
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={
                        teacherAssignment.isPrimary ||
                        teacherAssignment.permissions?.canManageStudents
                      }
                      disabled={teacherAssignment.isPrimary || !isOwner || isUpdating}
                      onCheckedChange={() =>
                        handleTogglePermission(
                          teacherAssignment.teacherId,
                          "canManageStudents",
                          teacherAssignment.permissions?.canManageStudents
                        )
                      }
                    />
                  </div>

                  {/* Permission: Live Sessions */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/10 border border-border/40">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600">
                        <MonitorPlay className="h-5 w-5" />
                      </div>
                      <div className="text-start">
                        <p className="font-black text-sm">Live Orchestration</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                          Start broadcasts & manage sessions
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={
                        teacherAssignment.isPrimary ||
                        teacherAssignment.permissions?.canManageLiveSessions
                      }
                      disabled={teacherAssignment.isPrimary || !isOwner || isUpdating}
                      onCheckedChange={() =>
                        handleTogglePermission(
                          teacherAssignment.teacherId,
                          "canManageLiveSessions",
                          teacherAssignment.permissions?.canManageLiveSessions
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

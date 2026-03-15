import { useMemo } from "react";
import { Enrollment, User } from "@/types";
import { HttpError } from "@refinedev/core";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Calendar,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
  MessageSquare,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface StudentsTabProps {
  classId: string;
  approvedCount: number;
  pendingEnrollments: Enrollment[];
  isStaff: boolean;
  onInsight: (student: { id: string; name: string }) => void;
  onUnenroll: (id: number) => void;
  onEnrollClick: () => void;
  onMessageAllClick: () => void;
  onEnrollmentAction: (id: number, status: "approved" | "rejected") => void;
}

export const StudentsTab = ({
  classId,
  approvedCount,
  pendingEnrollments,
  isStaff,
  onInsight,
  onUnenroll,
  onEnrollClick,
  onMessageAllClick,
  onEnrollmentAction,
}: StudentsTabProps) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const columns = useMemo<ColumnDef<Enrollment>[]>(
    () => [
      {
        id: "student",
        header: () => (
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {t("classes.show.students.table.student")}
          </p>
        ),
        accessorKey: "student",
        cell: ({ getValue, row }) => {
          const student = getValue<User>();
          const isWaitlisted = row.original.status === "waitlisted";
          const isPending = row.original.status === "pending";

          return (
            <div className="flex items-center gap-3 py-1">
              <Avatar className="size-10 border-2 border-background shadow-sm rounded-xl">
                {student.image && (
                  <AvatarImage
                    src={student.image}
                    alt={student.name}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="bg-primary/5 text-primary font-black text-xs">
                  {student.name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col truncate text-start">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm tracking-tight">
                    {student.name}
                  </span>
                  {isWaitlisted && (
                    <Badge
                      variant="outline"
                      className="bg-orange-500/10 text-orange-600 border-none text-[8px] font-black uppercase tracking-tighter px-2 py-0 h-4"
                    >
                      {t("classes.show.students.table.waitlist", {
                        pos: row.original.waitlistPosition,
                      })}
                    </Badge>
                  )}
                  {isPending && (
                    <Badge
                      variant="outline"
                      className="bg-blue-500/10 text-blue-600 border-none text-[8px] font-black uppercase tracking-tighter px-2 py-0 h-4"
                    >
                      {t("classes.show.students.pending.status")}
                    </Badge>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground font-bold truncate">
                  {student.email}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: () => (
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {t("classes.show.students.table.enrolledOn")}
          </p>
        ),
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 opacity-40" />
            <span>
              {new Date(getValue<string>()).toLocaleDateString(
                isAr ? "ar-EG" : "en-US",
                { month: "short", day: "numeric", year: "numeric" },
              )}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div
            className={cn(
              "flex items-center gap-2",
              isAr ? "justify-start" : "justify-end",
            )}
          >
            {isStaff && row.original.status === "approved" && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 border-ai-primary/20 hover:bg-ai-primary/5 text-ai-primary transition-all shadow-sm"
                onClick={() =>
                  onInsight({
                    id: row.original.student.id,
                    name: row.original.student.name,
                  })
                }
              >
                <Sparkles className="h-3.5 w-3.5" />
                {t("buttons.aiInsight")}
              </Button>
            )}
            {isStaff && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                onClick={() => onUnenroll(row.original.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [isStaff, t, isAr, onInsight, onUnenroll],
  );

  const enrollmentsTable = useTable<Enrollment, HttpError>({
    columns,
    refineCoreProps: {
        resource: "enrollments",
        filters: {
            initial: [
                {
                    field: "classId",
                    operator: "eq",
                    value: classId,
                }
            ]
        },
        pagination: {
            pageSize: 10,
        },
        syncWithLocation: false,
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
      <div className="lg:col-span-3 space-y-8">
        <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-black/5 overflow-hidden">
          <CardHeader className="p-10 pb-4 flex flex-row items-center justify-between border-b border-black/[0.03] bg-muted/30">
            <div className="space-y-1.5 text-start">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <CardTitle className="text-2xl font-black tracking-tight">
                  {t("classes.show.students.table.title")}
                </CardTitle>
              </div>
              <CardDescription className="text-muted-foreground font-medium px-1">
                {t("classes.show.students.table.description", {
                  count: approvedCount,
                })}
              </CardDescription>
            </div>
            {isStaff && (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={onMessageAllClick}
                  className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-[10px] gap-2 border-primary/10 hover:bg-primary/5 transition-all"
                >
                  <MessageSquare className="h-4 w-4" />
                  {t("classes.show.students.actions.messageAll")}
                </Button>
                <Button
                  onClick={onEnrollClick}
                  className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/20 transition-all"
                >
                  <UserPlus className="h-4 w-4" />
                  {t("classes.show.students.actions.enrollStudent")}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <DataTable table={enrollmentsTable} />
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - Pending Requests */}
      {isStaff && (
        <div className="space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-black/5 overflow-hidden">
            <CardHeader className="p-8 pb-4 bg-orange-500/5">
              <div className="flex items-center justify-between">
                <div className="space-y-1 text-start">
                  <CardTitle className="text-lg font-black tracking-tight">
                    {t("classes.show.students.pending.title")}
                  </CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-orange-600/60">
                    {t("classes.show.students.pending.count", {
                      count: pendingEnrollments.length,
                    })}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {pendingEnrollments.length === 0 ? (
                <div className="text-center py-10 space-y-3 opacity-30">
                  <UserPlus className="h-8 w-8 mx-auto" />
                  <p className="text-[10px] font-black uppercase tracking-widest">
                    {t("classes.show.students.pending.empty")}
                  </p>
                </div>
              ) : (
                pendingEnrollments.map((enrollment: Enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between p-4 rounded-3xl bg-orange-500/5 border border-orange-500/10 transition-all hover:bg-orange-500/10 group"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-orange-500/20 rounded-xl">
                        {enrollment.student.image && (
                          <AvatarImage
                            src={enrollment.student.image}
                            alt={enrollment.student.name}
                            className="object-cover"
                          />
                        )}
                        <AvatarFallback className="bg-orange-500/10 text-orange-600 font-black text-xs">
                          {enrollment.student.name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col text-start">
                        <span className="text-sm font-black tracking-tight">
                          {enrollment.student.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-bold">
                          {t("classes.show.students.pending.requested")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl text-muted-foreground hover:text-success hover:bg-success/5"
                        onClick={() =>
                          onEnrollmentAction(enrollment.id, "approved")
                        }
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                        onClick={() =>
                          onEnrollmentAction(enrollment.id, "rejected")
                        }
                      >
                        <XCircle className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

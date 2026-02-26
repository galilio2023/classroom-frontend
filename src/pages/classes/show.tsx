import { useShow, useDelete, useGetIdentity } from "@refinedev/core";
import { useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";

import { DataTable } from "@/components/refine-ui/data-table/data-table";
import {
  ShowView,
  ShowViewHeader,
} from "@/components/refine-ui/views/show-view";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Class, Enrollment, User } from "@/types";
import { Loader2, PlusCircle, Trash2, Sparkles, ClipboardCheck, MessageSquare, Library } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EnrollStudentDialog } from "./enroll-student-dialog";
import { AssignmentList } from "../assignments/list";
import { AIQuizGenerator } from "@/components/ai-quiz-generator";
import { AttendanceTab } from "./attendance-tab";
import { AIStudyBuddy } from "@/components/ai-study-buddy";
import { DiscussionTab } from "./discussion-tab";
import { ResourceTab } from "./resource-tab";
import { cn } from "@/lib/utils";

const ClassesShow = () => {
  const { id } = useParams();
  const classId = id ?? "";
  const { data: identity } = useGetIdentity<User>();

  const [activeTab, setActiveTab] = useState("discussions");
  const [unenrollTarget, setUnenrollTarget] = useState<number | null>(null);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);

  const {
    result: aClass,
    query: { isLoading, isError },
  } = useShow<Class>({
    resource: "classes",
    id: classId,
  });

  const enrollments = aClass?.enrollments ?? [];
  const assignments = aClass?.assignments ?? [];

  const { mutate: deleteMutation, mutation } = useDelete();

  const isAdmin = identity?.role === "admin";
  const isTeacher = identity?.role === "teacher";
  const isStaff = isAdmin || isTeacher;

  const studentColumns = useMemo<ColumnDef<Enrollment>[]>(
    () => [
      {
        id: "student",
        header: "Student",
        accessorKey: "student",
        cell: ({ getValue }) => {
          const student = getValue<User>();
          return (
            <div className="flex items-center gap-2">
              <Avatar className="size-7">
                {student.image && (
                  <AvatarImage src={student.image} alt={student.name} />
                )}
                <AvatarFallback>{student.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col truncate">
                <span className="truncate">{student.name}</span>
                <span className="text-xs text-muted-foreground truncate">
                  {student.email}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Enrolled On",
        cell: ({ getValue }) =>
          new Date(getValue<string>()).toLocaleDateString(),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          isStaff && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setUnenrollTarget(row.original.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )
        ),
      },
    ],
    [isStaff],
  );

  const enrollmentsTable = useTable<Enrollment>({
    columns: studentColumns,
    data: enrollments,
  });

  const enrolledStudentIds = useMemo(
    () => enrollments.map((e: Enrollment) => e.student.id),
    [enrollments],
  );

  const handleConfirmUnenroll = () => {
    if (unenrollTarget) {
      deleteMutation(
        { resource: "enrollments", id: unenrollTarget },
        { onSuccess: () => setUnenrollTarget(null) },
      );
    }
  };

  if (isLoading) {
    return (
      <ShowView>
        <ShowViewHeader resource="classes" title="Loading..." />
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </div>
      </ShowView>
    );
  }

  if (isError || !aClass) {
    return (
      <ShowView>
        <ShowViewHeader title="Class not found" />
      </ShowView>
    );
  }

  return (
    <>
      <ShowView className="class-view class-show space-y-6">
        <ShowViewHeader resource="classes" title={aClass.name} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={cn("grid w-full", isStaff ? "grid-cols-7" : "grid-cols-5")}>
            <TabsTrigger value="discussions">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>Discussions</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="resources">
              <div className="flex items-center gap-2">
                <Library className="h-4 w-4" />
                <span>Resources</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="attendance">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                <span>Attendance</span>
              </div>
            </TabsTrigger>
            {isStaff && (
              <>
                <TabsTrigger value="ai-quiz">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>AI Quiz</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </>
            )}
          </TabsList>

          <div className="mt-6">
            <TabsContent value="discussions">
              <DiscussionTab classId={classId} />
            </TabsContent>

            <TabsContent value="resources">
              <ResourceTab classId={classId} />
            </TabsContent>

            <TabsContent value="students">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Enrolled Students</CardTitle>
                    <CardDescription>
                      {enrollments.length} of {aClass.capacity} spots filled
                    </CardDescription>
                  </div>
                  {isStaff && (
                    <Button onClick={() => setIsEnrollDialogOpen(true)}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Enroll Student
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <DataTable table={enrollmentsTable} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assignments">
              <AssignmentList classId={classId} assignments={assignments} />
            </TabsContent>

            <TabsContent value="attendance">
              <AttendanceTab classId={classId} enrollments={enrollments} />
            </TabsContent>

            {isStaff && (
              <>
                <TabsContent value="ai-quiz">
                  <AIQuizGenerator classId={classId} />
                </TabsContent>

                <TabsContent value="details">
                  <Card>
                    <CardHeader>
                      <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subject</span>
                        <span className="font-medium">
                          {aClass?.subject?.name ?? "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Teacher</span>
                        <span className="font-medium">
                          {aClass?.teacher?.name ?? "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant="default" className="capitalize">
                          {aClass.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Invite Code</span>
                        <Badge variant="outline" className="font-mono">
                          {aClass.inviteCode}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </ShowView>

      <AlertDialog
        open={unenrollTarget !== null}
        onOpenChange={() => setUnenrollTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will unenroll the student from the class.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmUnenroll}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Unenrolling..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EnrollStudentDialog
        classId={classId}
        isOpen={isEnrollDialogOpen}
        onOpenChange={setIsEnrollDialogOpen}
        enrolledStudentIds={enrolledStudentIds}
      />

      {/* AI Study Buddy Floating Widget */}
      <AIStudyBuddy 
        subject={aClass.subject?.name} 
        topic={aClass.name}
      />
    </>
  );
};

export default ClassesShow;

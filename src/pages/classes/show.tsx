import { useShow, useDelete, useGetIdentity, useUpdate } from "@refinedev/core";
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
import { 
  Loader2, 
  PlusCircle, 
  Trash2, 
  ClipboardCheck, 
  MessageSquare, 
  Library, 
  FileQuestion, 
  Sparkles, 
  LayoutGrid, 
  Megaphone, 
  CheckCircle2, 
  XCircle, 
  Users, 
  Info,
  Copy,
  Check
} from "lucide-react";
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
import { AttendanceTab } from "./attendance-tab";
import { AIStudyBuddy } from "@/components/ai-study-buddy";
import { DiscussionTab } from "./discussion-tab";
import { ResourceTab } from "./resource-tab";
import { QuizTab } from "./quiz-tab";
import { CurriculumTab } from "./curriculum-tab";
import { AnnouncementTab } from "./announcement-tab";
import { AIStudentInsightModal } from "@/components/ai-student-insight-modal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ClassesShow = () => {
  const { id } = useParams();
  const classId = id ?? "";
  const { data: identity } = useGetIdentity<User>();

  const [activeTab, setActiveTab] = useState("curriculum");
  const [unenrollTarget, setUnenrollTarget] = useState<number | null>(null);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // AI Insight State
  const [insightTarget, setInsightTarget] = useState<{ id: string; name: string } | null>(null);

  const {
    query: { data: aClassData, isLoading, isError, refetch }
  } = useShow<Class>({
    resource: "classes",
    id: classId,
  });

  const aClass = aClassData?.data;

  const allEnrollments = aClass?.enrollments ?? [];
  const approvedEnrollments = allEnrollments.filter(e => e.status === "approved");
  const pendingEnrollments = allEnrollments.filter(e => e.status === "pending");
  const assignments = aClass?.assignments ?? [];

  const { mutate: deleteMutation, mutation: deleteMutationResult } = useDelete();
  const { mutate: updateEnrollment } = useUpdate();
  const isDeleting = deleteMutationResult.isPending;

  const isAdmin = identity?.role === "admin";
  const isTeacher = identity?.role === "teacher";
  const isStaff = isAdmin || isTeacher;

  const handleCopyInviteCode = () => {
    if (aClass?.inviteCode) {
      navigator.clipboard.writeText(aClass.inviteCode);
      setCopied(true);
      toast.success("Invite code copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEnrollmentAction = (id: number, status: "approved" | "rejected") => {
    updateEnrollment({
      resource: "classes/enrollments",
      id,
      values: { status },
      onSuccess: () => {
        toast.success(`Student enrollment ${status}`);
        refetch();
      }
    });
  };

  const columns = useMemo<ColumnDef<Enrollment>[]>(
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
          <div className="flex items-center gap-2">
            {isStaff && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-2 border-primary/20 hover:bg-primary/5 text-primary"
                onClick={() => setInsightTarget({ id: row.original.student.id, name: row.original.student.name })}
              >
                <Sparkles className="h-3.5 w-3.5" />
                AI Insight
              </Button>
            )}
            {isStaff && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setUnenrollTarget(row.original.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [isStaff],
  );

  const enrollmentsTable = useTable<Enrollment>({
    columns,
    data: approvedEnrollments,
  });

  const enrolledStudentIds = useMemo(
    () => approvedEnrollments.map((e: Enrollment) => e.student.id),
    [approvedEnrollments],
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
        <ShowViewHeader resource="classes" />
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </div>
      </ShowView>
    );
  }

  if (isError || !aClass) {
    return (
      <ShowView>
        <ShowViewHeader resource="classes" />
        <div className="flex justify-center items-center h-96">
          <p>Class not found</p>
        </div>
      </ShowView>
    );
  }

  return (
    <>
      <ShowView className="class-view class-show space-y-6">
        <ShowViewHeader resource="classes" title={aClass.name} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={cn("grid w-full", isStaff ? "grid-cols-9" : "grid-cols-8")}>
            <TabsTrigger value="curriculum">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Curriculum</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="announcements">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4" />
                <span className="hidden sm:inline">Announcements</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="discussions">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Discussions</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="resources">
              <div className="flex items-center gap-2">
                <Library className="h-4 w-4" />
                <span className="hidden sm:inline">Resources</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="students">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Students</span>
                {isStaff && pendingEnrollments.length > 0 && (
                  <Badge variant="destructive" className="h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                    {pendingEnrollments.length}
                  </Badge>
                )}
              </div>
            </TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="quizzes">
              <div className="flex items-center gap-2">
                <FileQuestion className="h-4 w-4" />
                <span className="hidden sm:inline">Quizzes</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="attendance">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Attendance</span>
              </div>
            </TabsTrigger>
            {isStaff && (
              <TabsTrigger value="details">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <span className="hidden sm:inline">Details</span>
                </div>
              </TabsTrigger>
            )}
          </TabsList>

          <div className="mt-6">
            <TabsContent value="curriculum">
              <CurriculumTab classId={classId} />
            </TabsContent>

            <TabsContent value="announcements">
              <AnnouncementTab classId={classId} />
            </TabsContent>

            <TabsContent value="discussions">
              <DiscussionTab classId={classId} />
            </TabsContent>

            <TabsContent value="resources">
              <ResourceTab classId={classId} />
            </TabsContent>

            <TabsContent value="students" className="space-y-6">
              {isStaff && pendingEnrollments.length > 0 && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Pending Requests
                    </CardTitle>
                    <CardDescription>
                      Students waiting for approval to join this class.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pendingEnrollments.map((enrollment) => (
                        <div key={enrollment.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={enrollment.student.image} />
                              <AvatarFallback>{enrollment.student.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{enrollment.student.name}</p>
                              <p className="text-xs text-muted-foreground">{enrollment.student.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-destructive hover:bg-destructive/5"
                              onClick={() => handleEnrollmentAction(enrollment.id, "rejected")}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => handleEnrollmentAction(enrollment.id, "approved")}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Enrolled Students</CardTitle>
                    <CardDescription>
                      {approvedEnrollments.length} of {aClass.capacity} spots filled
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

            <TabsContent value="quizzes">
              <QuizTab classId={classId} />
            </TabsContent>

            <TabsContent value="attendance">
              <AttendanceTab classId={classId} enrollments={approvedEnrollments} />
            </TabsContent>

            {isStaff && (
              <TabsContent value="details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Class Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subject</span>
                        <span className="font-medium">
                          {aClass?.subject?.name ?? "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant="default" className="capitalize">
                          {aClass.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Capacity</span>
                        <span className="font-medium">
                          {aClass.capacity} Students
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Megaphone className="h-5 w-5 text-primary" />
                        Student Access
                      </CardTitle>
                      <CardDescription>
                        Share this code with students so they can join the class.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/10">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-primary uppercase tracking-wider">Invite Code</p>
                          <p className="text-2xl font-bold font-mono tracking-widest">{aClass.inviteCode}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-12 w-12 rounded-full"
                          onClick={handleCopyInviteCode}
                        >
                          {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Teachers</p>
                        <div className="space-y-2">
                          {aClass.teachers?.map((tc) => (
                            <div key={tc.teacher.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={tc.teacher.image} />
                                <AvatarFallback>{tc.teacher.name?.[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{tc.teacher.name}</p>
                                <p className="text-[10px] text-muted-foreground">{tc.isPrimary ? "Primary Teacher" : "Co-Teacher"}</p>
                              </div>
                              {tc.isPrimary && <Badge variant="secondary" className="text-[10px]">Primary</Badge>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )}
          </div>
        </Tabs>
      </ShowView>

      {isStaff && (
        <>
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
                  disabled={isDeleting}
                >
                  {isDeleting ? "Unenrolling..." : "Confirm"}
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

          {/* AI Student Insight Modal */}
          <AIStudentInsightModal
            isOpen={insightTarget !== null}
            onClose={() => setInsightTarget(null)}
            studentId={insightTarget?.id || ""}
            studentName={insightTarget?.name || ""}
            classId={classId}
          />
        </>
      )}

      {/* AI Study Buddy Floating Widget */}
      <AIStudyBuddy 
        subject={aClass.subject?.name} 
        topic={aClass.name}
        classId={classId}
      />
    </>
  );
};

export default ClassesShow;

import { useShow, useDelete, useGetIdentity } from "@refinedev/core";
import { useParams } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
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
import { Class, Enrollment, User, Discussion } from "@/types";
import { Loader2, PlusCircle, Trash2, Sparkles, ClipboardCheck, MessageSquare, Send, Reply, RefreshCw, MoreVertical, Info } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

dayjs.extend(relativeTime);

// --- INTERNAL DISCUSSION COMPONENT ---
const InternalDiscussionTab = ({ classId }: { classId: string }) => {
  const { data: identity } = useGetIdentity<User>();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [newPost, setNewPost] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const fetchDiscussions = async () => {
    const url = `${import.meta.env.VITE_API_URL}/discussions?classId=${classId}`;
    setIsLoading(true);
    try {
      const response = await fetch(url, { credentials: "include" });
      const result = await response.json();
      setDiscussions(result.data || []);
    } catch (err: any) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDiscussions(); }, [classId]);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/discussions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newPost, classId: Number(classId) }),
        credentials: "include",
      });
      if (response.ok) {
        setNewPost("");
        fetchDiscussions();
        toast.success("Post shared with class");
      }
    } catch (err) {
      toast.error("Failed to post message");
    }
  };

  const handleReply = async (parentId: number) => {
    if (!replyContent.trim()) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/discussions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent, classId: Number(classId), parentId }),
        credentials: "include",
      });
      if (response.ok) {
        setReplyTo(null);
        setReplyContent("");
        fetchDiscussions();
        toast.success("Reply sent");
      }
    } catch (err) {
      toast.error("Failed to send reply");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/discussions/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        fetchDiscussions();
        toast.success("Message deleted");
      }
    } catch (err) {
      toast.error("Failed to delete message");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Classroom Feed</h3>
          <p className="text-sm text-muted-foreground">Share updates and ask questions with your class.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDiscussions} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
              <AvatarImage src={identity?.image ?? ""} />
              <AvatarFallback className="bg-primary text-primary-foreground">{identity?.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <Textarea 
                placeholder="Write a message to the class..." 
                value={newPost} 
                onChange={(e) => setNewPost(e.target.value)} 
                className="min-h-[100px] bg-background resize-none focus-visible:ring-primary"
              />
              <div className="flex justify-end">
                <Button onClick={handlePost} disabled={!newPost.trim() || isLoading} className="px-8">
                  <Send className="h-4 w-4 mr-2" />
                  Post
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {isLoading && discussions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading discussions...</p>
          </div>
        ) : discussions.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/30">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="font-medium">No messages yet.</p>
            <p className="text-sm">Be the first to start a conversation!</p>
          </div>
        ) : (
          discussions.map(post => (
            <Card key={post.id} className="group transition-all hover:shadow-md">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10 shadow-sm">
                    <AvatarImage src={post.user?.image ?? ""} />
                    <AvatarFallback>{post.user?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{post.user?.name}</span>
                          <Badge variant="secondary" className="text-[10px] h-4 px-1.5 capitalize">
                            {post.user?.role}
                          </Badge>
                        </div>
                        <span className="text-[11px] text-muted-foreground">{dayjs(post.createdAt).fromNow()}</span>
                      </div>
                      {(identity?.id === post.userId || identity?.role === "admin") && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(post.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-primary" 
                        onClick={() => setReplyTo(replyTo === post.id ? null : post.id)}
                      >
                        <Reply className="h-3 w-3 mr-1.5" />
                        {replyTo === post.id ? "Cancel" : "Reply"}
                      </Button>
                    </div>
                    
                    {replyTo === post.id && (
                      <div className="mt-4 space-y-3 bg-muted/50 p-3 rounded-lg border border-border animate-in fade-in slide-in-from-top-2 duration-200">
                        <Textarea 
                          placeholder="Write a reply..." 
                          value={replyContent} 
                          onChange={(e) => setReplyContent(e.target.value)} 
                          className="min-h-[80px] bg-background text-sm"
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)}>Cancel</Button>
                          <Button size="sm" onClick={() => handleReply(post.id)} disabled={!replyContent.trim()}>Send Reply</Button>
                        </div>
                      </div>
                    )}

                    {post.replies && post.replies.length > 0 && (
                      <div className="mt-4 space-y-4 border-l-2 border-muted pl-4 ml-1">
                        {post.replies.map(reply => (
                          <div key={reply.id} className="group/reply flex gap-3 relative">
                            <Avatar className="h-7 w-7 shadow-xs">
                              <AvatarImage src={reply.user?.image ?? ""} />
                              <AvatarFallback className="text-[10px]">{reply.user?.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-xs">{reply.user?.name}</span>
                                  <span className="text-[10px] text-muted-foreground">{dayjs(reply.createdAt).fromNow()}</span>
                                </div>
                                {(identity?.id === reply.userId || identity?.role === "admin") && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 opacity-0 group-hover/reply:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDelete(reply.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                              <p className="text-xs mt-1 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
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
          <TabsList className={cn("grid w-full", isStaff ? "grid-cols-6" : "grid-cols-4")}>
            <TabsTrigger value="discussions">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>Discussions</span>
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
              <InternalDiscussionTab classId={classId} />
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

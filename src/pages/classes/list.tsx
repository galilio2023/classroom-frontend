import {
  Search,
  Key,
  LayoutGrid,
  Globe,
  Users,
  Calendar,
  Building2,
  Copy,
  Trash2,
  Video,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";
import {
  useList,
  HttpError,
  useGetIdentity,
  useCustomMutation,
  useInvalidate,
  useDelete,
  useNavigation,
} from "@refinedev/core";
import { Link } from "react-router-dom";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ListView } from "@/components/refine-ui/views/list-view";
import { CreateButton } from "@/components/refine-ui/buttons/create";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

import { Subject, User, UserRole, ClassListItem } from "@/types";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";
import { socket } from "@/lib/socket";

const ClassesList = () => {
  const { data: identity } = useGetIdentity<User>();
  const { create } = useNavigation();
  const isStudent = identity?.role === UserRole.STUDENT;
  const isTeacher = identity?.role === UserRole.TEACHER;
  const isAdmin = identity?.role === UserRole.ADMIN;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [inviteCode, setInviteCode] = useState("");
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const { mutate: joinClass, mutation: joinMutation } = useCustomMutation();
  const { mutate: cloneClass, mutation: cloneMutation } = useCustomMutation();
  const { mutate: deleteClass } = useDelete();
  const invalidate = useInvalidate();

  const isJoining = joinMutation.isPending;
  const isCloning = cloneMutation.isPending;

  // Real-time Live Status Updates
  useEffect(() => {
    if (!socket.connected) socket.connect();

    const handleLiveUpdate = () => {
      invalidate({ resource: "classes", invalidates: ["list"] });
    };

    socket.on("live_session_started", handleLiveUpdate);
    socket.on("live_session_ended", handleLiveUpdate);

    return () => {
      socket.off("live_session_started", handleLiveUpdate);
      socket.off("live_session_ended", handleLiveUpdate);
    };
  }, [invalidate]);

  const handleJoinByCode = () => {
    if (!inviteCode.trim()) return;

    joinClass(
      {
        url: "/classes/join",
        method: "post",
        values: { inviteCode },
      },
      {
        onSuccess: (data: any) => {
          toast.success(data.data.message || "Request sent!");
          setIsJoinModalOpen(false);
          setInviteCode("");
        },
        onError: (error: any) => {
          toast.error(error?.data?.message || "Invalid invite code");
        },
      },
    );
  };

  const handleClone = (id: number) => {
    cloneClass(
      {
        url: `/classes/${id}/clone`,
        method: "post",
        values: {},
      },
      {
        onSuccess: () => {
          toast.success("Class curriculum cloned successfully!");
          invalidate({ resource: "classes", invalidates: ["list"] });
        },
      },
    );
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteClass(
        {
          resource: "classes",
          id: deleteTarget,
        },
        {
          onSuccess: () => {
            toast.success("Class deleted successfully");
            setDeleteTarget(null);
          },
        },
      );
    }
  };

  const classColumns = useMemo<ColumnDef<ClassListItem>[]>(
    () => [
      {
        id: "banner",
        accessorKey: "bannerUrl",
        size: 80,
        header: () => null,
        cell: ({ row, getValue }) => {
          const bannerUrl = getValue<string>();
          const classColor = (row.original as any).color || "#3b82f6";
          return bannerUrl ? (
            <img
              src={bannerUrl}
              alt="Class banner"
              className="h-10 w-10 rounded-lg object-cover border shadow-sm"
              loading="lazy"
            />
          ) : (
            <div
              className="h-10 w-10 rounded-lg border flex items-center justify-center shadow-sm"
              style={{
                backgroundColor: `${classColor}20`,
                borderColor: `${classColor}40`,
              }}
            >
              <LayoutGrid className="h-5 w-5" style={{ color: classColor }} />
            </div>
          );
        },
      },
      {
        id: "name",
        accessorKey: "name",
        size: 200,
        header: () => <p className="column-title">Class Name</p>,
        cell: ({ row, getValue }) => (
          <div className="flex flex-col">
            <span className="text-foreground font-bold">
              {getValue<string>()}
            </span>
            {row.original.isLive && (
              <div className="flex items-center gap-1 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
                  Live Now
                </span>
              </div>
            )}
          </div>
        ),
      },
      {
        id: "department",
        accessorFn: (row) => row.subject?.department?.name,
        header: () => <p className="column-title">Department</p>,
        cell: ({ getValue }) => {
          const deptName = getValue<string>();
          return deptName ? (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              <span className="text-xs">{deptName}</span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground/50 italic">
              None
            </span>
          );
        },
      },
      {
        id: "teacher",
        header: () => <p className="column-title">Teacher</p>,
        cell: ({ row }) => {
          const primaryTeacher = row.original.teachers?.find(
            (t) => t.isPrimary,
          )?.teacher;
          return (
            <span className="text-foreground font-medium text-xs">
              {primaryTeacher?.name || "Not assigned"}
            </span>
          );
        },
      },
      {
        id: "students",
        accessorKey: "_count.enrollments",
        header: () => <p className="column-title">Students</p>,
        cell: ({ row }) => {
          const count = row.original._count?.enrollments || 0;
          return (
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-bold">{count}</span>
              <span className="text-[10px] text-muted-foreground">
                / {row.original.capacity || "∞"}
              </span>
            </div>
          );
        },
      },
      {
        id: "schedule",
        accessorKey: "schedules",
        header: () => <p className="column-title">Schedule</p>,
        cell: ({ getValue }) => {
          const schedules = getValue<any[]>();
          if (!schedules || schedules.length === 0)
            return (
              <span className="text-[10px] text-muted-foreground italic">
                No schedule
              </span>
            );
          const first = schedules[0];
          return (
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                {first.day}: {first.startTime}-{first.endTime}
              </span>
              {schedules.length > 1 && (
                <Badge variant="outline" className="h-4 px-1 text-[8px]">
                  +{schedules.length - 1}
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        id: "status",
        accessorKey: "status",
        size: 80,
        header: () => <p className="column-title">Status</p>,
        cell: ({ row, getValue }) => {
          const status = getValue<"active" | "inactive">();
          const classColor = (row.original as any).color || "#3b82f6";
          return (
            <Badge
              variant={status === "active" ? "default" : "secondary"}
              className="capitalize text-[10px] h-5"
              style={
                status === "active" ? { backgroundColor: classColor } : {}
              }
            >
              {status}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        size: 180,
        header: () => null,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2 pr-4">
            {(isTeacher || isAdmin) && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={() => handleClone(row.original.id)}
                  disabled={isCloning}
                  title="Duplicate Class"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleteTarget(row.original.id)}
                  title="Delete Class"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              asChild
              variant={row.original.isLive ? "default" : "outline"}
              size="sm"
              className={cn(
                "rounded-full px-4 h-8 text-xs",
                row.original.isLive &&
                  "bg-red-500 hover:bg-red-600 text-white border-none shadow-md shadow-red-500/20",
              )}
            >
              <Link to={`/classes/show/${row.original.id}`}>
                {row.original.isLive ? (
                  <>
                    <Video className="h-3 w-3 mr-1.5 animate-pulse" />
                    Join Live
                  </>
                ) : (
                  "Enter Class"
                )}
              </Link>
            </Button>
          </div>
        ),
      },
    ],
    [isTeacher, isAdmin, isCloning],
  );

  const { query: subjectsQuery } = useList<Subject, HttpError>({
    resource: "subjects",
    pagination: { pageSize: 100 },
  });

  const subjects = subjectsQuery.data?.data ?? [];

  const filters = useMemo(() => {
    const f = [];
    if (selectedSubject !== "all")
      f.push({
        field: "subject",
        operator: "eq" as const,
        value: selectedSubject,
      });
    if (searchQuery)
      f.push({
        field: "name",
        operator: "contains" as const,
        value: searchQuery,
      });
    return f;
  }, [selectedSubject, searchQuery]);

  const classesTable = useTable<ClassListItem>({
    columns: classColumns,
    refineCoreProps: {
      resource: "classes",
      pagination: { pageSize: 10, mode: "server" },
      filters: { permanent: filters },
      sorters: { initial: [{ field: "id", order: "desc" }] },
      meta: {
        populate: [
          "subject",
          "subject.department",
          "teachers",
          "teachers.teacher",
          "_count",
        ],
      },
    },
  });

  const hasData =
    (classesTable.refineCore.tableQuery.data?.data?.length || 0) > 0;
  const isLoading = classesTable.refineCore.tableQuery.isLoading;

  return (
    <ListView>
      <Breadcrumb />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            {isStudent ? "Discover Classes" : "My Classrooms"}
          </h1>
          <p className="text-muted-foreground">
            {isStudent
              ? "Find and join new classes to expand your knowledge."
              : "Manage your students, curriculum, and class activities."}
          </p>
        </div>

        <div className="flex gap-2">
          {isStudent && (
            <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 rounded-xl h-11 px-6 border-primary/20 hover:bg-primary/5 text-primary"
                >
                  <Key className="h-4 w-4" />
                  Join by Code
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join a Class</DialogTitle>
                  <DialogDescription>
                    Enter the 8-character invite code provided by your teacher.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    placeholder="e.g. ABC123XY"
                    value={inviteCode}
                    onChange={(e) =>
                      setInviteCode(e.target.value.toUpperCase())
                    }
                    className="h-12 text-center text-2xl font-bold font-mono tracking-widest"
                    maxLength={8}
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsJoinModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleJoinByCode}
                    disabled={isJoining || inviteCode.length !== 8}
                  >
                    {isJoining ? "Joining..." : "Join Class"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {(isTeacher || isAdmin) && (
            <CreateButton resource="classes" className="h-11 rounded-xl px-6" />
          )}
        </div>
      </div>

      <div className="intro-row bg-muted/30 p-4 rounded-2xl mb-6">
        <div className="actions-row w-full flex flex-col sm:flex-row gap-4">
          <div className="search-field flex-1">
            <Search className="search-icon" />
            <Input
              type="text"
              placeholder="Search classes by name..."
              className="pl-10 w-full h-11 rounded-xl bg-background"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-[200px] h-11 rounded-xl bg-background">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="All Subjects" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject: Subject) => (
                  <SelectItem key={subject.id} value={subject.name}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {!isLoading && !hasData ? (
        <div className="mt-8">
          <EmptyState
            icon={LayoutGrid}
            title="No classes found"
            description={
              isStudent
                ? "You haven't joined any classes yet. Use an invite code to get started."
                : "You haven't created any classes yet."
            }
            action={
              isStudent
                ? {
                    label: "Join a Class",
                    onClick: () => setIsJoinModalOpen(true),
                  }
                : {
                    label: "Create Class",
                    onClick: () => create("classes"),
                  }
            }
          />
        </div>
      ) : (
        <DataTable table={classesTable} />
      )}

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the class and all its curriculum
              data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Class
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ListView>
  );
};

export default ClassesList;

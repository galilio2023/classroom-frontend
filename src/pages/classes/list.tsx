import { Search, Key, LayoutGrid, Globe } from "lucide-react";
import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";
import { useList, HttpError, useGetIdentity, useCustomMutation } from "@refinedev/core";
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

import { Subject, User, UserRole, ClassListItem } from "@/types";
import { toast } from "sonner";

const ClassesList = () => {
  const { data: identity } = useGetIdentity<User>();
  const isStudent = identity?.role === UserRole.STUDENT;
  const isTeacher = identity?.role === UserRole.TEACHER;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [inviteCode, setInviteCode] = useState("");
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const { mutate: joinClass, mutation } = useCustomMutation();
  const isJoining = mutation.isPending;

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
        }
      }
    );
  };

  const classColumns = useMemo<ColumnDef<ClassListItem>[]>(
    () => [
      {
        id: "banner",
        accessorKey: "bannerUrl",
        size: 80,
        header: () => null,
        cell: ({ getValue }) => {
          const bannerUrl = getValue<string>();
          return bannerUrl ? (
            <img
              src={bannerUrl}
              alt="Class banner"
              className="h-10 w-10 rounded-lg object-cover border shadow-sm"
              loading="lazy"
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center">
              <LayoutGrid className="h-5 w-5 text-primary/40" />
            </div>
          );
        },
      },
      {
        id: "name",
        accessorKey: "name",
        size: 250,
        header: () => <p className="column-title">Class Name</p>,
        cell: ({ getValue }) => (
          <span className="text-foreground font-bold">{getValue<string>()}</span>
        ),
      },
      {
        id: "subject",
        accessorKey: "subject.name",
        size: 150,
        header: () => <p className="column-title">Subject</p>,
        cell: ({ getValue }) => {
          const subjectName = getValue<string>();
          return subjectName ? (
            <Badge variant="secondary" className="font-medium">{subjectName}</Badge>
          ) : (
            <span className="text-muted-foreground">Not set</span>
          );
        },
      },
      {
        id: "teacher",
        header: () => <p className="column-title">Primary Teacher</p>,
        cell: ({ row }) => {
          const primaryTeacher = row.original.teachers?.find(t => t.isPrimary)?.teacher;
          return (
            <span className="text-foreground font-medium">
              {primaryTeacher?.name || "Not assigned"}
            </span>
          );
        },
      },
      {
        id: "status",
        accessorKey: "status",
        size: 100,
        header: () => <p className="column-title">Status</p>,
        cell: ({ getValue }) => {
          const status = getValue<"active" | "inactive">();
          return (
            <Badge variant={status === "active" ? "default" : "secondary"} className="capitalize">
              {status}
            </Badge>
          );
        },
      },
      {
        id: "details",
        size: 100,
        header: () => null,
        cell: ({ row }) => (
          <div className="flex justify-end pr-4">
            <Button asChild variant="outline" size="sm" className="rounded-full px-4">
              <Link to={`/classes/show/${row.original.id}`}>Enter Class</Link>
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const { result: subjectsResult } = useList<Subject, HttpError>({
    resource: "subjects",
    pagination: { pageSize: 100 },
  });

  const subjects = subjectsResult?.data ?? [];

  const filters = useMemo(() => {
    const f = [];
    if (selectedSubject !== "all")
      f.push({ field: "subject", operator: "eq" as const, value: selectedSubject });
    if (searchQuery)
      f.push({ field: "name", operator: "contains" as const, value: searchQuery });
    return f;
  }, [selectedSubject, searchQuery]);

  const classesTable = useTable<ClassListItem>({
    columns: classColumns,
    refineCoreProps: {
      resource: "classes",
      pagination: { pageSize: 10, mode: "server" },
      filters: { permanent: filters },
      sorters: { initial: [{ field: "id", order: "desc" }] },
    },
  });

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
                <Button variant="outline" className="gap-2 rounded-xl h-11 px-6 border-primary/20 hover:bg-primary/5 text-primary">
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
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="h-12 text-center text-2xl font-bold font-mono tracking-widest"
                    maxLength={8}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsJoinModalOpen(false)}>Cancel</Button>
                  <Button onClick={handleJoinByCode} disabled={isJoining || inviteCode.length !== 8}>
                    {isJoining ? "Joining..." : "Join Class"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {isTeacher && <CreateButton resource="classes" className="h-11 rounded-xl px-6" />}
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

      <DataTable table={classesTable} />
    </ListView>
  );
};

export default ClassesList;

import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { Search, User, FileText, Calendar, CheckCircle2, Clock, AlertCircle, Eye, BrainCircuit } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/refine-ui/data-table/data-table.tsx";
import { useTable } from "@refinedev/react-table";
import { useNavigation, useGetIdentity } from "@refinedev/core";
import { Submission, User as UserType, UserRole } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { GradingDialog } from "@/pages/assignments/grading-dialog";

const SubmissionsListPage = () => {
  const { data: identity } = useGetIdentity<UserType>();
  const isStaff = identity?.role === UserRole.ADMIN || identity?.role === UserRole.TEACHER;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isGradingOpen, setIsGradingOpen] = useState(false);

  const { show } = useNavigation();

  const handleGradeClick = (submission: Submission) => {
    if (!isStaff) return;
    setSelectedSubmission(submission);
    setIsGradingOpen(true);
  };

  const filters = useMemo(() => {
    const f = [];
    if (searchQuery) {
      f.push({ field: "assignment.title", operator: "contains" as const, value: searchQuery });
    }
    return f;
  }, [searchQuery]);

  const submissionTable = useTable<Submission>({
    columns: useMemo<ColumnDef<Submission>[]>(
      () => [
        {
          id: "student",
          header: () => <p className="column-title">Student</p>,
          accessorKey: "student",
          cell: ({ getValue }) => {
            const student = getValue<UserType>();
            if (!student) return null;
            return (
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={student.image ?? undefined} />
                  <AvatarFallback>{student.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-xs font-medium">{student.name}</span>
                  <span className="text-[10px] text-muted-foreground">{student.email}</span>
                </div>
              </div>
            );
          },
        },
        {
          accessorKey: "assignment.title",
          header: () => <p className="column-title">Assignment</p>,
          cell: ({ getValue }) => (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{getValue<string>()}</span>
            </div>
          )
        },
        {
          accessorKey: "updatedAt",
          header: () => <p className="column-title">Submitted On</p>,
          cell: ({ getValue, row }) => {
            const date = getValue<string>();
            const isLate = row.original.isLate;
            return (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{format(new Date(date), "MMM d, HH:mm")}</span>
                </div>
                {isLate && (
                  <Badge variant="destructive" className="h-4 px-1 text-[8px] uppercase font-black w-fit">
                    Late
                  </Badge>
                )}
              </div>
            );
          }
        },
        {
          accessorKey: "grade",
          header: () => <p className="column-title">Score</p>,
          cell: ({ getValue }) => {
            const grade = getValue<number | null>();
            return grade !== null ? (
              <Badge variant="outline" className="font-bold text-primary border-primary/20">
                {grade} / 100
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px]">Pending</Badge>
            );
          }
        },
        {
          id: "status",
          header: () => <p className="column-title">Status</p>,
          cell: ({ row }) => {
            const isGraded = row.original.grade !== null;
            return isGraded ? (
              <Badge variant="default" className="gap-1 bg-green-500">
                <CheckCircle2 className="h-3 w-3" />
                Graded
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                Submitted
              </Badge>
            );
          }
        },
        {
          id: "actions",
          size: 100,
          header: () => <p className="column-title text-right pr-4">Actions</p>,
          cell: ({ row }) => (
            <div className="flex items-center justify-end gap-2 pr-2">
              {isStaff ? (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handleGradeClick(row.original)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {!row.original.grade && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-primary"
                      onClick={() => handleGradeClick(row.original)}
                    >
                      <BrainCircuit className="h-4 w-4" />
                    </Button>
                  )}
                </>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-[10px] font-bold uppercase"
                  onClick={() => show("assignments", row.original.assignmentId)}
                >
                  View Task
                </Button>
              )}
            </div>
          ),
        },
      ],
      [isStaff, show],
    ),
    refineCoreProps: {
      resource: "submissions",
      pagination: { pageSize: 10, mode: "server" },
      filters: { permanent: filters },
      sorters: { initial: [{ field: "updatedAt", order: "desc" }] },
      meta: {
        populate: ["student", "assignment", "assignment.class"]
      }
    },
  });

  return (
    <>
      <ListView>
        <Breadcrumb />
        <h1 className="page-title">Submissions</h1>
        <div className="intro-row">
          <p>Review and grade student work across all assignments.</p>
          <div className="actions-row">
            <div className="search-field">
              <Search className="search-icon" />
              <Input
                type="text"
                placeholder="Search by assignment title..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DataTable table={submissionTable} />
      </ListView>

      {isStaff && (
        <GradingDialog
            isOpen={isGradingOpen}
            onOpenChange={setIsGradingOpen}
            submission={selectedSubmission}
        />
      )}
    </>
  );
};

export default SubmissionsListPage;

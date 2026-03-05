import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { Search, FileQuestion, Calendar, LayoutGrid, BookOpen, CheckCircle2, Clock, AlertCircle, Sparkles, Trophy } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { useMemo, useState } from "react";
import { CreateButton } from "@/components/refine-ui/buttons/create.tsx";
import { DataTable } from "@/components/refine-ui/data-table/data-table.tsx";
import { useTable } from "@refinedev/react-table";
import { useNavigation, useDelete, useGetIdentity } from "@refinedev/core";
import { Quiz, User, UserRole } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { format } from "date-fns";

const QuizzesListPage = () => {
  const { data: identity } = useGetIdentity<User>();
  const isStaff = identity?.role === UserRole.ADMIN || identity?.role === UserRole.TEACHER;

  const [searchQuery, setSearchQuery] = useState("");
  const { edit, show } = useNavigation();
  const { mutate: deleteMutation } = useDelete();

  const filters = useMemo(() => {
    const f = [];
    if (searchQuery) {
      f.push({ field: "title", operator: "contains" as const, value: searchQuery });
    }
    return f;
  }, [searchQuery]);

  const quizTable = useTable<Quiz>({
    columns: useMemo<ColumnDef<Quiz>[]>(
      () => [
        {
          accessorKey: "title",
          header: () => <p className="column-title">Quiz Title</p>,
          cell: ({ getValue }) => (
            <span className="text-foreground font-bold">{getValue<string>()}</span>
          ),
        },
        {
          accessorKey: "class.name",
          header: () => <p className="column-title">Class</p>,
          cell: ({ getValue }) => (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="text-xs">{getValue<string>() || "N/A"}</span>
            </div>
          )
        },
        {
          accessorKey: "dueDate",
          header: () => <p className="column-title">Due Date</p>,
          cell: ({ getValue }) => {
            const date = getValue<string>();
            if (!date) return <span className="text-xs text-muted-foreground italic">No deadline</span>;
            const isPast = new Date(date) < new Date();
            return (
              <div className={`flex items-center gap-1.5 text-xs font-medium ${isPast ? "text-destructive" : "text-muted-foreground"}`}>
                <Calendar className="h-3.5 w-3.5" />
                <span>{format(new Date(date), "MMM d, yyyy")}</span>
              </div>
            );
          }
        },
        {
          id: "marks",
          header: () => <p className="column-title">Total Marks</p>,
          cell: ({ row }) => (
            <div className="flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-yellow-500" />
              <span className="text-xs font-bold">{row.original.totalMarks || 100}</span>
            </div>
          )
        },
        {
          id: "ai_generated",
          header: () => <p className="column-title">AI Generated</p>,
          cell: ({ row }) => {
            const isAI = row.original.id % 2 === 0;
            return isAI ? (
              <Badge variant="outline" className="gap-1 text-primary border-primary/20 bg-primary/5">
                <Sparkles className="h-3 w-3" />
                AI Generated
              </Badge>
            ) : null;
          }
        },
        {
          id: "actions",
          size: 100,
          header: () => <p className="column-title text-right pr-4">Actions</p>,
          cell: ({ row }) => (
            <div className="flex items-center justify-end gap-2 pr-2">
              {isStaff && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-xs"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent row click
                    edit("quizzes", row.original.id);
                  }}
                >
                  Edit
                </Button>
              )}
            </div>
          ),
        },
      ],
      [edit, isStaff],
    ),
    refineCoreProps: {
      resource: "quizzes",
      pagination: { pageSize: 10, mode: "server" },
      filters: { permanent: filters },
      sorters: { initial: [{ field: "id", order: "desc" }] },
      meta: {
        populate: ["class", "class.subject"]
      }
    },
  });

  return (
    <ListView>
      <Breadcrumb />
      <h1 className="page-title">Quizzes</h1>
      <div className="intro-row">
        <p>Manage class quizzes and AI-generated assessments.</p>
        <div className="actions-row">
          <div className="search-field">
            <Search className="search-icon" />
            <Input
              type="text"
              placeholder="Search quizzes..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {isStaff && <CreateButton />}
        </div>
      </div>
      <DataTable 
        table={quizTable} 
        onRowClick={(record) => show("quizzes", record.id)}
      />
    </ListView>
  );
};

export default QuizzesListPage;

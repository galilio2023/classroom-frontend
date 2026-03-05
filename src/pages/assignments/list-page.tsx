import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { Search, FileText, Calendar, LayoutGrid, BookOpen, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { useMemo, useState } from "react";
import { CreateButton } from "@/components/refine-ui/buttons/create.tsx";
import { DataTable } from "@/components/refine-ui/data-table/data-table.tsx";
import { useTable } from "@refinedev/react-table";
import { useNavigation, useDelete, useGetIdentity } from "@refinedev/core";
import { Assignment, User, UserRole } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
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
import { DataTableRowActions } from "@/components/refine-ui/data-table/row-actions";
import { format } from "date-fns";

const AssignmentsListPage = () => {
  const { data: identity } = useGetIdentity<User>();
  const isStaff = identity?.role === UserRole.ADMIN || identity?.role === UserRole.TEACHER;

  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const { edit, show } = useNavigation();
  const { mutate: deleteMutation } = useDelete();

  const filters = useMemo(() => {
    const f = [];
    if (searchQuery) {
      f.push({ field: "title", operator: "contains" as const, value: searchQuery });
    }
    return f;
  }, [searchQuery]);

  const assignmentTable = useTable<Assignment>({
    columns: useMemo<ColumnDef<Assignment>[]>(
      () => [
        {
          accessorKey: "title",
          header: () => <p className="column-title">Assignment Title</p>,
          cell: ({ getValue }) => (
            <span className="text-foreground font-bold">{getValue<string>()}</span>
          ),
        },
        {
          accessorKey: "class.name",
          header: () => <p className="column-title">Class</p>,
          cell: ({ row }) => (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="text-xs">{(row.original as any).class?.name || "N/A"}</span>
            </div>
          )
        },
        {
          accessorKey: "class.subject.name",
          header: () => <p className="column-title">Subject</p>,
          cell: ({ row }) => (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              <span className="text-xs">{(row.original as any).class?.subject?.name || "N/A"}</span>
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
          id: "status",
          header: () => <p className="column-title">Status</p>,
          cell: ({ row }) => {
            const dueDate = row.original.dueDate;
            if (!dueDate) return <Badge variant="secondary">Draft</Badge>;
            const isPast = new Date(dueDate) < new Date();
            return isPast ? (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                Closed
              </Badge>
            ) : (
              <Badge variant="default" className="gap-1 bg-green-500 hover:bg-green-600">
                <CheckCircle2 className="h-3 w-3" />
                Published
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
              {isStaff && (
                <DataTableRowActions
                  resource="assignments"
                  recordId={row.original.id}
                  onEdit={() => edit("assignments", row.original.id)}
                  onDelete={() => setDeleteTarget(row.original.id)}
                />
              )}
            </div>
          ),
        },
      ],
      [edit, isStaff],
    ),
    refineCoreProps: {
      resource: "assignments",
      pagination: { pageSize: 10, mode: "server" },
      filters: { permanent: filters },
      sorters: { initial: [{ field: "id", order: "desc" }] },
      meta: {
        populate: ["class", "class.subject"]
      }
    },
  });

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteMutation({
        resource: "assignments",
        id: deleteTarget,
        mutationMode: "pessimistic",
      });
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <ListView>
        <Breadcrumb />
        <h1 className="page-title">Assignments</h1>
        <div className="intro-row">
          <p>Track and manage all class assignments and student tasks.</p>
          <div className="actions-row">
            <div className="search-field">
              <Search className="search-icon" />
              <Input
                type="text"
                placeholder="Search assignments..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {isStaff && <CreateButton />}
          </div>
        </div>
        <DataTable 
            table={assignmentTable} 
            onRowClick={(record) => show("assignments", record.id)}
        />
      </ListView>

      <AlertDialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the assignment and all associated student submissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AssignmentsListPage;

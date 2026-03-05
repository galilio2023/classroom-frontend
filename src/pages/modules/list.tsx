import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { Search, Library, LayoutGrid, BookOpen, CheckCircle2, Clock, AlertCircle, Sparkles, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { useMemo, useState } from "react";
import { CreateButton } from "@/components/refine-ui/buttons/create.tsx";
import { DataTable } from "@/components/refine-ui/data-table/data-table.tsx";
import { useTable } from "@refinedev/react-table";
import { useNavigation, useDelete, useGetIdentity } from "@refinedev/core";
import { Module, User, UserRole } from "@/types";
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

const ModulesListPage = () => {
  const { data: identity } = useGetIdentity<User>();
  const isStaff = identity?.role === UserRole.ADMIN || identity?.role === UserRole.TEACHER;

  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const { edit } = useNavigation();
  const { mutate: deleteMutation } = useDelete();

  const filters = useMemo(() => {
    const f = [];
    if (searchQuery) {
      f.push({ field: "name", operator: "contains" as const, value: searchQuery });
    }
    return f;
  }, [searchQuery]);

  const moduleTable = useTable<Module>({
    columns: useMemo<ColumnDef<Module>[]>(
      () => [
        {
          accessorKey: "order",
          header: () => <p className="column-title">Order</p>,
          cell: ({ getValue }) => (
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-muted-foreground">
              <ArrowUpDown className="h-3 w-3" />
              {getValue<number>()}
            </div>
          ),
        },
        {
          accessorKey: "name",
          header: () => <p className="column-title">Module Title</p>,
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
          id: "content_stats",
          header: () => <p className="column-title">Content</p>,
          cell: ({ row }) => {
            const assignments = row.original.assignments?.length || 0;
            const resources = row.original.resources?.length || 0;
            return (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] h-5">{resources} Resources</Badge>
                <Badge variant="outline" className="text-[10px] h-5">{assignments} Tasks</Badge>
              </div>
            );
          }
        },
        {
          id: "status",
          header: () => <p className="column-title">Status</p>,
          cell: ({ row }) => {
            // Mock published status
            const isPublished = row.original.id % 2 === 0;
            return isPublished ? (
              <Badge variant="default" className="gap-1 bg-green-500">
                <CheckCircle2 className="h-3 w-3" />
                Published
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                Draft
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
                  resource="modules"
                  recordId={row.original.id}
                  onEdit={() => edit("modules", row.original.id)}
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
      resource: "modules",
      pagination: { pageSize: 10, mode: "server" },
      filters: { permanent: filters },
      sorters: { initial: [{ field: "order", order: "asc" }] },
      meta: {
        populate: ["class", "assignments", "resources"]
      }
    },
  });

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteMutation({
        resource: "modules",
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
        <h1 className="page-title">Modules</h1>
        <div className="intro-row">
          <p>Organize your course content into structured learning modules.</p>
          <div className="actions-row">
            <div className="search-field">
              <Search className="search-icon" />
              <Input
                type="text"
                placeholder="Search modules..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {isStaff && <CreateButton />}
          </div>
        </div>
        <DataTable table={moduleTable} />
      </ListView>

      <AlertDialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the module and all its content associations.
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

export default ModulesListPage;

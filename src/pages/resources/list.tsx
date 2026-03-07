import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { Search, FolderOpen, FileText, Link as LinkIcon, Video, Image as ImageIcon, LayoutGrid, User, Calendar, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { useMemo, useState } from "react";
import { CreateButton } from "@/components/refine-ui/buttons/create.tsx";
import { DataTable } from "@/components/refine-ui/data-table/data-table.tsx";
import { useTable } from "@refinedev/react-table";
import { useNavigation, useDelete, useGetIdentity } from "@refinedev/core";
import { Resource, User as UserType, UserRole } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { format } from "date-fns";
import { DataTableRowActions } from "@/components/refine-ui/data-table/row-actions";
import { EmptyState } from "@/components/empty-state";
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

const ResourcesListPage = () => {
  const { data: identity } = useGetIdentity<UserType>();
  const isStaff = identity?.role === UserRole.ADMIN || identity?.role === UserRole.TEACHER;

  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const { edit, create } = useNavigation();
  const { mutate: deleteMutation } = useDelete();

  const filters = useMemo(() => {
    const f = [];
    if (searchQuery) {
      f.push({ field: "title", operator: "contains" as const, value: searchQuery });
    }
    return f;
  }, [searchQuery]);

  const getIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-4 w-4 text-red-500" />;
      case "link": return <LinkIcon className="h-4 w-4 text-blue-500" />;
      case "image": return <ImageIcon className="h-4 w-4 text-green-500" />;
      case "note": return <FileText className="h-4 w-4 text-amber-500" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const resourceTable = useTable<Resource>({
    columns: useMemo<ColumnDef<Resource>[]>(
      () => [
        {
          accessorKey: "title",
          header: () => <p className="column-title">Resource Title</p>,
          cell: ({ getValue, row }) => (
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-muted/50 rounded-md">
                {getIcon(row.original.type)}
              </div>
              <span className="text-foreground font-bold">{getValue<string>()}</span>
            </div>
          ),
        },
        {
          accessorKey: "type",
          header: () => <p className="column-title">Type</p>,
          cell: ({ getValue }) => (
            <Badge variant="secondary" className="capitalize text-[10px]">{getValue<string>()}</Badge>
          )
        },
        {
          accessorKey: "class.name",
          header: () => <p className="column-title">Class</p>,
          cell: ({ getValue }) => (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="text-xs">{getValue<string>() || "Global"}</span>
            </div>
          )
        },
        {
          accessorKey: "createdAt",
          header: () => <p className="column-title">Uploaded On</p>,
          cell: ({ getValue }) => (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{format(new Date(getValue<string>()), "MMM d, yyyy")}</span>
            </div>
          )
        },
        {
          id: "actions",
          size: 100,
          header: () => <p className="column-title text-right pr-4">Actions</p>,
          cell: ({ row }) => (
            <div className="flex items-center justify-end gap-2 pr-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <a href={row.original.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              {isStaff && (
                <DataTableRowActions
                  resource="resources"
                  recordId={row.original.id}
                  onEdit={() => edit("resources", row.original.id)}
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
      resource: "resources",
      pagination: { pageSize: 10, mode: "server" },
      filters: { permanent: filters },
      sorters: { initial: [{ field: "id", order: "desc" }] },
      meta: {
        populate: ["class"]
      }
    },
  });

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteMutation({
        resource: "resources",
        id: deleteTarget,
        mutationMode: "pessimistic",
      });
      setDeleteTarget(null);
    }
  };

  const hasData = (resourceTable.refineCore.tableQuery.data?.data?.length || 0) > 0;
  const isLoading = resourceTable.refineCore.tableQuery.isLoading;

  return (
    <>
      <ListView>
        <Breadcrumb />
        <h1 className="page-title">Resources</h1>
        <div className="intro-row">
          <p>Manage and share learning materials, documents, and media.</p>
          <div className="actions-row">
            <div className="search-field">
              <Search className="search-icon" />
              <Input
                type="text"
                placeholder="Search resources..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {isStaff && <CreateButton />}
          </div>
        </div>
        
        {!isLoading && !hasData ? (
          <div className="mt-8">
            <EmptyState
              icon={FolderOpen}
              title="No resources found"
              description={isStaff ? "Upload your first resource to share it with your students." : "There are no resources available yet."}
              action={isStaff ? {
                label: "Upload Resource",
                onClick: () => create("resources"),
              } : undefined}
            />
          </div>
        ) : (
          <DataTable table={resourceTable} />
        )}
      </ListView>

      <AlertDialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the resource.
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

export default ResourcesListPage;

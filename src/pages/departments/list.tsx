import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { useMemo, useState } from "react";
import { CreateButton } from "@/components/refine-ui/buttons/create.tsx";
import { DataTable } from "@/components/refine-ui/data-table/data-table.tsx";
import { useTable } from "@refinedev/react-table";
import { useNavigation, useDelete } from "@refinedev/core";
import { Department } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge.tsx";
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

const DepartmentsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const { edit } = useNavigation();
  const { mutate: deleteMutation } = useDelete();

  const filters = useMemo(() => {
    const f = [];
    if (searchQuery) {
      f.push({ field: "search", operator: "contains" as const, value: searchQuery });
    }
    return f;
  }, [searchQuery]);

  const departmentTable = useTable<Department>({
    columns: useMemo<ColumnDef<Department>[]>(
      () => [
        { 
          accessorKey: "code", 
          size: 100, 
          header: () => <p className="column-title ml-2">Code</p>, 
          cell: ({ getValue }) => <Badge>{getValue<string>()}</Badge> 
        },
        { 
          accessorKey: "name", 
          size: 200, 
          header: () => <p className="column-title">Name</p>, 
          cell: ({ getValue }) => <span className="text-foreground">{getValue<string>()}</span> 
        },
        { 
          accessorKey: "description", 
          size: 300, 
          header: () => <p className="column-title">Description</p>, 
          cell: ({ getValue }) => <span className="truncate line-clamp-2">{getValue<string>()}</span> 
        },
        {
          id: "actions",
          size: 50,
          header: () => null,
          cell: ({ row }) => (
            <DataTableRowActions
              onEdit={() => edit("departments", row.original.id)}
              onDelete={() => setDeleteTarget(row.original.id)}
              editLabel="Edit Department"
              deleteLabel="Delete Department"
            />
          ),
        },
      ],
      [edit],
    ),
    refineCoreProps: {
      resource: "departments",
      pagination: { pageSize: 10, mode: "server" },
      filters: { permanent: filters },
      sorters: { initial: [{ field: "id", order: "desc" }] },
    },
  });

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteMutation({
        resource: "departments",
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
        <h1 className="page-title">Departments</h1>
        <div className="intro-row">
          <p>Manage your academic departments and faculties.</p>
          <div className="actions-row">
            <div className="search-field">
              <Search className="search-icon" />
              <Input type="text" placeholder="Search by name or code..." className="pl-10 w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <CreateButton />
          </div>
        </div>
        <DataTable table={departmentTable} />
      </ListView>

      <AlertDialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the department.
              <br /><br />
              <span className="font-semibold text-red-500">Warning:</span> You cannot delete a department if it still has subjects assigned to it.
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
export default DepartmentsList;

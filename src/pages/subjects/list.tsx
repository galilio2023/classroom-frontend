import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { Search, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { CreateButton } from "@/components/refine-ui/buttons/create.tsx";
import { DataTable } from "@/components/refine-ui/data-table/data-table.tsx";
import { useTable } from "@refinedev/react-table";
import { useSelect, useNavigation, useDelete } from "@refinedev/core";
import { Subject, Department } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
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

const SubjectsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null); // State for the delete modal

  const { edit } = useNavigation();
  const { mutate: deleteMutation } = useDelete();

  const { options: departmentOptions } = useSelect<Department>({
    resource: "departments",
    optionLabel: "name",
    optionValue: "name",
  });

  const filters = useMemo(() => {
    const f = [];
    if (searchQuery) {
      f.push({ field: "search", operator: "contains" as const, value: searchQuery });
    }
    if (selectedDepartment && selectedDepartment !== "all") {
      f.push({ field: "department", operator: "eq" as const, value: selectedDepartment });
    }
    return f;
  }, [searchQuery, selectedDepartment]);

  const subjectTable = useTable<Subject>({
    columns: useMemo<ColumnDef<Subject>[]>(
      () => [
        { accessorKey: "code", size: 100, header: () => <p className="column-title ml-2">Code</p>, cell: ({ getValue }) => <Badge>{getValue<string>()}</Badge> },
        { accessorKey: "name", size: 200, header: () => <p className="column-title">Name</p>, cell: ({ getValue }) => <span className="text-foreground">{getValue<string>()}</span> },
        { accessorKey: "department", size: 150, header: () => <p className="column-title">Department</p>, cell: ({ getValue }) => { const department = getValue<Department>(); return <Badge variant="secondary">{department?.name}</Badge>; } },
        { accessorKey: "description", size: 300, header: () => <p className="column-title">Description</p>, cell: ({ getValue }) => <span className="truncate line-clamp-2">{getValue<string>()}</span> },
        {
          id: "actions",
          header: () => <div className="text-right mr-4">Actions</div>,
          cell: ({ row }) => {
            const subject = row.original;
            return (
              <div className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => edit("subjects", subject.id)} className="flex items-center gap-2 cursor-pointer">
                      <Pencil className="h-4 w-4" />
                      <span>Edit Subject</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setDeleteTarget(subject.id)} className="flex items-center gap-2 text-red-500 focus:text-red-500 cursor-pointer">
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Subject</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          },
        },
      ],
      [edit],
    ),
    refineCoreProps: {
      resource: "subjects",
      pagination: { pageSize: 10, mode: "server" },
      filters: { permanent: filters },
      sorters: { initial: [{ field: "id", order: "desc" }] },
    },
  });

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteMutation({
        resource: "subjects",
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
        <h1 className="page-title">Subjects</h1>
        <div className="intro-row">
          <p>Quick access to essential metrics and management tools.</p>
          <div className="actions-row">
            <div className="search-field">
              <Search className="search-icon" />
              <Input type="text" placeholder="Search by name or code..." className="pl-10 w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger><SelectValue placeholder="Filter by department" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departmentOptions.map(({ value, label }) => (
                    <SelectItem value={String(value)} key={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <CreateButton />
            </div>
          </div>
        </div>
        <DataTable table={subjectTable} />
      </ListView>

      {/* The Delete Confirmation Dialog */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the subject and remove its data from our servers.
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
export default SubjectsList;

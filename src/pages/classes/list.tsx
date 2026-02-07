import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { Search, Copy, Check } from "lucide-react";
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
import { useNavigation, useDelete } from "@refinedev/core";
import { Class, ClassStatus, Subject, User } from "@/types";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const statusVariants: Record<ClassStatus, "default" | "secondary" | "destructive" | "outline"> = {
  [ClassStatus.ACTIVE]: "default",
  [ClassStatus.INACTIVE]: "secondary",
  [ClassStatus.ARCHIVED]: "outline",
};

const ClassesList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const { edit } = useNavigation();
  const { mutate: deleteMutation } = useDelete();

  const filters = useMemo(() => {
    const f = [];
    if (searchQuery) {
      f.push({ field: "search", operator: "contains" as const, value: searchQuery });
    }
    if (selectedStatus && selectedStatus !== "all") {
      f.push({ field: "status", operator: "eq" as const, value: selectedStatus });
    }
    return f;
  }, [searchQuery, selectedStatus]);

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Invite code copied to clipboard");
  };

  const classTable = useTable<Class>({
    columns: useMemo<ColumnDef<Class>[]>(
      () => [
        { 
          accessorKey: "name", 
          size: 200, 
          header: () => <p className="column-title ml-2">Class Name</p>, 
          cell: ({ getValue }) => <span className="text-foreground font-medium">{getValue<string>()}</span> 
        },
        { 
          accessorKey: "subject", 
          size: 150, 
          header: () => <p className="column-title">Subject</p>, 
          cell: ({ getValue }) => {
            const subject = getValue<Subject>();
            return <Badge variant="outline">{subject?.name}</Badge>;
          } 
        },
        { 
          accessorKey: "teacher", 
          size: 200, 
          header: () => <p className="column-title">Teacher</p>, 
          cell: ({ getValue }) => {
            const teacher = getValue<User>();
            return (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={teacher?.image} />
                  <AvatarFallback>{teacher?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{teacher?.name}</span>
              </div>
            );
          } 
        },
        { 
          accessorKey: "status", 
          size: 100, 
          header: () => <p className="column-title">Status</p>, 
          cell: ({ getValue }) => {
            const status = getValue<ClassStatus>();
            return <Badge variant={statusVariants[status]} className="capitalize">{status}</Badge>;
          } 
        },
        { 
          accessorKey: "inviteCode", 
          size: 150, 
          header: () => <p className="column-title">Invite Code</p>, 
          cell: ({ getValue }) => {
            const code = getValue<string>();
            return (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 gap-2 text-muted-foreground hover:text-foreground"
                onClick={() => copyInviteCode(code)}
              >
                <span className="font-mono">{code}</span>
                <Copy className="h-3 w-3" />
              </Button>
            );
          } 
        },
        {
          id: "actions",
          size: 50,
          header: () => null,
          cell: ({ row }) => (
            <DataTableRowActions
              onEdit={() => edit("classes", row.original.id)}
              onDelete={() => setDeleteTarget(row.original.id)}
              editLabel="Edit Class"
              deleteLabel="Delete Class"
            />
          ),
        },
      ],
      [edit],
    ),
    refineCoreProps: {
      resource: "classes",
      pagination: { pageSize: 10, mode: "server" },
      filters: { permanent: filters },
      sorters: { initial: [{ field: "createdAt", order: "desc" }] },
    },
  });

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteMutation({
        resource: "classes",
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
        <h1 className="page-title">Classes</h1>
        <div className="intro-row">
          <p>Manage your active classes and schedules.</p>
          <div className="actions-row">
            <div className="search-field">
              <Search className="search-icon" />
              <Input type="text" placeholder="Search by name..." className="pl-10 w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={ClassStatus.ACTIVE}>Active</SelectItem>
                  <SelectItem value={ClassStatus.INACTIVE}>Inactive</SelectItem>
                  <SelectItem value={ClassStatus.ARCHIVED}>Archived</SelectItem>
                </SelectContent>
              </Select>
              <CreateButton />
            </div>
          </div>
        </div>
        <DataTable table={classTable} />
      </ListView>

      <AlertDialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the class and all student enrollments associated with it.
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
export default ClassesList;

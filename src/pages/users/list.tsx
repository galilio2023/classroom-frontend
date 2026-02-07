import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { Search } from "lucide-react";
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
import { User, UserRole } from "@/types";
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

const roleVariants: Record<UserRole, "default" | "secondary" | "destructive" | "outline"> = {
  [UserRole.ADMIN]: "destructive",
  [UserRole.TEACHER]: "default",
  [UserRole.STUDENT]: "secondary",
};

const UsersList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { edit } = useNavigation();
  const { mutate: deleteMutation } = useDelete();

  const filters = useMemo(() => {
    const f = [];
    if (searchQuery) {
      f.push({ field: "search", operator: "contains" as const, value: searchQuery });
    }
    if (selectedRole && selectedRole !== "all") {
      f.push({ field: "role", operator: "eq" as const, value: selectedRole });
    }
    return f;
  }, [searchQuery, selectedRole]);

  const userTable = useTable<User>({
    columns: useMemo<ColumnDef<User>[]>(
      () => [
        {
          id: "avatar",
          size: 50,
          header: () => null,
          cell: ({ row }) => {
            const user = row.original;
            return (
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            );
          },
        },
        { 
          accessorKey: "name", 
          size: 200, 
          header: () => <p className="column-title">Name</p>, 
          cell: ({ getValue }) => <span className="text-foreground font-medium">{getValue<string>()}</span> 
        },
        { 
          accessorKey: "email", 
          size: 250, 
          header: () => <p className="column-title">Email</p>, 
          cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<string>()}</span> 
        },
        { 
          accessorKey: "role", 
          size: 100, 
          header: () => <p className="column-title">Role</p>, 
          cell: ({ getValue }) => {
            const role = getValue<UserRole>();
            return <Badge variant={roleVariants[role] || "outline"} className="capitalize">{role}</Badge>;
          } 
        },
        {
          id: "actions",
          size: 50,
          header: () => null,
          cell: ({ row }) => (
            <DataTableRowActions
              onEdit={() => edit("users", row.original.id)}
              onDelete={() => setDeleteTarget(row.original.id)}
              editLabel="Edit User"
              deleteLabel="Delete User"
            />
          ),
        },
      ],
      [edit],
    ),
    refineCoreProps: {
      resource: "users",
      pagination: { pageSize: 10, mode: "server" },
      filters: { permanent: filters },
      sorters: { initial: [{ field: "createdAt", order: "desc" }] },
    },
  });

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteMutation({
        resource: "users",
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
        <h1 className="page-title">Users</h1>
        <div className="intro-row">
          <p>Manage teachers, students, and administrators.</p>
          <div className="actions-row">
            <div className="search-field">
              <Search className="search-icon" />
              <Input type="text" placeholder="Search by name or email..." className="pl-10 w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Filter by role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                  <SelectItem value={UserRole.TEACHER}>Teacher</SelectItem>
                  <SelectItem value={UserRole.STUDENT}>Student</SelectItem>
                </SelectContent>
              </Select>
              <CreateButton />
            </div>
          </div>
        </div>
        <DataTable table={userTable} />
      </ListView>

      <AlertDialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account.
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
export default UsersList;

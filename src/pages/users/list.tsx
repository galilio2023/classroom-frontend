import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { Search, ShieldCheck, ShieldAlert, FileText, CheckCircle2, XCircle, ExternalLink, Loader2, Trash2, Pencil } from "lucide-react";
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
import { useNavigation, useDelete, useGetIdentity, useUpdate } from "@refinedev/core";
import { User, UserRole } from "@/types";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

const roleVariants: Record<
  UserRole,
  "default" | "secondary" | "destructive" | "outline"
> = {
  [UserRole.ADMIN]: "destructive",
  [UserRole.TEACHER]: "default",
  [UserRole.STUDENT]: "secondary",
};

const UsersList = () => {
  const { data: identity } = useGetIdentity<User>();
  const isAdmin = identity?.role === UserRole.ADMIN;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [verificationTarget, setVerificationTarget] = useState<User | null>(null);

  const { edit } = useNavigation();
  const { mutate: deleteMutation } = useDelete();
  const { mutate: updateMutation, mutation } = useUpdate();
  const isUpdating = mutation.isPending;

  const filters = useMemo(() => {
    const f = [];
    if (searchQuery) {
      f.push({
        field: "search",
        operator: "contains" as const,
        value: searchQuery,
      });
    }
    if (selectedRole && selectedRole !== "all") {
      f.push({ field: "role", operator: "eq" as const, value: selectedRole });
    }
    if (verificationFilter === "pending") {
      f.push({ field: "role", operator: "eq" as const, value: UserRole.TEACHER });
      f.push({ field: "isVerified", operator: "eq" as const, value: false });
    }
    return f;
  }, [searchQuery, selectedRole, verificationFilter]);

  const handleVerify = (id: string, isVerified: boolean) => {
    updateMutation({
      resource: "users",
      id,
      values: { isVerified },
    }, {
      onSuccess: () => {
        toast.success(isVerified ? "Teacher verified successfully!" : "Verification rejected.");
        setVerificationTarget(null);
      }
    });
  };

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
                <AvatarImage src={user.image ?? undefined} alt={user.name} />
                <AvatarFallback>
                  {user.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            );
          },
        },
        {
          accessorKey: "name",
          size: 200,
          header: () => <p className="column-title">Name</p>,
          cell: ({ getValue }) => (
            <span className="text-foreground font-medium">
              {getValue<string>()}
            </span>
          ),
        },
        {
          accessorKey: "email",
          size: 250,
          header: () => <p className="column-title">Email</p>,
          cell: ({ getValue }) => (
            <span className="text-muted-foreground">{getValue<string>()}</span>
          ),
        },
        {
          accessorKey: "role",
          size: 100,
          header: () => <p className="column-title">Role</p>,
          cell: ({ getValue, row }) => {
            const role = getValue<UserRole>();
            const isVerified = row.original.isVerified;
            return (
              <div className="flex items-center gap-2">
                <Badge variant={roleVariants[role] || "outline"} className="capitalize">
                  {role}
                </Badge>
                {role === UserRole.TEACHER && (
                  isVerified ? (
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                  ) : (
                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                  )
                )}
              </div>
            );
          },
        },
        {
          id: "verification",
          header: () => <p className="column-title">Verification</p>,
          cell: ({ row }) => {
            const user = row.original;
            if (user.role !== UserRole.TEACHER) return null;
            
            return (
              <Button 
                variant="ghost" 
                size="sm" 
                className={user.isVerified ? "text-green-600" : "text-amber-600 font-bold"}
                onClick={() => setVerificationTarget(user)}
              >
                {user.isVerified ? "Verified" : "Review Proof"}
              </Button>
            );
          }
        },
        {
          id: "actions",
          size: 100,
          header: () => <p className="column-title text-right pr-4">Actions</p>,
          cell: ({ row }) => (
            <div className="flex items-center justify-end gap-2 pr-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => edit("users", row.original.id)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              {isAdmin && row.original.id !== identity?.id && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteTarget(row.original.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ),
        },
      ],
      [edit, isAdmin, identity?.id],
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
              <Input
                type="text"
                placeholder="Search by name or email..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Verification Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending Teachers</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                  <SelectItem value={UserRole.TEACHER}>Teacher</SelectItem>
                  <SelectItem value={UserRole.STUDENT}>Student</SelectItem>
                </SelectContent>
              </Select>
              {isAdmin && <CreateButton />}
            </div>
          </div>
        </div>
        <DataTable table={userTable} />
      </ListView>

      {/* Verification Dialog */}
      <Dialog open={verificationTarget !== null} onOpenChange={() => setVerificationTarget(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Teacher Verification Review
            </DialogTitle>
            <DialogDescription>
              Review the credentials for {verificationTarget?.name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">Full Name</p>
                <p className="font-medium">{verificationTarget?.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">Email</p>
                <p className="font-medium">{verificationTarget?.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">Phone</p>
                <p className="font-medium">{verificationTarget?.phoneNumber || "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">Status</p>
                <Badge variant={verificationTarget?.isVerified ? "default" : "secondary"}>
                  {verificationTarget?.isVerified ? "Verified" : "Pending Approval"}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase">Verification Document</p>
              {verificationTarget?.verificationDocumentUrl ? (
                <div className="border rounded-xl p-4 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Teaching Credentials Proof</p>
                      <p className="text-xs text-muted-foreground">Uploaded during registration</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={verificationTarget.verificationDocumentUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Document
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="border border-dashed rounded-xl p-8 text-center text-muted-foreground">
                  No document uploaded.
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              className="text-destructive hover:bg-destructive/5"
              onClick={() => handleVerify(verificationTarget!.id, false)}
              disabled={isUpdating}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button 
              onClick={() => handleVerify(verificationTarget!.id, true)}
              disabled={isUpdating || !verificationTarget?.verificationDocumentUrl}
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Approve & Verify Teacher
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
export default UsersList;

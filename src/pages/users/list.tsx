import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { Search, ShieldCheck, ShieldAlert, FileText, CheckCircle2, XCircle, ExternalLink, Loader2, Trash2, Pencil, Building2, UserCircle, Activity, Ban, UserCheck } from "lucide-react";
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
import { User, UserRole, UserStatus } from "@/types";
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
import { cn } from "@/lib/utils";

const roleVariants: Record<
  UserRole,
  "default" | "secondary" | "destructive" | "outline"
> = {
  [UserRole.ADMIN]: "destructive",
  [UserRole.TEACHER]: "default",
  [UserRole.STUDENT]: "secondary",
};

const statusVariants: Record<
  UserStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  [UserStatus.ACTIVE]: "default",
  [UserStatus.INACTIVE]: "secondary",
  [UserStatus.SUSPENDED]: "destructive",
};

const UsersList = () => {
  const { data: identity } = useGetIdentity<User>();
  const isAdmin = identity?.role === UserRole.ADMIN;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
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
      f.push({ field: "search", operator: "contains" as const, value: searchQuery });
    }
    if (selectedRole && selectedRole !== "all") {
      f.push({ field: "role", operator: "eq" as const, value: selectedRole });
    }
    if (selectedStatus && selectedStatus !== "all") {
      f.push({ field: "status", operator: "eq" as const, value: selectedStatus });
    }
    if (verificationFilter === "pending") {
      f.push({ field: "role", operator: "eq" as const, value: UserRole.TEACHER });
      f.push({ field: "isVerified", operator: "eq" as const, value: false });
    }
    return f;
  }, [searchQuery, selectedRole, selectedStatus, verificationFilter]);

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

  const handleStatusChange = (id: string, status: UserStatus) => {
    updateMutation({
      resource: "users",
      id,
      values: { status },
    }, {
      onSuccess: () => {
        toast.success(`User status updated to ${status}`);
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
              <Avatar className="h-9 w-9 border-2 border-primary/10">
                <AvatarImage src={user.image ?? undefined} alt={user.name} />
                <AvatarFallback className="bg-primary/5 text-primary font-bold">
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
            <span className="text-foreground font-bold">
              {getValue<string>()}
            </span>
          ),
        },
        {
          accessorKey: "email",
          size: 250,
          header: () => <p className="column-title">Email</p>,
          cell: ({ getValue }) => (
            <span className="text-muted-foreground text-xs font-medium">{getValue<string>()}</span>
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
                <Badge variant={roleVariants[role] || "outline"} className="capitalize text-[10px] font-black tracking-widest px-2 h-5">
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
          accessorKey: "department.name",
          header: () => <p className="column-title">Department</p>,
          cell: ({ getValue }) => {
            const dept = getValue<string>();
            return dept ? (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{dept}</span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground/50 italic">None</span>
            );
          }
        },
        {
          accessorKey: "status",
          header: () => <p className="column-title">Status</p>,
          cell: ({ getValue, row }) => {
            const status = getValue<UserStatus>() || UserStatus.ACTIVE;
            if (!isAdmin || row.original.id === identity?.id) {
                return (
                    <Badge variant={statusVariants[status]} className="capitalize text-[10px] h-5 font-black tracking-widest">
                        {status}
                    </Badge>
                );
            }
            return (
                <Select 
                    value={status} 
                    onValueChange={(val) => handleStatusChange(row.original.id, val as UserStatus)}
                    disabled={isUpdating}
                >
                    <SelectTrigger className={cn(
                        "h-7 w-[110px] text-[10px] font-black uppercase tracking-widest border-none shadow-none focus:ring-0",
                        status === UserStatus.ACTIVE ? "bg-green-500/10 text-green-600" : 
                        status === UserStatus.SUSPENDED ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                    )}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={UserStatus.ACTIVE} className="text-[10px] font-black uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <UserCheck className="h-3 w-3" />
                                Active
                            </div>
                        </SelectItem>
                        <SelectItem value={UserStatus.SUSPENDED} className="text-[10px] font-black uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <Ban className="h-3 w-3" />
                                Suspended
                            </div>
                        </SelectItem>
                        <SelectItem value={UserStatus.INACTIVE} className="text-[10px] font-black uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <Activity className="h-3 w-3" />
                                Inactive
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            );
          }
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
                className={cn(
                    "h-7 text-[10px] font-black uppercase tracking-widest",
                    user.isVerified ? "text-green-600" : "text-amber-600 bg-amber-500/5 hover:bg-amber-500/10"
                )}
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
      [edit, isAdmin, identity?.id, isUpdating],
    ),
    refineCoreProps: {
      resource: "users",
      pagination: { pageSize: 10, mode: "server" },
      filters: { permanent: filters },
      sorters: { initial: [{ field: "createdAt", order: "desc" }] },
      meta: {
        populate: ["department"]
      }
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
        <h1 className="page-title">User Governance</h1>
        <div className="intro-row">
          <p>Manage teachers, students, and administrators. Oversee verification and account status.</p>
          <div className="actions-row">
            <div className="search-field flex-1">
              <Search className="search-icon" />
              <Input
                type="text"
                placeholder="Search by name or email..."
                className="pl-10 w-full h-11 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                <SelectTrigger className="w-[180px] h-11 rounded-xl">
                  <SelectValue placeholder="Verification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Verification</SelectItem>
                  <SelectItem value="pending">Pending Teachers</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[140px] h-11 rounded-xl">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                  <SelectItem value={UserRole.TEACHER}>Teacher</SelectItem>
                  <SelectItem value={UserRole.STUDENT}>Student</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[140px] h-11 rounded-xl">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={UserStatus.ACTIVE}>Active</SelectItem>
                  <SelectItem value={UserStatus.SUSPENDED}>Suspended</SelectItem>
                  <SelectItem value={UserStatus.INACTIVE}>Inactive</SelectItem>
                </SelectContent>
              </Select>
              {isAdmin && <CreateButton className="h-11 rounded-xl px-6" />}
            </div>
          </div>
        </div>
        <DataTable table={userTable} />
      </ListView>

      {/* Verification Dialog */}
      <Dialog open={verificationTarget !== null} onOpenChange={() => setVerificationTarget(null)}>
        <DialogContent className="max-w-2xl overflow-hidden">
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
            <div className="grid grid-cols-2 gap-6 bg-muted/30 p-4 rounded-2xl border">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Name</p>
                <p className="font-bold">{verificationTarget?.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email</p>
                <p className="font-bold">{verificationTarget?.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phone</p>
                <p className="font-bold">{verificationTarget?.phoneNumber || "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</p>
                <Badge variant={verificationTarget?.isVerified ? "default" : "secondary"} className="h-5 text-[10px] font-black uppercase tracking-widest">
                  {verificationTarget?.isVerified ? "Verified" : "Pending Approval"}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Verification Document</p>
              {verificationTarget?.verificationDocumentUrl ? (
                <div className="border-2 border-primary/10 rounded-2xl p-6 flex flex-col items-center gap-4 bg-card shadow-inner">
                  <div className="flex items-center gap-4 w-full">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black">Teaching Credentials Proof</p>
                      <p className="text-xs text-muted-foreground font-medium">Uploaded by teacher for verification</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl font-bold h-10" asChild>
                        <a href={verificationTarget.verificationDocumentUrl} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Full
                        </a>
                    </Button>
                  </div>
                  
                  {/* Inline Preview if image */}
                  {verificationTarget.verificationDocumentUrl.match(/\.(jpg|jpeg|png|webp)$/i) && (
                    <div className="w-full h-48 rounded-xl overflow-hidden border bg-muted">
                        <img src={verificationTarget.verificationDocumentUrl} alt="Proof" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-2xl p-12 text-center text-muted-foreground bg-muted/10">
                  <ShieldAlert className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-widest">No document uploaded.</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t">
            <Button 
              variant="outline" 
              className="text-destructive border-destructive/20 hover:bg-destructive/5 font-black uppercase tracking-widest text-[10px] h-11 px-6"
              onClick={() => handleVerify(verificationTarget!.id, false)}
              disabled={isUpdating}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button 
              className="font-black uppercase tracking-widest text-[10px] h-11 px-8 shadow-lg shadow-primary/20"
              onClick={() => handleVerify(verificationTarget!.id, true)}
              disabled={isUpdating}
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
              user account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
export default UsersList;

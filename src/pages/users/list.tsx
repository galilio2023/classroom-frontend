import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  FileText,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  Trash2,
  Pencil,
  Building2,
  UserCheck,
  Users as UsersIcon,
  UserPlus,
  Filter,
  MoreHorizontal,
  Eye,
  UserMinus,
  UserPlus2
} from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { useMemo, useState, useRef, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { CreateButton } from "@/components/refine-ui/buttons/create.tsx";
import {
  useNavigation,
  useDelete,
  useGetIdentity,
  useUpdate,
  useList,
} from "@refinedev/core";
import { User, UserRole, UserStatus, VerificationStatus } from "@/types";
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
import { useVirtualizer } from "@tanstack/react-virtual";
import { Skeleton } from "@/components/ui/skeleton";
import usePageTitle from "@/hooks/use-page-title";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";

const roleVariants: Record<
  UserRole,
  "default" | "secondary" | "destructive" | "outline"
> = {
  [UserRole.ADMIN]: "destructive",
  [UserRole.TEACHER]: "default",
  [UserRole.STUDENT]: "secondary",
  [UserRole.PARENT]: "outline",
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
  usePageTitle("User Governance");
  const { data: identity } = useGetIdentity<User>();
  const isAdmin = identity?.role === UserRole.ADMIN;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [verificationTarget, setVerificationTarget] = useState<User | null>(
    null,
  );

  const { edit, show } = useNavigation();
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
    if (selectedStatus && selectedStatus !== "all") {
      f.push({
        field: "status",
        operator: "eq" as const,
        value: selectedStatus,
      });
    }
    if (verificationFilter === "pending") {
      f.push({
        field: "role",
        operator: "eq" as const,
        value: UserRole.TEACHER,
      });
      f.push({
        field: "verificationStatus",
        operator: "eq" as const,
        value: VerificationStatus.PENDING,
      });
    }
    return f;
  }, [searchQuery, selectedRole, selectedStatus, verificationFilter]);

  const { query: usersQuery } = useList<User>({
    resource: "users",
    pagination: { pageSize: 1000, mode: "server" },
    filters,
    sorters: [{ field: "createdAt", order: "desc" }],
    meta: {
      populate: ["department"],
    },
  });

  const users = usersQuery.data?.data || [];
  const isLoading = usersQuery.isLoading;
  const hasData = users.length > 0;

  const parentRef = useRef<HTMLDivElement>(null);

  const estimateSize = useCallback(() => 100, []);

  const rowVirtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 5,
  });

  const handleVerify = (id: string, isVerified: boolean) => {
    updateMutation(
      {
        resource: "users",
        id,
        values: {
          verificationStatus: isVerified
            ? VerificationStatus.VERIFIED
            : VerificationStatus.REJECTED,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            isVerified
              ? "Teacher verified successfully!"
              : "Verification rejected.",
          );
          setVerificationTarget(null);
        },
      },
    );
  };

  const handleStatusChange = (id: string, newStatus: UserStatus) => {
    updateMutation(
      {
        resource: "users",
        id,
        values: { status: newStatus },
      },
      {
        onSuccess: () => {
          toast.success(`User status updated to ${newStatus}`);
        },
      }
    );
  };

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

  // Stats calculation (from the loaded list)
  const stats = useMemo(() => {
    if (!users) return { total: 0, pending: 0, active: 0 };
    return {
      total: users.length,
      pending: users.filter(
        (u: User) =>
          u.role === UserRole.TEACHER &&
          u.verificationStatus === VerificationStatus.PENDING,
      ).length,
      active: users.filter((u: User) => u.status === UserStatus.ACTIVE)
        .length,
    };
  }, [users]);

  return (
    <>
      <ListView className="space-y-8">
        <div className="space-y-4">
          <Breadcrumb />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black tracking-tight">
                User Governance
              </h1>
              <p className="text-muted-foreground font-medium mt-1">
                Manage teachers, students, and administrators. Oversee
                verification and account status.
              </p>
            </div>
            {isAdmin && (
              <CreateButton className="h-12 rounded-2xl px-6 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20">
                <UserPlus className="h-4 w-4 mr-2" />
                Add New User
              </CreateButton>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-6 border-primary/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-primary/5">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <UsersIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Total Users
              </p>
              <p className="text-2xl font-black">
                {isLoading ? "..." : stats.total}
              </p>
            </div>
          </Card>
          <Card className="p-6 border-amber-500/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-amber-500/5">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Pending Verification
              </p>
              <p className="text-2xl font-black text-amber-600">
                {isLoading ? "..." : stats.pending}
              </p>
            </div>
          </Card>
          <Card className="p-6 border-green-500/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-green-500/5">
            <div className="p-3 rounded-2xl bg-green-500/10 text-green-600">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Active Accounts
              </p>
              <p className="text-2xl font-black text-green-600">
                {isLoading ? "..." : stats.active}
              </p>
            </div>
          </Card>
        </div>

        {/* Filters & Search */}
        <Card className="p-4 border-primary/5 bg-muted/30 rounded-4xl backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name or email..."
                className="pl-11 h-12 rounded-2xl border-none bg-background shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-background px-3 rounded-2xl shadow-sm border border-primary/5">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={verificationFilter}
                  onValueChange={setVerificationFilter}
                >
                  <SelectTrigger className="w-[160px] border-none h-10 focus:ring-0 shadow-none font-bold text-xs">
                    <SelectValue placeholder="Verification" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All Verification</SelectItem>
                    <SelectItem value="pending">Pending Teachers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[130px] h-12 rounded-2xl font-bold text-xs bg-background border-primary/5 shadow-sm">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                  <SelectItem value={UserRole.TEACHER}>Teacher</SelectItem>
                  <SelectItem value={UserRole.STUDENT}>Student</SelectItem>
                  <SelectItem value={UserRole.PARENT}>Parent</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[130px] h-12 rounded-2xl font-bold text-xs bg-background border-primary/5 shadow-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={UserStatus.ACTIVE}>Active</SelectItem>
                  <SelectItem value={UserStatus.SUSPENDED}>
                    Suspended
                  </SelectItem>
                  <SelectItem value={UserStatus.INACTIVE}>Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Virtualized List */}
        <div
          ref={parentRef}
          className="h-[600px] overflow-auto pr-2 custom-scrollbar rounded-3xl border border-primary/5 bg-card/30 backdrop-blur-sm relative"
        >
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-6"
                >
                  <Skeleton className="h-12 w-12 rounded-2xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : !hasData ? (
            <div className="h-full flex items-center justify-center p-10">
              <EmptyState
                icon={UsersIcon}
                title="No users found"
                description="Try adjusting your filters or search query to find what you're looking for."
                className="border-none bg-transparent min-h-0"
              />
            </div>
          ) : (
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                const user = users[virtualItem.index];
                if (!user) return null;

                return (
                  <div
                    key={virtualItem.key}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                    className="px-6"
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center h-full border-b border-primary/5 hover:bg-primary/[0.02] transition-colors group"
                    >
                      <Avatar className="h-12 w-12 rounded-2xl border-2 border-primary/10 shadow-sm">
                        <AvatarImage
                          src={user.image ?? undefined}
                          alt={user.name}
                        />
                        <AvatarFallback className="bg-primary/5 text-primary font-black">
                          {user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="ml-4 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground font-black truncate">
                            {user.name}
                          </span>
                          {user.role === UserRole.TEACHER &&
                            (user.verificationStatus ===
                            VerificationStatus.VERIFIED ? (
                              <ShieldCheck className="h-4 w-4 text-green-500" />
                            ) : (
                              <ShieldAlert className="h-4 w-4 text-amber-500" />
                            ))}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-muted-foreground text-xs font-medium truncate">
                            {user.email}
                          </span>
                          {user.department?.name && (
                            <>
                              <span className="text-muted-foreground/30 text-[10px]">
                                •
                              </span>
                              <div className="flex items-center gap-1 text-muted-foreground/70">
                                <Building2 className="h-3 w-3" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">
                                  {user.department.name}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="hidden md:flex items-center gap-4 px-4">
                        <Badge
                          variant={roleVariants[user.role] || "outline"}
                          className="capitalize text-[10px] font-black tracking-widest px-3 h-6 rounded-lg"
                        >
                          {user.role}
                        </Badge>
                        <Badge
                          variant={statusVariants[user.status]}
                          className="capitalize text-[10px] h-6 font-black tracking-widest px-3 rounded-lg"
                        >
                          {user.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {user.role === UserRole.TEACHER &&
                          user.verificationStatus ===
                            VerificationStatus.PENDING && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-[10px] font-black uppercase tracking-widest rounded-xl border-amber-500/20 text-amber-600 bg-amber-500/5 hover:bg-amber-500/10"
                              onClick={() => setVerificationTarget(user)}
                            >
                              Review Proof
                            </Button>
                          )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 rounded-xl"
                          >
                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">
                              Actions
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => show("users", user.id)}
                              className="rounded-lg gap-2 cursor-pointer"
                            >
                              <Eye className="h-4 w-4 text-primary" />
                              <span>View Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => edit("users", user.id)}
                              className="rounded-lg gap-2 cursor-pointer"
                            >
                              <Pencil className="h-4 w-4 text-primary" />
                              <span>Edit User</span>
                            </DropdownMenuItem>
                            
                            {isAdmin && user.id !== identity?.id && (
                              <>
                                <DropdownMenuSeparator />
                                {user.status === UserStatus.ACTIVE ? (
                                  <DropdownMenuItem
                                    onClick={() => handleStatusChange(user.id, UserStatus.SUSPENDED)}
                                    className="rounded-lg gap-2 text-amber-600 focus:text-amber-600 cursor-pointer"
                                  >
                                    <UserMinus className="h-4 w-4" />
                                    <span>Suspend User</span>
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => handleStatusChange(user.id, UserStatus.ACTIVE)}
                                    className="rounded-lg gap-2 text-green-600 focus:text-green-600 cursor-pointer"
                                  >
                                    <UserPlus2 className="h-4 w-4" />
                                    <span>Activate User</span>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => setDeleteTarget(user.id)}
                                  className="rounded-lg gap-2 text-destructive focus:text-destructive cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span>Delete Account</span>
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ListView>

      {/* Verification Dialog */}
      <Dialog
        open={verificationTarget !== null}
        onOpenChange={() => setVerificationTarget(null)}
      >
        <DialogContent className="max-w-2xl overflow-hidden rounded-[2rem] border-primary/10 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-black">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              Verification Review
            </DialogTitle>
            <DialogDescription className="font-medium">
              Review the credentials for {verificationTarget?.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-6 bg-muted/30 p-6 rounded-3xl border border-primary/5">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Full Name
                </p>
                <p className="font-bold text-lg">{verificationTarget?.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Email
                </p>
                <p className="font-bold">{verificationTarget?.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Phone
                </p>
                <p className="font-bold">
                  {verificationTarget?.phoneNumber || "Not provided"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Status
                </p>
                <Badge
                  variant={
                    verificationTarget?.verificationStatus ===
                    VerificationStatus.VERIFIED
                      ? "default"
                      : "secondary"
                  }
                  className="h-6 text-[10px] font-black uppercase tracking-widest px-3 rounded-lg"
                >
                  {verificationTarget?.verificationStatus ===
                  VerificationStatus.VERIFIED
                    ? "Verified"
                    : "Pending Approval"}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                Verification Document
              </p>
              {verificationTarget?.verificationDocumentUrl ? (
                <div className="border-2 border-primary/10 rounded-[2rem] p-8 flex flex-col items-center gap-6 bg-card shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                  <div className="flex items-center gap-4 w-full">
                    <div className="p-4 bg-primary/10 rounded-2xl">
                      <FileText className="h-10 w-10 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-black">
                        Teaching Credentials Proof
                      </p>
                      <p className="text-sm text-muted-foreground font-medium">
                        Uploaded by teacher for verification
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="lg"
                      className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-6 shadow-sm"
                      asChild
                    >
                      <a
                        href={verificationTarget.verificationDocumentUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Full
                      </a>
                    </Button>
                  </div>

                  {/* Inline Preview if image */}
                  {verificationTarget.verificationDocumentUrl.match(
                    /\.(jpg|jpeg|png|webp)$/i,
                  ) && (
                    <div className="w-full h-64 rounded-2xl overflow-hidden border bg-muted/50 group relative">
                      <img
                        src={verificationTarget.verificationDocumentUrl}
                        alt="Proof"
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-[2rem] p-16 text-center text-muted-foreground bg-muted/10">
                  <ShieldAlert className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="text-sm font-black uppercase tracking-widest">
                    No document uploaded.
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-0 pt-6 border-t border-primary/5">
            <Button
              variant="outline"
              className="text-destructive border-destructive/20 hover:bg-destructive/5 font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-2xl"
              onClick={() => handleVerify(verificationTarget!.id, false)}
              disabled={isUpdating}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              className="font-black uppercase tracking-widest text-[10px] h-12 px-10 rounded-2xl shadow-xl shadow-primary/20"
              onClick={() => handleVerify(verificationTarget!.id, true)}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Approve & Verify Teacher
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-[2.5rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-medium">
              This action cannot be undone. This will permanently delete the
              user account and all associated data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-6">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-8 shadow-lg shadow-destructive/20"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
export default UsersList;

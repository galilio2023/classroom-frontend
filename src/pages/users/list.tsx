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
  UserPlus2,
  Layers
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
import { Skeleton } from "@/components/ui/skeleton";
import usePageTitle from "@/hooks/use-page-title";
import { motion, AnimatePresence } from "framer-motion";
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
import { useTranslation } from "react-i18next";

const roleVariants: Record<string, "default" | "secondary" | "outline" | "destructive" | "ai"> = {
  [UserRole.ADMIN]: "default",
  [UserRole.TEACHER]: "ai", // Using 'ai' for a distinct look for teachers
  [UserRole.STUDENT]: "secondary",
  [UserRole.PARENT]: "outline",
};

const statusVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  [UserStatus.ACTIVE]: "default",
  [UserStatus.SUSPENDED]: "destructive",
  [UserStatus.INACTIVE]: "secondary",
};

const UsersList = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  
  usePageTitle(t("users.governance.title"));
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

  const { edit, show, create } = useNavigation();
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

  const { result: usersResult, query: usersQuery } = useList<User>({
    resource: "users",
    pagination: { pageSize: 50, mode: "server" }, // Reduced page size for global scroll
    filters,
    sorters: [{ field: "createdAt", order: "desc" }],
    meta: {
      populate: ["department"],
    },
  });

  const users = usersResult.data;
  const isLoading = usersQuery.isLoading;
  const hasData = users.length > 0;

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
              ? t("users.governance.toasts.verified")
              : t("users.governance.toasts.rejected"),
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
          toast.success(t("users.governance.toasts.statusUpdated", { 
            status: t(`status.${newStatus.toLowerCase()}` as any),
            defaultValue: `Status updated to ${newStatus}`
          }));
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
          (u.verificationStatus === VerificationStatus.PENDING || u.verificationStatus === VerificationStatus.UNVERIFIED),
      ).length,
      active: users.filter((u: User) => u.status === UserStatus.ACTIVE)
        .length,
    };
  }, [users]);

  return (
    <>
      <ListView>
        <div className="space-y-8 md:space-y-12">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
          >
            <div className="space-y-4 flex-1">
              <Breadcrumb />
              <div className="space-y-1">
                <h1 className="page-title mb-0 flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
                    <UsersIcon className="h-6 w-6 md:h-8 md:w-8" />
                  </div>
                  {t("users.governance.title")}
                </h1>
                <p className="text-muted-foreground font-medium max-w-2xl text-balance">
                  {t("users.governance.description")}
                </p>
              </div>
            </div>
            <div className="w-full md:w-auto">
              {isAdmin && (
                <CreateButton 
                  className="w-full md:w-auto rounded-2xl h-12 md:h-14 px-10 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/25 hover:translate-y-[-2px] transition-all"
                >
                  <UserPlus className="h-5 w-5 mr-2 rtl:mr-0 rtl:ml-2" />
                  {t("buttons.addNewUser")}
                </CreateButton>
              )}
            </div>
          </motion.div>

          {/* Stats Row - Adaptive */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-[2rem] md:rounded-[2.5rem] flex items-center gap-5 shadow-sm">
              <div className="p-3.5 rounded-2xl bg-primary/10 text-primary">
                <UsersIcon className="h-6 w-6 md:h-7 md:w-7" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                  {t("users.governance.stats.totalUsers")}
                </p>
                <p className="text-2xl md:text-3xl font-black">
                  {isLoading ? "..." : new Intl.NumberFormat(i18n.language).format(stats.total)}
                </p>
              </div>
            </Card>
            <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-[2rem] md:rounded-[2.5rem] flex items-center gap-5 shadow-sm">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-600">
                <ShieldAlert className="h-6 w-6 md:h-7 md:w-7" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                  {t("users.governance.stats.pendingVerification")}
                </p>
                <p className="text-2xl md:text-3xl font-black text-amber-600">
                  {isLoading ? "..." : new Intl.NumberFormat(i18n.language).format(stats.pending)}
                </p>
              </div>
            </Card>
            <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-[2rem] md:rounded-[2.5rem] flex items-center gap-5 shadow-sm">
              <div className="p-3.5 rounded-2xl bg-green-500/10 text-green-600">
                <UserCheck className="h-6 w-6 md:h-7 md:w-7" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                  {t("users.governance.stats.activeAccounts")}
                </p>
                <p className="text-2xl md:text-3xl font-black text-green-600">
                  {isLoading ? "..." : new Intl.NumberFormat(i18n.language).format(stats.active)}
                </p>
              </div>
            </Card>
          </div>

          {/* Filters & Search - Sticky */}
          <Card className="p-2 border-border/40 bg-muted/20 rounded-[1.75rem] md:rounded-3xl backdrop-blur-md sticky top-20 z-30 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-2">
              <div className="relative flex-1 group">
                <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors", isAr ? "right-4" : "left-4")} />
                <Input
                  type="text"
                  placeholder={t("users.governance.filters.searchPlaceholder")}
                  className={cn("h-12 rounded-2xl border-none bg-background/50 shadow-none font-medium", isAr ? "pr-11 pl-4" : "pl-11 pr-4")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 bg-background/50 px-3 py-1 rounded-2xl border border-border/40">
                <Filter className="h-3.5 w-3.5 text-muted-foreground/60" />
                <Select
                  value={verificationFilter}
                  onValueChange={setVerificationFilter}
                >
                  <SelectTrigger className="w-[160px] border-none h-10 focus:ring-0 shadow-none font-bold text-[10px] uppercase tracking-wider bg-transparent">
                    <SelectValue placeholder={t("users.governance.filters.verification")} />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="all" className="font-bold">{t("users.governance.filters.allVerification")}</SelectItem>
                    <SelectItem value="pending" className="font-bold">{t("users.governance.filters.pendingTeachers")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[130px] h-12 rounded-2xl font-bold text-[10px] uppercase tracking-wider bg-background/50 border border-border/40 shadow-sm">
                  <SelectValue placeholder={t("users.governance.filters.role")} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all" className="font-bold">{t("users.governance.filters.allRoles")}</SelectItem>
                  <SelectItem value={UserRole.ADMIN} className="font-bold">{t("roles.admin")}</SelectItem>
                  <SelectItem value={UserRole.TEACHER} className="font-bold">{t("roles.teacher")}</SelectItem>
                  <SelectItem value={UserRole.STUDENT} className="font-bold">{t("roles.student")}</SelectItem>
                  <SelectItem value={UserRole.PARENT} className="font-bold">{t("roles.parent")}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[130px] h-12 rounded-2xl font-bold text-[10px] uppercase tracking-wider bg-background/50 border border-border/40 shadow-sm">
                  <SelectValue placeholder={t("users.governance.filters.status")} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all" className="font-bold">{t("users.governance.filters.allStatus")}</SelectItem>
                  <SelectItem value={UserStatus.ACTIVE} className="font-bold">{t("status.active")}</SelectItem>
                  <SelectItem value={UserStatus.SUSPENDED} className="font-bold">{t("status.suspended")}</SelectItem>
                  <SelectItem value={UserStatus.INACTIVE} className="font-bold">{t("status.inactive")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Users List - Global Scroll Behavior */}
          <div className="relative min-h-[400px]">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="p-6 flex flex-col md:flex-row items-center gap-6 border-border/20 bg-background/50">
                    <Skeleton className="h-20 w-20 rounded-3xl shrink-0" />
                    <div className="flex-1 space-y-4 w-full">
                      <Skeleton className="h-8 w-[350px] max-w-full" />
                      <div className="flex gap-4">
                         <Skeleton className="h-4 w-24" />
                         <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-12 w-36 rounded-2xl" />
                  </Card>
                ))}
              </div>
            ) : !hasData ? (
              <div className="flex items-center justify-center p-16 bg-card/20 rounded-[2.5rem] border border-dashed border-border/40">
                <EmptyState
                  icon={Layers}
                  title={t("users.governance.table.noUsers")}
                  description={t("users.governance.table.noUsersDesc")}
                  className="border-none bg-transparent min-h-0"
                  action={isAdmin ? {
                    label: t("buttons.addNewUser"),
                    onClick: () => create("users"),
                  } : undefined}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {users.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "group relative flex flex-col md:flex-row items-center p-5 md:p-6 rounded-[2rem] bg-card/50 backdrop-blur-sm border border-border/40 hover:border-primary/30 hover:bg-card/80 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 cursor-pointer"
                      )}
                      onClick={() => show("users", user.id)}
                    >
                      {/* Role Color Accent */}
                      <div 
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 rounded-r-full transition-all group-hover:h-20"
                        style={{ backgroundColor: user.role === UserRole.TEACHER ? "var(--ai-primary)" : "var(--primary)" }}
                      />

                      {/* Avatar */}
                      <div className="relative shrink-0 mb-4 md:mb-0">
                        <Avatar className="h-20 w-20 rounded-[1.5rem] border-4 border-background shadow-lg group-hover:scale-105 transition-transform duration-500">
                          <AvatarImage
                            src={user.image ?? undefined}
                            alt={user.name}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary font-black text-xl">
                            {user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {user.role === UserRole.TEACHER &&
                          (user.verificationStatus ===
                          VerificationStatus.VERIFIED ? (
                            <div className="absolute -top-3 -right-3 p-1.5 rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30 border-4 border-background">
                              <ShieldCheck className="h-4 w-4" />
                            </div>
                          ) : (
                            <div className="absolute -top-3 -right-3 p-1.5 rounded-full bg-amber-500 text-white shadow-lg shadow-amber-500/30 border-4 border-background animate-pulse">
                              <ShieldAlert className="h-4 w-4" />
                            </div>
                          ))}
                      </div>

                      {/* Info */}
                      <div className={cn("flex-1 min-w-0 w-full", isAr ? "md:mr-8 md:text-right" : "md:ml-8 md:text-left")}>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                          <h3 className="text-xl md:text-2xl font-black tracking-tight truncate group-hover:text-primary transition-colors leading-tight">
                            {user.name}
                          </h3>
                          <div className="flex items-center justify-center md:justify-start gap-2">
                            <Badge
                              variant={roleVariants[user.role] || "outline"}
                              className="capitalize text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-full shadow-sm"
                            >
                              {t(`roles.${user.role.toLowerCase()}` as any)}
                            </Badge>
                            <Badge
                              variant={statusVariants[user.status]}
                              className="capitalize text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-full shadow-sm"
                            >
                              {t(`status.${user.status.toLowerCase()}` as any)}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 mt-4">
                          <div className="flex items-center gap-2.5 bg-background/40 px-3 py-1.5 rounded-full border border-border/20 shadow-sm">
                            <div className="p-1.5 rounded-lg bg-primary/5 shrink-0">
                                <FileText className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider">Email</span>
                                <span className="text-[11px] font-black text-foreground truncate max-w-[150px]">{user.email}</span>
                            </div>
                          </div>

                          {user.department?.name && (
                            <div className="flex items-center gap-2.5 bg-background/40 px-3 py-1.5 rounded-full border border-border/20 shadow-sm">
                              <div className="p-1.5 rounded-lg bg-primary/5 shrink-0">
                                  <Building2 className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <div className="flex flex-col">
                                  <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider">Department</span>
                                  <span className="text-[11px] font-black text-foreground truncate max-w-[150px]">{user.department.name}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-6 md:mt-0 shrink-0">
                        {user.role === UserRole.TEACHER &&
                          (user.verificationStatus ===
                            VerificationStatus.PENDING || user.verificationStatus === VerificationStatus.UNVERIFIED) && (
                            <Button
                              variant="outline"
                              size="lg"
                              className="w-full md:w-auto rounded-2xl px-8 h-12 font-black uppercase tracking-widest text-[10px] border-amber-500/20 text-amber-600 bg-amber-500/5 hover:bg-amber-500/10 shadow-sm"
                              onClick={(e) => { e.stopPropagation(); setVerificationTarget(user); }}
                            >
                              {t("buttons.reviewProof")}
                            </Button>
                          )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-12 w-12 rounded-2xl bg-muted/30 hover:bg-muted/50"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-64 p-2 rounded-3xl"
                          >
                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/40 px-3 py-3">
                              {t("users.governance.table.actions")}
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => show("users", user.id)}
                              className="rounded-xl gap-3 py-3 cursor-pointer"
                            >
                              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                  <Eye className="h-4 w-4" />
                              </div>
                              <span className="font-bold">{t("buttons.viewProfile")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => edit("users", user.id)}
                              className="rounded-xl gap-3 py-3 cursor-pointer"
                            >
                              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                  <Pencil className="h-4 w-4" />
                              </div>
                              <span className="font-bold">{t("buttons.editUser")}</span>
                            </DropdownMenuItem>
                            
                            {isAdmin && user.id !== identity?.id && (
                              <>
                                <DropdownMenuSeparator className="my-2 opacity-50" />
                                {user.status === UserStatus.ACTIVE ? (
                                  <DropdownMenuItem
                                    onClick={() => handleStatusChange(user.id, UserStatus.SUSPENDED)}
                                    className="rounded-xl gap-3 py-3 cursor-pointer text-amber-600 focus:bg-amber-500/10"
                                  >
                                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                                        <UserMinus className="h-4 w-4" />
                                    </div>
                                    <span className="font-bold">{t("buttons.suspendUser")}</span>
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => handleStatusChange(user.id, UserStatus.ACTIVE)}
                                    className="rounded-xl gap-3 py-3 cursor-pointer text-green-600 focus:bg-green-500/10"
                                  >
                                    <div className="p-2 rounded-lg bg-green-500/10 text-green-600">
                                        <UserPlus2 className="h-4 w-4" />
                                    </div>
                                    <span className="font-bold">{t("buttons.activateUser")}</span>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => setDeleteTarget(user.id)}
                                  className="rounded-xl gap-3 py-3 cursor-pointer text-destructive focus:bg-destructive/10"
                                >
                                  <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                                      <Trash2 className="h-4 w-4" />
                                  </div>
                                  <span className="font-bold">{t("buttons.deleteAccount")}</span>
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </ListView>

      {/* Verification Dialog */}
      <Dialog
        open={verificationTarget !== null}
        onOpenChange={() => setVerificationTarget(null)}
      >
        <DialogContent className="max-w-2xl overflow-hidden rounded-[2.5rem] md:rounded-[3rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl p-0">
          <div className="p-8 md:p-12 space-y-8">
            <DialogHeader className="text-start space-y-4">
              <div className="p-5 rounded-2xl bg-primary/10 text-primary w-fit mx-auto">
                <ShieldCheck className="h-10 w-10" />
              </div>
              <div className="space-y-2 text-center">
                <DialogTitle className="text-3xl font-black tracking-tight">
                  {t("users.governance.verification.title")}
                </DialogTitle>
                <DialogDescription className="font-medium text-base px-6">
                  {t("users.governance.verification.description", { name: verificationTarget?.name })}
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/30 p-8 rounded-[2rem] border border-border/40 shadow-inner">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    {t("users.governance.verification.fullName")}
                  </p>
                  <p className="font-black text-lg md:text-xl">{verificationTarget?.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    {t("users.governance.verification.email")}
                  </p>
                  <p className="font-black text-lg md:text-xl">{verificationTarget?.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    {t("users.governance.verification.phone")}
                  </p>
                  <p className="font-black text-lg md:text-xl">
                    {verificationTarget?.phoneNumber || "---"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    {t("users.governance.verification.status")}
                  </p>
                  <Badge
                    variant={
                      verificationTarget?.verificationStatus ===
                      VerificationStatus.VERIFIED
                        ? "default"
                        : "secondary"
                    }
                    className="h-7 text-[10px] font-black uppercase tracking-widest px-4 rounded-xl shadow-sm"
                  >
                    {verificationTarget?.verificationStatus ===
                    VerificationStatus.VERIFIED
                      ? t("users.governance.verification.verified")
                      : t("users.governance.verification.pending")}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">
                  {t("users.governance.verification.document")}
                </p>
                {verificationTarget?.verificationDocumentUrl ? (
                  <div className="border-2 border-primary/10 rounded-[2rem] p-8 flex flex-col items-center gap-6 bg-card shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                      <div className="p-4 bg-primary/10 rounded-2xl shrink-0">
                        <FileText className="h-10 w-10 text-primary" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <p className="text-lg md:text-xl font-black">
                          {t("users.governance.verification.proofTitle")}
                        </p>
                        <p className="text-sm text-muted-foreground font-medium">
                          {t("users.governance.verification.proofDesc")}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 md:h-14 px-8 shadow-sm"
                        asChild
                      >
                        <a
                          href={verificationTarget.verificationDocumentUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                          {t("buttons.viewFull")}
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
                      {t("users.governance.verification.noDocument")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-4 pt-8 border-t border-border/40">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-destructive border-destructive/20 hover:bg-destructive/5 font-black uppercase tracking-widest text-[10px] h-12 md:h-14 px-8 rounded-2xl"
                onClick={() => handleVerify(verificationTarget!.id, false)}
                disabled={isUpdating}
              >
                <XCircle className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                {t("buttons.reject")}
              </Button>
              <Button
                size="lg"
                className="w-full sm:w-auto font-black uppercase tracking-widest text-[10px] h-12 md:h-14 px-10 rounded-2xl shadow-xl shadow-primary/20"
                onClick={() => handleVerify(verificationTarget!.id, true)}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2 rtl:mr-0 rtl:ml-2" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                )}
                {t("buttons.approveVerify")}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl max-w-lg">
          <AlertDialogHeader className="space-y-6">
            <div className="p-5 rounded-2xl bg-destructive/10 text-destructive w-fit mx-auto">
              <Trash2 className="h-10 w-10" />
            </div>
            <div className="space-y-2 text-center">
              <AlertDialogTitle className="text-3xl font-black tracking-tight">
                {t("users.governance.deleteDialog.title")}
              </AlertDialogTitle>
              <AlertDialogDescription className="font-medium text-base px-8 leading-relaxed">
                {t("users.governance.deleteDialog.description")}
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-4 pt-8">
            <AlertDialogCancel className="rounded-2xl px-10 h-14 font-black uppercase tracking-widest text-[10px]">
              {t("buttons.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="rounded-2xl px-12 h-14 font-black uppercase tracking-widest text-[10px] bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xl shadow-destructive/20"
            >
              {t("buttons.confirmDelete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
export default UsersList;

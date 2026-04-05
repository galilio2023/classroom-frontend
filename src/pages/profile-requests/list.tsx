import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import {
  Search,
  CheckCircle2,
  XCircle,
  Filter,
  MoreHorizontal,
  Eye,
  Mail,
  Activity,
  ShieldCheck,
  Loader2,
  ArrowRight,
  UserCheck,
  Clock,
  FileText,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { useMemo, useState, useRef, useCallback } from "react";
import { useList, useNavigation, useCustomMutation, useInvalidate } from "@refinedev/core";
import { ProfileChangeRequest } from "@/types";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import usePageTitle from "@/hooks/use-page-title";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

dayjs.extend(relativeTime);

const ProfileRequestsList = () => {
  const { t } = useTranslation();
  usePageTitle(t("profileRequests.title"));

  const [searchQuery, setSearchQuery] = useState("");
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { show } = useNavigation();
  const { mutate: approve, mutation: approveMutation } = useCustomMutation();
  const isApproving = approveMutation.isPending;
  const { mutate: reject, mutation: rejectMutation } = useCustomMutation();
  const isRejecting = rejectMutation.isPending;
  const invalidate = useInvalidate();

  const filters = useMemo(() => {
    const f = [];
    if (statusFilter !== "all") {
      f.push({ field: "status", operator: "eq" as const, value: statusFilter });
    }
    if (searchQuery) {
      f.push({
        field: "user.name",
        operator: "contains" as const,
        value: searchQuery,
      });
    }
    return f;
  }, [statusFilter, searchQuery]);

  const { query } = useList<ProfileChangeRequest>({
    resource: "profile-requests",
    pagination: { pageSize: 1000, mode: "server" },
    filters,
    sorters: [{ field: "createdAt", order: "desc" }],
    meta: { populate: ["user"] },
  });

  const requests = useMemo(() => query.data?.data || [], [query.data?.data]);
  const isLoading = query.isLoading;
  const hasData = requests.length > 0;

  const handleApprove = (id: number) => {
    approve(
      {
        url: `/profile-requests/${id}/approve`,
        method: "post",
        values: {},
      },
      {
        onSuccess: () => {
          toast.success(t("profileRequests.toasts.approved"));
          invalidate({ resource: "profile-requests", invalidates: ["list"] });
        },
      }
    );
  };

  const handleReject = () => {
    if (!rejectTarget) return;

    reject(
      {
        url: `/profile-requests/${rejectTarget}/reject`,
        method: "post",
        values: { notes: rejectReason || "Changes rejected by administrator" },
      },
      {
        onSuccess: () => {
          toast.success(t("profileRequests.toasts.rejected"));
          setRejectTarget(null);
          setRejectReason("");
          invalidate({ resource: "profile-requests", invalidates: ["list"] });
        },
      }
    );
  };

  const parentRef = useRef<HTMLDivElement>(null);

  const estimateSize = useCallback(() => 160, []);

  const rowVirtualizer = useVirtualizer({
    count: requests.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 5,
  });

  // Stats calculation
  const stats = useMemo(() => {
    if (!requests.length) return { total: 0, pending: 0, approved: 0 };
    return {
      total: requests.length,
      pending: requests.filter((r: ProfileChangeRequest) => r.status === "pending").length,
      approved: requests.filter((r: ProfileChangeRequest) => r.status === "approved").length,
    };
  }, [requests]);

  return (
    <div className="space-y-10 pb-20">
      <ListView>
        <div className="space-y-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black tracking-tight">{t("profileRequests.title")}</h1>
                <p className="text-muted-foreground font-medium mt-1">
                  {t("profileRequests.description")}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-6 border-primary/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-primary/5">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {t("profileRequests.stats.total")}
                </p>
                <p className="text-2xl font-black">{isLoading ? "..." : stats.total}</p>
              </div>
            </Card>
            <Card className="p-6 border-amber-500/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-amber-500/5">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {t("profileRequests.stats.pending")}
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
                  {t("profileRequests.stats.approved")}
                </p>
                <p className="text-2xl font-black text-green-600">
                  {isLoading ? "..." : stats.approved}
                </p>
              </div>
            </Card>
          </div>

          {/* Filters & Search */}
          <Card className="p-4 border-primary/5 bg-muted/30 rounded-4xl backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="text"
                  placeholder={t("profileRequests.searchPlaceholder")}
                  className="ps-11 h-14 rounded-2xl border-none bg-background shadow-sm font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 bg-background px-4 rounded-2xl shadow-sm border border-primary/5">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 border-none h-10 focus:ring-0 shadow-none font-black text-[10px] uppercase tracking-widest">
                    <SelectValue placeholder={t("my-classes.allStatus")} />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl shadow-2xl bg-white dark:bg-[#09090b] opacity-100 backdrop-blur-none border border-border/50">
                    <SelectItem value="all" className="rounded-xl font-bold">
                      {t("my-classes.allStatus")}
                    </SelectItem>
                    <SelectItem value="pending" className="rounded-xl font-bold">
                      {t("status.upcoming")}
                    </SelectItem>
                    <SelectItem value="approved" className="rounded-xl font-bold">
                      {t("status.active")}
                    </SelectItem>
                    <SelectItem value="rejected" className="rounded-xl font-bold">
                      {t("buttons.reject")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Virtualized List Container */}
          <div
            ref={parentRef}
            className="h-150 overflow-auto pe-2 custom-scrollbar rounded-[2.5rem] border border-primary/5 bg-card/30 backdrop-blur-sm relative"
          >
            {isLoading ? (
              <div style={{ height: "100%", width: "100%", position: "relative" }}>
                {Array.from({ length: 6 }).map((_, i: any) => (
                  <div
                    key={i}
                    className="flex flex-col md:flex-row items-center p-8 border-b border-primary/5 gap-6"
                  >
                    <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-3 w-full">
                      <Skeleton className="h-6 w-62.5" />
                      <Skeleton className="h-4 w-45" />
                    </div>
                    <Skeleton className="h-10 w-24 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : !hasData ? (
              <div className="h-full w-full flex items-center justify-center p-12">
                <EmptyState
                  icon={ShieldCheck}
                  title={t("profileRequests.empty.title")}
                  description={t("profileRequests.empty.desc")}
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
                {rowVirtualizer.getVirtualItems().map((virtualItem: any) => {
                  const request = requests[virtualItem.index];
                  if (!request) return null;

                  const requestDate = dayjs(request.createdAt);
                  const oldData = request.oldData || {};
                  const newData = request.newData || {};
                  const changedKeys = Object.keys(newData).filter((k) => newData[k] !== oldData[k]);

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
                      className="px-8 py-4"
                    >
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col md:flex-row items-center h-full border border-primary/5 bg-background/50 rounded-3xl px-6 hover:bg-primary/2 transition-all group shadow-sm"
                      >
                        {/* User Avatar */}
                        <div className="relative shrink-0 mb-4 md:mb-0">
                          <Avatar className="h-14 w-14 rounded-xl border-2 border-background shadow-md group-hover:scale-110 transition-transform">
                            <AvatarImage
                              src={request.user.image ?? undefined}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-primary/5 text-primary font-black text-lg">
                              {request.user.name[0]}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        {/* Info */}
                        <div className="flex-1 md:ms-6 text-center md:text-start min-w-0 w-full">
                          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                            <h3 className="text-lg font-black tracking-tight truncate group-hover:text-primary transition-colors">
                              {request.user.name}
                            </h3>
                            <div className="flex items-center justify-center md:justify-start gap-2">
                              <Badge
                                variant={
                                  request.status === "approved"
                                    ? "default"
                                    : request.status === "pending"
                                      ? "secondary"
                                      : "destructive"
                                }
                                className={cn(
                                  "text-[10px] md:text-[11px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border-none",
                                  request.status === "pending" && "bg-amber-500/10 text-amber-600"
                                )}
                              >
                                {request.status}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-[10px] md:text-[11px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border-primary/10"
                              >
                                {t("profileRequests.labels.changes", {
                                  count: changedKeys.length,
                                })}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 mt-2">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Mail className="h-3 w-3 text-primary" />
                              <span className="text-[11px] font-bold">{request.user.email}</span>
                            </div>

                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Clock className="h-3 w-3 text-primary" />
                              <span className="text-[11px] font-bold uppercase tracking-tight">
                                {t("profileRequests.labels.requested", {
                                  time: requestDate.fromNow(),
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Changes Preview */}
                          <div className="mt-3 flex flex-wrap gap-2">
                            {changedKeys.map((key: any) => {
                              const isDoc = key === "verificationDocumentUrl";
                              return (
                                <div
                                  key={key}
                                  className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-lg border border-primary/5"
                                >
                                  <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">
                                    {key.replace("Url", "").replace(/([A-Z])/g, " $1")}
                                  </span>
                                  {isDoc ? (
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="h-auto p-0 text-[10px] md:text-[11px] font-black gap-1 text-primary"
                                      onClick={() => setPreviewUrl(String(newData[key]))}
                                    >
                                      <FileText className="h-2.5 w-2.5" />
                                      {t("profileRequests.labels.viewProof")}
                                    </Button>
                                  ) : (
                                    <div className="flex items-center gap-1 text-[10px] md:text-[11px] font-bold">
                                      <span className="text-muted-foreground/40 line-through truncate max-w-15">
                                        {String(oldData[key] || t("profileRequests.labels.empty"))}
                                      </span>
                                      <ArrowRight className="h-2 w-2 text-primary/40" />
                                      <span className="text-primary truncate max-w-15">
                                        {String(newData[key])}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-4 md:mt-0 shrink-0">
                          {request.status === "pending" && (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 rounded-lg font-black uppercase tracking-widest text-[10px] md:text-[11px] border-green-500/20 text-green-600 bg-green-500/5 hover:bg-green-500/10 px-3"
                                onClick={() => handleApprove(request.id)}
                                disabled={isApproving}
                              >
                                {isApproving ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin me-1.5" />
                                ) : (
                                  <CheckCircle2 className="h-3.5 w-3.5 me-1.5" />
                                )}
                                {t("buttons.approve")}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 rounded-lg font-black uppercase tracking-widest text-[10px] md:text-[11px] border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 px-3"
                                onClick={() => setRejectTarget(request.id)}
                                disabled={isRejecting}
                              >
                                <XCircle className="h-3.5 w-3.5 me-1.5" />
                                {t("buttons.reject")}
                              </Button>
                            </div>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-48 rounded-xl p-1 bg-white dark:bg-[#09090b] opacity-100 backdrop-blur-none border border-border/50 shadow-2xl"
                            >
                              <DropdownMenuLabel className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-muted-foreground px-2 py-1.5">
                                {t("assignments.list.labels.options")}
                              </DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => show("users", request.user.id)}
                                className="rounded-lg gap-2 py-2 cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5 text-primary" />
                                <span className="font-bold text-xs">
                                  {t("buttons.viewProfile")}
                                </span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-lg gap-2 py-2 cursor-pointer">
                                <MessageSquare className="h-3.5 w-3.5 text-primary" />
                                <span className="font-bold text-xs">
                                  {t("buttons.contactUser")}
                                </span>
                              </DropdownMenuItem>
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
        </div>
      </ListView>

      {/* Document Preview Dialog */}
      <Dialog open={previewUrl !== null} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col rounded-[2.5rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-6 w-6" />
                </div>
                <DialogTitle className="text-2xl font-black tracking-tight">
                  {t("profileRequests.labels.verificationDoc")}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 bg-muted/30 rounded-4xl overflow-hidden border border-primary/5 mt-6 relative group">
            {previewUrl?.endsWith(".pdf") ? (
              <iframe src={previewUrl} className="w-full h-full" title="PDF Preview" />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-8">
                <img
                  src={previewUrl || ""}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain shadow-2xl rounded-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            )}
          </div>
          <DialogFooter className="p-6 pt-4 gap-3">
            <Button
              variant="ghost"
              className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-6"
              onClick={() => setPreviewUrl(null)}
            >
              {t("buttons.closePreview")}
            </Button>
            <Button
              className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-8 shadow-xl shadow-primary/20"
              asChild
            >
              <a href={previewUrl || ""} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4 me-2" />
                {t("buttons.openFullRes")}
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectTarget !== null} onOpenChange={() => setRejectTarget(null)}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl max-w-md">
          <DialogHeader className="space-y-4">
            <div className="p-4 rounded-2xl bg-destructive/10 text-destructive w-fit">
              <XCircle className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-3xl font-black tracking-tight">
                {t("profileRequests.dialogs.rejectTitle")}
              </DialogTitle>
              <DialogDescription className="font-medium text-base">
                {t("profileRequests.dialogs.rejectDesc")}
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="py-8 space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1">
              {t("profileRequests.dialogs.rejectionFeedback")}
            </Label>
            <Textarea
              placeholder={t("profileRequests.dialogs.rejectionPlaceholder")}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-37.5 rounded-4xl bg-muted/30 border-none focus-visible:ring-destructive/30 p-6 text-base leading-relaxed font-medium resize-none"
            />
          </div>
          <DialogFooter className="gap-3">
            <Button
              variant="ghost"
              className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-8"
              onClick={() => setRejectTarget(null)}
            >
              {t("buttons.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isRejecting || !rejectReason.trim()}
              className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-12 shadow-xl shadow-destructive/20"
            >
              {isRejecting ? (
                <Loader2 className="h-4 w-4 animate-spin me-2" />
              ) : (
                <XCircle className="h-4 w-4 me-2" />
              )}
              {t("profileRequests.dialogs.confirmRejection")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileRequestsList;

import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import {
  Search,
  FolderOpen,
  FileText,
  Link as LinkIcon,
  Video,
  Image as ImageIcon,
  Calendar,
  ExternalLink,
  PlusCircle,
  Filter,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowRight,
  Download,
  Share2,
  Clock,
  FileArchive,
  AlertCircle,
  Layers,
} from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { useMemo, useState, useRef } from "react";
import { useList, useNavigation, useDelete } from "@refinedev/core";
import { Resource } from "@/types";
import { useUserRole } from "@/hooks/use-user-role";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import usePageTitle from "@/hooks/use-page-title";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { useTerm } from "@/contexts/term-context";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

dayjs.extend(relativeTime);

const ResourcesListPage = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  usePageTitle(t("resourcesPage.title"));
  const { identity, isStaff } = useUserRole();
  const { selectedTerm } = useTerm();

  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const { edit, create, show } = useNavigation();
  const { mutate: deleteMutation, mutation: deleteMutationObj } = useDelete();
  const isDeleteLoading = deleteMutationObj.isPending;

  const filters = useMemo(() => {
    const f = [];
    if (searchQuery) {
      f.push({
        field: "title",
        operator: "contains" as const,
        value: searchQuery,
      });
    }
    if (selectedTerm) {
      f.push({
        field: "termId",
        operator: "eq" as const,
        value: selectedTerm.id,
      });
    }
    // IMPORTANT: Filter resources by teacherId if the current user is a staff member (teacher)
    if (isStaff && identity?.id) {
      f.push({
        field: "teacherId",
        operator: "eq" as const,
        value: identity.id,
      });
    }
    return f;
  }, [searchQuery, selectedTerm, isStaff, identity?.id]); // Added isStaff and identity.id to dependencies

  const { query } = useList<Resource>({
    resource: "resources",
    pagination: { pageSize: 50, mode: "server" },
    filters,
    sorters: [{ field: "id", order: "desc" }],
    meta: {
      populate: ["class"],
    },
  });

  const { data: resourcesData, isPending: isLoading } = query;

  const resources = resourcesData?.data || [];
  const hasData = resources.length > 0;

  const getIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-8 w-8 text-red-500" />;
      case "link":
        return <LinkIcon className="h-8 w-8 text-blue-500" />;
      case "image":
        return <ImageIcon className="h-8 w-8 text-green-500" />;
      case "note":
        return <FileText className="h-8 w-8 text-amber-500" />;
      default:
        return <FileArchive className="h-8 w-8 text-primary" />;
    }
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteMutation(
        {
          resource: "resources",
          id: deleteTarget,
          mutationMode: "pessimistic",
        },
        {
          onSuccess: () => setDeleteTarget(null),
        }
      );
    }
  };

  const stats = useMemo(() => {
    if (!resources.length) return { total: 0, videos: 0, documents: 0 };
    return {
      total: resources.length,
      videos: resources.filter((r: Resource) => r.type === "video").length,
      documents: resources.filter((r: Resource) => r.type !== "video" && r.type !== "link").length,
    };
  }, [resources]);

  return (
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
            <div className="space-y-1 text-start">
              <h1 className="page-title mb-0 flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
                  <FolderOpen className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                {t("resourcesPage.title")}
              </h1>
              <p className="text-muted-foreground font-medium max-w-2xl text-balance">
                {t("resourcesPage.description")}
              </p>
            </div>
          </div>
          <div className="w-full md:w-auto">
            {isStaff && (
              <Button
                onClick={() => create("resources")}
                size="lg"
                className="w-full md:w-auto rounded-2xl h-12 md:h-14 px-10 font-bold uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/25 hover:translate-y-[-2px] transition-all"
              >
                <PlusCircle className="h-5 w-5" />
                {t("resourcesPage.upload")}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Stats Row - Adaptive */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-4xl md:rounded-[2.5rem] flex items-center gap-5 shadow-sm">
            <div className="p-3.5 rounded-2xl bg-primary/10 text-primary">
              <FolderOpen className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <div className="text-start">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                {t("resourcesPage.stats.total")}
              </p>
              <p className="text-2xl md:text-3xl font-black">{isLoading ? "..." : stats.total}</p>
            </div>
          </Card>
          <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-4xl md:rounded-[2.5rem] flex items-center gap-5 shadow-sm">
            <div className="p-3.5 rounded-2xl bg-red-500/10 text-red-600">
              <Video className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <div className="text-start">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                {t("resourcesPage.stats.multimedia")}
              </p>
              <p className="text-2xl md:text-3xl font-black text-red-600">
                {isLoading ? "..." : stats.videos}
              </p>
            </div>
          </Card>
          <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-4xl md:rounded-[2.5rem] flex items-center gap-5 shadow-sm">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-600">
              <FileText className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <div className="text-start">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                {t("resourcesPage.stats.documents")}
              </p>
              <p className="text-2xl md:text-3xl font-black text-amber-600">
                {isLoading ? "..." : stats.documents}
              </p>
            </div>
          </Card>
        </div>

        {/* Search & Filters Card - Sticky */}
        <Card className="p-2 border-border/40 bg-muted/20 rounded-[1.75rem] md:rounded-3xl backdrop-blur-md sticky top-20 z-30 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-2">
            <div className="relative flex-1 group">
              <Search
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors start-4"
                )}
              />
              <Input
                type="text"
                placeholder={t("resourcesPage.searchPlaceholder")}
                className={cn(
                  "h-12 rounded-2xl border-none bg-background/50 shadow-none font-medium ps-11 pe-4"
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 bg-background/50 px-4 py-2 rounded-2xl border border-border/40 shrink-0">
              <Filter className="h-3.5 w-3.5 text-muted-foreground/60" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                {t("discussions.filter")}
              </span>
            </div>
          </div>
        </Card>

        {/* Archive Banner */}
        <AnimatePresence>
          {selectedTerm?.status === "archived" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-6 md:p-8 rounded-4xl flex flex-col sm:flex-row items-center sm:items-start gap-5 backdrop-blur-sm text-center sm:text-start"
            >
              <div className="p-3 rounded-[1.25rem] bg-amber-500/20 shrink-0">
                <AlertCircle className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <div className="space-y-1">
                <p className="font-black uppercase tracking-[0.15em] text-[10px] opacity-80">
                  {t("dashboard.archiveViewActive")}
                </p>
                <p className="text-base md:text-lg font-bold">
                  {t("dashboard.archiveViewDescription", {
                    termName: selectedTerm.name,
                  })}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resources List - Global Scroll */}
        <div className="relative min-h-[400px]">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i: any) => (
                <Card
                  key={i}
                  className="p-6 flex flex-col md:flex-row items-center gap-6 border-border/20 bg-background/50"
                >
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
                icon={FolderOpen}
                title={t("resourcesPage.empty.title")}
                description={t("resourcesPage.empty.desc")}
                className="border-none bg-transparent min-h-0"
                action={
                  isStaff && selectedTerm?.status === "active"
                    ? {
                        label: t("resourcesPage.upload"),
                        onClick: () => create("resources"),
                      }
                    : undefined
                }
              />
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {resources.map((resource: any, index: any) => {
                  const uploadDate = dayjs(resource.createdAt);
                  const resourceColor = (resource as any).class?.color || "#6366f1";

                  return (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "group relative flex flex-col md:flex-row items-center p-5 md:p-6 rounded-4xl bg-card/50 backdrop-blur-sm border border-border/40 hover:border-primary/30 hover:bg-card/80 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 cursor-pointer"
                      )}
                    >
                      {/* Class Color Accent */}
                      <div
                        className="absolute start-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-primary rounded-e-full transition-all group-hover:h-20"
                        style={{ backgroundColor: resourceColor }}
                      />

                      {/* Icon */}
                      <div className="relative shrink-0 mb-4 md:mb-0">
                        <div className="h-20 w-20 rounded-[1.5rem] border-4 border-background flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500 bg-background">
                          {getIcon(resource.type)}
                        </div>
                      </div>

                      {/* Info Area */}
                      <div
                        className={cn(
                          "flex-1 min-w-0 w-full text-start",
                          isAr ? "md:me-8 md:text-end" : "md:ms-8 md:text-start"
                        )}
                      >
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                          <h3 className="text-xl md:text-2xl font-black tracking-tight truncate group-hover:text-primary transition-colors leading-tight">
                            {resource.title}
                          </h3>
                          <div className="flex items-center justify-center md:justify-start gap-2">
                            <Badge
                              variant="outline"
                              className="text-[10px] md:text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border-primary/10 shadow-sm"
                            >
                              {resource.type}
                            </Badge>
                            <Badge className="bg-primary/5 text-primary border-none font-black px-3 py-0.5 rounded-full text-[10px] md:text-[11px] tracking-widest uppercase shadow-sm">
                              {(resource as any).class?.name || "Global"}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 mt-4">
                          <div className="flex items-center gap-2.5 bg-background/40 px-3 py-1.5 rounded-full border border-border/20 shadow-sm">
                            <div className="p-1.5 rounded-lg bg-primary/5 shrink-0">
                              <Calendar className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="flex flex-col text-start">
                              <span className="text-[10px] md:text-[11px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                                Uploaded
                              </span>
                              <span className="text-[11px] font-black text-foreground">
                                {uploadDate.format("MMM D, YYYY")}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 bg-background/40 px-3 py-1.5 rounded-full border border-border/20 shadow-sm">
                            <div className="p-1.5 rounded-lg bg-primary/5 shrink-0">
                              <Clock className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="flex flex-col text-start">
                              <span className="text-[10px] md:text-[11px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                                Timeline
                              </span>
                              <span className="text-[11px] font-black uppercase tracking-tight">
                                {uploadDate.fromNow()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Area */}
                      <div className="flex items-center gap-3 mt-6 md:mt-0 shrink-0">
                        <div
                          className={cn(
                            "hidden lg:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ltr:translate-x-4 rtl:-translate-x-4 group-hover:translate-x-0"
                          )}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-11 w-11 rounded-2xl text-muted-foreground hover:text-primary hover:bg-primary/5 bg-muted/20"
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-5 w-5" />
                            </a>
                          </Button>
                          {isStaff && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-11 w-11 rounded-2xl text-muted-foreground hover:text-primary hover:bg-primary/5 bg-muted/20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  edit("resources", resource.id);
                                }}
                              >
                                <Pencil className="h-5 w-5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-11 w-11 rounded-2xl text-destructive hover:bg-destructive/10 bg-muted/20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteTarget(resource.id);
                                }}
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </>
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full md:w-auto rounded-2xl px-8 h-12 font-black uppercase tracking-widest text-[10px] transition-all border-primary/20 text-primary hover:bg-primary/5"
                          asChild
                        >
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            {t("buttons.open")}
                            <ExternalLink className={cn("h-4 w-4 ms-2 rtl:-scale-x-100")} />
                          </a>
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-12 w-12 rounded-2xl md:hidden lg:flex bg-muted/30"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-64 p-2 rounded-3xl bg-white dark:bg-[#09090b] opacity-100 backdrop-blur-none border border-border/50 shadow-2xl"
                          >
                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/40 px-3 py-3">
                              {t("resourcesPage.labels.options")}
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              className="rounded-xl gap-3 py-3 cursor-pointer"
                              asChild
                            >
                              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                  <Download className="h-4 w-4" />
                                </div>
                                <span className="font-bold">
                                  {t("resourcesPage.labels.download")}
                                </span>
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl gap-3 py-3 cursor-pointer">
                              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Share2 className="h-4 w-4" />
                              </div>
                              <span className="font-bold">{t("resourcesPage.labels.share")}</span>
                            </DropdownMenuItem>
                            {isStaff && (
                              <>
                                <DropdownMenuSeparator className="my-2 opacity-50" />
                                <DropdownMenuItem
                                  onClick={() => edit("resources", resource.id)}
                                  className="rounded-xl gap-3 py-3 cursor-pointer"
                                >
                                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <Pencil className="h-4 w-4" />
                                  </div>
                                  <span className="font-bold">
                                    {t("resourcesPage.labels.edit")}
                                  </span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setDeleteTarget(resource.id)}
                                  className="rounded-xl gap-3 py-3 cursor-pointer text-destructive focus:bg-destructive/10"
                                >
                                  <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </div>
                                  <span className="font-bold">
                                    {t("resourcesPage.labels.delete")}
                                  </span>
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-[2.5rem]">
          <AlertDialogHeader className="space-y-6">
            <div className="p-5 rounded-2xl bg-destructive/10 text-destructive w-fit mx-auto">
              <Trash2 className="h-10 w-10" />
            </div>
            <div className="space-y-2 text-center">
              <AlertDialogTitle className="text-3xl font-black tracking-tight">
                {t("resourcesPage.deleteDialog.title")}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base font-medium px-8 leading-relaxed">
                {t("resourcesPage.deleteDialog.desc")}
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-4 pt-8">
            <AlertDialogCancel className="rounded-2xl px-10 h-14 font-black uppercase tracking-widest text-[10px]">
              {t("buttons.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleteLoading}
              className="rounded-2xl px-12 h-14 font-black uppercase tracking-widest text-[10px] bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xl shadow-destructive/20"
            >
              {isDeleteLoading ? t("buttons.processing") : t("buttons.confirmDelete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ListView>
  );
};

export default ResourcesListPage;

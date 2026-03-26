import React, { useState } from "react";
import {
  useList,
  useCustomMutation,
  useDelete,
  useGetIdentity,
} from "@refinedev/core";
import { FileUpload } from "@/components/file-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FolderOpen,
  Trash2,
  Link as LinkIcon,
  Video,
  FileText,
  Loader2,
  Plus,
  Download,
  Search,
  Grid,
  List as ListIcon,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Layers,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import dayjs from "dayjs";
import { EmptyState } from "@/components/empty-state";
import { User, UserRole } from "@/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import usePageTitle from "@/hooks/use-page-title";

const GlobalLibraryPage = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  usePageTitle(t("library.title"));
  const { data: identity } = useGetIdentity<User>();
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Upload State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [filePublicId, setFilePublicId] = useState("");

  const {
    query: { data: resourcesResult, isLoading, refetch },
  } = useList({
    resource: "resources",
    pagination: { pageSize: 100, mode: "server" },
  });

  const { mutate: createResource, mutation } = useCustomMutation();
  const isCreating = mutation.isPending;
  const { mutate: deleteResource } = useDelete();

  const handleUploadSuccess = (url: string, publicId: string) => {
    setFileUrl(url);
    setFilePublicId(publicId);
    if (!title) {
      setTitle(t("library.resourceTitle"));
    }
  };

  const handleCreate = () => {
    if (!title || !fileUrl) {
      toast.error(t("library.toasts.fillRequired"));
      return;
    }

    createResource(
      {
        url: "/resources",
        method: "post",
        values: {
          title,
          description,
          url: fileUrl,
          cldPubId: filePublicId,
          type: "file",
          classId: null,
          isInternal: true,
        },
      },
      {
        onSuccess: () => {
          toast.success(t("library.toasts.added"));
          setUploadOpen(false);
          setTitle("");
          setDescription("");
          setFileUrl("");
          setFilePublicId("");
          refetch();
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || t("library.toasts.error"),
          );
        },
      },
    );
  };

  const handleDelete = (id: number) => {
    if (confirm(t("library.deleteConfirm"))) {
      deleteResource(
        {
          resource: "resources",
          id,
        },
        {
          onSuccess: () => {
            toast.success(t("library.toasts.deleted"));
            refetch();
          },
        },
      );
    }
  };

  const resources = resourcesResult?.data || [];
  const filteredResources = resources.filter((r: any) =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const isTeacherOrAdmin =
    identity?.role === UserRole.TEACHER || identity?.role === UserRole.ADMIN;

  return (
    <div className="space-y-8 md:space-y-12 pb-20">
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
              {t("library.title")}
            </h1>
            <p className="text-muted-foreground font-medium max-w-2xl text-balance">
              {t("library.description")}
            </p>
          </div>
        </div>
        {isTeacherOrAdmin && (
          <div className="w-full md:w-auto">
            <Dialog open={isUploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="w-full md:w-auto rounded-2xl h-12 md:h-14 px-10 font-bold uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/25 hover:translate-y-[-2px] transition-all"
                >
                  <Plus className="h-5 w-5" /> {t("library.addResource")}
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl max-w-lg p-0 overflow-hidden text-start">
                <div className="p-8 md:p-12 space-y-8">
                  <DialogHeader className="space-y-4 text-start">
                    <div className="p-5 rounded-2xl bg-primary/10 text-primary w-fit mx-auto">
                      <Plus className="h-10 w-10" />
                    </div>
                    <div className="space-y-2 text-center">
                      <DialogTitle className="text-3xl font-black tracking-tight">
                        {t("library.addToLibrary")}
                      </DialogTitle>
                      <DialogDescription className="font-medium text-base text-muted-foreground">
                        {t("library.uploadDesc")}
                      </DialogDescription>
                    </div>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label
                        htmlFor="title"
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ms-2"
                      >
                        {t("library.resourceTitle")}
                      </Label>
                      <Input
                        id="title"
                        placeholder={t("library.resourceTitle")}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="h-16 rounded-3xl bg-muted/30 border-none shadow-inner px-8 text-lg font-black"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label
                        htmlFor="description"
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ms-2"
                      >
                        {t("common.description")}
                      </Label>
                      <Input
                        id="description"
                        placeholder={t("library.optionalDesc")}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="h-16 rounded-3xl bg-muted/30 border-none shadow-inner px-8 font-bold"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ms-2">
                        {t("common.upload.label")}
                      </Label>
                      <div className="p-1 rounded-4xl bg-muted/30 shadow-inner">
                        <FileUpload
                          label={t("common.upload.label")}
                          folder="library"
                          onUploadSuccess={handleUploadSuccess}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      variant="ghost"
                      className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-8 order-2 sm:order-1"
                      onClick={() => setUploadOpen(false)}
                    >
                      {t("buttons.cancel")}
                    </Button>
                    <Button
                      onClick={handleCreate}
                      disabled={isCreating || !fileUrl}
                      size="lg"
                      className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-12 shadow-xl shadow-primary/20 order-1 sm:order-2"
                    >
                      {isCreating ? (
                        <Loader2 className="me-3 h-5 w-5 animate-spin" />
                      ) : (
                        <Plus className="h-5 w-5 me-3" />
                      )}
                      {t("library.addToLibrary")}
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </motion.div>

      {/* Search & View Controls - Sticky */}
      <Card className="p-2 border-border/40 bg-muted/20 rounded-[1.75rem] md:rounded-3xl backdrop-blur-md sticky top-20 z-30 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 group w-full">
            <Search
              className={cn(
                "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors start-4",
              )}
            />
            <Input
              placeholder={t("library.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "h-12 rounded-2xl border-none bg-background/50 shadow-none font-medium ps-11 pe-4",
              )}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="bg-background/50 p-1.5 rounded-2xl flex items-center gap-1 border border-border/40 flex-1 md:flex-none justify-center">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "rounded-xl h-10 px-4 font-black text-[10px] uppercase tracking-widest gap-2",
                  viewMode === "grid" && "bg-white shadow-sm text-primary",
                )}
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
                <span className="hidden xs:inline">Grid</span>
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "rounded-xl h-10 px-4 font-black text-[10px] uppercase tracking-widest gap-2",
                  viewMode === "list" && "bg-white shadow-sm text-primary",
                )}
                onClick={() => setViewMode("list")}
              >
                <ListIcon className="h-4 w-4" />
                <span className="hidden xs:inline">List</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Library Grid/List */}
      <div className="relative min-h-[400px]">
        {isLoading ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card
                key={i}
                className="h-64 bg-background/50 animate-pulse rounded-4xl border-border/20"
              />
            ))}
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="flex items-center justify-center p-16 bg-card/20 rounded-[2.5rem] border border-dashed border-border/40">
            <EmptyState
              icon={Layers}
              title={t("library.emptyTitle")}
              description={t("library.emptyDesc")}
              className="border-none bg-transparent min-h-0"
            />
          </div>
        ) : (
          <div
            className={cn(
              "grid gap-6 md:gap-8",
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                : "grid-cols-1",
            )}
          >
            <AnimatePresence mode="popLayout">
              {filteredResources.map((resource: any, index) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card
                    className={cn(
                      "group relative overflow-hidden transition-all duration-500 border border-border/40 bg-card/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 cursor-pointer",
                      viewMode === "grid"
                        ? "rounded-4xl h-full"
                        : "rounded-3xl",
                    )}
                  >
                    {/* Status Accent */}
                    <div className="absolute start-0 top-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />

                    <CardContent
                      className={cn(
                        "p-6 md:p-8",
                        viewMode === "list" &&
                          "flex flex-col md:flex-row items-center gap-6",
                      )}
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="p-4 rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/5 group-hover:scale-110 transition-transform duration-500">
                          {resource.type === "video" ? (
                            <Video className="h-7 w-7" />
                          ) : resource.type === "link" ? (
                            <LinkIcon className="h-7 w-7" />
                          ) : (
                            <FileText className="h-7 w-7" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          {(isTeacherOrAdmin ||
                            resource.ownerId === identity?.id) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(resource.id);
                              }}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 text-start">
                        <h3
                          className="text-xl font-black tracking-tight group-hover:text-primary transition-colors leading-tight mb-2 truncate"
                          title={resource.title}
                        >
                          {resource.title}
                        </h3>
                        <p className="text-sm font-medium text-muted-foreground/70 line-clamp-2 mb-6 leading-relaxed">
                          {resource.description || t("library.noDescription")}
                        </p>

                        <div className="pt-6 border-t border-border/40 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-3.5 w-3.5 text-primary/60" />
                            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">
                              {dayjs(resource.createdAt)
                                .locale(i18n.language)
                                .format("MMM D, YYYY")}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl font-black uppercase tracking-widest text-[9px] h-9 px-4 gap-2 border-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                            asChild
                          >
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {t("buttons.download")}
                              <Download className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalLibraryPage;

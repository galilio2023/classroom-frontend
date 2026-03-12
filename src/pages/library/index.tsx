import React, { useState } from "react";
import { useList, useCustomMutation, useDelete, useGetIdentity } from "@refinedev/core";
import { FileUpload } from "@/components/file-upload";
import { Card, CardContent } from "@/components/ui/card";
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
  List as ListIcon
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

const GlobalLibraryPage = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { data: identity } = useGetIdentity<User>();
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Upload State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [filePublicId, setFilePublicId] = useState("");

  const { result: resourcesResult, query: { isLoading, refetch } } = useList({
    resource: "resources",
  });

  const { mutate: createResource, mutation: createMutation } = useCustomMutation();
  const isCreating = createMutation.isPending;
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

    createResource({
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
      }
    }, {
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
        toast.error(error?.response?.data?.message || t("library.toasts.error"));
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm(t("library.deleteConfirm"))) {
      deleteResource({
        resource: "resources",
        id,
      }, {
        onSuccess: () => {
            toast.success(t("library.toasts.deleted"));
            refetch();
        }
      });
    }
  };

  const resources = resourcesResult?.data || [];
  const filteredResources = resources.filter((r: any) => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isTeacherOrAdmin = identity?.role === UserRole.TEACHER || identity?.role === UserRole.ADMIN;

  if (!isTeacherOrAdmin) {
      return (
          <div className="container mx-auto py-20 text-center">
              <h2 className="text-2xl font-bold">{t("library.accessDenied")}</h2>
              <p className="text-muted-foreground">{t("library.teacherOnly")}</p>
          </div>
      );
  }

  return (
    <div className="container mx-auto py-6 space-y-8 text-start">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FolderOpen className="h-8 w-8 text-primary" />
            {t("library.title")}
          </h1>
          <p className="text-muted-foreground">{t("library.description")}</p>
        </div>
        
        <div className="flex items-center gap-2">
            <div className="relative w-64">
                <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isAr ? "right-2" : "left-2")} />
                <Input 
                    placeholder={t("library.searchPlaceholder")} 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={cn(isAr ? "pr-8" : "pl-8")}
                />
            </div>
            <div className="bg-muted/50 p-1 rounded-lg flex items-center gap-1 border">
                <Button 
                    variant={viewMode === "grid" ? "secondary" : "ghost"} 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setViewMode("grid")}
                >
                    <Grid className="h-4 w-4" />
                </Button>
                <Button 
                    variant={viewMode === "list" ? "secondary" : "ghost"} 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setViewMode("list")}
                >
                    <ListIcon className="h-4 w-4" />
                </Button>
            </div>
            <Dialog open={isUploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" /> {t("library.addResource")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] text-start">
                <DialogHeader className="text-start">
                <DialogTitle>{t("library.addToLibrary")}</DialogTitle>
                <DialogDescription>{t("library.uploadDesc")}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="title">{t("library.resourceTitle")}</Label>
                    <Input 
                        id="title" 
                        placeholder={t("library.resourceTitle")} 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">{t("common.description")}</Label>
                    <Input 
                        id="description" 
                        placeholder={t("library.optionalDesc")} 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label>{t("common.upload.label")}</Label>
                    <FileUpload 
                        label={t("common.upload.label")}
                        folder="library"
                        onUploadSuccess={handleUploadSuccess}
                    />
                </div>
                </div>
                <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setUploadOpen(false)}>{t("buttons.cancel")}</Button>
                <Button onClick={handleCreate} disabled={isCreating || !fileUrl}>
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("library.addToLibrary")}
                </Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
            {[1,2,3,4].map(i => <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : filteredResources.length === 0 ? (
        <EmptyState 
            icon={FolderOpen}
            title={t("library.emptyTitle")}
            description={t("library.emptyDesc")}
        />
      ) : (
        <div className={cn(
            "grid gap-6",
            viewMode === "grid" ? "grid-cols-1 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"
        )}>
            {filteredResources.map((resource: any) => (
                <Card key={resource.id} className="group hover:shadow-lg transition-all border-none shadow-md bg-card/50">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                {resource.type === 'video' ? <Video className="h-6 w-6" /> : 
                                 resource.type === 'link' ? <LinkIcon className="h-6 w-6" /> : 
                                 <FileText className="h-6 w-6" />}
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className={cn(
                                    "text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity",
                                    isAr ? "-ml-2 -mt-2" : "-mr-2 -mt-2"
                                )}
                                onClick={() => handleDelete(resource.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <h3 className="font-bold truncate" title={resource.title}>{resource.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{resource.description || t("library.noDescription")}</p>
                        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                            <span>{dayjs(resource.createdAt).locale(i18n.language).format("MMM D, YYYY")}</span>
                            <a 
                                href={resource.url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="flex items-center gap-1 hover:text-primary transition-colors"
                            >
                                <Download className="h-3 w-3" />
                                {t("buttons.download")}
                            </a>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      )}
    </div>
  );
};

export default GlobalLibraryPage;

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
  AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { useMemo, useState, useRef, useCallback } from "react";
import { useList, useNavigation, useDelete, useGetIdentity } from "@refinedev/core";
import { Resource, User as UserType, UserRole } from "@/types";
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
import { useVirtualizer } from "@tanstack/react-virtual";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { useTerm } from "@/contexts/term-context";
import { cn } from "@/lib/utils";

dayjs.extend(relativeTime);

const ResourcesListPage = () => {
  usePageTitle("Learning Resources");
  const { data: identity } = useGetIdentity<UserType>();
  const isStaff = identity?.role === UserRole.ADMIN || identity?.role === UserRole.TEACHER;
  const { selectedTerm } = useTerm();

  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const { edit, create } = useNavigation();
  const { mutate: deleteMutation } = useDelete();

  const filters = useMemo(() => {
    const f = [];
    if (searchQuery) {
      f.push({ field: "title", operator: "contains" as const, value: searchQuery });
    }
    if (selectedTerm) {
        f.push({ field: "termId", operator: "eq" as const, value: selectedTerm.id });
    }
    return f;
  }, [searchQuery, selectedTerm]);

  const { query: { data: resourcesData, isLoading } } = useList<Resource>({
    resource: "resources",
    pagination: { pageSize: 1000, mode: "server" },
    filters,
    sorters: [{ field: "id", order: "desc" }],
    meta: {
      populate: ["class"]
    }
  });

  const resources = resourcesData?.data || [];
  const hasData = resources.length > 0;

  const getIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-6 w-6 text-red-500" />;
      case "link": return <LinkIcon className="h-6 w-6 text-blue-500" />;
      case "image": return <ImageIcon className="h-6 w-6 text-green-500" />;
      case "note": return <FileText className="h-6 w-6 text-amber-500" />;
      default: return <FileArchive className="h-6 w-6 text-primary" />;
    }
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteMutation({
        resource: "resources",
        id: deleteTarget,
        mutationMode: "pessimistic",
      }, {
        onSuccess: () => setDeleteTarget(null),
      });
    }
  };

  const parentRef = useRef<HTMLDivElement>(null);

  const estimateSize = useCallback(() => 120, []);

  const rowVirtualizer = useVirtualizer({
    count: resources.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 5,
  });

  // Stats calculation
  const stats = useMemo(() => {
    if (!resources.length) return { total: 0, videos: 0, documents: 0 };
    return {
      total: resources.length,
      videos: resources.filter((r: Resource) => r.type === 'video').length,
      documents: resources.filter((r: Resource) => r.type !== 'video' && r.type !== 'link').length
    };
  }, [resources]);

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
                <h1 className="text-4xl font-black tracking-tight">Resource Library</h1>
                <p className="text-muted-foreground font-medium mt-1">Access and manage learning materials, documents, and multimedia content.</p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                {isStaff && (
                  <Button 
                    onClick={() => create("resources")}
                    className="flex-1 md:flex-none rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                  >
                    <PlusCircle className="h-5 w-5" />
                    Upload Resource
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-6 border-primary/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-primary/5">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <FolderOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Items</p>
                <p className="text-2xl font-black">{isLoading ? "..." : stats.total}</p>
              </div>
            </Card>
            <Card className="p-6 border-red-500/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-red-500/5">
              <div className="p-3 rounded-2xl bg-red-500/10 text-red-600">
                <Video className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Multimedia</p>
                <p className="text-2xl font-black text-red-600">{isLoading ? "..." : stats.videos}</p>
              </div>
            </Card>
            <Card className="p-6 border-amber-500/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-amber-500/5">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Documents</p>
                <p className="text-2xl font-black text-amber-600">{isLoading ? "..." : stats.documents}</p>
              </div>
            </Card>
          </div>
          
          {/* Filters & Search */}
          <Card className="p-4 border-primary/5 bg-muted/30 rounded-4xl backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="text"
                  placeholder="Search resources by title or type..."
                  className="pl-11 h-14 rounded-2xl border-none bg-background shadow-sm font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 bg-background px-4 rounded-2xl shadow-sm border border-primary/5">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Library Filter</span>
              </div>
            </div>
          </Card>

          <AnimatePresence>
            {selectedTerm?.status === "archived" && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-amber-500/10 border border-amber-500/20 text-amber-700 p-6 rounded-4xl shadow-sm flex items-start gap-4 backdrop-blur-sm"
              >
                  <div className="p-3 rounded-2xl bg-amber-500/20">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-black uppercase tracking-widest text-xs">Archive View Active</p>
                    <p className="text-sm font-medium">You are viewing resources from <strong>{selectedTerm.name}</strong>. Content is read-only.</p>
                  </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Virtualized List Container */}
          <div 
            ref={parentRef} 
            className="h-150 overflow-auto pr-2 custom-scrollbar rounded-[2.5rem] border border-primary/5 bg-card/30 backdrop-blur-sm relative"
          >
            {isLoading ? (
              <div className="p-8 space-y-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col md:flex-row items-center gap-6">
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
                  icon={FolderOpen}
                  title="No resources found"
                  description={isStaff ? "Upload your first learning material to begin building your class library." : "There are no resources available for your classes yet."}
                  className="border-none bg-transparent min-h-0"
                  action={isStaff && selectedTerm?.status === "active" ? {
                    label: "Upload Resource",
                    onClick: () => create("resources"),
                  } : undefined}
                />
              </div>
            ) : (
              <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
                {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                  const resource = resources[virtualItem.index];
                  const uploadDate = dayjs(resource.createdAt);
                  
                  return (
                    <motion.div
                      key={virtualItem.key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                      className="flex flex-col md:flex-row items-center px-8 py-6 border-b border-primary/5 hover:bg-primary/[0.02] transition-all group"
                    >
                      {/* Icon */}
                      <div className="relative shrink-0 mb-4 md:mb-0">
                        <div className="h-16 w-16 rounded-2xl border-4 border-background flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform bg-background">
                            {getIcon(resource.type)}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 md:ml-8 text-center md:text-left min-w-0 w-full">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                          <h3 className="text-xl font-black tracking-tight truncate group-hover:text-primary transition-colors">
                            {resource.title}
                          </h3>
                          <div className="flex items-center justify-center md:justify-start gap-2">
                            <Badge 
                                variant="outline" 
                                className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border-primary/10"
                            >
                                {resource.type}
                            </Badge>
                            <Badge className="bg-primary/5 text-primary border-none font-black px-2 py-0.5 rounded-md text-[9px] tracking-widest uppercase">
                                {(resource as any).class?.name || "Global"}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 mt-3">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="p-1.5 rounded-lg bg-primary/5">
                                <Calendar className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="text-xs font-bold">
                                Uploaded {uploadDate.format("MMM D, YYYY")}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="p-1.5 rounded-lg bg-primary/5">
                                <Clock className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-tight">
                                {uploadDate.fromNow()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-6 md:mt-0 shrink-0">
                        <div className="hidden lg:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5"
                                asChild
                            >
                                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                    <Download className="h-4 w-4" />
                                </a>
                            </Button>
                            {isStaff && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5"
                                        onClick={() => edit("resources", resource.id)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                                        onClick={() => setDeleteTarget(resource.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                        </div>

                        <Button
                          variant="outline"
                          className="rounded-2xl px-8 h-12 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                          asChild
                        >
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            Open Resource
                            <ExternalLink className="h-4 w-4 ml-2" />
                          </a>
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl md:hidden lg:flex">
                                    <MoreHorizontal className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-[1.5rem] p-2">
                                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">Resource Options</DropdownMenuLabel>
                                <DropdownMenuItem className="rounded-xl gap-3 py-3 cursor-pointer" asChild>
                                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                        <Download className="h-4 w-4 text-primary" />
                                        <span className="font-bold">Download File</span>
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl gap-3 py-3 cursor-pointer">
                                    <Share2 className="h-4 w-4 text-primary" />
                                    <span className="font-bold">Share Link</span>
                                </DropdownMenuItem>
                                {isStaff && (
                                    <>
                                        <DropdownMenuSeparator className="my-2" />
                                        <DropdownMenuItem onClick={() => edit("resources", resource.id)} className="rounded-xl gap-3 py-3 cursor-pointer">
                                            <Pencil className="h-4 w-4 text-primary" />
                                            <span className="font-bold">Edit Details</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            onClick={() => setDeleteTarget(resource.id)} 
                                            className="rounded-xl gap-3 py-3 cursor-pointer text-destructive focus:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="font-bold">Delete Resource</span>
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </ListView>

      <AlertDialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl">
          <AlertDialogHeader className="space-y-4">
            <div className="p-4 rounded-2xl bg-destructive/10 text-destructive w-fit">
              <Trash2 className="h-8 w-8" />
            </div>
            <div className="space-y-1">
                <AlertDialogTitle className="text-3xl font-black tracking-tight">Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="font-medium text-base leading-relaxed">
                    This action cannot be undone. This will permanently delete the resource and remove it from all class libraries.
                </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 pt-6">
            <AlertDialogCancel className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-8">Cancel</AlertDialogCancel>
            <AlertDialogAction 
                onClick={handleConfirmDelete} 
                className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-12 bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xl shadow-destructive/20"
            >
                Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ResourcesListPage;

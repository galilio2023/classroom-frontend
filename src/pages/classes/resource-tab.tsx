import { useList, useCreate, useDelete, useGetIdentity } from "@refinedev/core";
import { useState } from "react";
import { Module, User, UserRole, Resource } from "@/types";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  PlusCircle, 
  BookOpen, 
  FileText, 
  Link as LinkIcon, 
  Video, 
  File,
  Loader2,
  LayoutGrid,
  Trash2,
  MoreVertical,
  ExternalLink,
  PenLine,
  Image as ImageIcon,
  Library,
  ArrowRight,
  Sparkles,
  LayoutDashboard,
  Info,
  Plus,
  Save
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileUpload } from "@/components/file-upload";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface ResourceTabProps {
  classId: string;
}

export const ResourceTab = ({ classId }: ResourceTabProps) => {
  const { data: identity } = useGetIdentity<User>();
  const isTeacher = identity?.role === UserRole.TEACHER || identity?.role === UserRole.ADMIN;

  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    type: "file" as "file" | "link" | "video" | "note" | "image" | "other",
    url: "",
    content: "",
    cldPubId: "",
  });

  const { query } = useList<Module>({
    resource: "modules",
    filters: [{ field: "classId", operator: "eq", value: classId }],
    queryOptions: { enabled: !!classId },
  });

  const modules = query.data?.data || [];
  const isLoading = query.isLoading;

  const { mutate: createResource, mutation } = useCreate<Resource>();
  const isCreatingResource = mutation.isPending;

  const { mutate: deleteResource } = useDelete();

  const handleAddResource = () => {
    if (!newResource.title || !activeModuleId) {
      toast.error("Please fill in all required fields");
      return;
    }

    createResource(
      {
        resource: "resources",
        values: { 
          ...newResource, 
          classId: Number(classId), 
          moduleId: activeModuleId 
        },
      },
      {
        onSuccess: () => {
          setIsAddResourceOpen(false);
          setNewResource({ title: "", description: "", type: "file", url: "", content: "", cldPubId: "" });
          setActiveModuleId(null);
          query.refetch();
          toast.success("Resource added to module");
        },
      }
    );
  };

  const handleDeleteResource = (id: number) => {
    deleteResource(
      { resource: "resources", id },
      {
        onSuccess: () => {
          toast.success("Resource deleted");
          query.refetch();
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Loading Materials...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Library className="h-4 w-4" />
            </div>
            <h3 className="text-xl font-black tracking-tight">Learning Materials</h3>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            Access all files, links, and notes for this class.
          </p>
        </div>
      </div>

      {modules.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2rem] overflow-hidden py-20 text-center">
            <CardContent className="space-y-6">
              <div className="relative mx-auto w-fit">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative p-6 rounded-full bg-primary/10 text-primary">
                  <LayoutGrid className="h-12 w-12 opacity-40" />
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-black tracking-tight">No materials yet</h4>
                <p className="text-muted-foreground font-medium max-w-xs mx-auto">Materials are organized by modules. Ask your teacher to add some!</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <Accordion type="multiple" className="w-full space-y-6">
          <AnimatePresence mode="popLayout">
            {modules.map((module: Module) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <AccordionItem 
                  value={`module-${module.id}`} 
                  className="border-none shadow-xl bg-card/50 backdrop-blur-xl rounded-[2rem] overflow-hidden group transition-all hover:shadow-2xl hover:bg-card/80"
                >
                  <div className="flex items-center justify-between w-full px-6">
                    <AccordionTrigger className="hover:no-underline py-6 flex-1 group/trigger">
                      <div className="flex items-center gap-4 text-left">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover/trigger:scale-110 transition-transform">
                          <BookOpen className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <div className="font-black text-lg tracking-tight group-hover/trigger:text-primary transition-colors">{module.name}</div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{module.resources?.length || 0} Items</span>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    {isTeacher && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-10 rounded-xl font-black uppercase tracking-widest text-[9px] gap-2 border-primary/20 text-primary hover:bg-primary/5 ml-4"
                        onClick={() => {
                          setActiveModuleId(module.id);
                          setIsAddResourceOpen(true);
                        }}
                      >
                        <PlusCircle className="h-3.5 w-3.5" />
                        Add Material
                      </Button>
                    )}
                  </div>
                  <AccordionContent className="pb-8 pt-2 px-8">
                    <div className="grid grid-cols-1 gap-3">
                      {module.resources && module.resources.length > 0 ? (
                        module.resources.map((res) => (
                          <div key={res.id} className="flex items-center justify-between p-4 rounded-2xl border border-black/[0.03] dark:border-white/[0.03] bg-muted/20 hover:bg-primary/5 transition-all cursor-pointer group/item">
                            <div className="flex items-center gap-4 overflow-hidden">
                              <div className={cn(
                                "p-2.5 rounded-xl shrink-0 transition-transform group-hover/item:scale-110",
                                res.type === 'video' ? 'bg-blue-500/10 text-blue-500' : 
                                res.type === 'link' ? 'bg-success/10 text-success' : 
                                res.type === 'note' ? 'bg-purple-500/10 text-purple-500' :
                                res.type === 'image' ? 'bg-pink-500/10 text-pink-500' :
                                'bg-orange-500/10 text-orange-500'
                              )}>
                                {res.type === 'video' ? <Video className="h-4 w-4" /> : 
                                 res.type === 'link' ? <LinkIcon className="h-4 w-4" /> : 
                                 res.type === 'note' ? <PenLine className="h-4 w-4" /> :
                                 res.type === 'image' ? <ImageIcon className="h-4 w-4" /> :
                                 <File className="h-4 w-4" />}
                              </div>
                              <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-black tracking-tight group-hover/item:text-primary transition-colors truncate">{res.title}</span>
                                {res.description && <span className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-widest truncate">{res.description}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {res.type === 'note' ? (
                                <Button variant="ghost" size="sm" asChild className="h-9 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest gap-2 text-primary hover:bg-primary/10 transition-all">
                                  <Link to={`/classes/${classId}/lessons/${res.id}`}>
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    Open Lesson
                                    <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all" />
                                  </Link>
                                </Button>
                              ) : (
                                <Button variant="ghost" size="sm" asChild className="h-9 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest gap-2 hover:bg-muted transition-all">
                                  <a href={res.url} target="_blank" rel="noreferrer">
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    View
                                  </a>
                                </Button>
                              )}
                              {isTeacher && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-9 w-9 rounded-xl text-destructive opacity-0 group-hover/item:opacity-100 transition-opacity hover:bg-destructive/5"
                                  onClick={() => handleDeleteResource(res.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-10 rounded-2xl border-2 border-dashed border-muted-foreground/10 flex flex-col items-center justify-center gap-3 text-muted-foreground/40">
                          <Library className="h-8 w-8 opacity-20" />
                          <p className="text-[10px] font-black uppercase tracking-widest">No materials in this module</p>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </AnimatePresence>
        </Accordion>
      )}

      {/* Add Resource Dialog */}
      <Dialog open={isAddResourceOpen} onOpenChange={setIsAddResourceOpen}>
        <DialogContent className="sm:max-w-[650px] rounded-[2rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl">
          <DialogHeader className="space-y-3">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary w-fit">
              <PlusCircle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight">Add Material</DialogTitle>
            <DialogDescription className="font-medium">Share a file, link, or note with your students.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Lesson Notes" 
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                  className="h-12 rounded-xl bg-muted/20 border-none focus-visible:ring-primary font-bold"
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="type" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Type</Label>
                <Select 
                  value={newResource.type} 
                  onValueChange={(v: any) => setNewResource({ ...newResource, type: v })}
                >
                  <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-none focus:ring-primary transition-all font-bold">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-2xl">
                    <SelectItem value="note" className="rounded-lg font-bold">Written Note</SelectItem>
                    <SelectItem value="file" className="rounded-lg font-bold">File (PDF, Doc)</SelectItem>
                    <SelectItem value="image" className="rounded-lg font-bold">Image</SelectItem>
                    <SelectItem value="link" className="rounded-lg font-bold">External Link</SelectItem>
                    <SelectItem value="video" className="rounded-lg font-bold">Video URL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {newResource.type === "note" && (
              <div className="space-y-2.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Content (Markdown)</Label>
                <Textarea 
                  placeholder="Type your lesson notes here..." 
                  value={newResource.content}
                  onChange={(e) => setNewResource({ ...newResource, content: e.target.value })}
                  className="min-h-[250px] rounded-2xl bg-muted/20 border-none focus-visible:ring-primary p-5 text-sm leading-relaxed font-mono shadow-inner"
                />
              </div>
            )}
            
            {(newResource.type === "file" || newResource.type === "image") && (
              <div className="space-y-2.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Upload {newResource.type === "image" ? "Image" : "File"}</Label>
                <div className="p-6 rounded-2xl border-2 border-dashed border-muted-foreground/10 bg-muted/10">
                  <FileUpload 
                    onUploadSuccess={(url, pubId) => setNewResource({ ...newResource, url, cldPubId: pubId })}
                  />
                </div>
              </div>
            )}

            {(newResource.type === "link" || newResource.type === "video") && (
              <div className="space-y-2.5">
                <Label htmlFor="url" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">URL</Label>
                <div className="relative group">
                  <Input 
                    id="url" 
                    placeholder="https://..." 
                    value={newResource.url}
                    onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                    className="h-12 rounded-xl bg-muted/20 border-none focus-visible:ring-primary font-bold pl-10"
                  />
                  <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
              </div>
            )}
            
            <div className="space-y-2.5">
              <Label htmlFor="desc" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description (Optional)</Label>
              <Input 
                id="desc" 
                placeholder="Brief summary"
                value={newResource.description}
                onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                className="h-12 rounded-xl bg-muted/20 border-none focus-visible:ring-primary font-bold"
              />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="ghost" className="rounded-xl font-bold h-12" onClick={() => setIsAddResourceOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAddResource} 
              disabled={isCreatingResource}
              className="rounded-xl font-black uppercase tracking-widest h-12 px-8 shadow-lg shadow-primary/20"
            >
              {isCreatingResource ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Material
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

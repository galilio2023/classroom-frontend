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
  PenLine
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
    type: "file" as "file" | "link" | "video" | "note" | "other",
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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Learning Materials</h3>
          <p className="text-sm text-muted-foreground">
            Access all files, links, and notes for this class.
          </p>
        </div>
      </div>

      {modules.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-3 bg-muted rounded-full mb-4">
              <LayoutGrid className="h-8 w-8 text-muted-foreground" />
            </div>
            <h4 className="font-medium">No materials yet</h4>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
              Materials are organized by modules. Ask your teacher to add some!
            </p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="w-full space-y-4">
          {modules.map((module: Module) => (
            <AccordionItem key={module.id} value={`module-${module.id}`} className="border rounded-lg bg-card px-4">
              <div className="flex items-center">
                <AccordionTrigger className="hover:no-underline py-4 flex-1">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-primary/10 rounded-md">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-bold">{module.name}</div>
                      <div className="text-xs text-muted-foreground font-normal">
                        {module.resources?.length || 0} items
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                {isTeacher && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs ml-2"
                    onClick={() => {
                      setActiveModuleId(module.id);
                      setIsAddResourceOpen(true);
                    }}
                  >
                    <PlusCircle className="h-3 w-3 mr-1.5" />
                    Add
                  </Button>
                )}
              </div>
              <AccordionContent className="pb-6 pt-2">
                <div className="grid grid-cols-1 gap-2">
                  {module.resources && module.resources.length > 0 ? (
                    module.resources.map((res) => (
                      <div key={res.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center gap-3 overflow-hidden">
                          {res.type === 'video' ? <Video className="h-4 w-4 shrink-0 text-blue-500" /> : 
                           res.type === 'link' ? <LinkIcon className="h-4 w-4 shrink-0 text-green-500" /> : 
                           res.type === 'note' ? <PenLine className="h-4 w-4 shrink-0 text-purple-500" /> :
                           <File className="h-4 w-4 shrink-0 text-orange-500" />}
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium truncate">{res.title}</span>
                            {res.description && <span className="text-[10px] text-muted-foreground truncate">{res.description}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {res.type === 'note' ? (
                            <Button variant="ghost" size="sm" asChild className="h-8 px-3 text-xs gap-2 text-primary hover:bg-primary/10">
                              <Link to={`/classes/${classId}/lessons/${res.id}`}>
                                <ExternalLink className="h-3.5 w-3.5" />
                                Open
                              </Link>
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" asChild className="h-8 px-3 text-xs gap-2">
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
                              className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDeleteResource(res.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic py-4 text-center">No materials in this module.</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Add Resource Dialog */}
      <Dialog open={isAddResourceOpen} onOpenChange={setIsAddResourceOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Material</DialogTitle>
            <DialogDescription>Share a file, link, or note with your students.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Lesson Notes" 
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select 
                  value={newResource.type} 
                  onValueChange={(v: any) => setNewResource({ ...newResource, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="note">Written Note</SelectItem>
                    <SelectItem value="file">File (PDF, Doc)</SelectItem>
                    <SelectItem value="link">External Link</SelectItem>
                    <SelectItem value="video">Video URL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {newResource.type === "note" && (
              <div className="grid gap-2">
                <Label>Content (Markdown)</Label>
                <Textarea 
                  placeholder="Type your lesson notes here..." 
                  value={newResource.content}
                  onChange={(e) => setNewResource({ ...newResource, content: e.target.value })}
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
            )}
            
            {newResource.type === "file" && (
              <div className="grid gap-2">
                <Label>Upload File</Label>
                <FileUpload 
                  onUploadSuccess={(url, pubId) => setNewResource({ ...newResource, url, cldPubId: pubId })}
                />
              </div>
            )}

            {(newResource.type === "link" || newResource.type === "video") && (
              <div className="grid gap-2">
                <Label htmlFor="url">URL</Label>
                <Input 
                  id="url" 
                  placeholder="https://..." 
                  value={newResource.url}
                  onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                />
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="desc">Description (Optional)</Label>
              <Input 
                id="desc" 
                placeholder="Brief summary"
                value={newResource.description}
                onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddResourceOpen(false)}>Cancel</Button>
            <Button onClick={handleAddResource} disabled={isCreatingResource}>
              {isCreatingResource && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

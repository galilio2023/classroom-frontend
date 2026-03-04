import { useList, useCreate, useDelete, useGetIdentity } from "@refinedev/core";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Resource, User, Module } from "@/types";
import { FileText, Link as LinkIcon, Video, Trash2, Plus, ExternalLink, Download, Loader2, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { FileUpload } from "@/components/file-upload";

interface ResourceTabProps {
  classId: string;
}

export const ResourceTab = ({ classId }: ResourceTabProps) => {
  const { data: identity } = useGetIdentity<User>();
  const isStaff = identity?.role === "teacher" || identity?.role === "admin";
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    type: "file" as "file" | "link" | "video" | "other",
    url: "",
    cldPubId: "",
    moduleId: null as number | null,
  });

  // --- REFINE HOOKS ---
  const { result, query } = useList<Resource>({
    resource: "resources",
    filters: [{ field: "classId", operator: "eq", value: classId }],
    pagination: { mode: "off" },
  });

  const { data: modulesData } = useList<Module>({
    resource: "modules",
    filters: [{ field: "classId", operator: "eq", value: classId }],
    queryOptions: { enabled: !!classId },
  });

  const resources = result?.data || [];
  const modules = modulesData?.data || [];
  const isLoading = query.isLoading;
  const refetch = query.refetch;

  const { mutate: createResource, mutation } = useCreate<Resource, any, any>();
  const isCreating = mutation.isPending;

  const { mutate: deleteResource } = useDelete();

  const handleAdd = () => {
    if (!newResource.title || !newResource.url) {
      toast.error("Please fill in all required fields");
      return;
    }

    createResource(
      {
        resource: "resources",
        values: { ...newResource, classId: Number(classId) },
      },
      {
        onSuccess: () => {
          setIsAddOpen(false);
          setNewResource({ title: "", description: "", type: "file", url: "", cldPubId: "", moduleId: null });
          refetch();
          toast.success("Resource added successfully");
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteResource(
      { resource: "resources", id },
      {
        onSuccess: () => {
          refetch();
          toast.success("Resource deleted");
        },
      }
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "file": return <FileText className="h-5 w-5 text-blue-500" />;
      case "link": return <LinkIcon className="h-5 w-5 text-green-500" />;
      case "video": return <Video className="h-5 w-5 text-red-500" />;
      default: return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Resource Library</h3>
          <p className="text-sm text-muted-foreground">Persistent materials and links for this class.</p>
        </div>
        {isStaff && (
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Resource</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g. Course Syllabus" 
                    value={newResource.title}
                    onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="flex items-center gap-2">
                    <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
                    Curriculum Module (Optional)
                  </Label>
                  <Select 
                    value={newResource.moduleId?.toString() || "0"} 
                    onValueChange={(v) => setNewResource({ ...newResource, moduleId: v === "0" ? null : Number(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a module" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None (Global Resource)</SelectItem>
                      {modules.map((m) => (
                        <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      <SelectItem value="file">File (PDF, Doc)</SelectItem>
                      <SelectItem value="link">External Link</SelectItem>
                      <SelectItem value="video">Video URL</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {newResource.type === "file" ? (
                  <div className="grid gap-2">
                    <Label>Upload File</Label>
                    <FileUpload 
                      onUploadSuccess={(url, pubId) => setNewResource({ ...newResource, url, cldPubId: pubId })}
                    />
                  </div>
                ) : (
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
                    value={newResource.description}
                    onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAdd} disabled={isCreating}>
                  {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Resource
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : resources.length === 0 ? (
          <div className="col-span-full text-center py-20 border-2 border-dashed rounded-xl bg-muted/30">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground">No resources shared yet.</p>
          </div>
        ) : (
          resources.map((resource: Resource) => (
            <Card key={resource.id} className="group hover:shadow-md transition-all">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-muted rounded-lg">
                    {getIcon(resource.type)}
                  </div>
                  {isStaff && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(resource.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <CardTitle className="text-sm mb-1 truncate">{resource.title}</CardTitle>
                <CardDescription className="text-xs line-clamp-2 mb-4 h-8">
                  {resource.description || "No description provided."}
                </CardDescription>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs"
                  asChild
                >
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    {resource.type === "file" ? (
                      <><Download className="h-3 w-3 mr-2" /> Download</>
                    ) : (
                      <><ExternalLink className="h-3 w-3 mr-2" /> Open Link</>
                    )}
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

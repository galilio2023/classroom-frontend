import { useList, useCreate, useGetIdentity, useCustomMutation, useDelete, useGo } from "@refinedev/core";
import { useState } from "react";
import { Module, User, UserRole, Resource, Progress } from "@/types";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  PlusCircle, 
  Loader2,
  LayoutGrid,
  Zap,
  Target,
  MessageSquare,
  GraduationCap
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileUpload } from "@/components/file-upload";
import { ModuleItem } from "@/components/classes/curriculum/module-item";

interface CurriculumTabProps {
  classId: string;
}

export const CurriculumTab = ({ classId }: CurriculumTabProps) => {
  const { data: identity } = useGetIdentity<User>();
  const isTeacher = identity?.role === UserRole.TEACHER || identity?.role === UserRole.ADMIN;
  const isStudent = identity?.role === UserRole.STUDENT;
  const go = useGo();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newModuleName, setNewModuleName] = useState("");
  const [newModuleDesc, setNewModuleDesc] = useState("");

  const [isMagicModalOpen, setIsMagicModalOpen] = useState(false);
  const [isMagicCreating, setIsMagicCreating] = useState(false);
  const [magicConfig, setMagicConfig] = useState({
    topic: "",
    type: "package" as "package" | "note" | "quiz" | "assignment", 
    level: "high_school",
    tone: "academic",
    objectives: "",
    moduleId: null as number | null,
  });

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

  const { query: modulesQuery } = useList<Module>({
    resource: "modules",
    filters: [{ field: "classId", operator: "eq", value: classId }],
    queryOptions: { enabled: !!classId },
  });

  const { query: progressQuery } = useList<Progress>({
    resource: "progress",
    filters: [{ field: "classId", operator: "eq", value: classId }],
    queryOptions: { enabled: !!classId && isStudent },
  });

  const modules = modulesQuery.data?.data || [];
  const userProgress = progressQuery.data?.data || [];
  const isLoading = modulesQuery.isLoading;

  const { mutate: createModule } = useCreate();
  const { mutate: createResource } = useCreate<Resource>();
  const { mutate: deleteModule } = useDelete();
  const { mutate: customMutation } = useCustomMutation();

  const isItemCompleted = (type: 'resource' | 'assignment' | 'quiz', id: number) => {
    return userProgress.some((p: Progress) =>
        p.isCompleted && (
            (type === 'resource' && p.resourceId === id) ||
            (type === 'assignment' && p.assignmentId === id) ||
            (type === 'quiz' && p.quizId === id)
        )
    );
  };

  const handleToggleProgress = (type: 'resource' | 'assignment' | 'quiz', id: number, moduleId: number) => {
    const currentStatus = isItemCompleted(type, id);
    customMutation(
      {
        url: "progress/toggle",
        method: "post",
        values: {
          classId: Number(classId),
          moduleId,
          resourceId: type === 'resource' ? id : undefined,
          assignmentId: type === 'assignment' ? id : undefined,
          quizId: type === 'quiz' ? id : undefined,
          isCompleted: !currentStatus
        },
      },
      { onSuccess: () => { void progressQuery.refetch(); toast.success(!currentStatus ? "Marked as completed!" : "Marked as incomplete"); } }
    );
  };

  const handleCreateModule = () => {
    if (!newModuleName.trim()) return;
    createModule(
      { resource: "modules", values: { name: newModuleName, description: newModuleDesc, classId: Number(classId), order: modules.length } },
      { onSuccess: () => { setIsCreateModalOpen(false); setNewModuleName(""); setNewModuleDesc(""); void modulesQuery.refetch(); } }
    );
  };

  const handleMagicCreate = () => {
    if (!magicConfig.topic.trim()) return;
    setIsMagicCreating(true);
    customMutation(
      { url: "modules/magic-create", method: "post", values: { classId: Number(classId), ...magicConfig } },
      { onSuccess: () => { setIsMagicCreating(false); setIsMagicModalOpen(false); void modulesQuery.refetch(); }, onError: () => setIsMagicCreating(false) }
    );
  };

  const handleAddResource = () => {
    if (!newResource.title || !activeModuleId) return;
    createResource(
      { resource: "resources", values: { ...newResource, classId: Number(classId), moduleId: activeModuleId } },
      { onSuccess: () => { setIsAddResourceOpen(false); setNewResource({ title: "", description: "", type: "file", url: "", content: "", cldPubId: "" }); void modulesQuery.refetch(); } }
    );
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Course Curriculum</h3>
          <p className="text-sm text-muted-foreground">Structured lessons and materials for this class.</p>
        </div>
        {isTeacher && (
          <div className="flex gap-2">
            <Button variant="outline" className="border-purple-500/30 text-purple-600" onClick={() => { setMagicConfig({ ...magicConfig, moduleId: null, type: "package" }); setIsMagicModalOpen(true); }}>
              <Zap className="h-4 w-4 mr-2" /> Magic Builder
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}><PlusCircle className="h-4 w-4 mr-2" /> Add Module</Button>
          </div>
        )}
      </div>

      {modules.length === 0 ? (
        <Card className="border-dashed py-12 text-center">
          <CardContent>
            <LayoutGrid className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
            <h4 className="font-medium">No modules yet</h4>
            {isTeacher && <Button onClick={() => setIsCreateModalOpen(true)} className="mt-4">Manual Create</Button>}
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="w-full space-y-4">
          {modules.map((module) => (
            <ModuleItem 
              key={module.id}
              module={module}
              isTeacher={isTeacher}
              isStudent={isStudent}
              classId={classId}
              isItemCompleted={isItemCompleted}
              onToggleProgress={handleToggleProgress}
              onDeleteModule={(id) => deleteModule({ resource: "modules", id }, { onSuccess: () => { void modulesQuery.refetch(); } })}
              onMagicAction={(moduleId, type) => { setMagicConfig({ ...magicConfig, moduleId, type: type as any }); setIsMagicModalOpen(true); }}
              onAddMaterial={(moduleId) => { setActiveModuleId(moduleId); setIsAddResourceOpen(true); }}
              onAddTask={(moduleId) => go({ to: `/assignments/create?classId=${classId}&moduleId=${moduleId}` })}
            />
          ))}
        </Accordion>
      )}

      <Dialog open={isMagicModalOpen} onOpenChange={setIsMagicModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-500" />
                AI Magic Builder
            </DialogTitle>
            <DialogDescription>
                Generate a complete lesson package or specific materials using Gemini AI.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Topic</Label>
                <Input placeholder="e.g. Photosynthesis, Quantum Mechanics" value={magicConfig.topic} onChange={(e) => setMagicConfig({ ...magicConfig, topic: e.target.value })} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Content Type</Label>
                    <Select value={magicConfig.type} onValueChange={(v: any) => setMagicConfig({ ...magicConfig, type: v })}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="package">Full Package</SelectItem>
                            <SelectItem value="note">Lesson Notes</SelectItem>
                            <SelectItem value="quiz">Quiz</SelectItem>
                            <SelectItem value="assignment">Assignment</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Grade Level</Label>
                    <Select value={magicConfig.level} onValueChange={(v: any) => setMagicConfig({ ...magicConfig, level: v })}>
                        <SelectTrigger>
                            <div className="flex items-center gap-2">
                                <GraduationCap className="h-3.5 w-3.5 text-primary" />
                                <SelectValue />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="primary">Primary School</SelectItem>
                            <SelectItem value="high_school">High School</SelectItem>
                            <SelectItem value="university">University</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tone & Style</Label>
                <Select value={magicConfig.tone} onValueChange={(v: any) => setMagicConfig({ ...magicConfig, tone: v })}>
                    <SelectTrigger>
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-3.5 w-3.5 text-primary" />
                            <SelectValue />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="academic">Academic & Formal</SelectItem>
                        <SelectItem value="creative">Creative & Engaging</SelectItem>
                        <SelectItem value="practical">Practical & Hands-on</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Target className="h-3.5 w-3.5 text-primary" />
                    Learning Objectives (Optional)
                </Label>
                <Textarea 
                    placeholder="e.g. Focus on chemical equations, or historical context..." 
                    value={magicConfig.objectives} 
                    onChange={(e) => setMagicConfig({ ...magicConfig, objectives: e.target.value })}
                    className="resize-none h-20 text-xs"
                />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMagicModalOpen(false)}>Cancel</Button>
            <Button onClick={handleMagicCreate} disabled={isMagicCreating} className="bg-purple-600 hover:bg-purple-700">
                {isMagicCreating ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                    </>
                ) : (
                    <>
                        <Zap className="h-4 w-4 mr-2" />
                        Generate
                    </>
                )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddResourceOpen} onOpenChange={setIsAddResourceOpen}>
        <DialogContent className="sm:max-w-150">
          <DialogHeader><DialogTitle>Add Material</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Title</Label><Input value={newResource.title} onChange={(e) => setNewResource({ ...newResource, title: e.target.value })} /></div>
              <div className="space-y-2"><Label>Type</Label><Select value={newResource.type} onValueChange={(v: any) => setNewResource({ ...newResource, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="note">Note</SelectItem><SelectItem value="file">File</SelectItem><SelectItem value="link">Link</SelectItem></SelectContent></Select></div>
            </div>
            {newResource.type === "note" && <Textarea className="min-h-50" value={newResource.content} onChange={(e) => setNewResource({ ...newResource, content: e.target.value })} />}
            {newResource.type === "file" && <FileUpload onUploadSuccess={(url, pubId) => setNewResource({ ...newResource, url, cldPubId: pubId })} />}
          </div>
          <DialogFooter><Button onClick={handleAddResource}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Module</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2"><Label>Name</Label><Input value={newModuleName} onChange={(e) => setNewModuleName(e.target.value)} /></div>
            <div className="grid gap-2"><Label>Description</Label><Textarea value={newModuleDesc} onChange={(e) => setNewModuleDesc(e.target.value)} /></div>
          </div>
          <DialogFooter><Button onClick={handleCreateModule}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

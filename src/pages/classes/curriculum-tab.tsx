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
  Sparkles,
  Wand2,
  Zap,
  HelpCircle
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileUpload } from "@/components/file-upload";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ModuleItem } from "@/components/classes/curriculum/module-item";

interface CurriculumTabProps {
  classId: string;
}

const FieldHelper = ({ content }: { content: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help hover:text-primary transition-colors" />
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-[200px]">
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const CurriculumTab = ({ classId }: CurriculumTabProps) => {
  const { data: identity } = useGetIdentity<User>();
  const isTeacher = identity?.role === UserRole.TEACHER || identity?.role === UserRole.ADMIN;
  const isStudent = identity?.role === UserRole.STUDENT;
  const go = useGo();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newModuleName, setNewModuleName] = useState("");
  const [newModuleDesc, setNewModuleDesc] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Unified Magic Builder State
  const [isMagicModalOpen, setIsMagicModalOpen] = useState(false);
  const [isMagicCreating, setIsMagicCreating] = useState(false);
  const [magicConfig, setMagicConfig] = useState({
    topic: "",
    type: "package", 
    level: "high_school",
    moduleId: null as number | null,
  });

  // Resource Modal State
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

  const [isGeneratingNote, setIsGeneratingNote] = useState(false);
  const [noteBuilder, setNoteBuilder] = useState({ topic: "", type: "lesson", level: "high_school", tone: "engaging" });

  // --- DATA FETCHING ---
  const { result, query } = useList<Module>({
    resource: "modules",
    filters: [{ field: "classId", operator: "eq", value: classId }],
    queryOptions: { enabled: !!classId },
  });

  const { data: progressData, query: progressQuery } = useList<Progress>({
    resource: "progress",
    filters: [{ field: "classId", operator: "eq", value: classId }],
    queryOptions: { enabled: !!classId && isStudent },
  });

  const modules = result?.data || [];
  const userProgress = progressData?.data || [];
  const isLoading = query.isLoading;

  const { mutate: createModule, mutation } = useCreate();
  const { mutate: createResource, mutation: resourceMutation } = useCreate<Resource>();
  const { mutate: deleteModule } = useDelete();
  const { mutate: customMutation } = useCustomMutation();

  // --- HELPERS ---
  const isItemCompleted = (type: 'resource' | 'assignment' | 'quiz', id: number) => {
    return userProgress.some(p => 
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
      { onSuccess: () => { progressQuery.refetch(); toast.success(!currentStatus ? "Marked as completed!" : "Marked as incomplete"); } }
    );
  };

  const handleCreateModule = () => {
    if (!newModuleName.trim()) return;
    createModule(
      { resource: "modules", values: { name: newModuleName, description: newModuleDesc, classId: Number(classId), order: modules.length } },
      { onSuccess: () => { setIsCreateModalOpen(false); setNewModuleName(""); setNewModuleDesc(""); query.refetch(); } }
    );
  };

  const handleMagicCreate = () => {
    if (!magicConfig.topic.trim()) return;
    setIsMagicCreating(true);
    customMutation(
      { url: "modules/magic-create", method: "post", values: { classId: Number(classId), ...magicConfig } },
      { onSuccess: () => { setIsMagicCreating(false); setIsMagicModalOpen(false); query.refetch(); }, onError: () => setIsMagicCreating(false) }
    );
  };

  const handleAddResource = () => {
    if (!newResource.title || !activeModuleId) return;
    createResource(
      { resource: "resources", values: { ...newResource, classId: Number(classId), moduleId: activeModuleId } },
      { onSuccess: () => { setIsAddResourceOpen(false); setNewResource({ title: "", description: "", type: "file", url: "", content: "", cldPubId: "" }); query.refetch(); } }
    );
  };

  const handleAIGenerateNote = () => {
    setIsGeneratingNote(true);
    customMutation(
      { url: "ai/generate-content", method: "post", values: { prompt: `Generate ${noteBuilder.type} about ${noteBuilder.topic}`, context: `Class ID: ${classId}` } },
      { onSuccess: (data: any) => { setNewResource({ ...newResource, title: noteBuilder.topic, content: data.data.content }); setIsGeneratingNote(false); }, onError: () => setIsGeneratingNote(false) }
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
              onDeleteModule={(id) => deleteModule({ resource: "modules", id }, { onSuccess: () => query.refetch() })}
              onMagicAction={(moduleId, type) => { setMagicConfig({ ...magicConfig, moduleId, type: type as any }); setIsMagicModalOpen(true); }}
              onAddMaterial={(moduleId) => { setActiveModuleId(moduleId); setIsAddResourceOpen(true); }}
              onAddTask={(moduleId) => go({ to: `/assignments/create?classId=${classId}&moduleId=${moduleId}` })}
            />
          ))}
        </Accordion>
      )}

      {/* DIALOGS (Magic Builder, Add Resource, etc.) */}
      <Dialog open={isMagicModalOpen} onOpenChange={setIsMagicModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>AI Magic Builder</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Topic</Label><Input placeholder="e.g. Photosynthesis" value={magicConfig.topic} onChange={(e) => setMagicConfig({ ...magicConfig, topic: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Type</Label><Select value={magicConfig.type} onValueChange={(v: any) => setMagicConfig({ ...magicConfig, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="package">Full Package</SelectItem><SelectItem value="note">Lesson Notes</SelectItem><SelectItem value="quiz">Quiz</SelectItem><SelectItem value="assignment">Assignment</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label>Level</Label><Select value={magicConfig.level} onValueChange={(v: any) => setMagicConfig({ ...magicConfig, level: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="primary">Primary</SelectItem><SelectItem value="high_school">High School</SelectItem><SelectItem value="university">University</SelectItem></SelectContent></Select></div>
            </div>
          </div>
          <DialogFooter><Button onClick={handleMagicCreate} disabled={isMagicCreating}>{isMagicCreating ? "Generating..." : "Generate"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddResourceOpen} onOpenChange={setIsAddResourceOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>Add Material</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Title</Label><Input value={newResource.title} onChange={(e) => setNewResource({ ...newResource, title: e.target.value })} /></div>
              <div className="space-y-2"><Label>Type</Label><Select value={newResource.type} onValueChange={(v: any) => setNewResource({ ...newResource, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="note">Note</SelectItem><SelectItem value="file">File</SelectItem><SelectItem value="link">Link</SelectItem></SelectContent></Select></div>
            </div>
            {newResource.type === "note" && <Textarea className="min-h-[200px]" value={newResource.content} onChange={(e) => setNewResource({ ...newResource, content: e.target.value })} />}
            {newResource.type === "file" && <FileUpload onUploadSuccess={(url, pubId) => setNewResource({ ...newResource, url, cldPubId: pubId })} />}
          </div>
          <DialogFooter><Button onClick={handleAddResource}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Module</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Name</Label><Input value={newModuleName} onChange={(e) => setNewModuleName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={newModuleDesc} onChange={(e) => setNewModuleDesc(e.target.value)} /></div>
          </div>
          <DialogFooter><Button onClick={handleCreateModule}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

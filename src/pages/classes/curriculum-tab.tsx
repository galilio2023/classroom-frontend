import { useList, useCreate, useGetIdentity, useCustomMutation, useDelete, useGo } from "@refinedev/core";
import { useState } from "react";
import { Module, User, UserRole, Resource, Progress } from "@/types";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Loader2, LayoutGrid, Zap } from "lucide-react";
import { toast } from "sonner";
import { ModuleItem } from "@/components/classes/curriculum/module-item";
import { MagicBuilderDialog } from "@/components/classes/curriculum/magic-builder-dialog";
import { CreateModuleDialog } from "@/components/classes/curriculum/create-module-dialog";
import { AddResourceDialog } from "@/components/classes/curriculum/add-resource-dialog";

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

      <MagicBuilderDialog 
        isOpen={isMagicModalOpen}
        onOpenChange={setIsMagicModalOpen}
        config={magicConfig}
        setConfig={setMagicConfig}
        onGenerate={handleMagicCreate}
        isGenerating={isMagicCreating}
      />

      <AddResourceDialog 
        isOpen={isAddResourceOpen}
        onOpenChange={setIsAddResourceOpen}
        resource={newResource}
        setResource={setNewResource}
        onSave={handleAddResource}
      />

      <CreateModuleDialog 
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        name={newModuleName}
        setName={setNewModuleName}
        description={newModuleDesc}
        setDescription={setNewModuleDesc}
        onCreate={handleCreateModule}
      />
    </div>
  );
};

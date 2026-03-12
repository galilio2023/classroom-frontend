import { useList, useCreate, useGetIdentity, useCustomMutation, useDelete, useGo } from "@refinedev/core";
import { useState } from "react";
import { Module, User, UserRole, Resource, Progress } from "@/types";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Loader2, LayoutGrid, Zap, Sparkles, BookOpen, LayoutDashboard, Info, Plus, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { ModuleItem } from "@/components/classes/curriculum/module-item";
import { MagicBuilderDialog, MagicBuilderConfig } from "@/components/classes/curriculum/magic-builder-dialog";
import { CreateModuleDialog } from "@/components/classes/curriculum/create-module-dialog";
import { AddResourceDialog } from "@/components/classes/curriculum/add-resource-dialog";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface CurriculumTabProps {
  classId: string;
}

export const CurriculumTab = ({ classId }: CurriculumTabProps) => {
  const { t } = useTranslation();
  const { data: identity } = useGetIdentity<User>();
  const isTeacher = identity?.role === UserRole.TEACHER || identity?.role === UserRole.ADMIN;
  const isStudent = identity?.role === UserRole.STUDENT;
  const go = useGo();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newModuleName, setNewModuleName] = useState("");
  const [newModuleDesc, setNewModuleDesc] = useState("");

  const [isMagicModalOpen, setIsMagicModalOpen] = useState(false);
  const [isMagicCreating, setIsMagicCreating] = useState(false);
  const [magicConfig, setMagicConfig] = useState<MagicBuilderConfig>({
    topic: "",
    type: "package", 
    level: "high_school",
    tone: "academic",
    objectives: "",
    moduleId: null,
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
      { onSuccess: () => { void progressQuery.refetch(); toast.success(!currentStatus ? t("classes.curriculum.toast.completed") : t("classes.curriculum.toast.incomplete")); } }
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

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-start">
      <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{t("classes.curriculum.loading")}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <BookOpen className="h-4 w-4" />
            </div>
            <h3 className="text-xl font-black tracking-tight">{t("classes.curriculum.courseCurriculum")}</h3>
          </div>
          <p className="text-sm text-muted-foreground font-medium">{t("classes.curriculum.curriculumDescription")}</p>
        </div>
        {isTeacher && (
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="rounded-xl h-11 px-6 border-ai-primary/20 text-ai-primary hover:bg-ai-primary/5 font-black uppercase tracking-widest text-[10px] gap-2 relative overflow-hidden group shadow-sm"
              onClick={() => { setMagicConfig({ ...magicConfig, moduleId: null, type: "package" }); setIsMagicModalOpen(true); }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out] pointer-events-none" />
              <Sparkles className="h-4 w-4" />
              {t("buttons.magicBuilder")}
            </Button>
            <Button 
              onClick={() => {
                setNewModuleName("");
                setNewModuleDesc("");
                setIsCreateModalOpen(true);
              }}
              className="rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              {t("buttons.addModule")}
            </Button>
          </div>
        )}
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
                <h4 className="text-2xl font-black tracking-tight">{t("classes.curriculum.noModules")}</h4>
                <p className="text-muted-foreground font-medium max-w-xs mx-auto">{t("classes.curriculum.noModulesDescription")}</p>
              </div>
              {isTeacher && (
                <div className="flex items-center justify-center gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsMagicModalOpen(true)}
                    className="rounded-xl h-12 px-8 border-ai-primary/20 text-ai-primary hover:bg-ai-primary/5 font-black uppercase tracking-widest text-[10px] gap-2"
                  >
                    <Wand2 className="h-4 w-4" />
                    {t("buttons.aiMagicBuilder")}
                  </Button>
                  <Button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="rounded-xl h-12 px-8 font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/20"
                  >
                    <Plus className="h-4 w-4" />
                    {t("buttons.manualCreate")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              <LayoutDashboard className="h-3 w-3" />
              {t("classes.curriculum.modulesPublished", { count: modules.length })}
            </div>
            {isStudent && (
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                <Zap className="h-3 w-3" />
                {t("classes.curriculum.itemsCompleted", { count: userProgress.filter(p => p.isCompleted).length })}
              </div>
            )}
          </div>
          
          <Accordion type="multiple" className="w-full space-y-6">
            <AnimatePresence mode="popLayout">
              {modules.map((module, idx) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <ModuleItem 
                    module={module}
                    isTeacher={isTeacher}
                    isStudent={isStudent}
                    classId={classId}
                    isItemCompleted={isItemCompleted}
                    onToggleProgress={handleToggleProgress}
                    onDeleteModule={(id) => deleteModule({ resource: "modules", id }, { onSuccess: () => { void modulesQuery.refetch(); } })}
                    onMagicAction={(moduleId, type) => { setMagicConfig({ ...magicConfig, moduleId, type: type as any }); setIsMagicModalOpen(true); }}
                    onAddMaterial={(moduleId) => { 
                      setActiveModuleId(moduleId); 
                      setNewResource({
                        title: "",
                        description: "",
                        type: "file",
                        url: "",
                        content: "",
                        cldPubId: "",
                      });
                      setIsAddResourceOpen(true); 
                    }}
                    onAddTask={(moduleId) => go({ to: `/assignments/create?classId=${classId}&moduleId=${moduleId}` })}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </Accordion>
        </div>
      )}

      {isTeacher && (
        <MagicBuilderDialog 
          isOpen={isMagicModalOpen}
          onOpenChange={setIsMagicModalOpen}
          config={magicConfig}
          setConfig={setMagicConfig}
          onGenerate={handleMagicCreate}
          isGenerating={isMagicCreating}
        />
      )}

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

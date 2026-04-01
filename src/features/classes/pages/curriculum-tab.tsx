import {
  useCreate,
  useCustomMutation,
  useDelete,
  useGetIdentity,
  useGo,
  useList,
  CrudFilter,
} from "@refinedev/core";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Class, Module, Progress, Resource, User, UserRole, ListResponse } from "@/types";
import { CurriculumEmptyState } from "../components/class-empty-states";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { BookOpen, LayoutDashboard, Loader2, PlusCircle, Sparkles, Wand2, Zap } from "lucide-react";
import { toast } from "sonner";
import { ModuleItem } from "@/components/classes/curriculum/module-item";
import {
  MagicBuilderConfig,
  MagicBuilderDialog,
} from "@/components/classes/curriculum/magic-builder-dialog";
import { CreateModuleDialog } from "@/components/classes/curriculum/create-module-dialog";
import { AddResourceDialog } from "@/components/classes/curriculum/add-resource-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CanAccess } from "@/components/auth/can-access";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { useJobs } from "@/contexts/job-context";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { AiFeatureGuard } from "@/components/ai/AiFeatureGuard";
import { VersionSummaryModal } from "../components/version-summary-modal";
import { useEffect } from "react";

interface CurriculumTabProps {
  classId: string;
  aClass?: Class;
}

export const CurriculumTab = ({ classId, aClass }: CurriculumTabProps) => {
  const { t, i18n } = useTranslation();
  const { coreData } = useDashboard();
  const isAr = i18n.language === "ar";
  const { data: identity } = useGetIdentity<User>();
  const isTeacher = identity?.role === UserRole.TEACHER || identity?.role === UserRole.ADMIN;
  const isStudent = identity?.role === UserRole.STUDENT;
  const go = useGo();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [hasShownVersionModal, setHasShownVersionModal] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

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

  const { query: modulesQuery } = useList<Module>({
    resource: "modules",
    filters: [{ field: "classId", operator: "eq" as const, value: Number(classId) }],
    queryOptions: { enabled: !!classId },
  });

  const { query: progressQuery } = useList<Progress>({
    resource: "progress",
    filters: [{ field: "classId", operator: "eq" as const, value: Number(classId) }],
    queryOptions: { enabled: !!classId && isStudent },
  });

  const modulesRaw = modulesQuery.data?.data || [];
  const userProgress = progressQuery.data?.data || [];

  // 🚀 VERSION DRIFT: Map modules with isUpdated flag
  const modules = modulesRaw.map((m) => {
    const prog = userProgress.find((p: Progress) => p.moduleId === m.id);
    return {
      ...m,
      isUpdated: m.version > (prog?.lastViewedVersion || 0),
    };
  });

  const updatedModules = modules.filter((m) => m.isUpdated);

  // 🚀 UNIFIED MANIFEST SYNC: Check if class manifest has changed since last sync
  const myEnrollment = identity?.enrollments?.find((e) => e.classId === Number(classId));
  const isManifestUpdated =
    isStudent && (aClass?.manifestVersion || 0) > (myEnrollment?.lastSyncedManifest || 0);

  useEffect(() => {
    // We show the modal if either specific modules are updated OR the global manifest has bumped
    if (isStudent && (updatedModules.length > 0 || isManifestUpdated) && !hasShownVersionModal) {
      setIsVersionModalOpen(true);
      setHasShownVersionModal(true);
    }
  }, [isStudent, updatedModules.length, isManifestUpdated, hasShownVersionModal]);

  const { mutate: deleteModule } = useDelete();
  const { mutate: customMutation } = useCustomMutation();
  const queryClient = useQueryClient();

  const isLoading = modulesQuery.isLoading;

  // 🚀 VERSION SYNC: Mark all as read (Individual & Manifest)
  const { mutate: bulkSync } = useCustomMutation();
  const { mutate: syncManifest } = useCustomMutation();

  const handleVersionModalClose = () => {
    setIsVersionModalOpen(false);

    // 1. Sync Individual Modules (Detailed indicators)
    if (updatedModules.length > 0) {
      bulkSync({
        url: "/progress/bulk-sync",
        method: "post",
        values: {
          classId: Number(classId),
          modules: updatedModules.map((m) => ({ id: m.id, version: m.version })),
        },
      });
    }

    // 2. Sync Manifest (Global indicator)
    if (isManifestUpdated) {
      syncManifest(
        {
          url: `/classes/${classId}/sync-manifest`,
          method: "post",
          values: {},
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["progress"] });
            // Also invalidate identity to get updated enrollment data
            queryClient.invalidateQueries({ queryKey: ["getUserIdentity"] });
            toast.success(
              t("classes.curriculum.allCaughtUp", { defaultValue: "Great! You're all caught up." })
            );
          },
        }
      );
    }
  };

  const handleOnDragEnd = async (result: DropResult) => {
    if (!result.destination || !isTeacher) return;

    const items = Array.from(modules).sort((a, b) => (a.order || 0) - (b.order || 0));
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // 🚀 ROLLBACK MACHINE: Capture previous state
    const queryKey = [
      "modules",
      {
        filters: [{ field: "classId", operator: "eq" as const, value: Number(classId) }],
      },
    ];
    await queryClient.cancelQueries({ queryKey });
    const previousModules = queryClient.getQueryData(queryKey);

    // Optimistic update
    const newOrders = items.map((item, index) => ({
      id: item.id,
      order: index,
    }));

    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return old;
      return {
        ...old,
        data: items.map((item, index) => ({ ...item, order: index })),
      };
    });

    // Backend sync
    customMutation(
      {
        url: "modules/reorder",
        method: "post",
        values: {
          classId: Number(classId),
          orders: newOrders,
        },
      },
      {
        onError: () => {
          // Revert on failure
          if (previousModules) {
            queryClient.setQueryData(queryKey, previousModules);
          }
          toast.error(
            t("classes.curriculum.reorderError", {
              defaultValue: "Failed to save new order. Please try again.",
            })
          );
        },
      }
    );
  };

  const isItemCompleted = (type: "resource" | "assignment" | "quiz", id: number) => {
    return userProgress.some(
      (p: Progress) =>
        p.isCompleted &&
        ((type === "resource" && p.resourceId === id) ||
          (type === "assignment" && p.assignmentId === id) ||
          (type === "quiz" && p.quizId === id))
    );
  };

  const handleToggleProgress = async (
    type: "resource" | "assignment" | "quiz",
    id: number,
    moduleId: number
  ) => {
    const currentStatus = isItemCompleted(type, id);
    const queryKey: [string, { filters: CrudFilter[] }] = [
      "progress",
      {
        filters: [{ field: "classId", operator: "eq" as const, value: Number(classId) }],
      },
    ];

    // 1. Cancel any outgoing refetches (so they don't overwrite our optimistic update)
    await queryClient.cancelQueries({ queryKey });

    // 2. Snapshot the previous value
    const previousProgress = queryClient.getQueryData<ListResponse<Progress>>(queryKey);

    // 3. Optimistically update to the new value
    queryClient.setQueryData(queryKey, (old: ListResponse<Progress> | undefined) => {
      if (!old || !old.data) return old;

      let newData = [...old.data];
      if (!currentStatus) {
        // Add a temporary progress record
        newData.push({
          id: Math.random(), // Temp ID
          classId: Number(classId),
          moduleId,
          resourceId: type === "resource" ? id : null,
          assignmentId: type === "assignment" ? id : null,
          quizId: type === "quiz" ? id : null,
          isCompleted: true,
          completedAt: new Date().toISOString(),
          userId: identity?.id || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Progress);
      } else {
        // Remove the record
        newData = newData.filter(
          (p: Progress) =>
            !(
              (type === "resource" && p.resourceId === id) ||
              (type === "assignment" && p.assignmentId === id) ||
              (type === "quiz" && p.quizId === id)
            )
        );
      }
      return { ...old, data: newData };
    });

    // 4. Perform the actual mutation
    customMutation(
      {
        url: "progress/toggle",
        method: "post",
        values: {
          classId: Number(classId),
          moduleId,
          resourceId: type === "resource" ? id : undefined,
          assignmentId: type === "assignment" ? id : undefined,
          quizId: type === "quiz" ? id : undefined,
          isCompleted: !currentStatus,
        },
      },
      {
        onSuccess: () => {
          // Optional: Refetch to ensure we have the correct server-generated ID
          void progressQuery.refetch();
          toast.success(
            !currentStatus
              ? t("classes.curriculum.toast.completed")
              : t("classes.curriculum.toast.incomplete")
          );
        },
        onError: () => {
          // Rollback on error
          queryClient.setQueryData(queryKey, previousProgress);
          toast.error("Failed to update progress.");
        },
      }
    );
  };

  const handleMarkAsViewed = (moduleId: number, version: number) => {
    if (!isStudent) return;

    // Check if it actually needs an update to avoid redundant calls
    const prog = userProgress.find((p: Progress) => p.moduleId === moduleId);
    if (prog && prog.lastViewedVersion >= version) return;

    customMutation(
      {
        url: "progress/view",
        method: "post",
        values: {
          classId: Number(classId),
          moduleId,
          version,
        },
      },
      {
        onSuccess: () => {
          // Silently refresh progress to clear the NEW badge
          void progressQuery.refetch();
        },
      }
    );
  };

  const { addJob } = useJobs();

  const handleMagicCreate = () => {
    if (!magicConfig.topic.trim()) return;
    setIsMagicCreating(true);
    customMutation(
      {
        url: "modules/magic-create",
        method: "post",
        values: { classId: Number(classId), ...magicConfig },
        meta: {
          invalidates: ["modules"],
        },
      },
      {
        onSuccess: (data: any) => {
          setIsMagicCreating(false);
          setIsMagicModalOpen(false);

          if (data?.data?.jobId) {
            addJob({
              id: `magic-builder-${classId}`,
              type: "magic-builder",
              title: t("jobs.magic_builder_title", {
                topic: magicConfig.topic,
                defaultValue: `Building: ${magicConfig.topic}`,
              }),
              metadata: { jobId: data.data.jobId, classId },
            });
            toast.info(
              t("classes.curriculum.toast.magicStarted", {
                defaultValue: "Magic Builder has started creating your curriculum!",
              })
            );
          } else {
            void modulesQuery.refetch();
          }
        },
        onError: () => setIsMagicCreating(false),
      }
    );
  };

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-start">
        <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
          {t("classes.curriculum.loading")}
        </p>
      </div>
    );

  return (
    <div className="space-y-6 md:space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-start">
        <div className="space-y-1 md:space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <BookOpen className="h-4 w-4 md:h-5 md:w-5" />
            </div>
            <h3 className="text-xl md:text-2xl font-black tracking-tight">
              {t("classes.curriculum.courseCurriculum")}
            </h3>
          </div>
          <p className="text-sm md:text-base text-muted-foreground font-medium max-w-2xl">
            {t("classes.curriculum.curriculumDescription")}
          </p>
        </div>

        {isTeacher && (
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
            {coreData?.globalConfig?.enableAiFeatures !== false && (
              <CanAccess resource="modules" action="create" params={{ classId }}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        id="guide-magic-builder"
                        variant="outline"
                        className="flex-1 md:flex-none rounded-xl h-10 md:h-12 px-4 md:px-8 border-ai-primary/20 text-ai-primary hover:bg-ai-primary/5 font-black uppercase tracking-widest text-[9px] md:text-[10px] gap-2 relative overflow-hidden group shadow-sm"
                        onClick={() => {
                          setMagicConfig({
                            ...magicConfig,
                            moduleId: null,
                            type: "package",
                          });
                          setIsMagicModalOpen(true);
                        }}
                      >
                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out] pointer-events-none" />
                        <Wand2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        <span className="truncate">{t("buttons.magicBuilder")}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-center border-ai-primary/20 bg-background/95 backdrop-blur-xl p-3 shadow-2xl rounded-xl">
                      <div className="flex items-center justify-center mb-1">
                        <Sparkles className="h-4 w-4 text-ai-primary animate-pulse me-2" />
                        <span className="font-bold">{t("tooltips.magicBuilder.title")}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t("tooltips.magicBuilder.description")}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CanAccess>
            )}

            <CanAccess resource="modules" action="create" params={{ classId }}>
              <Button
                id="guide-add-module"
                onClick={() => {
                  setIsCreateModalOpen(true);
                }}
                className="flex-1 md:flex-none rounded-xl h-10 md:h-12 px-4 md:px-8 font-black uppercase tracking-widest text-[9px] md:text-[10px] gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                <PlusCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="truncate">{t("buttons.addModule")}</span>
              </Button>
            </CanAccess>
          </div>
        )}
      </div>

      {modules.length === 0 ? (
        <CurriculumEmptyState
          isTeacher={isTeacher}
          onAddClick={() => setIsCreateModalOpen(true)}
          onMagicClick={() => setIsMagicModalOpen(true)}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              <LayoutDashboard className="h-3 w-3" />
              {t("classes.curriculum.modulesPublished", {
                count: modules.length,
              })}
            </div>
            {isStudent && (
              <div className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary">
                <Zap className="h-3 w-3 md:h-3.5 md:w-3.5" />
                <span>
                  {t("classes.curriculum.itemsCompleted", {
                    count: userProgress.filter((p) => p.isCompleted).length,
                  })}
                </span>
              </div>
            )}
          </div>

          <Accordion type="multiple" className="w-full space-y-4 md:space-y-6">
            <DragDropContext onDragEnd={handleOnDragEnd}>
              <Droppable droppableId="modules">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    <AnimatePresence mode="popLayout">
                      {modules
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map((module, idx) => (
                          <Draggable
                            key={module.id}
                            draggableId={module.id.toString()}
                            index={idx}
                            isDragDisabled={!isTeacher}
                          >
                            {(draggableProvided) => (
                              <div
                                ref={draggableProvided.innerRef}
                                {...draggableProvided.draggableProps}
                                className="mb-4 md:mb-6"
                              >
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                >
                                  <ModuleItem
                                    module={module}
                                    isTeacher={isTeacher}
                                    isStudent={isStudent}
                                    classId={classId}
                                    dragHandleProps={draggableProvided.dragHandleProps}
                                    isItemCompleted={isItemCompleted}
                                    onToggleProgress={(type, id, mid) => {
                                      handleMarkAsViewed(mid, (module as any).version);
                                      handleToggleProgress(type, id, mid);
                                    }}
                                    onDeleteModule={(id) =>
                                      deleteModule(
                                        { resource: "modules", id },
                                        {
                                          onSuccess: () => {
                                            void modulesQuery.refetch();
                                          },
                                        }
                                      )
                                    }
                                    onMagicAction={(moduleId, type) => {
                                      setMagicConfig({
                                        ...magicConfig,
                                        moduleId,
                                        type: type as "package" | "note" | "quiz" | "assignment",
                                      });
                                      setIsMagicModalOpen(true);
                                    }}
                                    onAddMaterial={(moduleId) => {
                                      setActiveModuleId(moduleId);
                                      setIsAddResourceOpen(true);
                                    }}
                                    onAddTask={(moduleId) =>
                                      go({
                                        to: `/assignments/create?classId=${classId}&moduleId=${moduleId}`,
                                      })
                                    }
                                  />
                                </motion.div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                    </AnimatePresence>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </Accordion>
        </div>
      )}

      {isTeacher && (
        <AiFeatureGuard silent>
          <MagicBuilderDialog
            isOpen={isMagicModalOpen}
            onOpenChange={setIsMagicModalOpen}
            config={magicConfig}
            setConfig={setMagicConfig}
            onGenerate={handleMagicCreate}
            isGenerating={isMagicCreating}
            classId={Number(classId)}
          />
        </AiFeatureGuard>
      )}

      {isTeacher && (
        <>
          <AddResourceDialog
            isOpen={isAddResourceOpen}
            onOpenChange={setIsAddResourceOpen}
            classId={Number(classId)}
            moduleId={activeModuleId || 0}
          />

          <CreateModuleDialog
            isOpen={isCreateModalOpen}
            onOpenChange={setIsCreateModalOpen}
            classId={Number(classId)}
            order={modules.length}
          />
        </>
      )}

      {isVersionModalOpen && (
        <VersionSummaryModal
          isOpen={isVersionModalOpen}
          onClose={handleVersionModalClose}
          updatedModules={updatedModules}
        />
      )}
    </div>
  );
};

import {
  CrudFilter,
  useCustomMutation,
  useDelete,
  useGetIdentity,
  useGo,
  useList,
} from "@refinedev/core";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Class, ListResponse, Module, Progress, User } from "@/types";
import { CurriculumEmptyState } from "../components/class-empty-states";
import { LayoutDashboard, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import { MagicBuilderConfig } from "@/features/ai/hooks/use-magic-builder";
import { useTranslation } from "react-i18next";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { useJobs } from "@/contexts/job-context";
import { DropResult } from "@hello-pangea/dnd";
import { VersionSummaryModal } from "../components/version-summary-modal";
import { useCapabilities } from "@/features/users/hooks/use-capabilities";

// New sub-components
import { CurriculumHeader } from "../components/curriculum/CurriculumHeader";
import { ModuleList } from "../components/curriculum/ModuleList";
import { TeacherActions } from "../components/curriculum/TeacherActions";

interface CurriculumTabProps {
  classId: string;
  aClass?: Class;
}

export const CurriculumTab = ({ classId, aClass }: CurriculumTabProps) => {
  const { t } = useTranslation();
  const { coreData } = useDashboard();
  const { data: identity } = useGetIdentity<User>();
  const { isStudent, canManageCurriculum: isTeacher } = useCapabilities();
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

  const modules = modulesRaw.map((m) => {
    const prog = userProgress.find((p: Progress) => p.moduleId === m.id);
    return {
      ...m,
      isUpdated: m.version > (prog?.lastViewedVersion || 0),
    };
  });

  const updatedModules = modules.filter((m) => m.isUpdated);
  const myEnrollment = identity?.enrollments?.find((e) => e.classId === Number(classId));
  const isManifestUpdated =
    isStudent && (aClass?.manifestVersion || 0) > (myEnrollment?.lastSyncedManifest || 0);

  useEffect(() => {
    if (isStudent && (updatedModules.length > 0 || isManifestUpdated) && !hasShownVersionModal) {
      setIsVersionModalOpen(true);
      setHasShownVersionModal(true);
    }
  }, [isStudent, updatedModules.length, isManifestUpdated, hasShownVersionModal]);

  const { mutate: deleteModule } = useDelete();
  const { mutate: customMutation } = useCustomMutation();
  const queryClient = useQueryClient();

  const isLoading = modulesQuery.isLoading;

  const { mutate: bulkSync } = useCustomMutation();
  const { mutate: syncManifest } = useCustomMutation();

  const handleVersionModalClose = () => {
    setIsVersionModalOpen(false);
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

    if (isManifestUpdated) {
      syncManifest(
        {
          url: `/classes/${classId}/sync-manifest`,
          method: "post",
          values: {},
        },
        {
          onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["progress"] });
            void queryClient.invalidateQueries({ queryKey: ["getUserIdentity"] });
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

    const queryKey = [
      "modules",
      { filters: [{ field: "classId", operator: "eq" as const, value: Number(classId) }] },
    ];
    await queryClient.cancelQueries({ queryKey });
    const previousModules = queryClient.getQueryData(queryKey);

    const newOrders = items.map((item, index) => ({ id: item.id, order: index }));

    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return old;
      return { ...old, data: items.map((item, index) => ({ ...item, order: index })) };
    });

    customMutation(
      {
        url: "modules/reorder",
        method: "post",
        values: { classId: Number(classId), orders: newOrders },
      },
      {
        onError: () => {
          if (previousModules) queryClient.setQueryData(queryKey, previousModules);
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
      { filters: [{ field: "classId", operator: "eq" as const, value: Number(classId) }] },
    ];

    await queryClient.cancelQueries({ queryKey });
    const previousProgress = queryClient.getQueryData<ListResponse<Progress>>(queryKey);

    queryClient.setQueryData(queryKey, (old: ListResponse<Progress> | undefined) => {
      if (!old || !old.data) return old;
      let newData = [...old.data];
      if (!currentStatus) {
        newData.push({
          id: Math.random(),
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
          void progressQuery.refetch();
          toast.success(
            !currentStatus
              ? t("classes.curriculum.toast.completed")
              : t("classes.curriculum.toast.incomplete")
          );
        },
        onError: () => {
          queryClient.setQueryData(queryKey, previousProgress);
          toast.error("Failed to update progress.");
        },
      }
    );
  };

  const handleMarkAsViewed = (moduleId: number, version: number) => {
    if (!isStudent) return;
    const prog = userProgress.find((p: Progress) => p.moduleId === moduleId);
    if (prog && prog.lastViewedVersion >= version) return;

    customMutation(
      {
        url: "progress/view",
        method: "post",
        values: { classId: Number(classId), moduleId, version },
      },
      {
        onSuccess: () => {
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
        meta: { invalidates: ["modules"] },
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
      <CurriculumHeader
        classId={classId}
        isTeacher={isTeacher}
        enableAiFeatures={coreData?.globalConfig?.enableAiFeatures !== false}
        onMagicClick={() => {
          setMagicConfig({ ...magicConfig, moduleId: null, type: "package" });
          setIsMagicModalOpen(true);
        }}
        onAddModuleClick={() => setIsCreateModalOpen(true)}
      />

      {modules.length === 0 ? (
        <CurriculumEmptyState
          isTeacher={isTeacher}
          onAddClick={() => setIsCreateModalOpen(true)}
          onMagicClick={() => setIsMagicModalOpen(true)}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">
              <LayoutDashboard className="h-3 w-3" />
              {t("classes.curriculum.modulesPublished", { count: modules.length })}
            </div>
            {isStudent && (
              <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-primary">
                <Zap className="h-3 w-3 md:h-3.5 md:w-3.5" />
                <span>
                  {t("classes.curriculum.itemsCompleted", {
                    count: userProgress.filter((p) => p.isCompleted).length,
                  })}
                </span>
              </div>
            )}
          </div>

          <ModuleList
            modules={modules}
            isTeacher={isTeacher}
            isStudent={isStudent}
            classId={classId}
            onDragEnd={handleOnDragEnd}
            isItemCompleted={isItemCompleted}
            onToggleProgress={(type, id, mid) => {
              const m = modules.find((mod) => mod.id === mid);
              handleMarkAsViewed(mid, (m as any).version);
              void handleToggleProgress(type, id, mid);
            }}
            onDeleteModule={(id) =>
              deleteModule({ resource: "modules", id }, { onSuccess: () => modulesQuery.refetch() })
            }
            onMagicAction={(moduleId, type) => {
              setMagicConfig({
                ...magicConfig,
                moduleId,
                type: type as any,
              });
              setIsMagicModalOpen(true);
            }}
            onAddMaterial={(moduleId) => {
              setActiveModuleId(moduleId);
              setIsAddResourceOpen(true);
            }}
            onAddTask={(moduleId) =>
              go({ to: `/assignments/create?classId=${classId}&moduleId=${moduleId}` })
            }
          />
        </div>
      )}

      {isTeacher && (
        <TeacherActions
          classId={classId}
          isMagicModalOpen={isMagicModalOpen}
          setIsMagicModalOpen={setIsMagicModalOpen}
          magicConfig={magicConfig}
          setMagicConfig={setMagicConfig}
          isMagicCreating={isMagicCreating}
          onMagicCreate={handleMagicCreate}
          isAddResourceOpen={isAddResourceOpen}
          setIsAddResourceOpen={setIsAddResourceOpen}
          activeModuleId={activeModuleId}
          isCreateModalOpen={isCreateModalOpen}
          setIsCreateModalOpen={setIsCreateModalOpen}
          moduleCount={modules.length}
        />
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

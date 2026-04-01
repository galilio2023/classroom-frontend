import { Module } from "@/types";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Trash2,
  Sparkles,
  PenLine,
  FileQuestion,
  FileText,
  Plus,
  Library,
  ClipboardCheck,
  MoreVertical,
  Eye,
  EyeOff,
  GripVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResourceItem } from "./resource-item";
import { TaskItem } from "./task-item";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { CanAccess } from "@/components/auth/can-access";
import { useUpdate } from "@refinedev/core";
import { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { AiFeatureGuard } from "@/components/ai/AiFeatureGuard";

interface ModuleItemProps {
  module: Module;
  isTeacher: boolean;
  isStudent: boolean;
  classId: string;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  isItemCompleted: (type: "resource" | "assignment" | "quiz", id: number) => boolean;
  onToggleProgress: (
    type: "resource" | "assignment" | "quiz",
    id: number,
    moduleId: number
  ) => void;
  onDeleteModule: (id: number) => void;
  onMagicAction: (moduleId: number, type: string) => void;
  onAddMaterial: (moduleId: number) => void;
  onAddTask: (moduleId: number) => void;
}

export const ModuleItem = ({
  module,
  isTeacher,
  isStudent,
  classId,
  dragHandleProps,
  isItemCompleted,
  onToggleProgress,
  onDeleteModule,
  onMagicAction,
  onAddMaterial,
  onAddTask,
}: ModuleItemProps) => {
  const { t, i18n } = useTranslation();
  const { mutate: updateModule } = useUpdate();
  const isArabic = i18n.language === "ar";
  const totalItems =
    (module.resources?.length || 0) +
    (module.assignments?.length || 0) +
    (module.quizzes?.length || 0);

  const handleTogglePublish = () => {
    updateModule({
      resource: "modules",
      id: module.id,
      values: {
        isPublished: !module.isPublished,
        version: module.version, // 🛡️ COMPLIANCE: Backend requires version for all updates
      },
      mutationMode: "optimistic",
    });
  };

  return (
    <AccordionItem
      value={`module-${module.id}`}
      className="border-none shadow-xl bg-card/50 backdrop-blur-xl rounded-3xl md:rounded-4xl overflow-hidden group transition-all hover:shadow-2xl hover:bg-card/80"
    >
      <div className="flex items-center justify-between w-full px-4 md:px-6">
        {isTeacher && (
          <div
            {...dragHandleProps}
            className="p-2 cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-primary transition-colors"
          >
            <GripVertical
              className="h-5 w-5"
              aria-label={t("common.dragToReorder", "Drag to reorder")}
            />
          </div>
        )}
        <AccordionTrigger className="hover:no-underline py-4 md:py-6 flex-1 group/trigger text-start rtl:text-end">
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <div className="p-2 md:p-3 rounded-lg md:rounded-2xl bg-primary/10 text-primary group-hover/trigger:scale-110 transition-transform shrink-0">
              <BookOpen className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div className="space-y-0.5 md:space-y-1 min-w-0 text-start">
              <div className="flex items-center gap-2">
                <div className="font-black text-base md:text-lg tracking-tight group-hover/trigger:text-primary transition-colors truncate">
                  {module.name}
                </div>
                {(module as any).isUpdated && isStudent && (
                  <Badge className="bg-ai-primary text-white border-none text-[7px] md:text-[8px] font-black uppercase tracking-tighter px-1.5 py-0 h-3.5 md:h-4 shrink-0 animate-pulse">
                    <Sparkles className="h-2.5 w-2.5 me-1" />
                    {t("common.new", "NEW")}
                  </Badge>
                )}
                {isTeacher && !module.isPublished && (
                  <Badge
                    variant="outline"
                    className="bg-muted text-muted-foreground border-none text-[7px] md:text-[8px] font-black uppercase tracking-tighter px-1.5 py-0 h-3.5 md:h-4 shrink-0"
                  >
                    {t("common.draft", "Draft")}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                {module.description && (
                  <div className="text-[8px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-widest line-clamp-1 max-w-50 md:max-w-75">
                    {module.description}
                  </div>
                )}
                <div className="flex items-center gap-1 md:gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-muted-foreground/30 hidden xs:block" />
                  <span className="text-[8px] md:text-[10px] font-black text-primary uppercase tracking-widest whitespace-nowrap">
                    {t("classes.curriculum.modulesItemsCount", {
                      count: totalItems,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </AccordionTrigger>
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <CanAccess resource="modules" action="delete" id={module.id}>
            {isTeacher && (
              <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all"
                    >
                      <MoreVertical className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align={isArabic ? "start" : "end"}
                    className="rounded-xl border-none shadow-2xl p-1.5 min-w-40"
                  >
                    <DropdownMenuItem
                      className="font-bold rounded-lg cursor-pointer py-2.5"
                      onClick={handleTogglePublish}
                    >
                      {module.isPublished ? (
                        <>
                          <EyeOff className="h-4 w-4 me-2 rtl:me-0 rtl:ms-2" />
                          {t("buttons.unpublish", "Revert to Draft")}
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 me-2 rtl:me-0 rtl:ms-2" />
                          {t("buttons.publish", "Publish to Students")}
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive font-bold rounded-lg cursor-pointer py-2.5"
                      onClick={() => onDeleteModule(module.id)}
                    >
                      <Trash2 className="h-4 w-4 me-2 rtl:me-0 rtl:ms-2" />
                      {t("buttons.deleteModule")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </CanAccess>
        </div>
      </div>

      <AccordionContent className="pb-6 md:pb-8 pt-1 md:pt-2 px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
          {/* Resources Section */}
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <Library className="h-3 md:h-3.5 w-3 md:w-3.5 text-primary" />
                {t("classes.resource.learningMaterials")}
              </h4>
              <Badge
                variant="secondary"
                className="rounded-full px-2 py-0 h-4 md:h-5 text-[8px] md:text-[9px] font-black bg-primary/5 text-primary border-none"
              >
                {new Intl.NumberFormat(isArabic ? "ar-EG" : "en-US").format(
                  module.resources?.length || 0
                )}
              </Badge>
            </div>
            <div className="grid gap-2.5 md:gap-3">
              {(module.resources ?? []).length > 0 ? (
                (module.resources ?? []).map((res) => (
                  <ResourceItem
                    key={res.id}
                    resource={res}
                    isStudent={isStudent}
                    classId={classId}
                    completed={isItemCompleted("resource", res.id)}
                    onToggleProgress={(id) => onToggleProgress("resource", id, module.id)}
                  />
                ))
              ) : (
                <div className="p-6 md:p-8 rounded-xl md:rounded-2xl border-2 border-dashed border-muted-foreground/10 flex flex-col items-center justify-center gap-2 text-muted-foreground/40">
                  <Library className="h-5 w-5 md:h-6 md:w-6 opacity-20" />
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-center">
                    {t("classes.resource.noMaterialsInModule")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Assignments & Quizzes Section */}
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <ClipboardCheck className="h-3 md:h-3.5 w-3 md:w-3.5 text-primary" />
                {t("assignments.show.studentSubmissions")}
              </h4>
              <Badge
                variant="secondary"
                className="rounded-full px-2 py-0 h-4 md:h-5 text-[8px] md:text-[9px] font-black bg-primary/5 text-primary border-none"
              >
                {new Intl.NumberFormat(isArabic ? "ar-EG" : "en-US").format(
                  (module.assignments?.length || 0) + (module.quizzes?.length || 0)
                )}
              </Badge>
            </div>
            <div className="grid gap-2.5 md:gap-3">
              {module.assignments?.map((asn) => (
                <TaskItem
                  key={asn.id}
                  item={asn}
                  type="assignment"
                  isStudent={isStudent}
                  completed={isItemCompleted("assignment", asn.id)}
                  onToggleProgress={(id) => onToggleProgress("assignment", id, module.id)}
                />
              ))}
              {module.quizzes?.map((quiz) => (
                <TaskItem
                  key={quiz.id}
                  item={quiz}
                  type="quiz"
                  isStudent={isStudent}
                  completed={isItemCompleted("quiz", quiz.id)}
                  onToggleProgress={(id) => onToggleProgress("quiz", id, module.id)}
                />
              ))}
              {!module.assignments?.length && !module.quizzes?.length && (
                <div className="p-6 md:p-8 rounded-xl md:rounded-2xl border-2 border-dashed border-muted-foreground/10 flex flex-col items-center justify-center gap-2 text-muted-foreground/40">
                  <ClipboardCheck className="h-5 w-5 md:h-6 md:w-6 opacity-20" />
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-center">
                    {t("assignments.list.noAssignments")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {isTeacher && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 md:mt-10 pt-5 md:pt-6 border-t border-black/3 dark:border-white/3 flex flex-wrap gap-2 md:gap-3"
          >
            <CanAccess resource="modules" action="create" params={{ classId }}>
              <AiFeatureGuard>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none h-9 md:h-10 rounded-lg md:rounded-xl font-black uppercase tracking-widest text-[8px] md:text-[9px] border-ai-primary/20 text-ai-primary hover:bg-ai-primary/5 gap-1.5 md:gap-2 relative overflow-hidden group px-3 md:px-4"
                    >
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out] pointer-events-none" />
                      <Sparkles className="h-3 w-3 md:h-3.5 md:w-3.5" />
                      {t("buttons.aiMagicBuilder")}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="rounded-xl border-none shadow-2xl p-2 min-w-50"
                  >
                    <DropdownMenuItem
                      onClick={() => onMagicAction(module.id, "note")}
                      className="rounded-lg font-bold gap-2 py-2.5 cursor-pointer"
                    >
                      <div className="p-1.5 rounded-md bg-ai-primary/10 text-ai-primary">
                        <PenLine className="h-3.5 w-3.5" />
                      </div>
                      {t("buttons.generateNotes")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onMagicAction(module.id, "quiz")}
                      className="rounded-lg font-bold gap-2 py-2.5 cursor-pointer"
                    >
                      <div className="p-1.5 rounded-md bg-ai-primary/10 text-ai-primary">
                        <FileQuestion className="h-3.5 w-3.5" />
                      </div>
                      {t("buttons.generateQuiz")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onMagicAction(module.id, "assignment")}
                      className="rounded-lg font-bold gap-2 py-2.5 cursor-pointer"
                    >
                      <div className="p-1.5 rounded-md bg-ai-primary/10 text-ai-primary">
                        <FileText className="h-3.5 w-3.5" />
                      </div>
                      {t("buttons.generateAssignment")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </AiFeatureGuard>
            </CanAccess>

            <CanAccess resource="resources" action="create" params={{ classId }}>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none h-9 md:h-10 rounded-lg md:rounded-xl font-black uppercase tracking-widest text-[8px] md:text-[9px] gap-1.5 md:gap-2 border-primary/20 text-primary hover:bg-primary/5 px-3 md:px-4"
                onClick={() => onAddMaterial(module.id)}
              >
                <Plus className="h-3 w-3 md:h-3.5 md:w-3.5" />
                {t("buttons.addMaterial")}
              </Button>
            </CanAccess>

            <CanAccess resource="assignments" action="create" params={{ classId }}>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none h-9 md:h-10 rounded-lg md:rounded-xl font-black uppercase tracking-widest text-[8px] md:text-[9px] gap-1.5 md:gap-2 border-primary/20 text-primary hover:bg-primary/5 px-3 md:px-4"
                onClick={() => onAddTask(module.id)}
              >
                <Plus className="h-3 w-3 md:h-3.5 md:w-3.5" />
                {t("buttons.addTask")}
              </Button>
            </CanAccess>
          </motion.div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

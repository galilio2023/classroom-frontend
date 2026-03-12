import { Module } from "@/types";
import { 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
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
  MoreVertical
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

interface ModuleItemProps {
  module: Module;
  isTeacher: boolean;
  isStudent: boolean;
  classId: string;
  isItemCompleted: (type: 'resource' | 'assignment' | 'quiz', id: number) => boolean;
  onToggleProgress: (type: 'resource' | 'assignment' | 'quiz', id: number, moduleId: number) => void;
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
  isItemCompleted,
  onToggleProgress,
  onDeleteModule,
  onMagicAction,
  onAddMaterial,
  onAddTask
}: ModuleItemProps) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const totalItems = (module.resources?.length || 0) + (module.assignments?.length || 0) + (module.quizzes?.length || 0);
  
  return (
    <AccordionItem 
      value={`module-${module.id}`} 
      className="border-none shadow-xl bg-card/50 backdrop-blur-xl rounded-[2rem] overflow-hidden group transition-all hover:shadow-2xl hover:bg-card/80"
    >
      <div className="flex items-center justify-between w-full px-6">
        <AccordionTrigger className="hover:no-underline py-6 flex-1 group/trigger text-left rtl:text-right">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover/trigger:scale-110 transition-transform">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <div className="font-black text-lg tracking-tight group-hover/trigger:text-primary transition-colors">{module.name}</div>
              <div className="flex items-center gap-3">
                {module.description && (
                  <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest line-clamp-1 max-w-[300px]">
                    {module.description}
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                    {t("classes.curriculum.modulesItemsCount", { count: totalItems })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </AccordionTrigger>
        <div className="flex items-center gap-2">
          {isTeacher && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isArabic ? "start" : "end"} className="rounded-xl border-none shadow-2xl">
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive font-bold rounded-lg"
                  onClick={() => onDeleteModule(module.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                  {t("buttons.deleteModule")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      
      <AccordionContent className="pb-8 pt-2 px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Resources Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <Library className="h-3.5 w-3.5 text-primary" />
                {t("classes.resource.learningMaterials")}
              </h4>
              <Badge variant="secondary" className="rounded-full px-2 py-0 h-5 text-[9px] font-black bg-primary/5 text-primary border-none">
                {new Intl.NumberFormat(isArabic ? 'ar-EG' : 'en-US').format(module.resources?.length || 0)}
              </Badge>
            </div>
            <div className="grid gap-3">
              {module.resources && module.resources.length > 0 ? (
                module.resources.map((res) => (
                  <ResourceItem 
                    key={res.id}
                    resource={res}
                    isStudent={isStudent}
                    classId={classId}
                    completed={isItemCompleted('resource', res.id)}
                    onToggleProgress={(id) => onToggleProgress('resource', id, module.id)}
                  />
                ))
              ) : (
                <div className="p-6 rounded-2xl border-2 border-dashed border-muted-foreground/10 flex flex-col items-center justify-center gap-2 text-muted-foreground/40">
                  <Library className="h-6 w-6 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-widest">{t("classes.resource.noMaterialsInModule")}</p>
                </div>
              )}
            </div>
          </div>

          {/* Assignments & Quizzes Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <ClipboardCheck className="h-3.5 w-3.5 text-primary" />
                {t("assignments.show.studentSubmissions")}
              </h4>
              <Badge variant="secondary" className="rounded-full px-2 py-0 h-5 text-[9px] font-black bg-primary/5 text-primary border-none">
                {new Intl.NumberFormat(isArabic ? 'ar-EG' : 'en-US').format((module.assignments?.length || 0) + (module.quizzes?.length || 0))}
              </Badge>
            </div>
            <div className="grid gap-3">
              {module.assignments?.map((asn) => (
                <TaskItem 
                  key={asn.id}
                  item={asn}
                  type="assignment"
                  isStudent={isStudent}
                  completed={isItemCompleted('assignment', asn.id)}
                  onToggleProgress={(id) => onToggleProgress('assignment', id, module.id)}
                />
              ))}
              {module.quizzes?.map((quiz) => (
                <TaskItem 
                  key={quiz.id}
                  item={quiz}
                  type="quiz"
                  isStudent={isStudent}
                  completed={isItemCompleted('quiz', quiz.id)}
                  onToggleProgress={(id) => onToggleProgress('quiz', id, module.id)}
                />
              ))}
              {(!module.assignments?.length && !module.quizzes?.length) && (
                <div className="p-6 rounded-2xl border-2 border-dashed border-muted-foreground/10 flex flex-col items-center justify-center gap-2 text-muted-foreground/40">
                  <ClipboardCheck className="h-6 w-6 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-widest">{t("assignments.list.noAssignments")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {isTeacher && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 pt-6 border-t border-black/[0.03] dark:border-white/[0.03] flex flex-wrap gap-3"
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-10 rounded-xl font-black uppercase tracking-widest text-[9px] border-ai-primary/20 text-ai-primary hover:bg-ai-primary/5 gap-2 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out] pointer-events-none" />
                  <Sparkles className="h-3.5 w-3.5" />
                  {t("buttons.aiMagicBuilder")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="rounded-xl border-none shadow-2xl p-2 min-w-[200px]">
                <DropdownMenuItem onClick={() => onMagicAction(module.id, "note")} className="rounded-lg font-bold gap-2 py-2.5">
                  <div className="p-1.5 rounded-md bg-ai-primary/10 text-ai-primary">
                    <PenLine className="h-3.5 w-3.5" />
                  </div>
                  {t("buttons.generateNotes")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMagicAction(module.id, "quiz")} className="rounded-lg font-bold gap-2 py-2.5">
                  <div className="p-1.5 rounded-md bg-ai-primary/10 text-ai-primary">
                    <FileQuestion className="h-3.5 w-3.5" />
                  </div>
                  {t("buttons.generateQuiz")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMagicAction(module.id, "assignment")} className="rounded-lg font-bold gap-2 py-2.5">
                  <div className="p-1.5 rounded-md bg-ai-primary/10 text-ai-primary">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  {t("buttons.generateAssignment")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="outline" 
              size="sm" 
              className="h-10 rounded-xl font-black uppercase tracking-widest text-[9px] gap-2 border-primary/20 text-primary hover:bg-primary/5"
              onClick={() => onAddMaterial(module.id)}
            >
              <Plus className="h-3.5 w-3.5" />
              {t("buttons.addMaterial")}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-10 rounded-xl font-black uppercase tracking-widest text-[9px] gap-2 border-primary/20 text-primary hover:bg-primary/5"
              onClick={() => onAddTask(module.id)}
            >
              <Plus className="h-3.5 w-3.5" />
              {t("buttons.addTask")}
            </Button>
          </motion.div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

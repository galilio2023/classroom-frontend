import { Module } from "@/types";
import { 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Link as LinkIcon, 
  FileText, 
  MoreVertical, 
  Trash2, 
  Sparkles, 
  PenLine, 
  FileQuestion, 
  PlusCircle 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResourceItem } from "./resource-item";
import { TaskItem } from "./task-item";

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
  return (
    <AccordionItem value={`module-${module.id}`} className="border rounded-lg bg-card px-4">
      <div className="flex items-center justify-between w-full">
        <AccordionTrigger className="hover:no-underline py-4 flex-1">
          <div className="flex items-center gap-3 text-left">
            <div className="p-2 bg-primary/10 rounded-md">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-bold">{module.name}</div>
              {module.description && (
                <div className="text-xs text-muted-foreground font-normal line-clamp-1">
                  {module.description}
                </div>
              )}
            </div>
          </div>
        </AccordionTrigger>
        {isTeacher && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => onDeleteModule(module.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Module
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <AccordionContent className="pb-6 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Resources Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <LinkIcon className="h-3 w-3" />
              Learning Materials
            </h4>
            <div className="space-y-2">
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
                <p className="text-xs text-muted-foreground italic">No materials added.</p>
              )}
            </div>
          </div>

          {/* Assignments & Quizzes Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <FileText className="h-3 w-3" />
              Tasks & Assessments
            </h4>
            <div className="space-y-2">
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
                <p className="text-xs text-muted-foreground italic">No tasks assigned.</p>
              )}
            </div>
          </div>
        </div>
        
        {isTeacher && (
          <div className="mt-6 pt-4 border-t flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs border-purple-500/30 text-purple-600">
                  <Sparkles className="h-3 w-3 mr-1.5" />
                  AI Magic
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onMagicAction(module.id, "note")}>
                  <PenLine className="h-4 w-4 mr-2" />
                  Generate Lesson Notes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMagicAction(module.id, "quiz")}>
                  <FileQuestion className="h-4 w-4 mr-2" />
                  Generate Quiz
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMagicAction(module.id, "assignment")}>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Assignment
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => onAddMaterial(module.id)}
            >
              <PlusCircle className="h-3 w-3 mr-1.5" />
              Add Material
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => onAddTask(module.id)}
            >
              <PlusCircle className="h-3 w-3 mr-1.5" />
              Add Task
            </Button>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

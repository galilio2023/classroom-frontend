import { Assignment, Quiz, UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, FileQuestion, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  item: Assignment | Quiz;
  type: 'assignment' | 'quiz';
  isStudent: boolean;
  completed: boolean;
  onToggleProgress: (id: number) => void;
}

export const TaskItem = ({ 
  item, 
  type, 
  isStudent, 
  completed, 
  onToggleProgress 
}: TaskItemProps) => {
  const isQuiz = type === 'quiz';
  
  return (
    <div className={cn(
        "flex items-center justify-between p-2 rounded-md border transition-colors",
        completed ? "bg-green-50/50 border-green-100 dark:bg-green-950/10 dark:border-green-900/30" : 
        isQuiz ? "border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900/30" : "border-primary/10 bg-primary/5"
    )}>
        <div className="flex items-center gap-2 overflow-hidden">
            {isStudent && (
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 shrink-0"
                    onClick={() => onToggleProgress(item.id)}
                >
                    {completed ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                </Button>
            )}
            {isQuiz ? (
                <FileQuestion className={cn("h-4 w-4 shrink-0", completed ? "text-green-600" : "text-orange-500")} />
            ) : (
                <FileText className={cn("h-4 w-4 shrink-0", completed ? "text-green-600" : "text-primary")} />
            )}
            <div className="flex flex-col overflow-hidden">
                <span className={cn("text-sm font-medium truncate", completed && "text-green-700 dark:text-green-400")}>
                    {item.title}
                </span>
                {type === 'assignment' && (item as Assignment).dueDate && (
                    <span className="text-[10px] text-muted-foreground">
                        Due: {new Date((item as Assignment).dueDate!).toLocaleDateString()}
                    </span>
                )}
            </div>
        </div>
        <Badge variant="outline" className={cn(
            "text-[10px]", 
            completed ? "border-green-200 text-green-600" : 
            isQuiz ? "border-orange-200 text-orange-600" : ""
        )}>
            {isQuiz ? "Quiz" : "Assignment"}
        </Badge>
    </div>
  );
};

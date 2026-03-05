import { Assignment, Quiz } from "@/types";
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
        "flex items-center justify-between p-3 rounded-md border transition-colors",
        completed ? "bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900/50" : 
        isQuiz ? "bg-orange-50/50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900/30" : 
        "bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/30"
    )}>
        <div className="flex items-center gap-3 overflow-hidden flex-1">
            {isStudent && (
                <button 
                    onClick={() => onToggleProgress(item.id)}
                    className="shrink-0 focus:outline-none"
                >
                    {completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                        <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                    )}
                </button>
            )}
            
            <div className="flex items-center gap-2 min-w-0">
                {isQuiz ? (
                    <FileQuestion className={cn("h-4 w-4 shrink-0", completed ? "text-green-600" : "text-orange-500")} />
                ) : (
                    <FileText className={cn("h-4 w-4 shrink-0", completed ? "text-green-600" : "text-blue-500")} />
                )}
                
                <div className="flex flex-col min-w-0">
                    <span className={cn(
                        "text-sm font-medium truncate",
                        completed && "text-green-700 dark:text-green-400 line-through decoration-green-500/50"
                    )}>
                        {item.title}
                    </span>
                    {type === 'assignment' && (item as Assignment).dueDate && (
                        <span className="text-[10px] text-muted-foreground truncate">
                            Due: {new Date((item as Assignment).dueDate!).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </div>
        </div>
        
        <Badge variant="outline" className={cn(
            "text-[10px] ml-2 shrink-0", 
            completed ? "border-green-200 text-green-600 bg-green-50" : 
            isQuiz ? "border-orange-200 text-orange-600 bg-orange-50" : 
            "border-blue-200 text-blue-600 bg-blue-50"
        )}>
            {isQuiz ? "Quiz" : "Assignment"}
        </Badge>
    </div>
  );
};

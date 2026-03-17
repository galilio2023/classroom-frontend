import { Assignment, Quiz } from "@/types";
import { Badge } from "@/components/ui/badge";
import { FileText, FileQuestion, CheckCircle2, Circle, Calendar, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import "dayjs/locale/ar";

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
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const isQuiz = type === 'quiz';
  
  const getTaskStyles = () => {
    if (completed) return { bg: 'bg-success/5', border: 'border-success/20', iconColor: 'text-success', iconBg: 'bg-success/10' };
    if (isQuiz) return { bg: 'bg-orange-500/[0.03]', border: 'border-orange-500/10', iconColor: 'text-orange-500', iconBg: 'bg-orange-500/10' };
    return { bg: 'bg-blue-500/[0.03]', border: 'border-blue-500/10', iconColor: 'text-blue-500', iconBg: 'bg-blue-500/10' };
  };

  const styles = getTaskStyles();
  const dueDate = type === 'assignment' ? (item as Assignment).dueDate : null;
  const isOverdue = dueDate ? dayjs(dueDate).isBefore(dayjs()) : false;

  dayjs.locale(i18n.language);

  return (
    <motion.div 
      layout
      className={cn(
        "group flex items-center justify-between p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all duration-300",
        styles.bg,
        styles.border,
        !completed && "hover:border-primary/20 hover:bg-card hover:shadow-md"
      )}
    >
        <div className="flex items-center gap-3 md:gap-4 overflow-hidden flex-1">
            {isStudent && (
                <button 
                    onClick={() => onToggleProgress(item.id)}
                    className="shrink-0 focus:outline-none group/check"
                >
                    <AnimatePresence mode="wait">
                      {completed ? (
                          <motion.div
                            key="completed"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                          >
                            <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-success" />
                          </motion.div>
                      ) : (
                          <motion.div
                            key="pending"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                          >
                            <Circle className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground/40 group-hover/check:text-primary transition-colors" />
                          </motion.div>
                      )}
                    </AnimatePresence>
                </button>
            )}
            
            <div className="flex items-center gap-2.5 md:gap-3 min-w-0">
                <div className={cn("p-1.5 md:p-2 rounded-lg md:rounded-xl shrink-0 transition-transform group-hover:scale-110", styles.iconBg)}>
                    {isQuiz ? (
                        <FileQuestion className={cn("h-3.5 w-3.5 md:h-4 md:w-4", styles.iconColor)} />
                    ) : (
                        <FileText className={cn("h-3.5 w-3.5 md:h-4 md:w-4", styles.iconColor)} />
                    )}
                </div>
                
                <div className="flex flex-col min-w-0 text-start">
                    <span className={cn(
                        "text-xs md:text-sm font-black tracking-tight truncate transition-all",
                        completed ? "text-success/60 line-through decoration-success/30" : "text-foreground group-hover:text-primary"
                    )}>
                        {item.title}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      {dueDate && (
                          <div className={cn(
                            "flex items-center gap-1 text-[8px] md:text-[9px] font-black uppercase tracking-widest",
                            isOverdue && !completed ? "text-destructive" : "text-muted-foreground/40"
                          )}>
                              <Calendar className="h-2.5 w-2.5" />
                              <span className="truncate">{t("assignments.list.labels.due", { date: dayjs(dueDate).format("MMM D") })}</span>
                          </div>
                      )}
                      {isQuiz && !completed && (
                        <div className="flex items-center gap-1 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-orange-500/60">
                          <Clock className="h-2.5 w-2.5" />
                          <span>{t("classes.quiz.minsUnitLocalized", { count: 15 })}</span>
                        </div>
                      )}
                    </div>
                </div>
            </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <Badge variant="secondary" className={cn(
              "text-[8px] md:text-[9px] font-black uppercase tracking-widest px-1.5 md:px-2 py-0.5 rounded-full border-none", 
              completed ? "bg-success/10 text-success" :
              isQuiz ? "bg-orange-500/10 text-orange-600" : 
              "bg-blue-500/10 text-blue-600"
          )}>
              <span className="hidden xs:inline">{isQuiz ? t("classes.show.tabs.quizzes") : t("classes.show.tabs.assignments")}</span>
              <span className="xs:hidden">{isQuiz ? 'Q' : 'A'}</span>
          </Badge>
          {!completed && (
            <div className="hidden sm:block p-1.5 rounded-full bg-muted/50 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              <Sparkles className="h-3 w-3" />
            </div>
          )}
        </div>
    </motion.div>
  );
};

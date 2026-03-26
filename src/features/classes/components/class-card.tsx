import { motion } from "framer-motion";
import { 
  Video, 
  BookOpen, 
  Users, 
  GraduationCap, 
  Calendar, 
  PlusCircle, 
  Loader2, 
  ArrowRight, 
  MoreHorizontal, 
  Eye, 
  Pencil, 
  Copy, 
  Trash2,
  Send
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { ClassListItem, TeacherApplication, User } from "@/types";

interface Props {
  classItem: ClassListItem;
  index: number;
  identity?: User;
  isStudent: boolean;
  isTeacher: boolean;
  isAdmin: boolean;
  isEnrolling: boolean;
  applications: TeacherApplication[];
  onShow: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onClone: (id: number) => void;
  onEnroll: (id: number) => void;
  onApply: (id: number, name: string) => void;
}

export const ClassCard = ({ 
  classItem, 
  index, 
  identity, 
  isStudent, 
  isTeacher, 
  isAdmin, 
  isEnrolling,
  applications,
  onShow,
  onEdit,
  onDelete,
  onClone,
  onEnroll,
  onApply
}: Props) => {
  const { t } = useTranslation();
  const primaryTeacher = classItem.teachers?.find((t) => t.isPrimary)?.teacher;
  const classColor = classItem.color || "#6366f1";
  const isAssigned = classItem.isTeacherAssigned || classItem.teachers?.some((t) => t.teacher.id === identity?.id);
  const isEnrolled = classItem.isEnrolled;
  const pendingApp = applications.find((app) => app.classId === classItem.id && app.status === "pending");
  const firstSchedule = classItem.schedules?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="group relative flex flex-col h-full p-6 md:p-8 rounded-[2.5rem] bg-card/50 backdrop-blur-3xl border border-border/40 hover:border-primary/30 hover:bg-card/80 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 cursor-pointer"
      onClick={() => onShow(classItem.id as number)}
    >
      <div 
         className="absolute start-0 top-1/2 -translate-y-1/2 w-1.5 h-16 rounded-e-full transition-all group-hover:h-24"
         style={{ backgroundColor: classColor }}
      />

      {classItem.isLive && (
        <div className="absolute top-6 end-6 z-10">
          <Badge className="bg-red-500 hover:bg-red-600 text-white border-none px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg shadow-red-500/20 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
            <Video className="h-3 w-3" />
            <span className="text-[10px] font-black uppercase tracking-widest">Live Now</span>
          </Badge>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 md:gap-6 mb-6">
          <div className="relative shrink-0">
          {classItem.bannerUrl ? (
              <div className="relative p-1 rounded-[1.75rem] bg-background shadow-md group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                  <img src={classItem.bannerUrl} alt={classItem.name} className="h-20 w-20 md:h-24 md:w-24 rounded-[1.5rem] object-cover" />
              </div>
          ) : (
              <div className="h-20 w-20 md:h-24 md:w-24 rounded-[1.75rem] bg-muted/30 border-2 border-dashed border-border/40 flex items-center justify-center group-hover:scale-105 transition-transform duration-500" style={{ backgroundColor: `${classColor}10`, borderColor: `${classColor}30` }}>
                  <BookOpen className="h-8 w-8 md:h-10 md:w-10 transition-colors duration-500" style={{ color: classColor }} />
              </div>
          )}
          </div>

          <div className="flex-1 min-w-0 space-y-2.5 w-full text-start">
              <h3 className="text-xl md:text-2xl font-black tracking-tight truncate group-hover:text-primary transition-colors">{classItem.name}</h3>
              <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="ai" className="h-6 text-[9px] md:text-[10px]">{classItem.subject?.name || t("classes.list.general")}</Badge>
                  <Badge variant="secondary" className="h-6 text-[9px] md:text-[10px] bg-muted/50 border-none font-bold">{classItem.subject?.department?.name || "No Dept"}</Badge>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 md:mb-8 mt-auto flex-1 content-end">
          <div className="flex items-center gap-3 bg-background/50 p-3 rounded-2xl border border-border/40 shadow-sm">
              <div className="p-2 rounded-xl bg-primary/5 text-primary shrink-0"><Users className="h-4 w-4" /></div>
              <div className="flex flex-col min-w-0 text-start">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider truncate">{t("classes.list.studentsLabel")}</span>
                  <span className="text-xs md:text-sm font-black text-foreground">{classItem._count?.enrollments || 0}</span>
              </div>
          </div>

          <div className="flex items-center gap-3 bg-background/50 p-3 rounded-2xl border border-border/40 shadow-sm">
              <div className="p-2 rounded-xl bg-primary/5 text-primary shrink-0">{primaryTeacher ? <GraduationCap className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}</div>
              <div className="flex flex-col min-w-0 text-start">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider truncate">{primaryTeacher ? "Teacher" : "Schedule"}</span>
                  <span className="text-xs md:text-sm font-black text-foreground truncate">
                      {primaryTeacher ? primaryTeacher.name.split(' ')[0] : firstSchedule ? `${firstSchedule.day.substring(0,3)} ${firstSchedule.startTime}` : "Staff"}
                  </span>
              </div>
          </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-border/40 w-full mt-auto">
        {isTeacher && !isAssigned ? (
          <Button
            onClick={(e) => { e.stopPropagation(); onApply(classItem.id as number, classItem.name); }}
            disabled={!!pendingApp}
            size="lg"
            className="w-full rounded-2xl h-12 md:h-14 font-black uppercase tracking-widest text-[10px] md:text-xs transition-all shadow-xl shadow-primary/20"
          >
            <Send className="h-4 w-4 me-2 rtl:-scale-x-100" />
            {pendingApp ? t("buttons.applied") : t("buttons.applyToTeach")}
          </Button>
        ) : isStudent && !isEnrolled ? (
          <Button
            onClick={(e) => { e.stopPropagation(); onEnroll(classItem.id as number); }}
            disabled={isEnrolling}
            size="lg"
            className="w-full rounded-2xl h-12 md:h-14 font-black uppercase tracking-widest text-[10px] md:text-xs transition-all shadow-xl shadow-primary/20 bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            {isEnrolling ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <PlusCircle className="h-4 w-4 me-2" />}
            Request to Join
          </Button>
        ) : (
          <Button
            asChild
            size="lg"
            variant={classItem.isLive ? "default" : "outline"}
            className={cn(
              "flex-1 rounded-2xl h-12 md:h-14 font-black uppercase tracking-widest text-[10px] md:text-xs transition-all",
              classItem.isLive ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 border-none text-white" : "border-primary/20 hover:bg-primary/5 text-primary",
            )}
          >
            <Link to={`/classes/show/${classItem.id}`} onClick={(e) => e.stopPropagation()}>
              {classItem.isLive ? (<><Video className="h-4 w-4 me-2" />{t("buttons.joinLive")}</>) : (<>{t("buttons.enterClass")}<ArrowRight className="h-4 w-4 ms-2 rtl:-scale-x-100" /></>)}
            </Link>
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-muted/30 hover:bg-muted/50 shrink-0" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 md:w-64 p-2 rounded-3xl">
            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/50 px-3 py-3">{t("classes.list.classOptions")}</DropdownMenuLabel>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onShow(classItem.id as number); }} className="rounded-xl gap-3 py-3 cursor-pointer">
              <div className="p-2 rounded-lg bg-primary/10 text-primary"><Eye className="h-4 w-4" /></div>
              <span className="font-bold text-sm">{t("buttons.viewDetails")}</span>
            </DropdownMenuItem>
            {((isTeacher && isAssigned) || isAdmin) && (
              <>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(classItem.id as number); }} className="rounded-xl gap-3 py-3 cursor-pointer">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary"><Pencil className="h-4 w-4" /></div>
                  <span className="font-bold text-sm">{t("buttons.editClass")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2 opacity-50" />
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClone(classItem.id as number); }} className="rounded-xl gap-3 py-3 cursor-pointer">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary"><Copy className="h-4 w-4" /></div>
                  <span className="font-bold text-sm">{t("buttons.copyClassContent")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(classItem.id as number); }} className="rounded-xl gap-3 py-3 cursor-pointer text-destructive focus:bg-destructive/10">
                  <div className="p-2 rounded-lg bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></div>
                  <span className="font-bold text-sm">{t("buttons.deleteClass")}</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
};

import {
  useCreate,
  useDelete,
  useGetIdentity,
  useList,
  useUpdate,
  useNavigation,
} from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  History,
  Loader2,
  MoreHorizontal,
  Pencil,
  PlusCircle,
  Trash2,
  Layers,
  TrendingUp,
  MapPin,
  BookOpen,
  ChevronRight,
  Play,
} from "lucide-react";
import { AcademicYear, TimetableSlot, User, UserRole, Class, Subject } from "@/types";
import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import usePageTitle from "@/hooks/use-page-title";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb } from "@/components/refine/layout/breadcrumb";
import { ListView } from "@/components/refine/views/list-view";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useCapabilities } from "@/hooks/use-capabilities";
import { useTerm } from "@/contexts/term-context";
import { CollisionModal } from "../../components/CollisionModal";
import { DAYS } from "@/constants/calendar";

export default function LectureSchedulePage() {
  const { t } = useTranslation();
  const { isFacultySuite, isTeacher, isAdmin, lectureSchedule } = useCapabilities();
  const { push } = useNavigation() as any;
  const { currentTerm } = useTerm();

  const slotSchema = useMemo(
    () =>
      z.object({
        academicYearId: z.string().min(1, "Academic Year is required"),
        dayOfWeek: z.string().min(1, "Day is required"),
        startTime: z.string().min(1, "Start time is required"),
        endTime: z.string().min(1, "End time is required"),
        classId: z.string().optional(),
        sectionId: z.string().min(1, "Section is required"),
        roomId: z.string().optional(),
      }),
    []
  );

  type SlotFormValues = z.infer<typeof slotSchema>;

  usePageTitle(t("timetable.lecture.title", "Lecture Planner"));

  const { query: slotsQuery } = useList<TimetableSlot>({
    resource: "timetable/lecturer-weekly",
    queryOptions: { enabled: isTeacher || isAdmin },
  });

  const { query: yearsQuery } = useList<AcademicYear>({ resource: "academic-years" });

  const { query: sectionsQuery } = useList<any>({
    resource: "academic/sections",
    filters: currentTerm ? [{ field: "termId", operator: "eq", value: currentTerm.id }] : [],
    queryOptions: { enabled: isTeacher || isAdmin || !!currentTerm },
  });

  const slots = slotsQuery.data?.data || [];
  const years = yearsQuery.data?.data || [];
  const sections = (sectionsQuery.data?.data || []) as any[];
  const isLoading = slotsQuery.isLoading || yearsQuery.isLoading || sectionsQuery.isLoading;

  const { mutate: create, mutation: createMutation } = useCreate();
  const { mutate: deleteMutation } = useDelete();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCollisionOpen, setIsCollisionOpen] = useState(false);
  const [conflicts, setConflicts] = useState<any[]>([]);

  const form = useForm<SlotFormValues>({
    resolver: zodResolver(slotSchema),
  });

  const onSubmit = (values: SlotFormValues) => {
    const selectedSection = sections.find((s) => s.id.toString() === values.sectionId);

    create(
      {
        resource: "timetable/lecture-schedule",
        values: {
          ...values,
          dayOfWeek: parseInt(values.dayOfWeek),
          subjectId: selectedSection?.subjectId?.toString(),
        },
      },
      {
        onSuccess: () => {
          toast.success("Lecture slot saved.");
          setIsCreateOpen(false);
          form.reset();
        },
        onError: (err: any) => {
          if (err?.statusCode === 409 && err?.details) {
            setConflicts(err.details);
            setIsCollisionOpen(true);
          } else {
            toast.error(err?.message || "Failed to save lecture.");
          }
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Delete this lecture slot?")) {
      deleteMutation(
        { resource: "timetable", id },
        {
          onSuccess: () => toast.success("Slot removed."),
          onError: () => toast.error("Delete failed."),
        }
      );
    }
  };

  if (!isFacultySuite) {
    return (
      <div className="flex items-center justify-center p-20">
        <Card className="max-w-md p-8 text-center space-y-4 rounded-4xl border-border/40 shadow-xl">
          <TrendingUp className="w-12 h-12 text-muted-foreground/20 mx-auto" />
          <h2 className="text-xl font-black italic">Access Denied</h2>
          <p className="text-muted-foreground font-medium">
            The Lecture Planner is reserved for the Tablawy Faculty suite.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <ListView>
      <div className="space-y-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
        >
          <div className="space-y-4 flex-1 text-start">
            <Breadcrumb />
            <h1 className="page-title mb-0 flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/5 shadow-sm">
                <BookOpen className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              {t("timetable.lecture.title", "Lecture Planner")}
            </h1>
            <p className="text-muted-foreground font-medium max-w-2xl">
              Organize your course sections and lecture timing for the current semester.
            </p>
          </div>
          {(isTeacher || isAdmin) && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="rounded-2xl h-14 px-10 font-bold bg-purple-600 hover:bg-purple-700 shadow-purple-500/20 gap-2"
                >
                  <PlusCircle className="h-5 w-5" />
                  {t("timetable.lecture.create", "Schedule Lecture")}
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[2.5rem] max-w-lg p-0 overflow-hidden text-start">
                <div className="p-8 md:p-12 space-y-8">
                  <DialogHeader>
                    <DialogTitle className="text-3xl font-black">Schedule Lecture</DialogTitle>
                    <DialogDescription>
                      Assign a timeframe to one of your course sections.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                      <Label>Course Section</Label>
                      <Select
                        value={form.watch("sectionId")}
                        onValueChange={(v) => form.setValue("sectionId", v)}
                      >
                        <SelectTrigger className="rounded-2xl bg-muted/30 border-none h-12 px-4 text-start">
                          <SelectValue placeholder="Select Section" />
                        </SelectTrigger>
                        <SelectContent>
                          {sections.map((s) => (
                            <SelectItem key={s.id} value={s.id.toString()}>
                              {s.subject?.name} — {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Academic Year</Label>
                        <Select
                          value={form.watch("academicYearId")}
                          onValueChange={(v) => form.setValue("academicYearId", v)}
                        >
                          <SelectTrigger className="rounded-2xl bg-muted/30 border-none h-12 px-4">
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((y) => (
                              <SelectItem key={y.id} value={y.id.toString()}>
                                {y.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Day of Week</Label>
                        <Select
                          value={form.watch("dayOfWeek")}
                          onValueChange={(v) => form.setValue("dayOfWeek", v)}
                        >
                          <SelectTrigger className="rounded-2xl bg-muted/30 border-none h-12 px-4">
                            <SelectValue placeholder="Day" />
                          </SelectTrigger>
                          <SelectContent>
                            {DAYS.map((label: string, idx: number) => (
                              <SelectItem key={idx} value={idx.toString()}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          {...form.register("startTime")}
                          className="rounded-2xl bg-muted/30 border-none h-12 px-4"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          {...form.register("endTime")}
                          className="rounded-2xl bg-muted/30 border-none h-12 px-4"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Hall / Room</Label>
                      <Input
                        placeholder="e.g. Auditorium A"
                        {...form.register("roomId")}
                        className="rounded-2xl bg-muted/30 border-none h-12 px-4"
                      />
                    </div>

                    <DialogFooter className="pt-4">
                      <Button
                        type="submit"
                        className="w-full h-14 rounded-2xl font-black shadow-xl bg-purple-600 hover:bg-purple-700"
                      >
                        Confirm Lecture Slot
                      </Button>
                    </DialogFooter>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
          {DAYS.map((label: string, idx: number) => {
            const daySlots = slots.filter((s) => s.dayOfWeek === idx);
            const isToday = dayjs().get("day") === idx;

            return (
              <div
                key={idx}
                className={cn(
                  "space-y-4 p-2 rounded-[2rem] transition-colors duration-500",
                  isToday ? "bg-purple-500/5 ring-1 ring-purple-500/10" : ""
                )}
              >
                <div
                  className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] text-center py-2 border-b border-border/40 mb-4 flex flex-col items-center gap-1",
                    isToday ? "text-purple-500" : "text-muted-foreground/60"
                  )}
                >
                  {label}
                  {isToday && <div className="w-1 h-1 rounded-full bg-purple-500 animate-pulse" />}
                </div>
                <div className="space-y-3">
                  {daySlots.length === 0 ? (
                    <div className="h-20 rounded-3xl border border-dashed border-border/40 flex items-center justify-center opacity-30">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
                        Empty
                      </span>
                    </div>
                  ) : (
                    daySlots.map((slot) => (
                      <Card
                        key={slot.id}
                        className="p-4 rounded-3xl border-border/40 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden bg-card/60 backdrop-blur-xl border-l-4 border-l-purple-500/40 text-start"
                      >
                        <div className="flex flex-col items-start gap-2">
                          <span className="text-[10px] font-black tracking-tight text-purple-600">
                            {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                          </span>
                          <div className="space-y-1 min-w-0 w-full">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Layers className="w-3 h-3 text-purple-500 shrink-0" />
                              <h4 className="text-[10px] font-black truncate">
                                {(slot as any).section?.name || "Section"}
                                {slot.sectionId && (
                                  <span className="ml-1 text-[8px] opacity-40">
                                    #{slot.sectionId.toString()}
                                  </span>
                                )}
                              </h4>
                            </div>
                            <div className="flex items-center gap-1.5 opacity-60">
                              <BookOpen className="w-2.5 h-2.5 text-blue-500 shrink-0" />
                              <span className="text-[8px] font-bold truncate">
                                {(slot as any).subject?.name || "Course"}
                              </span>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full h-8 rounded-xl text-[8px] font-black uppercase tracking-widest gap-1.5 mt-1 hover:bg-purple-500/10 hover:text-purple-600"
                            onClick={() => push(`/classes/${slot.classId}`)}
                          >
                            View Section
                            <ChevronRight className="w-2.5 h-2.5" />
                          </Button>
                        </div>
                        {(isTeacher || isAdmin) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDelete(slot.id as number)}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        )}
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <CollisionModal
          open={isCollisionOpen}
          onOpenChange={setIsCollisionOpen}
          conflicts={conflicts}
        />
      </div>
    </ListView>
  );
}

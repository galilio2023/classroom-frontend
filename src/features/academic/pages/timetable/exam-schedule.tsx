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
  ShieldCheck,
  AlertTriangle,
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
import { CollisionModal } from "../../components/CollisionModal";
import { DAYS } from "@/constants/calendar";

export default function ExamSchedulePage() {
  const { t } = useTranslation();
  const { isSchoolSuite, isFacultySuite, isAdmin } = useCapabilities();
  const { push } = useNavigation() as any;

  const slotSchema = useMemo(
    () =>
      z.object({
        academicYearId: z.string().min(1, "Academic Year is required"),
        dayOfWeek: z.string().min(1, "Day is required"),
        startTime: z.string().min(1, "Start time is required"),
        endTime: z.string().min(1, "End time is required"),
        teacherId: z.string().min(1, "Invigilator is required"),
        classId: z.string().min(1, "Class/Section is required"),
        subjectId: z.string().min(1, "Course/Subject is required"),
        roomId: z.string().min(1, "Room/Hall is required"),
      }),
    []
  );

  type SlotFormValues = z.infer<typeof slotSchema>;

  usePageTitle(t("timetable.exam.title", "Exam Planner"));

  const { query: slotsQuery } = useList<TimetableSlot>({
    resource: "timetable",
    filters: [{ field: "scheduleType", operator: "eq", value: "exam" }],
  });

  const { query: yearsQuery } = useList<AcademicYear>({ resource: "academic-years" });
  const { query: classesQuery } = useList<Class>({ resource: "classes" });
  const { query: subjectsQuery } = useList<Subject>({ resource: "subjects" });
  const { query: teachersQuery } = useList<User>({
    resource: "users",
    filters: [{ field: "role", operator: "eq", value: UserRole.TEACHER }],
  });

  const slots = slotsQuery.data?.data || [];
  const years = yearsQuery.data?.data || [];
  const classesData = classesQuery.data?.data || [];
  const subjectsData = subjectsQuery.data?.data || [];
  const teachers = teachersQuery.data?.data || [];
  const isLoading =
    slotsQuery.isLoading ||
    yearsQuery.isLoading ||
    classesQuery.isLoading ||
    subjectsQuery.isLoading;

  const { mutate: create, mutation: createMutation } = useCreate();
  const { mutate: deleteMutation } = useDelete();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCollisionOpen, setIsCollisionOpen] = useState(false);
  const [conflicts, setConflicts] = useState<any[]>([]);

  const form = useForm<SlotFormValues>({
    resolver: zodResolver(slotSchema),
  });

  const onSubmit = (values: SlotFormValues) => {
    create(
      {
        resource: "timetable/exam-schedule",
        values: {
          ...values,
          dayOfWeek: parseInt(values.dayOfWeek),
        },
      },
      {
        onSuccess: () => {
          toast.success("Exam scheduled. Notifications queued.");
          setIsCreateOpen(false);
          form.reset();
        },
        onError: (err: any) => {
          if (err?.statusCode === 409 && err?.details) {
            setConflicts(err.details);
            setIsCollisionOpen(true);
          } else {
            toast.error(err?.message || "Failed to schedule exam.");
          }
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Cancel this exam schedule?")) {
      deleteMutation(
        { resource: "timetable", id },
        {
          onSuccess: () => toast.success("Exam cancelled."),
          onError: () => toast.error("Action failed."),
        }
      );
    }
  };

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
              <div className="p-3 rounded-2xl bg-destructive/10 text-destructive border border-destructive/5 shadow-sm">
                <ShieldCheck className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              {t("timetable.exam.title", "Exam Schedule Manager")}
            </h1>
            <p className="text-muted-foreground font-medium max-w-2xl">
              Define formal exam periods, venues, and invigilation duties.
            </p>
          </div>
          {isAdmin && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  variant="destructive"
                  className="rounded-2xl h-14 px-10 font-bold gap-2 shadow-lg shadow-destructive/25"
                >
                  <PlusCircle className="h-5 w-5" />
                  {t("timetable.exam.create", "Schedule Exam")}
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[2.5rem] max-w-lg p-0 overflow-hidden text-start">
                <div className="p-8 md:p-12 space-y-8">
                  <DialogHeader>
                    <DialogTitle className="text-3xl font-black">New Exam Slot</DialogTitle>
                    <DialogDescription>
                      Assign a timeframe and venue for a formal assessment.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                      <Label>Course / Subject</Label>
                      <Select onValueChange={(v) => form.setValue("subjectId", v)}>
                        <SelectTrigger className="rounded-2xl bg-muted/30 border-none h-12 px-4">
                          <SelectValue placeholder="Select Course" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjectsData.map((s) => (
                            <SelectItem key={s.id} value={s.id.toString()}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Target Class/Section</Label>
                        <Select onValueChange={(v) => form.setValue("classId", v)}>
                          <SelectTrigger className="rounded-2xl bg-muted/30 border-none h-12 px-4 text-start">
                            <SelectValue placeholder="Select Target" />
                          </SelectTrigger>
                          <SelectContent>
                            {classesData.map((c) => (
                              <SelectItem key={c.id} value={c.id.toString()}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Day of Week</Label>
                        <Select onValueChange={(v) => form.setValue("dayOfWeek", v)}>
                          <SelectTrigger className="rounded-2xl bg-muted/30 border-none h-12 px-4 text-start">
                            <SelectValue placeholder="Select Day" />
                          </SelectTrigger>
                          <SelectContent>
                            {DAYS.map((label, idx) => (
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
                      <Label>Invigilator / Teacher</Label>
                      <Select
                        value={form.watch("teacherId")}
                        onValueChange={(v) => form.setValue("teacherId", v)}
                      >
                        <SelectTrigger className="rounded-2xl bg-muted/30 border-none h-12 px-4">
                          <SelectValue placeholder="Assign Staff" />
                        </SelectTrigger>
                        <SelectContent>
                          {teachers.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{isFacultySuite ? "Hall Name" : "Room Name"}</Label>
                      <Input
                        placeholder="e.g. Hall 4"
                        {...form.register("roomId")}
                        className="rounded-2xl bg-muted/30 border-none h-12 px-4"
                      />
                    </div>

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

                    <DialogFooter className="pt-4">
                      <Button
                        type="submit"
                        variant="destructive"
                        className="w-full h-14 rounded-2xl font-black shadow-xl shadow-destructive/20"
                      >
                        Finalize Exam Slot
                      </Button>
                    </DialogFooter>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
          {DAYS.map((label, idx) => {
            const daySlots = slots.filter((s) => s.dayOfWeek === idx);
            return (
              <div key={idx} className="space-y-4">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-center text-muted-foreground/60 py-2 border-b border-border/40 mb-4">
                  {label}
                </div>
                <div className="space-y-3">
                  {daySlots.length === 0 ? (
                    <div className="h-20 rounded-3xl border border-dashed border-border/40 flex items-center justify-center opacity-20">
                      <span className="text-[8px] font-bold">No Exams</span>
                    </div>
                  ) : (
                    daySlots.map((slot) => (
                      <Card
                        key={slot.id}
                        className="p-4 rounded-3xl border-destructive/20 shadow-md transition-all group relative overflow-hidden bg-destructive/5 text-start"
                      >
                        <div className="flex flex-col items-start gap-2">
                          <Badge
                            variant="destructive"
                            className="h-5 px-2 rounded-full text-[8px] font-black uppercase tracking-widest gap-1"
                          >
                            <ShieldCheck className="w-2 h-2" /> Exam
                          </Badge>
                          <span className="text-[10px] font-black tracking-tight text-destructive">
                            {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                          </span>
                          <div className="space-y-1 min-w-0 w-full">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <BookOpen className="w-3 h-3 text-destructive shrink-0" />
                              <h4 className="text-[10px] font-black truncate">
                                {subjectsData.find(
                                  (s) => s.id.toString() === slot.subjectId?.toString()
                                )?.name || "Subject"}
                              </h4>
                            </div>
                            <div className="flex items-center gap-1.5 opacity-60">
                              <MapPin className="w-2.5 h-2.5 text-destructive shrink-0" />
                              <span className="text-[9px] font-bold truncate">{slot.roomId}</span>
                            </div>
                          </div>
                        </div>
                        {isAdmin && (
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

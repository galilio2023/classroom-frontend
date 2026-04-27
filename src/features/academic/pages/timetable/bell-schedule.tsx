import { useCreate, useDelete, useGetIdentity, useList, useUpdate } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Activity,
  Archive,
  Calendar,
  CheckCircle,
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
  User as UserIcon,
  BookOpen,
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

const DAYS = [
  { id: 0, label: "Sunday" },
  { id: 1, label: "Monday" },
  { id: 2, label: "Tuesday" },
  { id: 3, label: "Wednesday" },
  { id: 4, label: "Thursday" },
  { id: 5, label: "Friday" },
  { id: 6, label: "Saturday" },
];

export default function BellSchedulePage() {
  const { t } = useTranslation();
  const { isSchoolSuite, isAdmin } = useCapabilities();

  const slotSchema = useMemo(
    () =>
      z.object({
        academicYearId: z.string().min(1, "Academic Year is required"),
        dayOfWeek: z.string().min(1, "Day is required"),
        startTime: z.string().min(1, "Start time is required"),
        endTime: z.string().min(1, "End time is required"),
        teacherId: z.string().min(1, "Teacher is required"),
        roomId: z.string().optional(),
        classId: z.string().optional(),
        subjectId: z.string().optional(),
      }),
    []
  );

  type SlotFormValues = z.infer<typeof slotSchema>;

  usePageTitle(t("timetable.bell.title", "Bell Schedule"));

  const { query: slotsQuery } = useList<TimetableSlot>({
    resource: "timetable",
    filters: [{ field: "scheduleType", operator: "eq", value: "bell" }],
  });

  const { query: yearsQuery } = useList<AcademicYear>({ resource: "academic-years" });
  const { query: teachersQuery } = useList<User>({
    resource: "users",
    filters: [{ field: "role", operator: "eq", value: UserRole.TEACHER }],
  });
  const { query: classesQuery } = useList<Class>({ resource: "classes" });
  const { query: subjectsQuery } = useList<Subject>({ resource: "subjects" });

  const slots = slotsQuery.data?.data || [];
  const years = yearsQuery.data?.data || [];
  const teachers = teachersQuery.data?.data || [];
  const classesData = classesQuery.data?.data || [];
  const subjectsData = subjectsQuery.data?.data || [];
  const isLoading =
    slotsQuery.isLoading ||
    yearsQuery.isLoading ||
    teachersQuery.isLoading ||
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
        resource: "timetable/bell-schedule",
        values: {
          ...values,
          dayOfWeek: parseInt(values.dayOfWeek),
        },
      },
      {
        onSuccess: () => {
          toast.success("Period created successfully.");
          setIsCreateOpen(false);
          form.reset();
        },
        onError: (err: any) => {
          if (err?.statusCode === 409 && err?.details) {
            setConflicts(err.details);
            setIsCollisionOpen(true);
          } else {
            toast.error(err?.message || "Failed to create period.");
          }
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this period?")) {
      deleteMutation(
        { resource: "timetable", id },
        {
          onSuccess: () => toast.success("Period deleted."),
          onError: () => toast.error("Delete failed."),
        }
      );
    }
  };

  if (!isSchoolSuite) {
    return (
      <div className="flex items-center justify-center p-20">
        <Card className="max-w-md p-8 text-center space-y-4">
          <TrendingUp className="w-12 h-12 text-muted-foreground/20 mx-auto" />
          <h2 className="text-xl font-black">Not Available</h2>
          <p className="text-muted-foreground">
            The Bell Schedule is only available in the Tablawy School suite.
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
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/5 shadow-sm">
                <Clock className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              {t("timetable.bell.title", "Bell Schedule")}
            </h1>
            <p className="text-muted-foreground font-medium max-w-2xl">
              Define school-wide periods and timing cycles.
            </p>
          </div>
          {isAdmin && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="rounded-2xl h-14 px-10 font-bold gap-2 shadow-lg shadow-primary/25"
                >
                  <PlusCircle className="h-5 w-5" />
                  {t("timetable.bell.create", "Add Period")}
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[2.5rem] max-w-lg p-0 overflow-hidden text-start">
                <div className="p-8 md:p-12 space-y-8">
                  <DialogHeader>
                    <DialogTitle className="text-3xl font-black">New Period</DialogTitle>
                    <DialogDescription>
                      Define a recurring time slot for the school.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Academic Year</Label>
                        <Select
                          value={form.watch("academicYearId")}
                          onValueChange={(v) => form.setValue("academicYearId", v)}
                        >
                          <SelectTrigger className="rounded-2xl bg-muted/30 border-none h-12 px-4">
                            <SelectValue placeholder="Select Year" />
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
                            <SelectValue placeholder="Select Day" />
                          </SelectTrigger>
                          <SelectContent>
                            {DAYS.map((d) => (
                              <SelectItem key={d.id} value={d.id.toString()}>
                                {d.label}
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
                      <Label>Assigned Teacher</Label>
                      <Select onValueChange={(v) => form.setValue("teacherId", v)}>
                        <SelectTrigger className="rounded-2xl bg-muted/30 border-none h-12 px-4 text-start">
                          <SelectValue placeholder="Select Teacher" />
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

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Class (Grade)</Label>
                        <Select onValueChange={(v) => form.setValue("classId", v)}>
                          <SelectTrigger className="rounded-2xl bg-muted/30 border-none h-12 px-4 text-start">
                            <SelectValue placeholder="Select Class" />
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
                        <Label>Subject</Label>
                        <Select onValueChange={(v) => form.setValue("subjectId", v)}>
                          <SelectTrigger className="rounded-2xl bg-muted/30 border-none h-12 px-4 text-start">
                            <SelectValue placeholder="Select Subject" />
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
                    </div>

                    <div className="space-y-2">
                      <Label>Room (Optional)</Label>
                      <Input
                        placeholder="e.g. Lab 3"
                        {...form.register("roomId")}
                        className="rounded-2xl bg-muted/30 border-none h-12 px-4"
                      />
                    </div>

                    <DialogFooter className="pt-4">
                      <Button
                        type="submit"
                        className="w-full h-14 rounded-2xl font-black shadow-xl shadow-primary/20"
                      >
                        Save Period
                      </Button>
                    </DialogFooter>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
          {DAYS.map((day) => {
            const daySlots = slots.filter((s) => s.dayOfWeek === day.id);
            return (
              <div key={day.id} className="space-y-4">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-center text-muted-foreground/60 py-2 border-b border-border/40 mb-4">
                  {day.label}
                </div>
                <div className="space-y-3">
                  {daySlots.length === 0 ? (
                    <div className="h-20 rounded-3xl border border-dashed border-border/40 flex items-center justify-center opacity-40">
                      <span className="text-[8px] font-bold uppercase tracking-widest">Free</span>
                    </div>
                  ) : (
                    daySlots.map((slot) => (
                      <Card
                        key={slot.id}
                        className="p-4 rounded-3xl border-border/40 shadow-sm hover:shadow-md transition-all group relative overflow-hidden bg-card/40 backdrop-blur-sm text-start"
                      >
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-[10px] font-black tracking-tight text-primary">
                            {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                          </span>
                          <div className="flex flex-col gap-0.5 mt-1 text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-2.5 h-2.5 text-blue-500" />
                              <span className="text-[10px] font-black text-foreground">
                                {subjectsData.find(
                                  (s) => s.id.toString() === slot.subjectId?.toString()
                                )?.name || "Subject"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Layers className="w-2.5 h-2.5 text-amber-500" />
                              <span className="text-[8px] font-bold">
                                {classesData.find(
                                  (c) => c.id.toString() === slot.classId?.toString()
                                )?.name || "Class"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 opacity-70">
                              <UserIcon className="w-2.5 h-2.5" />
                              <span className="text-[8px] font-bold truncate">
                                T.{" "}
                                {teachers.find((t) => t.id === slot.teacherId)?.name || "Unknown"}
                              </span>
                            </div>
                          </div>
                          {slot.roomId && (
                            <div className="flex items-center gap-1 text-muted-foreground/60 mt-1">
                              <MapPin className="w-2.5 h-2.5" />
                              <span className="text-[8px] font-bold">{slot.roomId}</span>
                            </div>
                          )}
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

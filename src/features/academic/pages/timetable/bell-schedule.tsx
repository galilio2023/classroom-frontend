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
import { useTerm } from "@/contexts/term-context";
import { CollisionModal } from "../../components/CollisionModal";
import { TimetableGrid } from "@/features/timetable/components/TimetableGrid";

export default function BellSchedulePage() {
  const { t } = useTranslation();
  const { isSchoolSuite, isFacultySuite, isAdmin, lectureSchedule, bellTimetable } =
    useCapabilities();
  const { currentTerm } = useTerm();

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
        sectionId: lectureSchedule
          ? z.string().min(1, "Section is required")
          : z.string().optional(),
        subjectId: z.string().optional(),
      }),
    [lectureSchedule]
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
  const { query: sectionsQuery } = useList<any>({
    resource: "academic/sections",
    filters: currentTerm ? [{ field: "termId", operator: "eq", value: currentTerm.id }] : [],
    queryOptions: { enabled: lectureSchedule && !!currentTerm },
  });

  const slots = (slotsQuery.data?.data || []) as any[];
  const years = yearsQuery.data?.data || [];
  const teachers = teachersQuery.data?.data || [];
  const classesData = classesQuery.data?.data || [];
  const subjectsData = subjectsQuery.data?.data || [];
  const sectionsData = sectionsQuery.data?.data || [];
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
    // 🛡️ HUB PHASE 6.2: Wrap single slot in an array for batch backend compatibility
    create(
      {
        resource: "timetable/bell-schedule",
        values: {
          academicYearId: values.academicYearId,
          slots: [
            {
              ...values,
              dayOfWeek: parseInt(values.dayOfWeek),
            },
          ],
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

  const handleDelete = (id: string) => {
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

  if (!isSchoolSuite && !isFacultySuite) {
    return (
      <div className="flex items-center justify-center p-20">
        <Card className="max-w-md p-8 text-center space-y-4 rounded-4xl border-border/40">
          <TrendingUp className="w-12 h-12 text-muted-foreground/20 mx-auto" />
          <h2 className="text-xl font-black">Feature Restricted</h2>
          <p className="text-muted-foreground">
            The Bell Schedule is currently optimized for the Tablawy School suite.
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
              <DialogContent className="rounded-[2.5rem] max-w-lg p-0 overflow-hidden text-start border-none shadow-2xl">
                <div className="p-8 md:p-12 space-y-8">
                  <DialogHeader>
                    <DialogTitle className="text-3xl font-black uppercase tracking-tighter">
                      New Period
                    </DialogTitle>
                    <DialogDescription className="font-medium text-muted-foreground/60">
                      Define a recurring time slot for the school.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">
                          Academic Year
                        </Label>
                        <Select
                          value={form.watch("academicYearId")}
                          onValueChange={(v) => form.setValue("academicYearId", v)}
                        >
                          <SelectTrigger className="rounded-2xl bg-muted/30 border-none h-12 px-4 shadow-inner">
                            <SelectValue placeholder="Select Year" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-none shadow-2xl">
                            {years.map((y) => (
                              <SelectItem key={y.id} value={y.id.toString()}>
                                {y.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">
                          Day of Week
                        </Label>
                        <Select
                          value={form.watch("dayOfWeek")}
                          onValueChange={(v) => form.setValue("dayOfWeek", v)}
                        >
                          <SelectTrigger className="rounded-2xl bg-muted/30 border-none h-12 px-4 shadow-inner">
                            <SelectValue placeholder="Select Day" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-none shadow-2xl">
                            <SelectItem value="0">Sunday</SelectItem>
                            <SelectItem value="1">Monday</SelectItem>
                            <SelectItem value="2">Tuesday</SelectItem>
                            <SelectItem value="3">Wednesday</SelectItem>
                            <SelectItem value="4">Thursday</SelectItem>
                            <SelectItem value="5">Friday</SelectItem>
                            <SelectItem value="6">Saturday</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">
                          Start Time
                        </Label>
                        <Input
                          type="time"
                          {...form.register("startTime")}
                          className="rounded-2xl bg-muted/30 border-none h-12 px-4 shadow-inner"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">
                          End Time
                        </Label>
                        <Input
                          type="time"
                          {...form.register("endTime")}
                          className="rounded-2xl bg-muted/30 border-none h-12 px-4 shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1">
                        Assigned Teacher
                      </Label>
                      <Select onValueChange={(v) => form.setValue("teacherId", v)}>
                        <SelectTrigger className="rounded-2xl bg-muted/30 border-none h-12 px-4 text-start shadow-inner">
                          <SelectValue placeholder="Select Teacher" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-2xl">
                          {teachers.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {bellTimetable && (
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest ml-1">
                            Class (Grade)
                          </Label>
                          <Select
                            value={form.watch("classId")}
                            onValueChange={(v) => form.setValue("classId", v)}
                          >
                            <SelectTrigger className="rounded-2xl bg-muted/30 border-none h-12 px-4 text-start shadow-inner">
                              <SelectValue placeholder="Select Class" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-none shadow-2xl">
                              {classesData.map((c) => (
                                <SelectItem key={c.id} value={c.id.toString()}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {lectureSchedule && (
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest ml-1">
                            Academic Section
                          </Label>
                          <Select
                            value={form.watch("sectionId")}
                            onValueChange={(v) => form.setValue("sectionId", v)}
                          >
                            <SelectTrigger className="rounded-2xl bg-muted/30 border-none h-12 px-4 text-start shadow-inner">
                              <SelectValue placeholder="Select Section" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-none shadow-2xl">
                              {sectionsData.map((s) => (
                                <SelectItem key={s.id} value={s.id.toString()}>
                                  {s.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">
                          Subject
                        </Label>
                        <Select onValueChange={(v) => form.setValue("subjectId", v)}>
                          <SelectTrigger className="rounded-2xl bg-muted/30 border-none h-12 px-4 text-start shadow-inner">
                            <SelectValue placeholder="Select Subject" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-none shadow-2xl">
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
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1">
                        Room (Optional)
                      </Label>
                      <Input
                        placeholder="e.g. Lab 3"
                        {...form.register("roomId")}
                        className="rounded-2xl bg-muted/30 border-none h-12 px-4 shadow-inner"
                      />
                    </div>

                    <DialogFooter className="pt-4">
                      <Button
                        type="submit"
                        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
                        disabled={createMutation.isPending}
                      >
                        {createMutation.isPending ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          "Save Period"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>

        <TimetableGrid
          slots={slots.map((s) => ({
            ...s,
            subject: subjectsData.find((sub) => sub.id.toString() === s.subjectId?.toString()),
            teacher: teachers.find((t) => t.id === s.teacherId),
            section: classesData.find((c) => c.id.toString() === s.classId?.toString()),
          }))}
          isLoading={isLoading}
          isAdmin={isAdmin}
          onDelete={(id) => handleDelete(id as string)}
        />

        <CollisionModal
          open={isCollisionOpen}
          onOpenChange={setIsCollisionOpen}
          conflicts={conflicts}
        />
      </div>
    </ListView>
  );
}

import { useState, useMemo, useEffect } from "react";
import {
  useGetIdentity,
  useGo,
  useCustom,
  BaseRecord,
  HttpError,
  useList,
  useCustomMutation,
} from "@refinedev/core";
import { User, UserRole, Class } from "@/types";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Info,
  Users,
  FileText,
  FileQuestion,
  Wand2,
  Sparkles,
} from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
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
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

import usePageTitle from "@/hooks/use-page-title";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";

dayjs.extend(utc);

interface CalendarEvent extends BaseRecord {
  id: string;
  title: string;
  type: "class" | "assignment" | "quiz" | "exam";
  date: string;
  startTime?: string;
  endTime?: string;
  classId?: number;
  className?: string;
  color?: string;
}

export const CalendarPage = () => {
  const { t, i18n } = useTranslation();
  usePageTitle(t("calendar.title"));
  const { data: identity } = useGetIdentity<User>();
  const go = useGo();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );

  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  const isTeacher = identity?.role === UserRole.TEACHER;

  // Custom query to fetch all schedules and deadlines
  const { query: calendarQueryResult } = useCustom<CalendarEvent[], HttpError>({
    url: "/calendar/events",
    method: "get",
    queryOptions: {
      enabled: !!identity?.id,
      staleTime: 5 * 60 * 1000,
    },
  });

  const { data: calendarResult, isLoading, refetch } = calendarQueryResult;

  const calendarData = calendarResult?.data || [];

  useEffect(() => {
    if (identity && refetch) {
      void refetch();
    }
  }, [identity, refetch]);

  const {
    query: { data: classesData },
  } = useList<Class>({
    resource: "classes",
    queryOptions: {
      enabled: isTeacher,
    },
    filters: [
      {
        field: "teacherUid",
        operator: "eq",
        value: identity?.id,
      },
    ],
  });

  const { mutate: generateSchedule, mutation } = useCustomMutation<
    BaseRecord,
    HttpError,
    { classId: number }
  >();
  const isGenerating = mutation.isPending;

  const handleGenerateSchedule = () => {
    if (!selectedClassId) {
      toast.error(t("calendar.toasts.selectClass"));
      return;
    }

    generateSchedule(
      {
        url: "/calendar/generate",
        method: "post",
        values: { classId: Number(selectedClassId) },
      },
      {
        onSuccess: () => {
          toast.success(t("calendar.toasts.generated"));
          setIsGenerateDialogOpen(false);
          setSelectedClassId("");
          void refetch();
        },
        onError: (error: HttpError) => {
          toast.error(error.message || t("common.error"));
        },
      },
    );
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "class":
        return <Users className="h-4 w-4" />;
      case "assignment":
        return <FileText className="h-4 w-4" />;
      case "quiz":
        return <FileQuestion className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string, customColor?: string) => {
    if (customColor) return customColor;
    switch (type) {
      case "class":
        return "var(--primary)";
      case "assignment":
        return "#f59e0b";
      case "quiz":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    const events = calendarData || [];

    events.forEach((event: CalendarEvent) => {
      const dateKey = dayjs(event.date).format("YYYY-MM-DD");
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => {
        if (!a.startTime || !b.startTime) return 0;
        return a.startTime.localeCompare(b.startTime);
      });
    });

    return grouped;
  }, [calendarData]);

  const selectedDateKey = selectedDate
    ? dayjs(selectedDate).format("YYYY-MM-DD")
    : null;
  const selectedDayEvents = selectedDateKey
    ? eventsByDate[selectedDateKey] || []
    : [];

  const handleEventClick = (event: CalendarEvent) => {
    if (event.classId) {
      go({ to: `/classes/show/${event.classId}` });
    }
  };

  return (
    <div className="space-y-8 md:space-y-12 pb-20 relative">
      {/* Background Polish */}
      <div className="hidden sm:block absolute top-0 start-1/4 w-100 h-100 bg-primary/5 rounded-full blur-[100px] -z-10 animate-pulse" />

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6"
      >
        <div className="space-y-4 flex-1">
          <Breadcrumb />
          <div className="space-y-1">
            <h1 className="page-title mb-0 flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/5">
                <CalendarIcon className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              {t("calendar.title")}
            </h1>
            <p className="text-muted-foreground font-medium max-w-2xl text-balance">
              {t("calendar.description")}
            </p>
          </div>
        </div>

        {isTeacher && (
          <Dialog
            open={isGenerateDialogOpen}
            onOpenChange={setIsGenerateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-ai-primary/20 bg-ai-primary hover:bg-ai-primary/90 text-white border-none h-12 md:h-14 px-8 w-full md:w-auto"
              >
                <Wand2 className="h-4 w-4 md:h-5 md:w-5" />
                {t("calendar.generatePlan")}
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-card/95 backdrop-blur-3xl max-w-lg p-0 overflow-hidden">
              <div className="p-8 md:p-12 space-y-8">
                <DialogHeader className="space-y-4">
                  <div className="p-5 rounded-2xl bg-ai-primary/10 text-ai-primary w-fit mx-auto">
                    <Wand2 className="h-10 w-10" />
                  </div>
                  <div className="space-y-2 text-center">
                    <DialogTitle className="text-3xl font-black tracking-tight">
                      {t("calendar.generateTitle")}
                    </DialogTitle>
                    <DialogDescription className="font-medium text-base text-muted-foreground">
                      {t("calendar.generateDesc")}
                    </DialogDescription>
                  </div>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1">
                      {t("calendar.selectClass")}
                    </label>
                    <Select
                      value={selectedClassId}
                      onValueChange={setSelectedClassId}
                    >
                      <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-none shadow-inner px-6 text-lg">
                        <SelectValue placeholder={t("calendar.selectClass")} />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl bg-white dark:bg-[#09090b] opacity-100 backdrop-blur-none border border-border/50 shadow-2xl p-2">
                        {classesData?.data?.map((c: Class) => (
                          <SelectItem
                            key={c.id}
                            value={String(c.id)}
                            className="rounded-xl py-3 cursor-pointer"
                          >
                            <span className="font-bold">{c.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-6 rounded-2xl bg-primary/5 text-xs text-primary/70 border border-primary/10 flex items-start gap-4">
                    <Info className="h-5 w-5 shrink-0 mt-0.5" />
                    <p className="font-medium leading-relaxed">
                      {t("calendar.syncInfo")}
                    </p>
                  </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-3">
                  <Button
                    variant="ghost"
                    className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-8"
                    onClick={() => setIsGenerateDialogOpen(false)}
                  >
                    {t("buttons.cancel")}
                  </Button>
                  <Button
                    size="lg"
                    className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-10 bg-ai-primary hover:bg-ai-primary/90 text-white shadow-xl shadow-ai-primary/20"
                    onClick={handleGenerateSchedule}
                    disabled={isGenerating || !selectedClassId}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-5 w-5 me-3 animate-spin" />
                        {t("buttons.processing")}
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 me-3" />
                        {t("buttons.create")}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-8 md:gap-12 items-start">
        {/* Calendar Card */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-8"
        >
          <Card className="rounded-4xl border border-border/50 shadow-2xl bg-white dark:bg-[#09090b] opacity-100 backdrop-blur-none overflow-hidden p-4 md:p-8 lg:p-12">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="w-full flex justify-center"
              classNames={{
                months: "w-full",
                month: "w-full space-y-8 md:space-y-12",
                month_caption:
                  "flex justify-center pt-2 relative items-center mb-10 md:mb-16",
                caption_label:
                  "text-2xl md:text-3xl font-black tracking-tighter text-foreground",
                nav: "space-x-2 flex items-center",
                button_previous: cn(
                  "h-10 w-10 md:h-12 md:w-12 bg-muted/40 hover:bg-primary/10 rounded-2xl transition-all flex items-center justify-center p-0 absolute start-2",
                ),
                button_next: cn(
                  "h-10 w-10 md:h-12 md:w-12 bg-muted/40 hover:bg-primary/10 rounded-2xl transition-all flex items-center justify-center p-0 absolute end-2",
                ),
                month_grid: "w-full border-collapse space-y-4",
                weekdays: "flex w-full mb-6",
                weekday:
                  "text-muted-foreground/50 w-full font-black uppercase tracking-[0.2em] text-[9px] md:text-[10px]",
                week: "flex w-full mt-2 gap-2 md:gap-4",
                day: "text-center text-sm p-0 relative w-full h-12 xs:h-16 md:h-20 focus-within:relative focus-within:z-20",
                day_button: cn(
                  "h-full w-full p-0 font-bold hover:bg-primary/5 rounded-2xl md:rounded-[1.5rem] transition-all aria-selected:opacity-100",
                ),
                selected:
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground shadow-2xl shadow-primary/30",
                today: "bg-primary/10 text-primary border border-primary/20",
                outside: "text-muted-foreground/30 opacity-50",
                disabled: "text-muted-foreground opacity-50",
                range_middle:
                  "aria-selected:bg-accent aria-selected:text-accent-foreground",
                hidden: "invisible",
              }}
              locale={undefined}
              components={{
                Chevron: ({ orientation }) => {
                  const Icon =
                    orientation === "left" ? ChevronLeft : ChevronRight;
                  return <Icon className="h-6 w-6" />;
                },
                DayButton: ({ day, modifiers, ...props }) => {
                  const date = day.date;
                  const dateKey = dayjs(date).format("YYYY-MM-DD");
                  const dayEvents = eventsByDate[dateKey] || [];
                  const isSelected = modifiers.selected;
                  const isToday = modifiers.today;

                  return (
                    <button
                      {...props}
                      className={cn(
                        props.className,
                        "flex flex-col items-center justify-center h-full w-full relative group/day",
                        isSelected && "text-primary-foreground",
                        !isSelected && isToday && "text-primary",
                      )}
                    >
                      <span className="text-sm md:text-lg lg:text-xl font-black">
                        {date.getDate()}
                      </span>
                      {dayEvents.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-1 md:gap-1.5 mt-1 absolute bottom-2 md:bottom-3 max-w-[80%]">
                          {dayEvents.slice(0, 3).map((event, i) => (
                            <div
                              key={i}
                              className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full shadow-sm"
                              style={{
                                backgroundColor: isSelected
                                  ? "white"
                                  : getEventColor(event.type, event.color),
                              }}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-muted-foreground/40" />
                          )}
                        </div>
                      )}
                    </button>
                  );
                },
              }}
            />
          </Card>
        </motion.div>

        {/* Events Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4"
        >
          <Card className="rounded-4xl border border-border/50 shadow-2xl bg-white dark:bg-[#09090b] opacity-100 backdrop-blur-none overflow-hidden sticky top-24">
            <CardHeader className="p-8 md:p-10 pb-6 md:pb-8 border-b border-border/40 bg-muted/20">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                    <Clock className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl md:text-2xl font-black tracking-tight">
                    {selectedDate
                      ? dayjs(selectedDate).format(
                          i18n.language === "ar"
                            ? "DD MMMM YYYY"
                            : "MMMM D, YYYY",
                        )
                      : t("calendar.selectDate")}
                  </CardTitle>
                </div>
                <Badge
                  variant="ai"
                  className="w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
                >
                  {selectedDayEvents.length} {t("calendar.eventsSelectedDay")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6">
                  <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin text-primary/10" />
                    <CalendarIcon className="h-5 w-5 text-primary/30 absolute inset-0 m-auto" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 animate-pulse">
                    {t("classes.curriculum.loading")}
                  </p>
                </div>
              ) : selectedDayEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center px-10 opacity-30 grayscale scale-95 transition-all">
                  <div className="p-6 rounded-4xl bg-muted/50 mb-6">
                    <CalendarIcon className="h-16 w-16" />
                  </div>
                  <p className="font-black uppercase tracking-[0.2em] text-[10px]">
                    {t("calendar.noEvents")}
                  </p>
                  <p className="text-sm font-medium mt-3 leading-relaxed">
                    {t("calendar.noEventsDesc")}
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-112.5 md:h-150 p-6 md:p-8">
                  <div className="space-y-5 pe-2">
                    {selectedDayEvents.map((event, index) => {
                      const color = getEventColor(event.type, event.color);
                      return (
                        <motion.div
                          key={event.id || index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleEventClick(event)}
                          className={cn(
                            "group flex flex-col p-6 rounded-4xl border transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-primary/5",
                            event.classId
                              ? "hover:-translate-y-1"
                              : "hover:bg-muted/50 cursor-default",
                          )}
                          style={{
                            borderColor: `${color}20`,
                            backgroundColor: `${color}05`,
                          }}
                        >
                          <div className="flex flex-wrap justify-between items-start gap-3 mb-5">
                            <Badge
                              className="border-none text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm"
                              style={{
                                backgroundColor: `${color}15`,
                                color: color,
                                border: `1px solid ${color}20`,
                              }}
                            >
                              {getEventIcon(event.type)}
                              {t(`calendar.eventTypes.classes`)}
                            </Badge>
                            {event.startTime && (
                              <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground/60 bg-background/60 px-3 py-1.5 rounded-full backdrop-blur-md border border-border/40">
                                <Clock className="h-3.5 w-3.5" />
                                <span>
                                  {dayjs(event.startTime).format("HH:mm")}
                                  {event.endTime &&
                                    ` - ${dayjs(event.endTime).format("HH:mm")}`}
                                </span>
                              </div>
                            )}
                          </div>
                          <h4 className="font-black text-lg md:text-xl tracking-tight mb-2 group-hover:text-primary transition-colors text-start leading-tight">
                            {event.title}
                          </h4>
                          {event.className && (
                            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/60">
                              <div className="p-1.5 rounded-lg bg-primary/5">
                                <Users className="h-3 w-3 text-primary" />
                              </div>
                              <span className="truncate">
                                {event.className}
                              </span>
                            </div>
                          )}

                          {event.classId && (
                            <div className="mt-5 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                              {t("notifications.viewClass")}
                              <ChevronRight className="h-3 w-3" />
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
export default CalendarPage;

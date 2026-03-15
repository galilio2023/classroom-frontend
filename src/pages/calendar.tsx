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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronRight,
  Loader2,
  Info,
  Users,
  FileText,
  FileQuestion,
  Wand2,
  Plus,
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
import { ar } from "date-fns/locale";

import usePageTitle from "@/hooks/use-page-title";

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
  const isStudent = identity?.role === UserRole.STUDENT;

  // Custom query to fetch all schedules and deadlines
  const calendarQuery = useCustom<CalendarEvent[], HttpError>({
    url: "/calendar/events",
    method: "get",
    queryOptions: {
      enabled: !!identity?.id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  });

  const {
    data: calendarResult,
    isLoading,
    refetch,
  } = calendarQuery.query;

  const calendarData = calendarResult?.data || [];

  useEffect(() => {
    // Ensure data is fresh on mount
    if (identity && refetch) {
      void refetch();
    }
  }, [identity, refetch]);

  const { result: classesData } = useList<Class>({
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

  const { mutate: generateSchedule, mutation: isGenerating } =
    useCustomMutation<any>();

  const handleGenerateSchedule = () => {
    if (!selectedClassId) {
      toast.error(t("calendar.generateDialog.selectClassError"));
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
          toast.success(t("calendar.generateDialog.success"));
          setIsGenerateDialogOpen(false);
          setSelectedClassId("");
          void refetch();
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || t("calendar.generateDialog.error")
          );
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
        return "var(--primary)"; // Primary blue
      case "assignment":
        return "#f59e0b"; // Amber
      case "quiz":
        return "#ef4444"; // Red
      default:
        return "#6b7280"; // Gray
    }
  };

  // Group events by date string (YYYY-MM-DD)
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

    // Sort events within each day by start time
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

  const isAr = i18n.language === "ar";

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 text-start">
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
              <CalendarIcon className="h-8 w-8" />
            </div>
            {t("calendar.title")}
          </h1>
          <p className="text-muted-foreground font-medium">
            {t("calendar.description")}
          </p>
        </div>

        {isTeacher && (
          <Dialog
            open={isGenerateDialogOpen}
            onOpenChange={setIsGenerateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-ai-primary/20 bg-ai-primary hover:bg-ai-primary/90 text-white border-none">
                <Wand2 className="h-4 w-4" />
                {t("calendar.generateSchedule")}
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl">
              <DialogHeader className="space-y-4">
                <div className="p-4 rounded-2xl bg-ai-primary/10 text-ai-primary w-fit">
                  <Wand2 className="h-8 w-8" />
                </div>
                <div className="space-y-1 text-start">
                  <DialogTitle className="text-3xl font-black tracking-tight">
                    {t("calendar.generateDialog.title")}
                  </DialogTitle>
                  <DialogDescription className="font-medium text-base">
                    {t("calendar.generateDialog.description")}
                  </DialogDescription>
                </div>
              </DialogHeader>
              <div className="py-6 space-y-4 text-start">
                <div className="space-y-2">
                  <label className="text-sm font-bold">
                    {t("calendar.generateDialog.selectClass")}
                  </label>
                  <Select
                    value={selectedClassId}
                    onValueChange={setSelectedClassId}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue
                        placeholder={t("calendar.generateDialog.placeholder")}
                      />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {classesData?.data?.map((c: Class) => (
                        <SelectItem
                          key={c.id}
                          value={String(c.id)}
                          className="rounded-lg"
                        >
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 text-xs text-muted-foreground">
                  <Info className="h-4 w-4 mb-2 text-primary" />
                  {t("calendar.generateDialog.info")}
                </div>
              </div>
              <DialogFooter className="gap-3 pt-6">
                <Button
                  variant="ghost"
                  className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-6"
                  onClick={() => setIsGenerateDialogOpen(false)}
                >
                  {t("buttons.cancel")}
                </Button>
                <Button
                  className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-8 bg-ai-primary hover:bg-ai-primary/90 text-white shadow-xl shadow-ai-primary/20"
                  onClick={handleGenerateSchedule}
                  disabled={isGenerating.isPending || !selectedClassId}
                >
                  {isGenerating.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t("buttons.processing")}
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      {t("buttons.generate")}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Calendar View */}
        <Card className="lg:col-span-8 rounded-[2.5rem] border-none shadow-2xl shadow-black/5 bg-card/50 backdrop-blur-xl overflow-hidden p-6 md:p-10">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="w-full flex justify-center"
            classNames={{
              months: "w-full",
              month: "w-full space-y-8",
              caption: "flex justify-center pt-2 relative items-center mb-8",
              caption_label: "text-2xl font-black tracking-tight",
              nav: "space-x-2 flex items-center",
              nav_button: cn(
                "h-10 w-10 bg-muted/30 hover:bg-primary/10 rounded-2xl transition-all flex items-center justify-center p-0",
              ),
              nav_button_previous: "absolute left-2",
              nav_button_next: "absolute right-2",
              table: "w-full border-collapse space-y-2",
              head_row: "flex w-full mb-4",
              head_cell:
                "text-muted-foreground w-full font-black uppercase tracking-widest text-[10px]",
              row: "flex w-full mt-2 gap-2",
              cell: "text-center text-sm p-0 relative w-full h-14 focus-within:relative focus-within:z-20",
              day: cn(
                "h-14 w-full p-0 font-bold hover:bg-primary/5 rounded-2xl transition-all aria-selected:opacity-100",
              ),
              day_selected:
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground shadow-lg shadow-primary/20",
              day_today: "bg-muted/50 text-accent-foreground",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled: "text-muted-foreground opacity-50",
              day_range_middle:
                "aria-selected:bg-accent aria-selected:text-accent-foreground",
              day_hidden: "invisible",
            }}
            locale={isAr ? ar : undefined}
            components={{
              DayContent: ({ date, activeModifiers }) => {
                const dateKey = dayjs(date).format("YYYY-MM-DD");
                const dayEvents = eventsByDate[dateKey] || [];
                const isSelected = activeModifiers.selected;
                const isToday = activeModifiers.today;

                return (
                  <div
                    className={cn(
                      "flex flex-col items-center justify-center h-full w-full relative",
                      isSelected && "text-primary-foreground",
                      !isSelected && isToday && "text-primary",
                    )}
                  >
                    <span>{date.getDate()}</span>
                    {dayEvents.length > 0 && (
                      <div className="flex gap-1 mt-1 absolute bottom-2">
                        {dayEvents.slice(0, 3).map((event, i) => (
                          <div
                            key={i}
                            className="h-1.5 w-1.5 rounded-full"
                            style={{
                              backgroundColor: isSelected
                                ? "white"
                                : getEventColor(event.type, event.color),
                            }}
                          />
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>
                );
              },
            }}
          />
        </Card>

        {/* Selected Day Events */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-black/5 bg-card/50 backdrop-blur-xl overflow-hidden sticky top-6">
            <CardHeader className="p-8 pb-4 border-b border-black/[0.03] bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black tracking-tight">
                    {selectedDate
                      ? dayjs(selectedDate).format(
                          isAr ? "DD MMMM YYYY" : "MMMM D, YYYY",
                        )
                      : t("calendar.selectDate")}
                  </CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-primary mt-1">
                    {selectedDayEvents.length}{" "}
                    {t("calendar.eventsSelectedDay")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
                    {t("calendar.loading")}
                  </p>
                </div>
              ) : selectedDayEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-8 opacity-40">
                  <CalendarIcon className="h-12 w-12 mb-4" />
                  <p className="font-black uppercase tracking-widest text-xs">
                    {t("calendar.noEvents")}
                  </p>
                  <p className="text-sm font-medium mt-2">
                    {t("calendar.noEventsDescription")}
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] p-6 pr-8">
                  <div className="space-y-4">
                    {selectedDayEvents.map((event, index) => {
                      const color = getEventColor(event.type, event.color);
                      return (
                        <div
                          key={event.id || index}
                          onClick={() => handleEventClick(event)}
                          className={cn(
                            "group flex flex-col p-5 rounded-3xl border transition-all cursor-pointer shadow-sm hover:shadow-md",
                            event.classId
                              ? "hover:bg-primary/[0.02]"
                              : "hover:bg-muted/50 cursor-default",
                          )}
                          style={{
                            borderColor: `${color}20`,
                            backgroundColor: `${color}05`,
                          }}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <Badge
                              variant="outline"
                              className="border-none text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                              style={{
                                backgroundColor: `${color}15`,
                                color: color,
                              }}
                            >
                              {getEventIcon(event.type)}
                              {t(`calendar.types.${event.type}`)}
                            </Badge>
                            {event.startTime && (
                              <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-background/50 px-2 py-1 rounded-md backdrop-blur-sm">
                                <Clock className="h-3.5 w-3.5" />
                                <span>
                                  {dayjs(event.startTime).format("HH:mm")}
                                  {event.endTime && ` - ${dayjs(event.endTime).format("HH:mm")}`}
                                </span>
                              </div>
                            )}
                          </div>
                          <h4 className="font-black text-lg tracking-tight mb-1 group-hover:text-primary transition-colors text-start">
                            {event.title}
                          </h4>
                          {event.className && (
                            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5 opacity-50" />
                              {event.className}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default CalendarPage;

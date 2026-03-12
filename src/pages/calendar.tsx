import { useState, useMemo } from "react";
import { useGetIdentity, useGo, useCustom, BaseRecord, HttpError, useList, useCustomMutation } from "@refinedev/core";
import { User, UserRole, Class } from "@/types";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
    Calendar as CalendarIcon, 
    Clock, 
    ChevronRight, 
    Loader2, 
    Info, 
    BookOpen, 
    FileText, 
    FileQuestion, 
    Wand2,
    Plus
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

dayjs.extend(utc);

interface CalendarEvent extends BaseRecord {
    id: string;
    title: string;
    start?: string;
    type: "assignment" | "quiz" | "class";
    resourceId: number;
    className?: string;
    color: string;
    schedule?: {
        day: string;
        startTime: string;
        endTime: string;
    };
}

const CalendarPage = () => {
  const { t, i18n } = useTranslation();
  const go = useGo();
  const { data: identity } = useGetIdentity<User>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [genClassId, setGenClassId] = useState<string>("");
  const [genMonth, setGenMonth] = useState<string>(dayjs().format("M"));
  const [genYear, setGenYear] = useState<string>(dayjs().format("YYYY"));

  const isStaff = identity?.role === UserRole.TEACHER || identity?.role === UserRole.ADMIN;
  const isAr = i18n.language === 'ar';

  // Fetch unified calendar events
  const { query: calendarQuery } = useCustom<CalendarEvent[], HttpError>({
    url: "/calendar/events",
    method: "get",
    queryOptions: { enabled: !!identity }
  });

  const { data: result, isLoading, refetch } = calendarQuery;

  // Fetch ONLY classes taught by this teacher for the generator dropdown
  const { query: myClassesQuery } = useCustom<Class[]>({
      url: "/classes/mine",
      method: "get",
      queryOptions: { enabled: isStaff }
  });

  const { data: myClassesResult } = myClassesQuery;

  const { mutate: generateSchedule, mutation: generateMutation } = useCustomMutation();
  const isGenerating = generateMutation.isPending;

  const rawEvents = result?.data || [];
  // Handle Refine's response structure correctly
  const myClasses = (myClassesResult as any)?.data || [];

  const handleGenerate = () => {
      if (!genClassId) return toast.error(t("calendar.toasts.selectClass"));
      
      generateSchedule({
          url: "/calendar/generate",
          method: "post",
          values: {
              classId: Number(genClassId),
              month: Number(genMonth),
              year: Number(genYear)
          }
      }, {
          onSuccess: () => {
              toast.success(t("calendar.toasts.generated"));
              setIsGenerateOpen(false);
              void refetch();
          }
      });
  };

  // Logic to expand recurring class schedules into actual dates for the current month
  const processedEvents = useMemo(() => {
    const events: Record<string, CalendarEvent[]> = {};
    const currentMonth = dayjs(selectedDate || new Date());
    const startOfMonth = currentMonth.startOf('month');
    const endOfMonth = currentMonth.endOf('month');

    if (Array.isArray(rawEvents)) {
        rawEvents.forEach((event: CalendarEvent) => {
            if (event.type === 'class' && event.schedule) {
                let current = startOfMonth;
                while (current.isBefore(endOfMonth) || current.isSame(endOfMonth, 'day')) {
                    if (current.format('dddd') === event.schedule.day) {
                        const dateStr = current.format('YYYY-MM-DD');
                        if (!events[dateStr]) events[dateStr] = [];
                        events[dateStr].push({
                            ...event,
                            start: `${dateStr}T${event.schedule.startTime}:00Z`
                        });
                    }
                    current = current.add(1, 'day');
                }
            } else if (event.start) {
                const dateStr = dayjs.utc(event.start).local().format("YYYY-MM-DD");
                if (!events[dateStr]) events[dateStr] = [];
                events[dateStr].push(event);
            }
        });
    }
    return events;
  }, [rawEvents, selectedDate]);

  const selectedDateStr = selectedDate ? dayjs(selectedDate).format("YYYY-MM-DD") : "";
  const selectedEvents = processedEvents[selectedDateStr] || [];

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const getEventIcon = (type: string) => {
    switch(type) {
        case 'assignment': return <FileText className="h-3.5 w-3.5" />;
        case 'quiz': return <FileQuestion className="h-3.5 w-3.5" />;
        case 'class': return <BookOpen className="h-3.5 w-3.5" />;
        default: return <CalendarIcon className="h-3.5 w-3.5" />;
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    if (event.type === 'class') go({ to: `/classes/show/${event.resourceId}` });
    else if (event.type === 'assignment') go({ to: `/assignments/show/${event.resourceId}` });
    else if (event.type === 'quiz') go({ to: `/quizzes/show/${event.resourceId}` });
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 md:space-y-8 text-start">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">{t("calendar.title")}</h1>
            <p className="text-sm text-muted-foreground font-medium">{t("calendar.description")}</p>
        </div>
        
        {isStaff && (
            <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 w-full md:w-auto font-black uppercase tracking-widest text-[10px] h-11 rounded-xl">
                        <Wand2 className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                        {t("calendar.generatePlan")}
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader className="text-start">
                        <DialogTitle className="font-black tracking-tight">{t("calendar.generateTitle")}</DialogTitle>
                        <DialogDescription className="font-medium">
                            {t("calendar.generateDesc")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("calendar.targetClass")}</label>
                            <Select value={genClassId} onValueChange={setGenClassId}>
                                <SelectTrigger className="h-11 rounded-xl">
                                    <SelectValue placeholder={t("calendar.selectClass")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {myClasses && myClasses.length > 0 ? (
                                        myClasses.map((c: any) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-2 text-xs text-muted-foreground text-center">{t("calendar.noClasses")}</div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("calendar.month")}</label>
                                <Select value={genMonth} onValueChange={setGenMonth}>
                                    <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <SelectItem key={i+1} value={(i+1).toString()}>
                                                {dayjs().month(i).locale(i18n.language).format("MMMM")}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("calendar.year")}</label>
                                <Select value={genYear} onValueChange={setGenYear}>
                                    <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="2024">2024</SelectItem>
                                        <SelectItem value="2025">2025</SelectItem>
                                        <SelectItem value="2026">2026</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="gap-3">
                        <Button variant="outline" onClick={() => setIsGenerateOpen(false)} className="rounded-xl h-11 font-black uppercase tracking-widest text-[10px]">{t("buttons.cancel")}</Button>
                        <Button onClick={handleGenerate} disabled={isGenerating} className="rounded-xl h-11 font-black uppercase tracking-widest text-[10px]">
                            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2 rtl:mr-0 rtl:ml-2" /> : <Plus className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />}
                            {isGenerating ? t("calendar.generating") : t("calendar.generateSessions")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <Card className="lg:col-span-2 shadow-xl border-primary/10 overflow-hidden rounded-[2rem] border-none bg-card/50 backdrop-blur-xl">
          <CardHeader className="bg-primary/5 border-b border-black/[0.03] dark:border-white/[0.03] flex flex-row items-center justify-between p-6">
            <CardTitle className="flex items-center gap-3 text-lg font-black tracking-tight">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <CalendarIcon className="h-5 w-5" />
              </div>
              {t("calendar.monthlyOverview")}
            </CardTitle>
            <div className="flex gap-2">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-none text-[9px] uppercase font-black px-3 py-1">{t("calendar.eventTypes.classes")}</Badge>
                <Badge variant="outline" className="bg-red-500/10 text-red-600 border-none text-[9px] uppercase font-black px-3 py-1">{t("calendar.eventTypes.tasks")}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8 flex justify-center bg-white/50 dark:bg-zinc-950/50">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={isAr ? ar : undefined}
              className="rounded-md scale-100 md:scale-110 origin-top"
              components={{
                Day: ({ date, displayMonth }) => {
                  const d = dayjs(date).format("YYYY-MM-DD");
                  const dayEvents = processedEvents[d] || [];
                  const isSelected = dayjs(date).isSame(selectedDate, 'day');
                  const isOutside = date.getMonth() !== displayMonth.getMonth();
                  
                  if (isOutside) return <div className="size-8 md:size-10" />;

                  return (
                    <button
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        "size-8 md:size-10 p-0 font-normal rounded-xl transition-all flex items-center justify-center relative text-xs md:text-sm",
                        isSelected 
                          ? "bg-primary text-primary-foreground shadow-lg scale-110 z-10" 
                          : "hover:bg-primary/10 hover:text-primary",
                        dayEvents.length > 0 && !isSelected && "font-black text-primary bg-primary/5"
                      )}
                    >
                      {new Intl.NumberFormat(i18n.language).format(date.getDate())}
                      {dayEvents.length > 0 && (
                        <div className="absolute bottom-1.5 flex gap-0.5">
                            {Array.from(new Set(dayEvents.map(e => e.type))).map(type => (
                                <div key={type} className={cn(
                                    "w-1 h-1 rounded-full",
                                    isSelected ? "bg-primary-foreground" : 
                                    type === 'class' ? "bg-blue-500" : 
                                    type === 'assignment' ? "bg-red-500" : "bg-orange-500"
                                )} />
                            ))}
                        </div>
                      )}
                    </button>
                  );
                }
              }}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-2xl border-none bg-card/50 backdrop-blur-xl rounded-[2rem] h-full flex flex-col overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-black/[0.03] dark:border-white/[0.03] p-8">
              <CardTitle className="text-xl font-black tracking-tight">
                {selectedDate ? dayjs(selectedDate).locale(i18n.language).format("MMMM D, YYYY") : t("calendar.selectDate")}
              </CardTitle>
              <CardDescription className="font-bold text-[10px] uppercase tracking-widest text-primary/60 mt-1">
                {new Intl.NumberFormat(i18n.language).format(selectedEvents.length)} {selectedEvents.length === 1 ? t("calendar.event") : t("calendar.events")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[300px] md:h-[450px] p-8">
                {selectedEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 md:py-20 text-center text-muted-foreground/40">
                    <div className="p-4 rounded-full bg-muted/50 mb-4">
                        <Clock className="h-10 w-10 opacity-20" />
                    </div>
                    <p className="font-black text-lg tracking-tight text-foreground/40">{t("calendar.noEvents")}</p>
                    <p className="text-xs mt-1 font-medium">{t("calendar.noEventsDesc")}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[...selectedEvents].sort((a, _b) => (a.type === 'class' ? -1 : 1)).map((event) => (
                      <div 
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className="group relative flex flex-col gap-3 p-5 rounded-[1.5rem] border border-black/[0.03] dark:border-white/[0.03] bg-card/50 hover:bg-card hover:border-primary/20 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1"
                      >
                        <div className="flex justify-between items-start">
                          <Badge 
                            variant="outline" 
                            className={cn(
                                "text-[8px] md:text-[9px] uppercase font-black px-3 py-1 rounded-full border-none",
                                event.type === 'class' ? "bg-blue-500/10 text-blue-600" : 
                                event.type === 'assignment' ? "bg-red-500/10 text-red-600" : "bg-orange-500/10 text-orange-600"
                            )}
                          >
                            <span className="flex items-center gap-1.5">
                                {getEventIcon(event.type)}
                                {t(`assignments.list.labels.${event.type}` as any, { defaultValue: event.type })}
                            </span>
                          </Badge>
                          <ChevronRight className={cn("h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all", isAr && "rotate-180")} />
                        </div>
                        <div>
                            <h4 className="font-black text-sm leading-tight group-hover:text-primary transition-colors">{event.title}</h4>
                            {event.className && <p className="text-[10px] text-muted-foreground/60 mt-1.5 font-bold uppercase tracking-wider">{event.className}</p>}
                            {event.type === 'class' && event.schedule && (
                                <div className="flex items-center gap-2 mt-3 text-[10px] text-blue-600 font-black uppercase tracking-widest bg-blue-500/5 w-fit px-3 py-1 rounded-lg">
                                    <Clock className="h-3 w-3" />
                                    <span>{event.schedule.startTime} - {event.schedule.endTime}</span>
                                </div>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-start md:items-center gap-4 text-[10px] text-muted-foreground bg-primary/5 p-6 rounded-[2rem] border border-dashed border-primary/20">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Info className="h-4 w-4 shrink-0" />
        </div>
        <p className="leading-relaxed font-medium">
            {t("calendar.syncInfo")}
        </p>
      </div>
    </div>
  );
};

export default CalendarPage;

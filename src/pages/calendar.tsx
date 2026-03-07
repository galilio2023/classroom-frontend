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
  const go = useGo();
  const { data: identity } = useGetIdentity<User>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [genClassId, setGenClassId] = useState<string>("");
  const [genMonth, setGenMonth] = useState<string>(dayjs().format("M"));
  const [genYear, setGenYear] = useState<string>(dayjs().format("YYYY"));

  const isStaff = identity?.role === UserRole.TEACHER || identity?.role === UserRole.ADMIN;

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
      if (!genClassId) return toast.error("Please select a class");
      
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
              toast.success("Monthly plan generated successfully!");
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
    <div className="container mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Academic Calendar</h1>
            <p className="text-sm text-muted-foreground">Your unified schedule for classes, assignments, and quizzes.</p>
        </div>
        
        {isStaff && (
            <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 w-full md:w-auto">
                        <Wand2 className="h-4 w-4 mr-2" />
                        Generate Monthly Plan
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Generate Monthly Schedule</DialogTitle>
                        <DialogDescription>
                            This will automatically create class sessions for the entire month based on the recurring schedule rules.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold">Target Class (Group)</label>
                            <Select value={genClassId} onValueChange={setGenClassId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {myClasses && myClasses.length > 0 ? (
                                        myClasses.map((c: any) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-2 text-xs text-muted-foreground text-center">No classes found</div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Month</label>
                                <Select value={genMonth} onValueChange={setGenMonth}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <SelectItem key={i+1} value={(i+1).toString()}>
                                                {dayjs().month(i).format("MMMM")}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Year</label>
                                <Select value={genYear} onValueChange={setGenYear}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="2024">2024</SelectItem>
                                        <SelectItem value="2025">2025</SelectItem>
                                        <SelectItem value="2026">2026</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>Cancel</Button>
                        <Button onClick={handleGenerate} disabled={isGenerating}>
                            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                            Generate Sessions
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <Card className="lg:col-span-2 shadow-xl border-primary/10 overflow-hidden">
          <CardHeader className="bg-primary/5 border-b flex flex-row items-center justify-between p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Monthly Overview
            </CardTitle>
            <div className="flex gap-2">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200 text-[9px] md:text-[10px] uppercase font-black">Classes</Badge>
                <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200 text-[9px] md:text-[10px] uppercase font-black">Tasks</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 flex justify-center bg-white dark:bg-zinc-950">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
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
                        "size-8 md:size-10 p-0 font-normal rounded-md transition-all flex items-center justify-center relative text-xs md:text-sm",
                        isSelected 
                          ? "bg-primary text-primary-foreground shadow-lg scale-110 z-10" 
                          : "hover:bg-accent hover:text-accent-foreground",
                        dayEvents.length > 0 && !isSelected && "font-bold text-primary bg-primary/5"
                      )}
                    >
                      {date.getDate()}
                      {dayEvents.length > 0 && (
                        <div className="absolute bottom-1 flex gap-0.5">
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
          <Card className="shadow-xl border-primary/10 h-full flex flex-col overflow-hidden">
            <CardHeader className="bg-muted/50 border-b p-4 md:p-6">
              <CardTitle className="text-base md:text-lg font-black">
                {selectedDate ? dayjs(selectedDate).format("MMMM D, YYYY") : "Select a date"}
              </CardTitle>
              <CardDescription className="font-medium text-xs md:text-sm">
                {selectedEvents.length} {selectedEvents.length === 1 ? "event" : "events"} scheduled
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[300px] md:h-[450px] p-4">
                {selectedEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 md:py-20 text-center text-muted-foreground">
                    <Clock className="h-10 w-10 mb-2 opacity-20" />
                    <p className="font-bold">Quiet day!</p>
                    <p className="text-xs mt-1">No classes or deadlines found.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...selectedEvents].sort((a, _b) => (a.type === 'class' ? -1 : 1)).map((event) => (
                      <div 
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className="group relative flex flex-col gap-2 p-3 md:p-4 rounded-xl md:rounded-2xl border bg-card hover:border-primary/50 transition-all cursor-pointer shadow-sm hover:shadow-md"
                      >
                        <div className="flex justify-between items-start">
                          <Badge 
                            variant="outline" 
                            className={cn(
                                "text-[8px] md:text-[9px] uppercase font-black px-2 py-0.5 rounded-full border-none",
                                event.type === 'class' ? "bg-blue-500/10 text-blue-600" : 
                                event.type === 'assignment' ? "bg-red-500/10 text-red-600" : "bg-orange-500/10 text-orange-600"
                            )}
                          >
                            <span className="flex items-center gap-1">
                                {getEventIcon(event.type)}
                                {event.type}
                            </span>
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div>
                            <h4 className="font-black text-xs md:text-sm leading-tight group-hover:text-primary transition-colors">{event.title}</h4>
                            {event.className && <p className="text-[9px] md:text-[10px] text-muted-foreground mt-1 font-medium">{event.className}</p>}
                            {event.type === 'class' && event.schedule && (
                                <p className="text-[9px] md:text-[10px] text-blue-600 mt-1 font-bold flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {event.schedule.startTime} - {event.schedule.endTime}
                                </p>
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

      <div className="flex items-center gap-3 text-[9px] md:text-[10px] text-muted-foreground bg-muted/30 p-3 md:p-4 rounded-xl md:rounded-2xl border border-dashed border-primary/20">
        <Info className="h-4 w-4 text-primary shrink-0" />
        <p className="leading-relaxed">
            This calendar automatically syncs with your <strong>enrolled classes</strong> and <strong>upcoming tasks</strong>. 
            Recurring classes are expanded for the current month view. Click any event to view details.
        </p>
      </div>
    </div>
  );
};

export default CalendarPage;

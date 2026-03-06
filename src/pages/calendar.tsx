import { useState, useMemo } from "react";
import { useGetIdentity, useGo, useCustom, BaseRecord, HttpError } from "@refinedev/core";
import { User } from "@/types";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar as CalendarIcon, Clock, ChevronRight, Loader2, Info, BookOpen, FileText, FileQuestion } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { cn } from "@/lib/utils";

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

  // Fetch unified calendar events
  const { result, query } = useCustom<CalendarEvent[], HttpError>({
    url: "/calendar/events",
    method: "get",
    queryOptions: { enabled: !!identity }
  });

  const rawEvents = result?.data || [];
  const isLoading = query.isLoading;

  // Logic to expand recurring class schedules into actual dates for the current month
  const processedEvents = useMemo(() => {
    const events: Record<string, CalendarEvent[]> = {};
    const currentMonth = dayjs(selectedDate || new Date());
    const startOfMonth = currentMonth.startOf('month');
    const endOfMonth = currentMonth.endOf('month');

    rawEvents.forEach((event: CalendarEvent) => {
        if (event.type === 'class' && event.schedule) {
            // Expand recurring class for the whole month
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
            // Standard fixed-date event (Assignment/Quiz)
            const dateStr = dayjs.utc(event.start).local().format("YYYY-MM-DD");
            if (!events[dateStr]) events[dateStr] = [];
            events[dateStr].push(event);
        }
    });
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
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight">Academic Calendar</h1>
        <p className="text-muted-foreground">Your unified schedule for classes, assignments, and quizzes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-xl border-primary/10 overflow-hidden">
          <CardHeader className="bg-primary/5 border-b flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Monthly Overview
            </CardTitle>
            <div className="flex gap-2">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200 text-[10px] uppercase font-black">Classes</Badge>
                <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200 text-[10px] uppercase font-black">Tasks</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 flex justify-center bg-white dark:bg-zinc-950">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md scale-110 origin-top"
              components={{
                Day: ({ date, displayMonth }) => {
                  const d = dayjs(date).format("YYYY-MM-DD");
                  const dayEvents = processedEvents[d] || [];
                  const isSelected = dayjs(date).isSame(selectedDate, 'day');
                  const isOutside = date.getMonth() !== displayMonth.getMonth();
                  
                  if (isOutside) return <div className="size-8" />;

                  return (
                    <button
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        "size-8 p-0 font-normal rounded-md transition-all flex items-center justify-center relative text-sm",
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
            <CardHeader className="bg-muted/50 border-b">
              <CardTitle className="text-lg font-black">
                {selectedDate ? dayjs(selectedDate).format("MMMM D, YYYY") : "Select a date"}
              </CardTitle>
              <CardDescription className="font-medium">
                {selectedEvents.length} {selectedEvents.length === 1 ? "event" : "events"} scheduled
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[450px] p-4">
                {selectedEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-20 text-center text-muted-foreground">
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
                        className="group relative flex flex-col gap-2 p-4 rounded-2xl border bg-card hover:border-primary/50 transition-all cursor-pointer shadow-sm hover:shadow-md"
                      >
                        <div className="flex justify-between items-start">
                          <Badge 
                            variant="outline" 
                            className={cn(
                                "text-[9px] uppercase font-black px-2 py-0.5 rounded-full border-none",
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
                            <h4 className="font-black text-sm leading-tight group-hover:text-primary transition-colors">{event.title}</h4>
                            {event.className && <p className="text-[10px] text-muted-foreground mt-1 font-medium">{event.className}</p>}
                            {event.type === 'class' && event.schedule && (
                                <p className="text-[10px] text-blue-600 mt-1 font-bold flex items-center gap-1">
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

      <div className="flex items-center gap-3 text-[10px] text-muted-foreground bg-muted/30 p-4 rounded-2xl border border-dashed border-primary/20">
        <Info className="h-4 w-4 text-primary" />
        <p className="leading-relaxed">
            This calendar automatically syncs with your <strong>enrolled classes</strong> and <strong>upcoming tasks</strong>. 
            Recurring classes are expanded for the current month view. Click any event to view details.
        </p>
      </div>
    </div>
  );
};

export default CalendarPage;

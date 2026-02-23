import { useState, useEffect, useMemo } from "react";
import { useGetIdentity, useGo } from "@refinedev/core";
import { Assignment, User } from "@/types";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar as CalendarIcon, Clock, BookOpen, ChevronRight, Loader2, Info, ChevronLeft } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { cn } from "@/lib/utils";

dayjs.extend(utc);

const CalendarPage = () => {
  const go = useGo();
  const { data: identity } = useGetIdentity<User>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/assignments`, {
        credentials: "include",
      });
      const result = await response.json();
      setAssignments(result.data || []);
    } catch (err) {
      console.error("Calendar Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const assignmentDates = useMemo(() => {
    return assignments.reduce((acc: Record<string, Assignment[]>, curr) => {
      if (curr.dueDate) {
        const dateStr = dayjs.utc(curr.dueDate).local().format("YYYY-MM-DD");
        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(curr);
      }
      return acc;
    }, {});
  }, [assignments]);

  const selectedDateStr = selectedDate ? dayjs(selectedDate).format("YYYY-MM-DD") : "";
  const selectedAssignments = assignmentDates[selectedDateStr] || [];

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Academic Calendar</h1>
        <p className="text-muted-foreground">Track your assignment deadlines and class schedules.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-sm border-primary/10">
          <CardHeader className="bg-primary/5 border-b flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Monthly Overview
            </CardTitle>
            <div className="flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>{assignments.length} Deadlines Found</span>
            </div>
          </CardHeader>
          <CardContent className="p-6 flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border shadow-sm scale-110 origin-top"
              components={{
                // Custom Day rendering to ensure highlights are visible
                Day: ({ date, displayMonth }) => {
                  const d = dayjs(date).format("YYYY-MM-DD");
                  const isHighlighted = !!assignmentDates[d];
                  const isSelected = dayjs(date).isSame(selectedDate, 'day');
                  const isOutside = date.getMonth() !== displayMonth.getMonth();
                  
                  if (isOutside) return <div className="size-8" />;

                  return (
                    <button
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        "size-8 p-0 font-normal rounded-md transition-all flex items-center justify-center relative text-sm",
                        isSelected 
                          ? "bg-primary text-primary-foreground shadow-sm scale-110 z-10" 
                          : "hover:bg-accent hover:text-accent-foreground",
                        isHighlighted && !isSelected && "border-2 border-primary/50 font-bold text-primary bg-primary/5"
                      )}
                    >
                      {date.getDate()}
                      {isHighlighted && (
                        <div className={cn(
                          "absolute bottom-1 w-1 h-1 rounded-full",
                          isSelected ? "bg-primary-foreground" : "bg-primary"
                        )} />
                      )}
                    </button>
                  );
                }
              }}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-sm border-primary/10 h-full flex flex-col">
            <CardHeader className="bg-muted/50 border-b">
              <CardTitle className="text-lg">
                {selectedDate ? dayjs(selectedDate).format("MMMM D, YYYY") : "Select a date"}
              </CardTitle>
              <CardDescription>
                {selectedAssignments.length} {selectedAssignments.length === 1 ? "assignment" : "assignments"} due
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[400px] p-4">
                {selectedAssignments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-20 text-center text-muted-foreground">
                    <Clock className="h-10 w-10 mb-2 opacity-20" />
                    <p>No deadlines for this day.</p>
                    <p className="text-xs mt-2">Dates with a border have assignments.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedAssignments.map((assignment) => (
                      <div 
                        key={assignment.id}
                        onClick={() => go({ to: `/assignments/show/${assignment.id}` })}
                        className="group relative flex flex-col gap-2 p-4 rounded-xl border bg-card hover:bg-accent/50 hover:border-primary/50 transition-all cursor-pointer shadow-sm"
                      >
                        <div className="flex justify-between items-start">
                          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                            Assignment
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h4 className="font-bold text-sm leading-tight">{assignment.title}</h4>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-muted/30 p-2 rounded border border-dashed">
        <Info className="h-3 w-3" />
        <span>
          System found <strong>{assignments.length}</strong> assignments. 
          Dates: <strong>{Object.keys(assignmentDates).join(", ")}</strong>
        </span>
      </div>
    </div>
  );
};

export default CalendarPage;

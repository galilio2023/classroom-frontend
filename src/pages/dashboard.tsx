import { useNavigation, useGetIdentity } from "@refinedev/core";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Building2, Users, GraduationCap, ArrowRight, Layout, FileText, Calendar, Clock, CheckCircle2, MapPin, Sparkles, TrendingUp, ShieldCheck, RefreshCw, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Assignment, Class, Submission } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { EmptyState } from "@/components/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from "react";

const Dashboard = () => {
  const { list, show } = useNavigation();
  const { data: identity, isLoading: isIdentityLoading } = useGetIdentity<User>();
  
  const [stats, setStats] = useState<any>(null);
  const [upcomingAssignments, setUpcomingAssignments] = useState<any[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [attendanceTrend, setAttendanceTrend] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);

  const role = identity?.role;
  const isStaff = role === "teacher" || role === "admin";
  const isStudent = role === "student";

  const fetchDashboardData = async () => {
    if (!identity) return;
    
    setIsLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL;

    try {
      if (isStaff) {
        const statsRes = await fetch(`${apiUrl}/stats`, { credentials: "include" });
        const statsData = await statsRes.json();
        setStats(statsData.data || statsData);

        const trendRes = await fetch(`${apiUrl}/stats/attendance-trend`, { credentials: "include" });
        const trendData = await trendRes.json();
        setAttendanceTrend(trendData.data || []);

        const pendingRes = await fetch(`${apiUrl}/submissions/pending`, { credentials: "include" });
        const pendingData = await pendingRes.json();
        setPendingSubmissions(pendingData.data || []);
      }

      if (isStudent) {
        const upcomingRes = await fetch(`${apiUrl}/assignments/upcoming`, { credentials: "include" });
        const upcomingData = await upcomingRes.json();
        setUpcomingAssignments(upcomingData.data || []);
      }

      const scheduleRes = await fetch(`${apiUrl}/classes/today`, { credentials: "include" });
      const scheduleData = await scheduleRes.json();
      setTodaySchedule(scheduleData.data || []);

    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (identity) {
      fetchDashboardData();
    }
  }, [identity]);

  const activeCards = isStudent ? [
    { title: "My Classes", icon: Layout, heading: "Enrolled Classes", description: "Access your active classrooms.", resource: "classes" },
    { title: "Assignments", icon: FileText, heading: "My Tasks", description: "View and submit your work.", resource: "assignments" },
    { title: "Calendar", icon: Calendar, heading: "Schedule", description: "Track your academic deadlines.", resource: "calendar" },
  ] : [
    { title: "Classes", icon: Layout, heading: "Manage Classes", description: "Create and oversee classrooms.", resource: "classes" },
    { title: "Assignments", icon: FileText, heading: "Curriculum", description: "Manage tasks and grading.", resource: "assignments" },
    { title: "Calendar", icon: Calendar, heading: "Schedule", description: "View all academic deadlines.", resource: "calendar" },
    { title: "Users", icon: Users, heading: "Directory", description: "Manage students and staff.", resource: "users" },
  ];

  if (isIdentityLoading || (isLoading && !stats && upcomingAssignments.length === 0)) {
    return (
        <div className="flex h-[80vh] items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="container mx-auto py-6 md:py-10 px-4 md:px-6 relative">
      {/* Background Glows - Hidden on very small screens for performance */}
      <div className="hidden sm:block absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="hidden sm:block absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -z-10 animate-pulse delay-700" />

      <div className="mb-8 md:mb-12 space-y-2">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            Welcome back, {identity?.name || "User"}!
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl font-medium tracking-tight">
          {isStudent ? "Ready to continue your learning journey?" : "Here is your management overview for today."}
        </p>
      </div>

      <div className="grid gap-6 md:gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8 md:space-y-12">
            
            {/* STAFF ONLY: Engagement Chart */}
            {isStaff && (
                <Card className="border-none shadow-xl overflow-hidden bg-white/50 dark:bg-black/20 backdrop-blur-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-xl font-black">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Engagement Overview
                        </CardTitle>
                        <CardDescription>Class attendance trends for the last 7 days.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px] md:h-[300px] pt-6">
                        {attendanceTrend.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={attendanceTrend}>
                                    <defs>
                                        <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                    <XAxis 
                                        dataKey="date" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 10, fontWeight: 'bold' }}
                                        tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { weekday: 'short' })}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="present" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorPresent)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                                <TrendingUp className="h-10 w-10 mb-2" />
                                <p className="text-sm font-bold">No attendance data yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* STUDENT ONLY: Upcoming Assignments */}
            {isStudent && (
                <Card className="border-none shadow-xl bg-white/50 dark:bg-black/20 backdrop-blur-xl group">
                    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-black/5 dark:border-white/5 pb-6 gap-4">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center gap-3 text-2xl font-black">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    <Calendar className="h-6 w-6 text-primary" />
                                </div>
                                Upcoming Assignments
                            </CardTitle>
                            <CardDescription className="text-sm font-medium">Don't miss your next deadlines.</CardDescription>
                        </div>
                        <Button variant="secondary" size="sm" onClick={() => list("assignments")} className="w-full sm:w-auto rounded-full px-6 font-bold shadow-sm">
                            View All
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-8">
                        {upcomingAssignments.length > 0 ? (
                            <div className="space-y-4">
                                {upcomingAssignments.map((assignment: any) => (
                                    <div 
                                        key={assignment.id} 
                                        className="group/item flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 hover:scale-[1.01] transition-all cursor-pointer shadow-sm gap-4"
                                        onClick={() => show("assignments", assignment.id)}
                                    >
                                        <div className="flex flex-col gap-1.5">
                                            <span className="font-black text-lg group-hover/item:text-primary transition-colors">{assignment.title}</span>
                                            <div className="px-2 py-0.5 w-fit rounded-md bg-primary/10 text-[10px] font-bold text-primary uppercase tracking-wider">
                                                {assignment.class?.name}
                                            </div>
                                        </div>
                                        <Badge variant={new Date(assignment.dueDate) < new Date(Date.now() + 86400000) ? "destructive" : "outline"} className="w-fit rounded-full px-4 py-1 text-xs">
                                            <Clock className="h-3.5 w-3.5 mr-1.5" />
                                            {formatDistanceToNow(new Date(assignment.dueDate), { addSuffix: true })}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState icon={FileText} title="All caught up!" description="No upcoming assignments due soon." />
                        )}
                    </CardContent>
                </Card>
            )}

            {/* STAFF ONLY: Pending Grading */}
            {isStaff && (
                <Card className="border-none shadow-xl bg-white/50 dark:bg-black/20 backdrop-blur-xl group">
                    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-black/5 dark:border-white/5 pb-6 gap-4">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center gap-3 text-2xl font-black">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    <CheckCircle2 className="h-6 w-6 text-primary" />
                                </div>
                                Pending Grading
                            </CardTitle>
                            <CardDescription className="text-sm font-medium">Evaluate student submissions.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8">
                        {pendingSubmissions.length > 0 ? (
                            <div className="space-y-4">
                                {pendingSubmissions.map((submission: any) => (
                                    <div 
                                        key={submission.id} 
                                        className="group/item flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 hover:scale-[1.01] transition-all cursor-pointer shadow-sm gap-4"
                                        onClick={() => show("assignments", submission.assignmentId)}
                                    >
                                        <div className="flex items-center gap-5">
                                            <Avatar className="h-12 w-12 md:h-14 md:w-14 border-4 border-white dark:border-white/10 shadow-md">
                                                <AvatarImage src={submission.student?.image || ""} />
                                                <AvatarFallback className="bg-primary/10 text-primary font-black text-lg">{submission.student?.name?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col gap-1">
                                                <span className="font-black text-base md:text-lg group-hover/item:text-primary transition-colors">{submission.student?.name}</span>
                                                <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                                                    <FileText className="h-3.5 w-3.5 text-primary" />
                                                    {submission.assignment?.title}
                                                </span>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="w-fit rounded-full px-4 py-1 bg-white/50 dark:bg-black/20 font-bold">
                                            {formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState icon={CheckCircle2} title="Inbox Zero!" description="All submissions graded." />
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Quick Actions Grid */}
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2">
                {activeCards.map((card) => (
                <Card 
                    key={card.title} 
                    className="border-none shadow-lg hover:shadow-2xl group hover:-translate-y-2 transition-all duration-500 bg-white/50 dark:bg-black/20 backdrop-blur-xl"
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-primary/60">{card.title}</CardTitle>
                        <div className="p-2.5 bg-primary/5 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 group-hover:rotate-12">
                            <card.icon className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-3">
                            <div className="text-sm font-bold mt-1 text-foreground/80">{card.heading}</div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-8 leading-relaxed font-medium">
                            {card.description}
                        </p>
                        <Button 
                            variant="ghost"
                            className="w-full justify-between rounded-xl bg-primary/5 hover:bg-primary hover:text-primary-foreground transition-all font-bold group-hover:shadow-lg group-hover:shadow-primary/20"
                            onClick={() => card.resource && list(card.resource)}
                        >
                            Explore
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform" />
                        </Button>
                    </CardContent>
                </Card>
                ))}
            </div>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-8 md:space-y-10">
            {/* Today's Schedule */}
            <Card className="border-none shadow-xl overflow-hidden bg-white/50 dark:bg-black/20 backdrop-blur-xl">
                <CardHeader className="pb-6 border-b border-black/5 dark:border-white/5 bg-primary/5">
                    <CardTitle className="text-lg flex items-center gap-3 font-black">
                        <div className="p-2 bg-primary/20 rounded-lg">
                            <Clock className="h-5 w-5 text-primary" />
                        </div>
                        Today's Schedule
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-8">
                    {todaySchedule.length > 0 ? (
                        <div className="space-y-4">
                            {todaySchedule.map((item: any) => (
                                <div 
                                    key={item.id} 
                                    className="group relative flex flex-col gap-3 p-5 rounded-2xl bg-white/30 dark:bg-white/5 border border-white/40 dark:border-white/10 hover:border-primary/40 hover:bg-white/50 transition-all cursor-pointer shadow-sm"
                                    onClick={() => show("classes", item.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-base font-black truncate pr-2 group-hover:text-primary transition-colors">{item.name}</span>
                                        <div className="px-3 py-1 rounded-full bg-primary text-[10px] font-black text-primary-foreground shadow-lg shadow-primary/20">
                                            {item.todaySchedule?.startTime}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold">
                                        <MapPin className="h-4 w-4 text-primary/60" />
                                        <span>{item.todaySchedule?.startTime} - {item.todaySchedule?.endTime}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 opacity-40">
                            <Calendar className="h-12 w-12 mx-auto mb-4" />
                            <p className="text-xs font-black uppercase tracking-widest">No classes today</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Platform Overview */}
            {isStaff && (
                <div className="grid gap-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Platform Overview</h3>
                        <Button variant="ghost" size="icon" className="h-4 w-4 text-muted-foreground" onClick={fetchDashboardData}>
                            <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
                        </Button>
                    </div>
                    
                    {stats ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                            {[
                                { label: "Total Students", value: stats.totalStudents, icon: GraduationCap, color: "text-blue-500" },
                                { label: "Total Teachers", value: stats.totalTeachers, icon: Users, color: "text-green-500" },
                            ].map((stat) => (
                            <Card key={stat.label} className="border-none shadow-md hover:shadow-lg transition-shadow overflow-hidden group bg-white/50 dark:bg-black/20 backdrop-blur-xl">
                                <CardContent className="flex items-center p-6 gap-4 relative">
                                    <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <stat.icon className="h-12 w-12" />
                                    </div>
                                    <div className={cn("p-3 rounded-2xl bg-muted transition-colors group-hover:bg-primary/10", stat.color)}>
                                        <stat.icon className="h-6 w-6" />
                                    </div>
                                    <div className="z-10">
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                                        <h3 className="text-2xl font-black tracking-tight">{stat.value}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <Skeleton className="h-24 w-full rounded-2xl" />
                            <Skeleton className="h-24 w-full rounded-2xl" />
                        </div>
                    )}
                </div>
            )}

            {/* AI Assistant Promo */}
            {isStaff && (
                <Card className="relative group cursor-pointer overflow-hidden border-none shadow-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-xl" onClick={() => list("ai-assistant")}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-700">
                        <Sparkles className="h-20 w-20 text-indigo-500" />
                    </div>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl flex items-center gap-3 font-black">
                            <Sparkles className="h-6 w-6 text-indigo-500 animate-pulse" />
                            AI Assistant
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                            Unlock the power of <span className="text-indigo-500 font-bold">Gemini AI</span> to generate quizzes, assignments, and get instant study help.
                        </p>
                        <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-none font-black rounded-xl shadow-lg shadow-indigo-500/20 group-hover:gap-4 transition-all">
                            Try it now <ArrowRight className="h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Student Support */}
            {isStudent && (
                <Card className="border-none shadow-xl bg-primary/5 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            Student Support
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground leading-relaxed space-y-4">
                        <p>Need help with your studies? Use the <strong>AI Study Buddy</strong> inside any of your class pages for instant assistance.</p>
                        <Button variant="outline" className="w-full rounded-xl font-bold text-[10px] uppercase tracking-widest">Contact Support</Button>
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
};

const Badge = ({ children, variant = "default", className = "" }: { children: React.ReactNode, variant?: "default" | "outline" | "destructive", className?: string }) => {
    const variants = {
        default: "bg-primary text-primary-foreground shadow-md",
        outline: "border-2 border-primary/20 bg-white/50 dark:bg-black/20 text-foreground backdrop-blur-sm",
        destructive: "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20 animate-pulse"
    };
    return (
        <div className={cn("inline-flex items-center rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-all", variants[variant], className)}>
            {children}
        </div>
    );
};

export default Dashboard;

import { useNavigation, useCustom } from "@refinedev/core";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Building2, Users, GraduationCap, ArrowRight, LucideIcon, Layout, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardCardProps {
  title: string;
  icon: LucideIcon;
  heading: string;
  description: string;
  actionLabel: string;
  resource?: string;
  disabled?: boolean;
  value?: number | string;
  isLoading?: boolean;
}

const Dashboard = () => {
  const { list } = useNavigation();

  // Fetch dynamic stats from the backend
  const { data: statsData, isLoading } = useCustom<{
    totalUsers: number;
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    totalAssignments: number;
    totalSubjects: number;
    totalDepartments: number;
  }>({
    url: "/stats",
    method: "get",
  }) as any;

  const stats = statsData?.data;

  const cards: DashboardCardProps[] = [
    {
      title: "Classes",
      icon: Layout,
      heading: "Active Classes",
      description: "Manage your virtual classrooms and schedules.",
      actionLabel: "Go to Classes",
      resource: "classes",
      value: stats?.totalClasses,
      isLoading,
    },
    {
      title: "Subjects",
      icon: BookOpen,
      heading: "Academic Subjects",
      description: "View, create, and organize academic subjects.",
      actionLabel: "Go to Subjects",
      resource: "subjects",
      value: stats?.totalSubjects,
      isLoading,
    },
    {
      title: "Departments",
      icon: Building2,
      heading: "Departments",
      description: "Oversee academic departments and faculties.",
      actionLabel: "Go to Departments",
      resource: "departments",
      value: stats?.totalDepartments,
      isLoading,
    },
    {
      title: "Assignments",
      icon: FileText,
      heading: "Total Assignments",
      description: "Track all assignments across all classes.",
      actionLabel: "Go to Assignments",
      resource: "assignments",
      value: stats?.totalAssignments,
      isLoading,
    },
  ];

  const userStats = [
    { label: "Total Students", value: stats?.totalStudents, icon: GraduationCap, color: "text-blue-500" },
    { label: "Total Teachers", value: stats?.totalTeachers, icon: Users, color: "text-green-500" },
  ];

  return (
    <div className="container mx-auto py-10">
      {/* Header Section */}
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Welcome to the Classroom Management System. Here's what's happening across the platform.
        </p>
      </div>

      {/* User Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        {userStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center p-6 gap-4">
              <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card 
            key={card.title} 
            className={card.disabled ? "opacity-60" : "hover:shadow-md transition-shadow"}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                {card.isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <span className="text-2xl font-bold">{card.value ?? 0}</span>
                )}
                <div className="text-sm font-semibold mt-1">{card.heading}</div>
              </div>
              <p className="text-xs text-muted-foreground mb-4 min-h-[2.5rem]">
                {card.description}
              </p>
              <Button 
                variant={card.disabled ? "secondary" : "outline"}
                className="w-full justify-between"
                disabled={card.disabled}
                onClick={() => card.resource && list(card.resource)}
              >
                {card.actionLabel}
                {!card.disabled && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

import { useNavigation } from "@refinedev/core";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Building2, Users, GraduationCap, ArrowRight, LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  icon: LucideIcon;
  heading: string;
  description: string;
  actionLabel: string;
  resource?: string;
  disabled?: boolean;
}

const Dashboard = () => {
  const { list } = useNavigation();

  const cards: DashboardCardProps[] = [
    {
      title: "Subjects",
      icon: BookOpen,
      heading: "Manage Subjects",
      description: "View, create, and organize academic subjects.",
      actionLabel: "Go to Subjects",
      resource: "subjects",
    },
    {
      title: "Departments",
      icon: Building2,
      heading: "Departments",
      description: "Oversee academic departments and faculties.",
      actionLabel: "Go to Departments",
      resource: "departments",
    },
    {
      title: "Teachers",
      icon: Users,
      heading: "Faculty",
      description: "Manage teacher profiles and assignments.",
      actionLabel: "Coming Soon",
      disabled: true,
    },
    {
      title: "Students",
      icon: GraduationCap,
      heading: "Students",
      description: "Track student enrollments and progress.",
      actionLabel: "Coming Soon",
      disabled: true,
    },
  ];

  return (
    <div className="container mx-auto py-10">
      {/* Header Section */}
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the Classroom Management System. Manage your academic resources efficiently.
        </p>
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
              <div className="text-2xl font-bold mb-2">{card.heading}</div>
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

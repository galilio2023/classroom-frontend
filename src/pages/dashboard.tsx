import { useNavigation } from "@refinedev/core";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Building2, Users, GraduationCap, ArrowRight } from "lucide-react";

const Dashboard = () => {
  const { list } = useNavigation();

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
        
        {/* Subjects Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">Manage Subjects</div>
            <p className="text-xs text-muted-foreground mb-4">
              View, create, and organize academic subjects.
            </p>
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => list("subjects")}
            >
              Go to Subjects
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Departments Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">Departments</div>
            <p className="text-xs text-muted-foreground mb-4">
              Oversee academic departments and faculties.
            </p>
            <Button 
              variant="outline" 
              className="w-full justify-between"
              // We haven't built the list page yet, but the route exists in the backend
              onClick={() => list("departments")}
            >
              Go to Departments
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Teachers Card (Placeholder) */}
        <Card className="opacity-60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">Faculty</div>
            <p className="text-xs text-muted-foreground mb-4">
              Manage teacher profiles and assignments.
            </p>
            <Button disabled variant="secondary" className="w-full">
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        {/* Students Card (Placeholder) */}
        <Card className="opacity-60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">Students</div>
            <p className="text-xs text-muted-foreground mb-4">
              Track student enrollments and progress.
            </p>
            <Button disabled variant="secondary" className="w-full">
              Coming Soon
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Dashboard;

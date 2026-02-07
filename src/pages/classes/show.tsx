import { useOne, useTable, useNavigation, useDelete } from "@refinedev/core";
import { useParams } from "react-router-dom";
import { Class, Enrollment, User, UserRole } from "@/types";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DataTableRowActions } from "@/components/refine-ui/data-table/row-actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { EnrollStudentDialog } from "./enroll-student-dialog";

const ClassShow = () => {
  const { id } = useParams();
  const [unenrollTarget, setUnenrollTarget] = useState<number | null>(null);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);

  const { data: classData, isLoading: isClassLoading } = useOne<Class>({
    resource: "classes",
    id,
  });

  const { mutate: deleteMutation } = useDelete();

  const enrollmentsTable = useTable<Enrollment>({
    resource: "enrollments",
    filters: {
      permanent: [{ field: "classId", operator: "eq", value: id }],
    },
    sorters: {
      initial: [{ field: "createdAt", order: "desc" }],
    },
    pagination: {
      pageSize: 5,
    },
    syncWithLocation: false, // To prevent URL query params from changing
  });

  const columns = useMemo<ColumnDef<Enrollment>[]>(
    () => [
      {
        id: "student",
        header: "Student",
        cell: ({ row }) => {
          const student = row.original.student;
          return (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={student.image} alt={student.name} />
                <AvatarFallback>{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{student.name}</p>
                <p className="text-sm text-muted-foreground">{student.email}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Enrolled On",
        cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
      },
      {
        id: "actions",
        size: 50,
        header: () => null,
        cell: ({ row }) => (
          <DataTableRowActions
            onDelete={() => setUnenrollTarget(row.original.id)}
            deleteLabel="Unenroll Student"
          />
        ),
      },
    ],
    [],
  );

  const handleConfirmUnenroll = () => {
    if (unenrollTarget) {
      deleteMutation({
        resource: "enrollments",
        id: unenrollTarget,
        mutationMode: "pessimistic",
      });
      setUnenrollTarget(null);
    }
  };

  const aClass = classData?.data;

  if (isClassLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="container mx-auto py-6">
        <Breadcrumb />
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="page-title">{aClass?.name}</h1>
            <p className="text-muted-foreground">Manage class details and student enrollments.</p>
          </div>
          <Button onClick={() => setIsEnrollDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Enroll Student
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Enrolled Students */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Students ({enrollmentsTable.table.getRowCount()})</CardTitle>
                <CardDescription>The list of students currently enrolled in this class.</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable table={enrollmentsTable} columns={columns} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Class Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Teacher</span>
                  <span className="font-medium">{aClass?.teacher.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subject</span>
                  <span className="font-medium">{aClass?.subject.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capacity</span>
                  <span className="font-medium">{enrollmentsTable.table.getRowCount()} / {aClass?.capacity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="default" className="capitalize">{aClass?.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invite Code</span>
                  <Badge variant="outline" className="font-mono">{aClass?.inviteCode}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Unenroll Confirmation Dialog */}
      <AlertDialog open={unenrollTarget !== null} onOpenChange={() => setUnenrollTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will unenroll the student from the class. This action can be undone by enrolling them again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUnenroll}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Enroll Student Dialog */}
      {id && (
        <EnrollStudentDialog
          classId={id}
          isOpen={isEnrollDialogOpen}
          onOpenChange={setIsEnrollDialogOpen}
        />
      )}
    </>
  );
};

export default ClassShow;

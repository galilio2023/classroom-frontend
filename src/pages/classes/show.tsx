import { useShow, useDelete } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { useParams } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { DataTable } from "@/components/refine-ui/data-table/data-table";
import {
  ShowView,
  ShowViewHeader,
} from "@/components/refine-ui/views/show-view";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Class, Enrollment, User } from "@/types";
import { Loader2, PlusCircle, Trash } from "lucide-react";
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
import { EnrollStudentDialog } from "./enroll-student-dialog";

const ClassesShow = () => {
  const { id } = useParams();
  const classId = id ?? "";

  const [unenrollTarget, setUnenrollTarget] = useState<number | null>(null);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);

  const {
    query: { data: showData, isLoading: isClassLoading, isError },
  } = useShow<Class>({
    resource: "classes",
    id: classId,
  });

  const aClass = showData?.data;

  const { mutate: deleteMutation, mutation } = useDelete();

  const studentColumns = useMemo<ColumnDef<Enrollment>[]>(
    () => [
      {
        id: "student",
        header: "Student",
        accessorFn: (row) => row.student,
        cell: ({ getValue }) => {
          const student = getValue<User>();
          return (
            <div className="flex items-center gap-2">
              <Avatar className="size-7">
                {student.image && (
                  <AvatarImage src={student.image} alt={student.name} />
                )}
                <AvatarFallback>{student.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col truncate">
                <span className="truncate">{student.name}</span>
                <span className="text-xs text-muted-foreground truncate">
                  {student.email}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Enrolled On",
        cell: ({ getValue }) =>
          new Date(getValue<string>()).toLocaleDateString(),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setUnenrollTarget(row.original.id)}
          >
            <Trash className="h-4 w-4 text-destructive" />
          </Button>
        ),
      },
    ],
    [],
  );

  const studentsTable = useTable<Enrollment>({
    columns: studentColumns,
    refineCoreProps: {
      resource: "enrollments",
      filters: {
        permanent: [{ field: "classId", operator: "eq", value: classId }],
      },
      queryOptions: {
        enabled: !!classId,
      },
    },
  });

  const enrolledStudentIds = useMemo(() => {
    return studentsTable.reactTable
      .getRowModel()
      .rows.map((row) => row.original.student.id);
  }, [studentsTable.reactTable.getRowModel().rows]);

  const handleConfirmUnenroll = () => {
    if (unenrollTarget) {
      deleteMutation(
        { resource: "enrollments", id: unenrollTarget },
        { onSuccess: () => setUnenrollTarget(null) },
      );
    }
  };

  // Correctly access the loading state from the nested object
  const isLoading =
    isClassLoading || studentsTable.refineCore.tableQuery.isLoading;

  if (isLoading) {
    return (
      <ShowView>
        <ShowViewHeader resource="classes" title="Loading..." />
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </div>
      </ShowView>
    );
  }

  if (isError || !aClass) {
    return (
      <ShowView>
        <ShowViewHeader title="Class not found" />
      </ShowView>
    );
  }

  return (
    <>
      <ShowView className="class-view class-show space-y-6">
        <ShowViewHeader resource="classes" title={aClass.name} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Enrolled Students</CardTitle>
                  <CardDescription>
                    {/* Correctly access the total count from the nested object */}
                    {studentsTable.refineCore.tableQuery.data?.total ?? 0} of{" "}
                    {aClass.capacity} spots filled
                  </CardDescription>
                </div>
                <Button onClick={() => setIsEnrollDialogOpen(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Enroll Student
                </Button>
              </CardHeader>
              <CardContent>
                <DataTable table={studentsTable} />
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subject</span>
                  <span className="font-medium">
                    {aClass?.subject?.name ?? "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Teacher</span>
                  <span className="font-medium">
                    {aClass?.teacher?.name ?? "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="default" className="capitalize">
                    {aClass.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invite Code</span>
                  <Badge variant="outline" className="font-mono">
                    {aClass.inviteCode}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ShowView>

      <AlertDialog
        open={unenrollTarget !== null}
        onOpenChange={() => setUnenrollTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will unenroll the student from the class.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmUnenroll}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Unenrolling..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EnrollStudentDialog
        classId={classId}
        isOpen={isEnrollDialogOpen}
        onOpenChange={setIsEnrollDialogOpen}
        enrolledStudentIds={enrolledStudentIds}
      />
    </>
  );
};

export default ClassesShow;

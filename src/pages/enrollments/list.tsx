import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, UserPlus, CheckCircle, XCircle, Phone } from "lucide-react";
import { Enrollment, User } from "@/types";
import { useDelete, useNavigation, useCustomMutation, useInvalidate } from "@refinedev/core";
import { toast } from "sonner";

const EnrollmentsList = () => {
  const { create } = useNavigation();
  const { mutate: unenroll } = useDelete();
  const { mutate: updateStatus } = useCustomMutation();
  const invalidate = useInvalidate();

  const handleStatusUpdate = (id: number, status: "approved" | "rejected") => {
    updateStatus({
        url: `/enrollments/${id}/status`,
        method: "patch",
        values: { status },
    }, {
        onSuccess: () => {
            toast.success(`Enrollment ${status} successfully`);
            invalidate({
                resource: "enrollments",
                invalidates: ["list"],
            });
        }
    });
  };

  const columns = useMemo<ColumnDef<Enrollment>[]>(
    () => [
      {
        id: "student",
        header: "Student",
        accessorKey: "student",
        cell: ({ getValue }) => {
          const student = getValue<User>();
          if (!student) return null;
          return (
            <div className="flex items-center gap-2">
              <Avatar className="size-8">
                <AvatarImage src={student.image ?? ""} />
                <AvatarFallback>{student.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">{student.name}</span>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{student.email}</span>
                    {student.phoneNumber && (
                        <span className="flex items-center gap-0.5 text-primary font-bold">
                            <Phone className="h-2.5 w-2.5" />
                            {student.phoneNumber}
                        </span>
                    )}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: "class",
        header: "Class",
        accessorKey: "class",
        cell: ({ getValue }: any) => {
          const classData = getValue();
          return <span className="font-semibold">{classData?.name}</span>;
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue<string>();
          const variants: any = {
            pending: "warning",
            approved: "success",
            rejected: "destructive",
          };
          return (
            <Badge variant={variants[status] || "default"} className="capitalize font-black text-[10px]">
              {status}
            </Badge>
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
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            {row.original.status === "pending" && (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleStatusUpdate(row.original.id, "approved")}
                    >
                        <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        onClick={() => handleStatusUpdate(row.original.id, "rejected")}
                    >
                        <XCircle className="h-4 w-4" />
                    </Button>
                </>
            )}
            <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => {
                if (confirm("Are you sure you want to remove this enrollment?")) {
                    unenroll({
                    resource: "enrollments",
                    id: row.original.id,
                    }, {
                        onSuccess: () => toast.success("Enrollment removed")
                    });
                }
                }}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useTable({
    columns,
    refineCoreProps: {
        resource: "enrollments",
    }
  });

  return (
    <ListView>
      <ListViewHeader 
        title="Global Enrollments" 
      >
        <Button onClick={() => create("classes")}>
          <UserPlus className="h-4 w-4 mr-2" />
          Enroll Student
        </Button>
      </ListViewHeader>
      <DataTable table={table} />
    </ListView>
  );
};

export default EnrollmentsList;

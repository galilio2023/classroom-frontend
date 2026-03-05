import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, UserPlus, CheckCircle, XCircle, Phone, Filter, CheckSquare, Square } from "lucide-react";
import { Enrollment, User, UserRole } from "@/types";
import { useDelete, useNavigation, useCustomMutation, useInvalidate, useGetIdentity } from "@refinedev/core";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const EnrollmentsList = () => {
  const { data: identity } = useGetIdentity<User>();
  const isStaff = identity?.role === UserRole.ADMIN || identity?.role === UserRole.TEACHER;
  
  const { create } = useNavigation();
  const { mutate: unenroll } = useDelete();
  const { mutate: updateStatus, mutation: updateMutation } = useCustomMutation();
  const invalidate = useInvalidate();

  const isUpdating = updateMutation.isPending;

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  const handleBulkAction = (status: "approved" | "rejected") => {
    if (selectedIds.length === 0) return;
    
    // In a real app, we'd have a bulk endpoint. 
    // For now, we'll process them and invalidate once.
    const promises = selectedIds.map(id => 
        new Promise((resolve) => {
            updateStatus({
                url: `/enrollments/${id}/status`,
                method: "patch",
                values: { status },
            }, { onSuccess: resolve, onError: resolve });
        })
    );

    toast.promise(Promise.all(promises), {
        loading: `Processing ${selectedIds.length} enrollments...`,
        success: () => {
            setSelectedIds([]);
            invalidate({ resource: "enrollments", invalidates: ["list"] });
            return `Successfully processed ${selectedIds.length} enrollments`;
        },
        error: "Failed to process some enrollments",
    });
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filters = useMemo(() => {
    const f = [];
    if (statusFilter !== "all") {
        f.push({ field: "status", operator: "eq" as const, value: statusFilter });
    }
    return f;
  }, [statusFilter]);

  const columns = useMemo<ColumnDef<Enrollment>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => {
                    const allIds = table.getRowModel().rows.map(r => r.original.id);
                    setSelectedIds(prev => prev.length === allIds.length ? [] : allIds);
                }}
            >
                {selectedIds.length > 0 ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
            </Button>
        ),
        cell: ({ row }) => (
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => toggleSelect(row.original.id)}
            >
                {selectedIds.includes(row.original.id) ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
            </Button>
        ),
        size: 40,
      },
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
        accessorKey: "class.name", // Changed from "class" to "class.name"
        cell: ({ getValue }) => {
          const className = getValue<string>();
          return <span className="font-semibold">{className}</span>;
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
                        disabled={isUpdating}
                    >
                        <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        onClick={() => handleStatusUpdate(row.original.id, "rejected")}
                        disabled={isUpdating}
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
    [selectedIds, isUpdating]
  );

  const table = useTable({
    columns,
    refineCoreProps: {
        resource: "enrollments",
        filters: { permanent: filters },
    }
  });

  return (
    <ListView>
      <ListViewHeader 
        title="Enrollment Management" 
      >
        <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
                <div className="flex items-center gap-2 mr-4 animate-in fade-in slide-in-from-right-4">
                    <span className="text-xs font-bold text-muted-foreground">{selectedIds.length} selected</span>
                    <Button size="sm" variant="outline" className="h-8 text-green-600 border-green-200 bg-green-50" onClick={() => handleBulkAction("approved")}>
                        Approve All
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-destructive border-destructive/20 bg-destructive/5" onClick={() => handleBulkAction("rejected")}>
                        Reject All
                    </Button>
                </div>
            )}
            
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 gap-2">
                        <Filter className="h-4 w-4" />
                        {statusFilter === "all" ? "All Status" : statusFilter.toUpperCase()}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Status</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("approved")}>Approved</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("rejected")}>Rejected</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Button size="sm" className="h-9" onClick={() => create("classes")}>
                <UserPlus className="h-4 w-4 mr-2" />
                Enroll Student
            </Button>
        </div>
      </ListViewHeader>
      <DataTable table={table} />
    </ListView>
  );
};

export default EnrollmentsList;

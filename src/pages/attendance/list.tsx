import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { Search, Calendar, Users, CheckCircle2, XCircle, Clock, AlertCircle, QrCode, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/refine-ui/data-table/data-table.tsx";
import { useTable } from "@refinedev/react-table";
import { useNavigation, useGetIdentity } from "@refinedev/core";
import { Attendance, User, UserRole } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { format } from "date-fns";
import { QRAttendanceModal } from "../classes/qr-attendance-modal";
import { useNavigate } from "react-router-dom";

const AttendanceListPage = () => {
  const { data: identity } = useGetIdentity<User>();
  const isStaff = identity?.role === UserRole.ADMIN || identity?.role === UserRole.TEACHER;
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [qrTargetClassId, setQrTargetClassId] = useState<string | null>(null);
  const { show } = useNavigation();

  const filters = useMemo(() => {
    const f = [];
    if (searchQuery) {
      f.push({ field: "class.name", operator: "contains" as const, value: searchQuery });
    }
    return f;
  }, [searchQuery]);

  const handleRowClick = (record: any) => {
    if (isStaff) {
        // Take teacher to the specific class, specific tab, and specific date
        navigate(`/classes/show/${record.classId}?tab=attendance&date=${record.date}`);
    } else {
        show("classes", record.classId);
    }
  };

  const attendanceTable = useTable<any>({
    columns: useMemo<ColumnDef<any>[]>(
      () => [
        {
          accessorKey: "class.name",
          header: () => <p className="column-title">Class Name</p>,
          cell: ({ getValue }) => (
            <span className="text-foreground font-bold">{getValue<string>()}</span>
          ),
        },
        {
          accessorKey: "date",
          header: () => <p className="column-title">Session Date</p>,
          cell: ({ getValue }) => (
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{format(new Date(getValue<string>()), "MMM d, yyyy")}</span>
            </div>
          )
        },
        {
          id: "stats",
          header: () => <p className="column-title">{isStaff ? "Attendance Summary" : "Your Status"}</p>,
          cell: ({ row }) => {
            if (isStaff) {
                return (
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-[10px] font-bold">
                            {row.original.presentCount} Present
                        </Badge>
                        {row.original.absentCount > 0 && (
                            <Badge variant="outline" className="text-destructive border-red-200 bg-red-50 text-[10px] font-bold">
                                {row.original.absentCount} Absent
                            </Badge>
                        )}
                    </div>
                );
            }
            const status = row.original.status;
            return (
              <Badge variant={status === "present" ? "default" : "outline"} className="capitalize">
                {status}
              </Badge>
            );
          }
        },
        {
          id: "actions",
          size: 150,
          header: () => <p className="column-title text-right pr-4">Actions</p>,
          cell: ({ row }) => (
            <div className="flex items-center justify-end gap-2 pr-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs gap-1"
                onClick={(e) => {
                    e.stopPropagation();
                    handleRowClick(row.original);
                }}
              >
                Details
                <ArrowRight className="h-3 w-3" />
              </Button>
              {isStaff && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-xs gap-1.5 border-primary/20 text-primary hover:bg-primary/5"
                  onClick={(e) => {
                    e.stopPropagation();
                    setQrTargetClassId(row.original.classId.toString());
                  }}
                >
                  <QrCode className="h-3.5 w-3.5" />
                  Start QR
                </Button>
              )}
            </div>
          ),
        },
      ],
      [isStaff],
    ),
    refineCoreProps: {
      resource: "attendance",
      pagination: { pageSize: 10, mode: "server" },
      filters: { permanent: filters },
      sorters: { initial: [{ field: "date", order: "desc" }] },
      meta: {
        populate: ["class"]
      }
    },
  });

  return (
    <>
      <ListView>
        <Breadcrumb />
        <h1 className="page-title">Attendance Tracking</h1>
        <div className="intro-row">
          <p>{isStaff ? "Monitor and manage class attendance sessions and QR check-ins." : "Track your attendance history across all classes."}</p>
          <div className="actions-row">
            <div className="search-field">
              <Search className="search-icon" />
              <Input
                type="text"
                placeholder="Search by class name..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DataTable 
            table={attendanceTable} 
            onRowClick={handleRowClick}
        />
      </ListView>

      {qrTargetClassId && (
        <QRAttendanceModal 
            isOpen={true} 
            onClose={() => setQrTargetClassId(null)} 
            classId={qrTargetClassId} 
        />
      )}
    </>
  );
};

export default AttendanceListPage;

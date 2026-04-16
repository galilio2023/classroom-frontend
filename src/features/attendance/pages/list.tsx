import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useList, useNavigation } from "@refinedev/core";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { format } from "date-fns";

import { AttendanceListHeader } from "../components/list/AttendanceListHeader";
import { AttendanceStats } from "../components/list/AttendanceStats";
import { AttendanceFilters } from "../components/list/AttendanceFilters";
import { Attendance, AttendanceStatus } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/features/users/hooks/use-user-role";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

const AttendanceList = () => {
  const { t } = useTranslation();
  const { isStaff } = useUserRole();
  const [searchQuery, setSearchQuery] = useState("");
  const { show } = useNavigation();

  const { query } = useList<Attendance>({
    resource: "attendance",
    pagination: { pageSize: 10 },
    filters: searchQuery
      ? [
          {
            field: "student.name",
            operator: "contains",
            value: searchQuery,
          },
        ]
      : [],
    sorters: [{ field: "date", order: "desc" }],
  });

  const attendances = query.data?.data || [];
  const isLoading = query.isLoading;

  const stats = useMemo(() => {
    if (!attendances.length) return { total: 0, avgPresent: 0, recentAbsence: 0 };
    const total = attendances.length;
    const present = attendances.filter(
      (a: Attendance) => a.status === AttendanceStatus.PRESENT
    ).length;
    const absent = attendances.filter(
      (a: Attendance) => a.status === AttendanceStatus.ABSENT
    ).length;
    return {
      total,
      avgPresent: Math.round((present / total) * 100),
      recentAbsence: absent,
    };
  }, [attendances]);

  const columns = useMemo<ColumnDef<Attendance>[]>(
    () => [
      {
        accessorKey: "date",
        header: t("attendance.fields.date", "Date"),
        cell: ({ getValue }) => format(new Date(getValue<string>()), "PPP"),
      },
      {
        accessorKey: "student.name",
        header: t("attendance.fields.student", "Student"),
        cell: ({ row }) => (
          <div className="font-bold">
            {row.original.student?.name || t("common.unknown", "Unknown")}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: t("attendance.fields.status", "Status"),
        cell: ({ getValue }) => {
          const status = getValue<AttendanceStatus>();
          const variants: Record<AttendanceStatus, string> = {
            [AttendanceStatus.PRESENT]: "bg-green-500/10 text-green-600",
            [AttendanceStatus.ABSENT]: "bg-red-500/10 text-red-600",
            [AttendanceStatus.LATE]: "bg-amber-500/10 text-amber-600",
            [AttendanceStatus.EXCUSED]: "bg-blue-500/10 text-blue-600",
          };
          return (
            <Badge variant="outline" className={variants[status]}>
              {t(`attendance.status.${status}`, status)}
            </Badge>
          );
        },
      },
      {
        accessorKey: "participationScore",
        header: t("attendance.fields.participation", "Participation"),
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${getValue<number>()}%` }} />
            </div>
            <span className="text-xs font-black">{getValue<number>()}%</span>
          </div>
        ),
      },
    ],
    [t]
  );

  const table = useReactTable({
    data: attendances,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-8 pb-20">
      <AttendanceListHeader isStaff={isStaff} onStartQr={() => {}} onScanQr={() => {}} />

      <AttendanceStats stats={stats} isLoading={isLoading} isStaff={isStaff} />

      <AttendanceFilters searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <Card className="border-none shadow-2xl shadow-primary/5 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-[10px] font-black uppercase tracking-widest py-6"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-64 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary/20" />
                  </TableCell>
                </TableRow>
              ) : attendances.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-64 text-center text-muted-foreground font-medium"
                  >
                    {t("common.table.noData")}
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => show("attendance", row.original.id)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-6 text-sm font-medium">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {attendances.length > 0 && (
          <div className="p-6 bg-muted/10 border-t flex items-center justify-between">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
              {t("common.table.pagination", "Page {{current}} of {{total}}", {
                current: table.getState().pagination.pageIndex + 1,
                total: table.getPageCount(),
              })}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl h-10 w-10 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl h-10 w-10 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AttendanceList;

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

import { Submission, UserRole } from "@/types";
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
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Breadcrumb } from "@/components/refine/layout/breadcrumb";

const SubmissionsList = () => {
  const { t } = useTranslation();
  const { isStaff, role } = useUserRole();
  const [searchQuery, setSearchQuery] = useState("");
  const { show } = useNavigation();

  const { query } = useList<Submission>({
    resource: "submissions",
    pagination: { pageSize: 10 },
    filters: searchQuery
      ? [
          {
            field: "assignment.title",
            operator: "contains",
            value: searchQuery,
          },
        ]
      : [],
    sorters: [{ field: "createdAt", order: "desc" }],
    meta: {
      populate: ["assignment", "student"],
    },
  });

  const submissions = query.data?.data || [];
  const isLoading = query.isLoading;

  const columns = useMemo<ColumnDef<Submission>[]>(
    () => [
      {
        accessorKey: "assignment.title",
        header: t("submissions.fields.assignment", "Assignment"),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-bold text-indigo-600">{row.original.assignment?.title}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
              ID: #{row.original.id}
            </span>
          </div>
        ),
      },
      ...(isStaff
        ? [
            {
              accessorKey: "student.name",
              header: t("submissions.fields.student", "Student"),
              cell: ({ row }: any) => (
                <div className="font-medium">{row.original.student?.name}</div>
              ),
            },
          ]
        : []),
      {
        accessorKey: "createdAt",
        header: t("submissions.fields.submittedAt", "Submitted At"),
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span className="text-xs">{format(new Date(getValue<string>()), "PPp")}</span>
          </div>
        ),
      },
      {
        accessorKey: "grade",
        header: t("submissions.fields.grade", "Grade"),
        cell: ({ row }) => {
          const grade = row.original.grade;
          if (grade === null) {
            return (
              <Badge variant="secondary" className="bg-muted text-muted-foreground">
                {t("submissions.status.pending", "Pending")}
              </Badge>
            );
          }
          return (
            <div className="flex items-center gap-2 font-black text-indigo-600">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>{grade}/100</span>
            </div>
          );
        },
      },
      {
        accessorKey: "aiStatus",
        header: "AI Agent",
        cell: ({ getValue }) => {
          const status = getValue<string>();
          const variants: Record<string, string> = {
            processing: "bg-indigo-500/10 text-indigo-600 animate-pulse",
            completed: "bg-green-500/10 text-green-600",
            failed: "bg-red-500/10 text-red-600",
            idle: "bg-muted text-muted-foreground",
          };
          return (
            <Badge variant="outline" className={variants[status] || variants.idle}>
              {status === "processing" && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
              {t(`submissions.aiStatus.${status}`, status)}
            </Badge>
          );
        },
      },
    ],
    [t, isStaff]
  );

  const table = useReactTable({
    data: submissions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <Breadcrumb />
          <h1 className="text-4xl font-black tracking-tight text-indigo-950">
            {t("resources.submissions.label")}
          </h1>
          <p className="text-muted-foreground font-medium">
            {isStaff
              ? t(
                  "submissions.description.staff",
                  "Manage and grade student submissions with AI assistance."
                )
              : t(
                  "submissions.description.student",
                  "Track your assignments and pedagogical feedback."
                )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder={t("common.search")}
            className="pl-11 h-12 rounded-2xl border-none shadow-lg shadow-primary/5 focus-visible:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-2xl shadow-primary/5 rounded-4xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-none">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-[10px] font-black uppercase tracking-widest py-8 px-6"
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
                  <TableCell colSpan={columns.length} className="h-96 text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-indigo-200" />
                  </TableCell>
                </TableRow>
              ) : submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-96 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                      <div className="p-6 rounded-full bg-muted/50">
                        <FileText className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                      <p className="font-bold text-lg">{t("common.table.noData")}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="group border-b border-muted/20 cursor-pointer hover:bg-indigo-50/30 transition-all duration-300"
                    onClick={() => show("submissions", row.original.id)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-6 px-6 text-sm font-medium">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {submissions.length > 0 && (
          <div className="p-8 bg-muted/10 flex items-center justify-between">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
              {t("common.table.pagination", "Page {{current}} of {{total}}", {
                current: table.getState().pagination.pageIndex + 1,
                total: table.getPageCount(),
              })}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="rounded-2xl h-12 w-12 p-0 shadow-lg shadow-primary/5 hover:bg-white border-none"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-5 w-5 text-indigo-950" />
              </Button>
              <Button
                variant="outline"
                className="rounded-2xl h-12 w-12 p-0 shadow-lg shadow-primary/5 hover:bg-white border-none"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-5 w-5 text-indigo-950" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SubmissionsList;

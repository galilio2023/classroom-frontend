import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useList, useNavigation, useCustomMutation } from "@refinedev/core";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { format } from "date-fns";

import { Submission } from "@/types";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useUserRole } from "@/features/users/hooks/use-user-role";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
  FileText,
  Clock,
  CheckCircle2,
  Sparkles,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Breadcrumb } from "@/components/refine/layout/breadcrumb";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const SubmissionsList = () => {
  const { t } = useTranslation();
  const { isStaff } = useUserRole();
  const [searchQuery, setSearchQuery] = useState("");
  const { show } = useNavigation();
  const [rowSelection, setRowSelection] = useState({});

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

  const { mutate: bulkApplyAi, mutation: bulkMutation } = useCustomMutation();
  const isBulkApplying = bulkMutation.isPending;

  const columns = useMemo<ColumnDef<Submission>[]>(
    () => [
      ...(isStaff
        ? [
            {
              id: "select",
              header: ({ table }: any) => (
                <Checkbox
                  checked={table.getIsAllPageRowsSelected()}
                  onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                  aria-label="Select all"
                  className="translate-y-[2px]"
                />
              ),
              cell: ({ row }: any) => (
                <Checkbox
                  checked={row.getIsSelected()}
                  onCheckedChange={(value) => row.toggleSelected(!!value)}
                  aria-label="Select row"
                  className="translate-y-[2px]"
                  onClick={(e) => e.stopPropagation()}
                />
              ),
              enableSorting: false,
              enableHiding: false,
            },
          ]
        : []),
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
        cell: ({ row }) => {
          const status = row.original.aiStatus;
          const variants: Record<string, string> = {
            processing: "bg-indigo-500/10 text-indigo-600 animate-pulse",
            completed: "bg-green-500/10 text-green-600",
            failed: "bg-red-500/10 text-red-600",
            idle: "bg-muted text-muted-foreground",
          };
          return (
            <div className="flex flex-col gap-1">
              <Badge variant="outline" className={variants[status] || variants.idle}>
                {status === "processing" && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                {t(`submissions.aiStatus.${status}`, status)}
              </Badge>
              {status === "completed" && !row.original.grade && (
                <span className="text-[9px] font-bold text-green-600 uppercase flex items-center gap-1">
                  <Sparkles className="h-2 w-2" />
                  Grade Ready
                </span>
              )}
            </div>
          );
        },
      },
    ],
    [t, isStaff]
  );

  const table = useReactTable({
    data: submissions,
    columns,
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const canBulkApprove = useMemo(
    () =>
      selectedRows.length > 0 &&
      selectedRows.every(
        (row) => row.original.aiStatus === "completed" && row.original.grade === null
      ),
    [selectedRows]
  );

  const handleBulkApprove = () => {
    const submissionIds = selectedRows.map((row) => row.original.id);
    bulkApplyAi(
      {
        url: "/submissions/bulk-apply-ai",
        method: "post",
        values: { submissionIds },
      },
      {
        onSuccess: () => {
          toast.success(
            t("submissions.toasts.bulkSuccess", {
              defaultValue: `Successfully approved ${submissionIds.length} AI suggestions.`,
              count: submissionIds.length,
            })
          );
          setRowSelection({});
          query.refetch();
        },
      }
    );
  };

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

      <div className="relative">
        <AnimatePresence>
          {selectedRows.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
            >
              <Card className="bg-indigo-950 text-white p-4 rounded-[2rem] shadow-2xl border-indigo-900 flex items-center justify-between gap-6">
                <div className="flex items-center gap-4 ps-4">
                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center font-black text-xs">
                    {selectedRows.length}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                    {t("submissions.labels.selectedSubmissions", "Submissions Selected")}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleBulkApprove}
                    disabled={!canBulkApprove || isBulkApplying}
                    className="h-14 px-8 rounded-2xl bg-white text-indigo-950 hover:bg-indigo-50 font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl"
                  >
                    {isBulkApplying ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    {t("submissions.buttons.bulkApproveAi", "Approve AI Suggestions")}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

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
                      data-state={row.getIsSelected() && "selected"}
                      className="group border-b border-muted/20 cursor-pointer hover:bg-indigo-50/30 transition-all duration-300 data-[state=selected]:bg-indigo-50/50"
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
    </div>
  );
};

export default SubmissionsList;

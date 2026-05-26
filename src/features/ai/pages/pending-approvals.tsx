import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useList, useUpdate, useNavigation, useCustomMutation } from "@refinedev/core";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import {
  CheckCircle2,
  XCircle,
  BrainCircuit,
  FileText,
  Zap,
  ShieldCheck,
  Loader2,
  ChevronRight,
} from "lucide-react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb } from "@/components/refine/layout/breadcrumb";

interface SystemPrompt {
  id: number;
  promptId: string;
  content: string;
  version: number;
  isApproved: boolean;
  createdAt: string;
}

const PendingApprovalsPage = () => {
  const { t } = useTranslation();
  const { mutate: updateSubmission } = useUpdate();
  const { mutate: customMutation } = useCustomMutation();
  const { show } = useNavigation();

  // 1. Fetch Pending Submissions
  const { query } = useList<Submission>({
    resource: "submissions",
    filters: [
      { field: "approvalStatus", operator: "eq", value: "pending" },
      { field: "aiStatus", operator: "eq", value: "completed" },
    ],
    meta: { populate: ["assignment", "student"] },
  });

  const pendingSubmissions = query.data?.data || [];
  const isLoadingSubmissions = query.isLoading;

  // 2. Fetch System Prompts
  const { query: promptQuery } = useList<SystemPrompt>({
    resource: "system_prompts",
    filters: [{ field: "isApproved", operator: "eq", value: false }],
  });

  const pendingPrompts = promptQuery.data?.data || [];
  const isLoadingPrompts = promptQuery.isLoading;

  const handleApprove = (id: string | number, grade: number, feedback: string) => {
    updateSubmission({
      resource: "submissions",
      id,
      values: {
        grade,
        feedback,
        approvalStatus: "approved",
        gradedAt: new Date().toISOString(),
      },
      successNotification: () => ({
        type: "success",
        message: t("common.toasts.success", "Success"),
        description: "AI feedback approved and published.",
      }),
    });
  };

  const handleApprovePrompt = (id: string | number) => {
    customMutation({
      url: `ai/prompts/${id}/approve`,
      method: "post",
      values: {},
      successNotification: () => ({
        type: "success",
        message: "Prompt Approved",
        description: "The AI agent has been updated with the new personality.",
      }),
    });
  };

  const handleReject = (id: string | number) => {
    updateSubmission({
      resource: "submissions",
      id,
      values: { approvalStatus: "rejected" },
      successNotification: () => ({
        type: "success",
        message: "AI Feedback Rejected",
        description: "Submission marked for manual grading.",
      }),
    });
  };

  const submissionColumns = useMemo<ColumnDef<Submission>[]>(
    () => [
      {
        accessorKey: "assignment.title",
        header: "Assignment",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-bold text-indigo-950">{row.original.assignment?.title}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
              {row.original.student?.name}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "suggestedGrade",
        header: "AI Score",
        cell: ({ getValue }) => (
          <Badge className="bg-indigo-500 text-white font-black px-3 py-1 rounded-lg">
            {getValue<number>()}/100
          </Badge>
        ),
      },
      {
        accessorKey: "suggestedFeedback",
        header: "AI Feedback Preview",
        cell: ({ getValue }) => (
          <p className="text-xs text-muted-foreground line-clamp-1 max-w-[300px]">
            {getValue<string>()}
          </p>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 justify-end">
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-lg border-green-200 text-green-600 hover:bg-green-50"
              onClick={(e) => {
                e.stopPropagation();
                handleApprove(
                  row.original.id,
                  row.original.suggestedGrade!,
                  row.original.suggestedFeedback!
                );
              }}
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-lg border-red-200 text-red-600 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                handleReject(row.original.id);
              }}
            >
              <XCircle className="h-3.5 w-3.5 mr-1" />
              Reject
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-lg"
              onClick={() => show("submissions", row.original.id)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [t]
  );

  const promptColumns = useMemo<ColumnDef<SystemPrompt>[]>(
    () => [
      {
        accessorKey: "promptId",
        header: "Agent Role",
        cell: ({ getValue }) => (
          <Badge
            variant="outline"
            className="font-bold capitalize border-indigo-200 text-indigo-700 bg-indigo-50"
          >
            {getValue<string>().replace("_", " ")}
          </Badge>
        ),
      },
      {
        accessorKey: "version",
        header: "Version",
        cell: ({ getValue }) => (
          <span className="font-black text-indigo-950">v{getValue<number>()}</span>
        ),
      },
      {
        accessorKey: "content",
        header: "Logic Snapshot",
        cell: ({ getValue }) => (
          <p className="text-xs text-muted-foreground line-clamp-1 max-w-[400px]">
            {getValue<string>()}
          </p>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 justify-end">
            <Button
              size="sm"
              variant="default"
              className="h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
              onClick={() => handleApprovePrompt(row.original.id)}
            >
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              Approve Logic
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const submissionTable = useReactTable({
    data: pendingSubmissions,
    columns: submissionColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const promptTable = useReactTable({
    data: pendingPrompts,
    columns: promptColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto px-4 text-start">
      <div className="space-y-6">
        <Breadcrumb />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-3xl bg-indigo-950 text-white shadow-2xl">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-indigo-950">
                Human-in-the-Loop
              </h1>
              <p className="text-muted-foreground font-medium mt-1">
                Teacher Oversight: Review and verify AI-generated content before publishing.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="grading" className="w-full">
        <TabsList className="bg-muted/50 p-1.5 rounded-2xl h-14 mb-8">
          <TabsTrigger
            value="grading"
            className="rounded-xl h-11 px-8 font-bold data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-indigo-950"
          >
            <FileText className="h-4 w-4 mr-2" />
            AI Grading ({pendingSubmissions.length})
          </TabsTrigger>
          <TabsTrigger
            value="prompts"
            className="rounded-xl h-11 px-8 font-bold data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-indigo-950"
          >
            <BrainCircuit className="h-4 w-4 mr-2" />
            Evolved Prompts ({pendingPrompts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grading">
          <Card className="border-none shadow-2xl shadow-indigo-500/5 rounded-4xl overflow-hidden bg-card/50 backdrop-blur-xl">
            <div className="p-8 border-b border-muted/20 bg-muted/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg">AI Feedback Verification</h3>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">
                    Review suggested grades and pedagogical comments
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  {submissionTable.getHeaderGroups().map((headerGroup) => (
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
                  {isLoadingSubmissions ? (
                    <TableRow>
                      <TableCell colSpan={submissionColumns.length} className="h-64 text-center">
                        <Loader2 className="h-10 w-10 animate-spin mx-auto text-indigo-200" />
                      </TableCell>
                    </TableRow>
                  ) : pendingSubmissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={submissionColumns.length} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground/40">
                          <CheckCircle2 className="h-16 w-16 stroke-[1]" />
                          <p className="font-bold text-lg italic">
                            All caught up! No pending AI reviews.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    submissionTable.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="group border-b border-muted/10 hover:bg-indigo-50/30 transition-all cursor-pointer"
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
          </Card>
        </TabsContent>

        <TabsContent value="prompts">
          <Card className="border-none shadow-2xl shadow-indigo-500/5 rounded-4xl overflow-hidden bg-card/50 backdrop-blur-xl">
            <div className="p-8 border-b border-muted/20 bg-muted/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg">System Evolution Queue</h3>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">
                    Approve refined AI personalities and logic updates
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  {promptTable.getHeaderGroups().map((headerGroup) => (
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
                  {isLoadingPrompts ? (
                    <TableRow>
                      <TableCell colSpan={promptColumns.length} className="h-64 text-center">
                        <Loader2 className="h-10 w-10 animate-spin mx-auto text-indigo-200" />
                      </TableCell>
                    </TableRow>
                  ) : pendingPrompts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={promptColumns.length} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground/40">
                          <CheckCircle2 className="h-16 w-16 stroke-[1]" />
                          <p className="font-bold text-lg italic">
                            No new prompt versions pending review.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    promptTable.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="group border-b border-muted/10 hover:bg-purple-50/30 transition-all"
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
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PendingApprovalsPage;

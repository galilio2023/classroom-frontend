import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { useState } from "react";
import { Submission, PeerReview } from "@/types";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { useCustom } from "@refinedev/core";
import { GradingDialog } from "./grading-dialog";
import { SOCKET_URL } from "@/config";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ar";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Hooks
import { useSubmissionColumns } from "../components/show/useSubmissionColumns";

dayjs.extend(relativeTime);

interface SubmissionListProps {
  submissions?: Submission[];
  assignmentId?: number;
}

export const SubmissionList = ({ submissions = [], assignmentId }: SubmissionListProps) => {
  const { t, i18n } = useTranslation();
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isGradingOpen, setIsGradingOpen] = useState(false);

  dayjs.locale(i18n.language === "ar" ? "ar" : "en");

  const { query: allReviewsQuery } = useCustom<PeerReview[]>({
    url: `${SOCKET_URL.replace("/socket.io", "")}/api/peer-reviews/assignment/${assignmentId}`,
    method: "get",
    queryOptions: {
      enabled: !!assignmentId,
    },
  });

  const allReviews = allReviewsQuery?.data?.data || [];

  const handleGradeClick = (submission: Submission) => {
    setSelectedSubmission(submission);
    setIsGradingOpen(true);
  };

  const submissionColumns = useSubmissionColumns(t, allReviews, handleGradeClick);

  const table = useReactTable({
    data: submissions,
    columns: submissionColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 px-1 text-start">
        <div className="p-2 rounded-xl bg-primary/10 text-primary shadow-sm border border-primary/5">
          <MessageSquare className="h-5 w-5" />
        </div>
        <h3 className="text-xl md:text-2xl font-black uppercase tracking-widest text-start">
          {t("assignments.list.table.submissionsHeader")}
        </h3>
        <Badge
          variant="secondary"
          className="rounded-full px-3 py-1 h-7 text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border-none shadow-sm"
        >
          {submissions.length}
        </Badge>
      </div>

      <div className="rounded-[1.5rem] md:rounded-4xl border border-border/40 overflow-x-auto bg-card/50 backdrop-blur-xl shadow-lg">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => handleGradeClick(row.original)}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={submissionColumns.length} className="h-24 text-center">
                  {t("assignments.list.table.submissionsHeader")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <GradingDialog
        isOpen={isGradingOpen}
        onOpenChange={setIsGradingOpen}
        submission={selectedSubmission}
        submissions={submissions}
        onNavigate={(sub) => setSelectedSubmission(sub)}
      />
    </div>
  );
};

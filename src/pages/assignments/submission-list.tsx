import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { Submission, User, PeerReview } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Clock, CheckCircle2, AlertCircle, MessageSquare, Trophy } from "lucide-react";
import { UseTableReturnType } from "@refinedev/react-table";
import { HttpError, useCustom } from "@refinedev/core";
import { GradingDialog } from "./grading-dialog";
import { SOCKET_URL } from "@/config";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ar";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

dayjs.extend(relativeTime);

interface SubmissionListProps {
  submissions?: Submission[];
  assignmentId?: number;
}

export const SubmissionList = ({ submissions = [], assignmentId }: SubmissionListProps) => {
  const { t, i18n } = useTranslation();
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [isGradingOpen, setIsGradingOpen] = useState(false);

  // Update dayjs locale dynamically
  dayjs.locale(i18n.language === "ar" ? "ar" : "en");

  // Fetch all peer reviews for this assignment to show completion status
  const allReviewsResult = useCustom<PeerReview[]>({
    url: `${SOCKET_URL.replace("/socket.io", "")}/api/peer-reviews/assignment/${assignmentId}`,
    method: "get",
    queryOptions: {
      enabled: !!assignmentId,
    },
  });

  const allReviews = (allReviewsResult.result.data as PeerReview[]) || [];

  const handleGradeClick = (submission: Submission) => {
    setSelectedSubmission(submission);
    setIsGradingOpen(true);
  };

  const submissionColumns = useMemo<ColumnDef<Submission>[]>(
    () => [
      {
        id: "student",
        header: t("assignments.list.table.student"),
        accessorFn: (row) => row.student,
        cell: ({ getValue }) => {
          const student = getValue<User>();
          if (!student) return <span className="text-muted-foreground italic text-xs">{t("assignments.list.table.unknownStudent")}</span>;
          return (
            <div className="flex items-center gap-3 py-1">
              <div className="relative group">
                <Avatar className="size-9 border-2 border-background shadow-sm group-hover:border-primary/20 transition-all">
                  {student.image && (
                    <AvatarImage src={student.image} alt={student.name} className="object-cover" />
                  )}
                  <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs">
                    {student.name?.split(" ").map(n => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 size-3 bg-success rounded-full border-2 border-background" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors">{student.name}</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{t("assignments.list.table.studentId", { id: student.id.toString().slice(-4) })}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "updatedAt",
        header: t("assignments.list.table.status"),
        cell: ({ row }) => {
          const date = dayjs(row.original.updatedAt);
          const isLate = row.original.isLate;
          return (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-xs font-medium">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span>{date.fromNow()}</span>
              </div>
              {isLate ? (
                <Badge variant="destructive" className="w-fit text-[9px] h-4 px-1.5 uppercase font-black tracking-tighter bg-destructive/10 text-destructive border-none">
                  <AlertCircle className="h-2.5 w-2.5 mr-1" />
                  {t("assignments.list.table.late")}
                </Badge>
              ) : (
                <Badge variant="secondary" className="w-fit text-[9px] h-4 px-1.5 uppercase font-black tracking-tighter bg-success/10 text-success border-none">
                  <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                  {t("assignments.list.table.onTime")}
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        id: "peerReviews",
        header: t("assignments.list.table.peerProgress"),
        cell: ({ row }) => {
          const submissionId = row.original.id;
          const reviewsForThis = allReviews.filter((r: PeerReview) => r.submissionId === submissionId);
          const completed = reviewsForThis.filter((r: PeerReview) => !!r.feedback).length;
          const total = reviewsForThis.length;

          if (total === 0) return (
            <div className="flex items-center gap-2 text-muted-foreground/40">
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{t("assignments.list.table.notAssigned")}</span>
            </div>
          );

          const isFullyReviewed = completed === total;

          return (
            <div className="flex flex-col gap-2 min-w-[100px]">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter">
                <span className={cn(isFullyReviewed ? "text-success" : "text-muted-foreground")}>
                  {t("assignments.list.table.reviews", { completed, total })}
                </span>
                <span className="text-muted-foreground/40">{Math.round((completed / total) * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-black/[0.03] dark:border-white/10">
                <div 
                  className={cn(
                    "h-full transition-all duration-500 rounded-full",
                    isFullyReviewed ? "bg-success" : "bg-primary"
                  )}
                  style={{ width: `${(completed / total) * 100}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "grade",
        header: t("assignments.list.table.grade"),
        cell: ({ getValue }) => {
          const grade = getValue<number | null>();
          
          if (grade === null) return (
            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-dashed opacity-50">
              {t("assignments.list.table.pending")}
            </Badge>
          );

          const isHigh = grade >= 90;
          const isLow = grade < 50;

          return (
            <div className="flex items-center gap-2">
              <div className={cn(
                "size-8 rounded-lg flex items-center justify-center font-black text-xs shadow-sm border",
                isHigh ? "bg-primary/10 text-primary border-primary/20" : 
                isLow ? "bg-destructive/10 text-destructive border-destructive/20" : 
                "bg-muted text-foreground border-border"
              )}>
                {grade}
              </div>
              {isHigh && <Trophy className="h-3.5 w-3.5 text-gold-primary animate-bounce" />}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-lg font-bold text-[10px] uppercase tracking-widest gap-2 hover:bg-primary hover:text-primary-foreground transition-all group"
            onClick={() => handleGradeClick(row.original)}
          >
            <Eye className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
            {t("buttons.grade")}
          </Button>
        ),
      },
    ],
    [allReviews, t, i18n.language],
  );

  const reactTable = useReactTable({
    columns: submissionColumns,
    data: submissions,
    getCoreRowModel: getCoreRowModel(),
  });

  const tableAdapter: UseTableReturnType<Submission, HttpError> = {
    reactTable: reactTable,
    refineCore: {
      tableQuery: {
        isLoading: false,
        data: { data: submissions, total: submissions.length },
        isError: false,
      } as any,
      currentPage: 1,
      pageCount: 1,
      pageSize: submissions.length,
      setCurrentPage: () => {},
      setPageSize: () => {},
      filters: [],
      setFilters: () => {},
      sorters: [],
      setSorters: () => {},
    } as any,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <MessageSquare className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest">{t("assignments.list.table.submissionsHeader")}</h3>
          <Badge variant="secondary" className="rounded-full px-2 py-0 h-5 text-[10px] font-bold">
            {submissions.length}
          </Badge>
        </div>
      </div>
      
      <div className="rounded-2xl border border-black/[0.08] dark:border-white/10 overflow-hidden bg-card/50 backdrop-blur-sm shadow-sm">
        <DataTable table={tableAdapter} />
      </div>

      <GradingDialog
        isOpen={isGradingOpen}
        onOpenChange={setIsGradingOpen}
        submission={selectedSubmission}
      />
    </div>
  );
};

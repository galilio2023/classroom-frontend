import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { Submission, User, PeerReview } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Clock, CheckCircle2, AlertCircle, MessageSquare, Trophy, MoreHorizontal, Trash2, Edit3 } from "lucide-react";
import { HttpError, useCustom } from "@refinedev/core";
import { GradingDialog } from "./grading-dialog";
import { SOCKET_URL } from "@/config";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ar";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  dayjs.locale(i18n.language === "ar" ? "ar" : "en");

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
                <Avatar className="size-10 border-2 border-background shadow-sm group-hover:border-primary/20 transition-all">
                  {student.image && (
                    <AvatarImage src={student.image} alt={student.name} className="object-cover" />
                  )}
                  <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs">
                    {student.name?.split(" ").map(n => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 size-3.5 bg-success rounded-full border-2 border-background" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm md:text-base tracking-tight group-hover:text-primary transition-colors">{student.name}</span>
                <span className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider">{t("assignments.list.table.studentId", { id: student.id.toString().slice(-4) })}</span>
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
            <div className="flex flex-col gap-1.5 min-w-[100px]">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground/80">
                <Clock className="h-3.5 w-3.5" />
                <span>{date.fromNow()}</span>
              </div>
              {isLate ? (
                <Badge variant="destructive" className="w-fit text-[9px] h-5 px-2 uppercase font-black tracking-tighter shadow-sm">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {t("assignments.list.table.late")}
                </Badge>
              ) : (
                <Badge variant="secondary" className="w-fit text-[9px] h-5 px-2 uppercase font-black tracking-tighter bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-sm">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
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
            <div className="flex items-center gap-2 text-muted-foreground/40 min-w-[120px]">
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{t("assignments.list.table.notAssigned")}</span>
            </div>
          );

          const isFullyReviewed = completed === total;

          return (
            <div className="flex flex-col gap-2 min-w-[120px]">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter">
                <span className={cn(isFullyReviewed ? "text-success" : "text-primary")}>
                  {t("assignments.list.table.reviews", { completed, total })}
                </span>
                <span className="text-muted-foreground/40">{Math.round((completed / total) * 100)}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-black/[0.03] dark:border-white/10 shadow-inner">
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
            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-dashed opacity-50 shadow-sm">
              {t("assignments.list.table.pending")}
            </Badge>
          );

          const isHigh = grade >= 90;
          const isLow = grade < 50;

          return (
            <div className="flex items-center gap-2 min-w-[80px]">
              <div className={cn(
                "size-10 rounded-xl flex items-center justify-center font-black text-sm shadow-md border",
                isHigh ? "bg-primary/10 text-primary border-primary/20" : 
                isLow ? "bg-destructive/10 text-destructive border-destructive/20" : 
                "bg-muted/50 text-foreground border-border/40"
              )}>
                {grade}%
              </div>
              {isHigh && <Trophy className="h-4 w-4 text-gold-primary animate-bounce" />}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end min-w-[80px]">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl bg-muted/30 hover:bg-muted/50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl">
                <DropdownMenuItem
                  onClick={() => handleGradeClick(row.original)}
                  className="rounded-xl gap-3 py-3 cursor-pointer"
                >
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Eye className="h-4 w-4" />
                  </div>
                  <span className="font-bold">{t("buttons.grade")}</span>
                </DropdownMenuItem>
                {/* Add other actions like edit/delete submission if applicable */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [allReviews, t, i18n.language],
  );

  const table = useReactTable({
    data: submissions,
    columns: submissionColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 px-1">
        <div className="p-2 rounded-xl bg-primary/10 text-primary shadow-sm border border-primary/5">
          <MessageSquare className="h-5 w-5" />
        </div>
        <h3 className="text-xl md:text-2xl font-black uppercase tracking-widest">{t("assignments.list.table.submissionsHeader")}</h3>
        <Badge variant="secondary" className="rounded-full px-3 py-1 h-7 text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border-none shadow-sm">
          {submissions.length}
        </Badge>
      </div>
      
      <div className="rounded-[1.5rem] md:rounded-[2rem] border border-border/40 overflow-x-auto bg-card/50 backdrop-blur-xl shadow-lg">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
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
      />
    </div>
  );
};

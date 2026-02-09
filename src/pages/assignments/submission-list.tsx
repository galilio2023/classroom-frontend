import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { Submission, User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { UseTableReturnType } from "@refinedev/react-table";
import { HttpError } from "@refinedev/core";
import { GradingDialog } from "./grading-dialog"; // Import the dialog

interface SubmissionListProps {
  submissions?: Submission[];
}

export const SubmissionList = ({ submissions = [] }: SubmissionListProps) => {
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [isGradingOpen, setIsGradingOpen] = useState(false);

  const handleGradeClick = (submission: Submission) => {
    setSelectedSubmission(submission);
    setIsGradingOpen(true);
  };

  const submissionColumns = useMemo<ColumnDef<Submission>[]>(
    () => [
      {
        id: "student",
        header: "Student",
        accessorFn: (row) => row.student,
        cell: ({ getValue }) => {
          const student = getValue<User>();
          if (!student) return "Unknown Student";
          return (
            <div className="flex items-center gap-2">
              <Avatar className="size-7">
                {student.image && (
                  <AvatarImage src={student.image} alt={student.name} />
                )}
                <AvatarFallback>{student.name?.[0]}</AvatarFallback>
              </Avatar>
              <span className="truncate">{student.name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "updatedAt",
        header: "Submitted On",
        cell: ({ getValue }) => new Date(getValue<string>()).toLocaleString(),
      },
      {
        accessorKey: "grade",
        header: "Grade",
        cell: ({ getValue }) => {
          const grade = getValue<number | null>();
          return grade !== null ? `${grade} / 100` : "Not Graded";
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            title="View & Grade"
            onClick={() => handleGradeClick(row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [],
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
    <>
      <DataTable table={tableAdapter} />
      <GradingDialog
        isOpen={isGradingOpen}
        onOpenChange={setIsGradingOpen}
        submission={selectedSubmission}
      />
    </>
  );
};

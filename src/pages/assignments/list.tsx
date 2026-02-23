import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { Assignment } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditButton } from "@/components/refine-ui/buttons/edit";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { useGo, HttpError } from "@refinedev/core";
import { PlusCircle, FileText } from "lucide-react";
import { UseTableReturnType } from "@refinedev/react-table";
import { EmptyState } from "@/components/empty-state";

interface AssignmentListProps {
  classId: string;
  assignments?: Assignment[];
}

export const AssignmentList = ({
  classId,
  assignments = [],
}: AssignmentListProps) => {
  const go = useGo();

  const handleCreate = () => {
    go({
      to: `/assignments/create?classId=${classId}`,
      type: "push",
    });
  };

  const assignmentColumns = useMemo<ColumnDef<Assignment>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "dueDate",
        header: "Due Date",
        cell: ({ getValue }) => {
          const date = getValue<string>();
          return date ? new Date(date).toLocaleDateString() : "No Due Date";
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <ShowButton
              resource="assignments"
              recordItemId={row.original.id}
              hideText
              size="sm"
            />
            <EditButton
              resource="assignments"
              recordItemId={row.original.id}
              hideText
              size="sm"
            />
          </div>
        ),
      },
    ],
    [],
  );

  // 1. Use the standard, "dumb" hook to manage table state without API calls.
  const reactTable = useReactTable({
    columns: assignmentColumns,
    data: assignments,
    getCoreRowModel: getCoreRowModel(),
  });

  // 2. Create an adapter object that matches the UseTableReturnType expected by DataTable.
  // We mock the refineCore properties since we are handling data manually.
  const tableAdapter: UseTableReturnType<Assignment, HttpError> = {
    reactTable: reactTable,
    refineCore: {
      // Mock the tableQuery to show we are not loading and have data
      tableQuery: {
        isLoading: false,
        data: { data: assignments, total: assignments.length },
        isError: false,
      } as any,
      currentPage: 1,
      pageCount: 1,
      pageSize: assignments.length,
      setCurrentPage: () => {},
      setPageSize: () => {},
      filters: [],
      setFilters: () => {},
      sorters: [],
      setSorters: () => {},
    } as any,
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Assignments</CardTitle>
        {assignments.length > 0 && (
          <Button onClick={handleCreate}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {assignments.length > 0 ? (
          <DataTable table={tableAdapter} />
        ) : (
          <EmptyState
            icon={FileText}
            title="No assignments yet"
            description="Create your first assignment to start tracking student progress."
            action={{
              label: "Create Assignment",
              onClick: handleCreate,
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

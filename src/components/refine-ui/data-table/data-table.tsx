"use client";

import type { BaseRecord, HttpError } from "@refinedev/core";
import type { UseTableReturnType } from "@refinedev/react-table";
import type { Column } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { DataTablePagination } from "@/components/refine-ui/data-table/data-table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type DataTableProps<TData extends BaseRecord> = {
  table: UseTableReturnType<TData, HttpError>;
  onRowClick?: (record: TData) => void;
};

export function DataTable<TData extends BaseRecord>({
  table: tableResult,
  onRowClick,
}: DataTableProps<TData>) {
  // --- SAFETY GUARD ---
  if (!tableResult?.refineCore || !tableResult?.reactTable || !tableResult.reactTable.getHeaderGroups) {
    return (
      <div className="flex justify-center items-center h-40 border rounded-md bg-muted/5">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const {
    reactTable: { getHeaderGroups, getRowModel, getAllColumns, getAllLeafColumns },
    refineCore: {
      tableQuery,
      currentPage,
      setCurrentPage,
      pageCount,
      pageSize,
      setPageSize,
    },
  } = tableResult;

  const columns = getAllColumns();
  const isLoading = tableQuery.isLoading;

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [isOverflowing, setIsOverflowing] = useState({
    horizontal: false,
    vertical: false,
  });

  useEffect(() => {
    const checkOverflow = () => {
      if (tableRef.current && tableContainerRef.current) {
        const tableEl = tableRef.current;
        const container = tableContainerRef.current;
        const horizontalOverflow = tableEl.scrollWidth > container.clientWidth;
        const verticalOverflow = tableEl.scrollHeight > container.clientHeight;
        setIsOverflowing({ horizontal: horizontalOverflow, vertical: verticalOverflow });
      }
    };
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    const timeoutId = setTimeout(checkOverflow, 100);
    return () => {
      window.removeEventListener("resize", checkOverflow);
      clearTimeout(timeoutId);
    };
  }, [tableQuery.data?.data, pageSize]);

  const headerGroups = getHeaderGroups() || [];

  return (
    <div className="flex flex-col flex-1 gap-4 w-full max-w-full overflow-hidden">
      <div 
        ref={tableContainerRef} 
        className={cn(
            "rounded-md border bg-card overflow-x-auto",
            "scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent"
        )}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <Table 
            ref={tableRef} 
            className="min-w-[1000px] w-full table-auto"
        >
          <TableHeader>
            {headerGroups.map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id} 
                    className="whitespace-nowrap font-bold bg-muted/30 h-12"
                    style={{ ...getCommonStyles({ column: header.column, isOverflowing }) }}
                  >
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="relative">
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                <motion.tr
                  key="loading-skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td colSpan={columns.length}>
                    {Array.from({ length: pageSize < 1 ? 5 : Math.min(pageSize, 10) }).map((_, rowIndex) => (
                      <div key={`skeleton-row-${rowIndex}`} className="flex border-b last:border-0">
                        {getAllLeafColumns().map((column) => (
                          <div key={`skeleton-cell-${rowIndex}-${column.id}`} style={{ width: column.getSize() }} className="py-4 px-4">
                            <Skeleton className="h-5 w-full max-w-[150px]" />
                          </div>
                        ))}
                      </div>
                    ))}
                  </td>
                </motion.tr>
              ) : getRowModel().rows?.length ? (
                getRowModel().rows.map((row, index) => (
                  <motion.tr
                    key={row.original?.id ?? row.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.2 }}
                    className={cn(
                      "group border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
                      onRowClick && "cursor-pointer"
                    )}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell 
                        key={cell.id} 
                        className="whitespace-nowrap py-4"
                        style={{ ...getCommonStyles({ column: cell.column, isOverflowing }) }}
                      >
                        <motion.div 
                          whileHover={onRowClick ? { x: 4 } : {}}
                          className="max-w-[400px] truncate"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </motion.div>
                      </TableCell>
                    ))}
                  </motion.tr>
                ))
              ) : (
                <DataTableNoData isOverflowing={isOverflowing} columnsLength={columns.length} />
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
      
      {!isLoading && getRowModel().rows?.length > 0 && (
        <div className="w-full overflow-x-auto pb-2">
          <DataTablePagination
            currentPage={currentPage}
            pageCount={pageCount}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            total={tableQuery.data?.total}
          />
        </div>
      )}
    </div>
  );
}

function DataTableNoData({ isOverflowing, columnsLength }: { isOverflowing: { horizontal: boolean; vertical: boolean }; columnsLength: number; }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={columnsLength} className="relative text-center" style={{ height: "200px" }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background" style={{ position: isOverflowing.horizontal ? "sticky" : "absolute", left: "50%", transform: "translateX(-50%)", zIndex: isOverflowing.horizontal ? 2 : 1, width: isOverflowing.horizontal ? "fit-content" : "100%", minWidth: "300px" }}>
          <div className="text-lg font-semibold text-foreground">No data to display</div>
          <div className="text-sm text-muted-foreground">This table is empty for the time being.</div>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function getCommonStyles<TData>({ column, isOverflowing }: { column: Column<TData>; isOverflowing: { horizontal: boolean; vertical: boolean; }; }): React.CSSProperties {
  const isPinned = column.getIsPinned();
  const isLastLeftPinnedColumn = isPinned === "left" && column.getIsLastColumn("left");
  const isFirstRightPinnedColumn = isPinned === "right" && column.getIsFirstColumn("right");
  return {
    boxShadow: isOverflowing.horizontal && isLastLeftPinnedColumn ? "-4px 0 4px -4px var(--border) inset" : isOverflowing.horizontal && isFirstRightPinnedColumn ? "4px 0 4px -4px var(--border) inset" : undefined,
    left: isOverflowing.horizontal && isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isOverflowing.horizontal && isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    opacity: 1,
    position: isOverflowing.horizontal && isPinned ? "sticky" : "relative",
    background: isOverflowing.horizontal && isPinned ? "var(--background)" : "",
    borderTopRightRadius: isOverflowing.horizontal && isPinned === "right" ? "var(--radius)" : undefined,
    borderBottomRightRadius: isOverflowing.horizontal && isPinned === "right" ? "var(--radius)" : undefined,
    borderTopLeftRadius: isOverflowing.horizontal && isPinned === "left" ? "var(--radius)" : undefined,
    borderBottomLeftRadius: isOverflowing.horizontal && isPinned === "left" ? "var(--radius)" : undefined,
    width: column.getSize(),
    zIndex: isOverflowing.horizontal && isPinned ? 1 : 0,
  };
}

DataTable.displayName = "DataTable";

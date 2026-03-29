"use client";

import { type CrudOperators } from "@refinedev/core";
import type { Column } from "@tanstack/react-table";
import { useCallback, useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { DataTableFilterDropdown, DataTableFilterDropdownActions } from "./filter-dropdown";

export type DataTableFilterDropdownDateSinglePickerProps<TData> = {
  column: Column<TData>;
  defaultOperator?: CrudOperators;
  formatDate?: (date: Date | undefined) => string | undefined;
};

export function DataTableFilterDropdownDateSinglePicker<TData>({
  column,
  defaultOperator = "eq",
  formatDate,
}: DataTableFilterDropdownDateSinglePickerProps<TData>) {
  const columnFilterValue = column.getFilterValue() as string;

  const parseDate = useCallback((value: string | undefined): Date | undefined => {
    if (!value) return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return undefined;
    return date;
  }, []);

  const [filterValue, setFilterValue] = useState<Date | undefined>(() =>
    parseDate(columnFilterValue)
  );

  useEffect(() => {
    column.columnDef.meta = {
      ...column.columnDef.meta,
      filterOperator: defaultOperator,
    };
  }, [defaultOperator, column]);

  useEffect(() => {
    setFilterValue(parseDate(columnFilterValue));
  }, [columnFilterValue, parseDate]);

  const hasDate = !!filterValue;

  const handleApply = () => {
    if (!filterValue) return;
    const value = formatDate?.(filterValue) ?? filterValue.toISOString();
    column.setFilterValue(value);
  };

  return (
    <DataTableFilterDropdown column={column} contentClassName={cn("w-fit", "p-0")}>
      {({ setIsOpen }) => (
        <div
          className="flex flex-col items-center"
          onKeyDown={(event) => {
            if (!hasDate) return;
            if (event.key === "Enter") {
              handleApply();
              setIsOpen(false);
            }
          }}
        >
          <Calendar mode="single" selected={filterValue} onSelect={setFilterValue} />
          <div className="w-full">
            <Separator />
          </div>
          <DataTableFilterDropdownActions
            className="p-4"
            isApplyDisabled={!hasDate}
            onClear={() => {
              column.setFilterValue(undefined);
              setFilterValue(undefined);
              setIsOpen(false);
            }}
            onApply={() => {
              handleApply();
              setIsOpen(false);
            }}
          />
        </div>
      )}
    </DataTableFilterDropdown>
  );
}

export type DataTableFilterDropdownDateRangePickerProps<TData> = {
  column: Column<TData>;
  defaultOperator?: CrudOperators;
  formatDateRange?: (dateRange: DateRange | undefined) => string[] | undefined;
};

export function DataTableFilterDropdownDateRangePicker<TData>({
  column,
  defaultOperator = "between",
  formatDateRange,
}: DataTableFilterDropdownDateRangePickerProps<TData>) {
  const columnFilterValue = column.getFilterValue() as string[];

  const parseDateRange = useCallback((value: string[] | undefined): DateRange | undefined => {
    if (!value || !Array.isArray(value) || value.length !== 2) return undefined;
    const from = value[0] ? new Date(value[0]) : undefined;
    const to = value[1] ? new Date(value[1]) : undefined;
    if (!from || !to || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()))
      return undefined;
    return { from, to };
  }, []);

  const [filterValue, setFilterValue] = useState<DateRange | undefined>(() =>
    parseDateRange(columnFilterValue)
  );

  useEffect(() => {
    column.columnDef.meta = {
      ...column.columnDef.meta,
      filterOperator: defaultOperator,
    };
  }, [defaultOperator, column]);

  const filterValueKey = columnFilterValue?.join(",");

  useEffect(() => {
    setFilterValue(parseDateRange(columnFilterValue));
  }, [filterValueKey, parseDateRange, columnFilterValue]);

  const hasDateRange = filterValue?.from && filterValue?.to;

  const handleApply = () => {
    if (!filterValue?.from || !filterValue?.to) return;
    const values = formatDateRange?.(filterValue) ?? [
      filterValue.from.toISOString(),
      filterValue.to.toISOString(),
    ];
    column.setFilterValue(values);
  };

  return (
    <DataTableFilterDropdown column={column} contentClassName={cn("w-fit", "p-0")}>
      {({ setIsOpen }) => (
        <div
          className="flex flex-col items-center"
          onKeyDown={(event) => {
            if (!hasDateRange) return;
            if (event.key === "Enter") {
              handleApply();
              setIsOpen(false);
            }
          }}
        >
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={filterValue}
            onSelect={(date) => setFilterValue({ from: date?.from, to: date?.to })}
          />
          <div className="w-full">
            <Separator />
          </div>
          <DataTableFilterDropdownActions
            className="p-4"
            isApplyDisabled={!hasDateRange}
            onClear={() => {
              column.setFilterValue(undefined);
              setFilterValue(undefined);
              setIsOpen(false);
            }}
            onApply={() => {
              handleApply();
              setIsOpen(false);
            }}
          />
        </div>
      )}
    </DataTableFilterDropdown>
  );
}

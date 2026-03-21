"use client";

import { useTranslate, type CrudOperators } from "@refinedev/core";
import type { Column, Table as ReactTable } from "@tanstack/react-table";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { DataTableFilterDropdown, DataTableFilterDropdownActions } from "./filter-dropdown";
import { DataTableFilterOperatorSelect } from "./operator-select";

export type DataTableFilterInputProps<TData> = {
  column: Column<TData>;
  table?: ReactTable<TData>;
  defaultOperator?: CrudOperators;
  operators?: CrudOperators[];
  renderInput: (props: {
    value: string | string[];
    onChange: (value: string | string[]) => void;
  }) => React.ReactNode;
};

export function DataTableFilterInput<TData>({
  column: columnFromProps,
  table: tableFromProps,
  operators: operatorsFromProps,
  defaultOperator: defaultOperatorFromProps,
  renderInput,
}: DataTableFilterInputProps<TData>) {
  const [filterValue, setFilterValue] = useState(
    (columnFromProps.getFilterValue() as string | string[]) || ""
  );

  const [operator, setOperator] = useState<CrudOperators>(() => {
    if (!tableFromProps) return defaultOperatorFromProps || "eq";
    const columnFilter = tableFromProps.getState().columnFilters.find((f) => f.id === columnFromProps.id);
    if (columnFilter && "operator" in columnFilter) return columnFilter.operator as CrudOperators;
    return defaultOperatorFromProps || "eq";
  });

  const handleApply = () => columnFromProps.setFilterValue(filterValue);
  const handleClear = () => { columnFromProps.setFilterValue(undefined); setFilterValue(""); };

  const handleOperatorChange = (value: CrudOperators) => {
    setOperator(value);
    columnFromProps.columnDef.meta = { ...columnFromProps.columnDef.meta, filterOperator: value };
  };

  return (
    <DataTableFilterDropdown column={columnFromProps}>
      {({ setIsOpen }) => (
        <div
          className="flex flex-col items-center gap-4 w-full"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleApply();
              setIsOpen(false);
            }
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {operatorsFromProps && operatorsFromProps.length > 1 && (
              <DataTableFilterOperatorSelect
                value={operator}
                operators={operatorsFromProps}
                onValueChange={handleOperatorChange}
              />
            )}
            {renderInput({ value: filterValue, onChange: setFilterValue })}
          </div>
          <div className="w-full"><Separator /></div>
          <DataTableFilterDropdownActions
            onClear={() => { handleClear(); setIsOpen(false); }}
            onApply={() => { handleApply(); setIsOpen(false); }}
          />
        </div>
      )}
    </DataTableFilterDropdown>
  );
}

export type DataTableFilterDropdownTextProps<TData> = {
  column: Column<TData>;
  table: ReactTable<TData>;
  defaultOperator?: CrudOperators;
  operators?: CrudOperators[];
  placeholder?: string;
};

export function DataTableFilterDropdownText<TData>({
  column, table, operators = ["eq", "ne", "contains", "ncontains", "containss", "ncontainss", "startswith", "nstartswith", "startswiths", "nstartswiths", "endswith", "nendswith", "endswiths", "nendswiths", "in", "nin", "ina", "nina"],
  defaultOperator = "eq", placeholder,
}: DataTableFilterDropdownTextProps<TData>) {
  const t = useTranslate();
  return (
    <DataTableFilterInput
      column={column} table={table} operators={operators} defaultOperator={defaultOperator}
      renderInput={({ value, onChange }) => (
        <Input
          type="text"
          placeholder={placeholder ?? t("table.filter.text.placeholder", "Filter by...")}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    />
  );
}

export type DataTableFilterDropdownNumericProps<TData> = {
  column: Column<TData>;
  table: ReactTable<TData>;
  defaultOperator?: CrudOperators;
  operators?: CrudOperators[];
  placeholder?: string;
};

export function DataTableFilterDropdownNumeric<TData>({
  column, table, operators = ["eq", "ne", "gt", "lt", "gte", "lte"], defaultOperator = "eq", placeholder,
}: DataTableFilterDropdownNumericProps<TData>) {
  const t = useTranslate();
  return (
    <DataTableFilterInput
      column={column} table={table} operators={operators} defaultOperator={defaultOperator}
      renderInput={({ value, onChange }) => (
        <Input
          type="number"
          placeholder={placeholder ?? t("table.filter.numeric.placeholder", "Filter by...")}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    />
  );
}

export type DataTableFilterComboboxProps<TData> = {
  column: Column<TData>;
  table?: ReactTable<TData>;
  options: { label: string; value: string }[];
  defaultOperator?: CrudOperators;
  operators?: CrudOperators[];
  placeholder?: string;
  noResultsText?: string;
  multiple?: boolean;
};

export function DataTableFilterCombobox<TData>({
  column, table, options, defaultOperator = "eq", operators = ["eq", "ne", "in", "nin"], placeholder, noResultsText, multiple = false,
}: DataTableFilterComboboxProps<TData>) {
  const t = useTranslate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DataTableFilterInput
      column={column} table={table} operators={operators} defaultOperator={defaultOperator}
      renderInput={({ value, onChange }) => {
        const currentValues = multiple ? (Array.isArray(value) ? value : value ? [String(value)] : []) : (value ? [String(value)] : []);
        const handleSelect = (v: string) => {
          if (multiple) {
            const next = currentValues.includes(v) ? currentValues.filter((item) => item !== v) : [...currentValues, v];
            onChange(next);
          } else { onChange(v); setIsOpen(false); }
        };
        return (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={isOpen} className="w-full min-w-48 max-w-80 justify-start h-auto min-h-9">
                <div className="flex gap-2 w-full">
                  {multiple && currentValues.length > 0 ? (
                    <div className="flex flex-wrap gap-1 flex-1">
                      {currentValues.slice(0, 3).map((v) => (
                        <Badge key={v} variant="outline" className="inline-flex items-center gap-0 h-4 pr-0.5 rounded-sm">
                          <span className="text-[10px]">{options.find(o => o.value === v)?.label || v}</span>
                          <span className="cursor-pointer" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange(currentValues.filter(i => i !== v)); }}><X className="!h-2 !w-2" /></span>
                        </Badge>
                      ))}
                      {currentValues.length > 3 && <span className="text-xs">+{currentValues.length - 3} more</span>}
                    </div>
                  ) : <span className="truncate flex-1 text-start text-xs">{options.find(o => o.value === currentValues[0])?.label || placeholder || t("table.filter.combobox.placeholder", "Select...")}</span>}
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
              <Command>
                <CommandInput placeholder={t("table.filter.combobox.search", "Search...")} />
                <CommandList>
                  <CommandEmpty>{noResultsText || t("table.filter.combobox.noResults", "Results not found.")}</CommandEmpty>
                  <CommandGroup>
                    {options.map((o) => (
                      <CommandItem key={o.value} value={o.value} onSelect={() => handleSelect(o.value)}>
                        {o.label}<Check className={cn("ml-auto h-4 w-4", currentValues.includes(o.value) ? "opacity-100" : "opacity-0")} />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        );
      }}
    />
  );
}

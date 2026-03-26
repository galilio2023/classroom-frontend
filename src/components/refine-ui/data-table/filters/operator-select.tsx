"use client";

import { useTranslate, type CrudOperators } from "@refinedev/core";
import { Check, ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const CRUD_OPERATOR_LABELS: Record<
  Exclude<CrudOperators, "or" | "and">,
  { i18nKey: string; defaultLabel: string }
> = {
  eq: { i18nKey: "table.filter.operator.eq", defaultLabel: "Equals" },
  ne: { i18nKey: "table.filter.operator.ne", defaultLabel: "Not equals" },
  lt: { i18nKey: "table.filter.operator.lt", defaultLabel: "Less than" },
  gt: { i18nKey: "table.filter.operator.gt", defaultLabel: "Greater than" },
  lte: { i18nKey: "table.filter.operator.lte", defaultLabel: "Less than or equal" },
  gte: { i18nKey: "table.filter.operator.gte", defaultLabel: "Greater than or equal" },
  in: { i18nKey: "table.filter.operator.in", defaultLabel: "Includes in an array" },
  nin: { i18nKey: "table.filter.operator.nin", defaultLabel: "Not includes in an array" },
  ina: { i18nKey: "table.filter.operator.ina", defaultLabel: "Includes in an array (case sensitive)" },
  nina: { i18nKey: "table.filter.operator.nina", defaultLabel: "Not includes in an array (case sensitive)" },
  contains: { i18nKey: "table.filter.operator.contains", defaultLabel: "Contains" },
  ncontains: { i18nKey: "table.filter.operator.ncontains", defaultLabel: "Not contains" },
  containss: { i18nKey: "table.filter.operator.containss", defaultLabel: "Contains (case sensitive)" },
  ncontainss: { i18nKey: "table.filter.operator.ncontainss", defaultLabel: "Not contains (case sensitive)" },
  between: { i18nKey: "table.filter.operator.between", defaultLabel: "Between" },
  nbetween: { i18nKey: "table.filter.operator.nbetween", defaultLabel: "Not between" },
  null: { i18nKey: "table.filter.operator.null", defaultLabel: "Is null" },
  nnull: { i18nKey: "table.filter.operator.nnull", defaultLabel: "Is not null" },
  startswith: { i18nKey: "table.filter.operator.startswith", defaultLabel: "Starts with" },
  nstartswith: { i18nKey: "table.filter.operator.nstartswith", defaultLabel: "Not starts with" },
  startswiths: { i18nKey: "table.filter.operator.startswiths", defaultLabel: "Starts with (case sensitive)" },
  nstartswiths: { i18nKey: "table.filter.operator.nstartswiths", defaultLabel: "Not starts with (case sensitive)" },
  endswith: { i18nKey: "table.filter.operator.endswith", defaultLabel: "Ends with" },
  nendswith: { i18nKey: "table.filter.operator.nendswith", defaultLabel: "Not ends with" },
  endswiths: { i18nKey: "table.filter.operator.endswiths", defaultLabel: "Ends with (case sensitive)" },
  nendswiths: { i18nKey: "table.filter.operator.nendswiths", defaultLabel: "Not ends with (case sensitive)" },
  eqs: { i18nKey: "table.filter.operator.eqs", defaultLabel: "Equals (case sensitive)" },
  nes: { i18nKey: "table.filter.operator.nes", defaultLabel: "Not equals (case sensitive)" },
};

export type DataTableFilterOperatorSelectProps = {
  value: CrudOperators;
  onValueChange: (value: CrudOperators) => void;
  operators?: CrudOperators[];
  placeholder?: string;
  triggerClassName?: string;
  contentClassName?: string;
};

export function DataTableFilterOperatorSelect({
  value,
  onValueChange,
  operators: operatorsFromProps,
  placeholder,
  triggerClassName,
  contentClassName,
}: DataTableFilterOperatorSelectProps) {
  const t = useTranslate();
  const [open, setOpen] = useState(false);

  const operators = useMemo(() => {
    return Object.entries(CRUD_OPERATOR_LABELS).filter(([operator]) =>
      operatorsFromProps?.includes(operator as CrudOperators)
    );
  }, [operatorsFromProps]);

  const selectedLabel = t(
    CRUD_OPERATOR_LABELS[value as Exclude<CrudOperators, "or" | "and">].i18nKey,
    CRUD_OPERATOR_LABELS[value as Exclude<CrudOperators, "or" | "and">].defaultLabel
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between truncate", triggerClassName)}
        >
          <div className="truncate">{selectedLabel ?? (placeholder ?? t("table.filter.operator.placeholder", "Search operator..."))}</div>
          <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("p-0", contentClassName)} forceMount>
        <Command>
          <CommandInput placeholder={placeholder ?? t("table.filter.operator.placeholder", "Search operator...")} />
          <CommandList>
            <CommandEmpty>{t("table.filter.operator.noResults", "No operator found.")}</CommandEmpty>
            <CommandGroup>
              {operators.map(([op, { i18nKey, defaultLabel }]) => (
                <CommandItem
                  key={op}
                  value={op}
                  onSelect={() => {
                    onValueChange(op as CrudOperators);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("me-2 h-4 w-4", value === op ? "opacity-100" : "opacity-0")} />
                  {t(i18nKey, defaultLabel)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

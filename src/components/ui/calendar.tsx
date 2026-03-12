import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
// 1. Import CustomComponents from the library
import { DayPicker, CustomComponents } from "react-day-picker";
import { useTranslation } from "react-i18next";
import { ar, enUS } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const locale = isRtl ? ar : enUS;

  // 2. Extract and explicitly type the object to satisfy the IDE
  const customComponents: CustomComponents = {
    IconLeft: (iconProps) =>
      isRtl ? (
        <ChevronRight className="h-4 w-4" {...iconProps} />
      ) : (
        <ChevronLeft className="h-4 w-4" {...iconProps} />
      ),
    IconRight: (iconProps) =>
      isRtl ? (
        <ChevronLeft className="h-4 w-4" {...iconProps} />
      ) : (
        <ChevronRight className="h-4 w-4" {...iconProps} />
      ),
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={locale}
      dir={isRtl ? "rtl" : "ltr"}
      className={cn("p-3", className)}
      classNames={{
        // ... (keep all your existing classNames here, they are perfectly fine!)
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1 rtl:right-1 rtl:left-auto",
        nav_button_next: "absolute right-1 rtl:left-1 rtl:right-auto",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 rtl:first:[&:has([aria-selected])]:rounded-r-md rtl:last:[&:has([aria-selected])]:rounded-l-md",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      // 3. Pass the typed object
      components={customComponents}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, PlusCircle, Trash2 } from "lucide-react";
import {
  UseFormReturn,
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
} from "react-hook-form";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

interface ScheduleSectionProps {
  form: UseFormReturn<any>;
  fields: FieldArrayWithId<any, "schedules", "id">[];
  append: UseFieldArrayAppend<any, "schedules">;
  remove: UseFieldArrayRemove;
}

export const ScheduleSection = ({ form, fields, append, remove }: ScheduleSectionProps) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  return (
    <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-4xl overflow-hidden">
      <CardHeader className="p-8 pb-4">
        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 opacity-60 text-start">
          <Calendar className="h-4 w-4" />
          {t("classes.form.weeklySchedule")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-4 space-y-6">
        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {fields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, x: isAr ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isAr ? -10 : 10 }}
                className="flex flex-col md:flex-row items-end gap-4 p-6 rounded-2xl bg-muted/10 border border-black/3 dark:border-white/3 group text-start"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
                  <FormField
                    control={form.control}
                    name={`schedules.${index}.day`}
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1">
                          {t("classes.form.day")}
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl bg-background border-none focus:ring-primary transition-all font-bold">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-none shadow-2xl">
                            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                              <SelectItem
                                key={day}
                                value={day}
                                className="rounded-lg font-bold text-start"
                              >
                                {t(`days.${day}` as any)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`schedules.${index}.startTime`}
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1">
                          {t("classes.form.startTime")}
                        </FormLabel>
                        <FormControl>
                          <div className="relative group/input">
                            <Clock
                              className={cn(
                                "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-primary transition-colors",
                                "start-3"
                              )}
                            />
                            <Input
                              type="time"
                              className={cn(
                                "h-12 rounded-xl bg-background border-none focus-visible:ring-primary font-bold",
                                isAr ? "pe-10" : "ps-10"
                              )}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`schedules.${index}.endTime`}
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1">
                          {t("classes.form.endTime")}
                        </FormLabel>
                        <FormControl>
                          <div className="relative group/input">
                            <Clock
                              className={cn(
                                "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-primary transition-colors",
                                "start-3"
                              )}
                            />
                            <Input
                              type="time"
                              className={cn(
                                "h-12 rounded-xl bg-background border-none focus-visible:ring-primary font-bold",
                                isAr ? "pe-10" : "ps-10"
                              )}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full h-14 rounded-2xl border-2 border-dashed border-primary/20 text-primary hover:bg-primary/5 font-black uppercase tracking-widest text-[10px] gap-2 transition-all"
            onClick={() => append({ day: "Mon", startTime: "09:00", endTime: "10:30" })}
          >
            <PlusCircle className="h-4 w-4" />
            {t("buttons.addTimeSlot")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

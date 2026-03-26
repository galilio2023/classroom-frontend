import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Calendar, Clock, Check, LayoutDashboard, Users, Palette, FileText, Sparkles, PlusCircle, Save, ShieldCheck, Loader2, Trash2 } from "lucide-react";
import { UseFormReturn, FieldArrayWithId, UseFieldArrayAppend, UseFieldArrayRemove } from "react-hook-form";
import { ClassStatus } from "@/types";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useList } from "@refinedev/core";
import { AcademicTerm } from "@/types";
import { useTranslation } from "react-i18next";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface ClassFormProps {
  form: UseFormReturn<any>;
  subjectOptions: { value: string | number; label: string }[];
  fields: FieldArrayWithId<any, "schedules", "id">[];
  append: UseFieldArrayAppend<any, "schedules">;
  remove: UseFieldArrayRemove;
  formLoading: boolean;
  isEdit?: boolean;
}

const PRESET_COLORS = [
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#71717a", // Zinc
];

export const ClassForm = ({ 
  form, 
  subjectOptions, 
  fields, 
  append, 
  remove,
  formLoading,
  isEdit = false
}: ClassFormProps) => {
  const { t, i18n } = useTranslation();
  const selectedColor = form.watch("color");

  const { query: termsQuery } = useList<AcademicTerm>({
    resource: "academic-terms",
    pagination: { pageSize: 100 },
    filters: [
      {
        field: "status",
        operator: "in",
        value: ["active", "upcoming"],
      },
    ],
  });

  const termsLoading = termsQuery.isLoading;
  const terms = termsQuery.data?.data || [];

  const isAr = i18n.language === 'ar';

  return (
    <div className="space-y-10">
      {/* Basic Details Card */}
      <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2rem] overflow-hidden">
        <div className="h-1.5 w-full transition-colors duration-500" style={{ backgroundColor: selectedColor }} />
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 opacity-60 text-start">
            <BookOpen className="h-4 w-4" />
            {isEdit ? t("classes.form.updateDetails") : t("classes.form.coreInfo")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-start">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <LayoutDashboard className="h-3 w-3" />
                    {t("classes.form.className")}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={t("classes.form.classNamePlaceholder")} {...field} className="h-14 rounded-2xl bg-muted/20 border-none focus-visible:ring-primary font-bold" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      {t("classes.form.capacity")}
                    </FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-muted-foreground/40 cursor-help hover:text-primary transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[200px] text-[10px] font-medium leading-relaxed">
                          {t("classes.form.capacityHelp")}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormControl>
                    <div className="relative group">
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        className="h-14 rounded-2xl bg-muted/20 border-none focus-visible:ring-primary font-black text-center text-xl" 
                      />
                      <span className={cn("absolute top-1/2 -translate-y-1/2 text-[10px] font-black opacity-20 group-focus-within:opacity-40 transition-opacity", isAr ? "left-4" : "right-4")}>
                        {t("classes.form.studentsUnit")}
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-start">
            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <BookOpen className="h-3 w-3" />
                    {t("classes.form.subjectArea")}
                  </FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value ? String(field.value) : ""}
                  >
                    <FormControl>
                      <SelectTrigger className="h-14 rounded-2xl bg-muted/20 border-none focus:ring-primary transition-all font-bold">
                        <SelectValue placeholder={t("classes.form.selectSubject")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-none shadow-2xl">
                      {subjectOptions.map((option) => (
                        <SelectItem key={option.value} value={String(option.value)} className="rounded-lg font-bold text-start">
                          {option.label}
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
              name="termId"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    {t("classes.form.academicTerm")}
                  </FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? String(field.value) : ""}
                    disabled={termsLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="h-14 rounded-2xl bg-muted/20 border-none focus:ring-primary transition-all font-bold">
                        <SelectValue placeholder={t("classes.form.selectTerm")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-none shadow-2xl">
                      {terms.map((term: AcademicTerm) => (
                        <SelectItem key={term.id} value={String(term.id)} className="rounded-lg font-bold text-start">
                          {term.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-start">
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <Palette className="h-3 w-3" />
                    {t("classes.form.themeColor")}
                  </FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-3 p-4 rounded-2xl bg-muted/10 border border-black/[0.03] dark:border-white/[0.03]">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={cn(
                            "h-10 w-10 rounded-full border-4 transition-all hover:scale-110 flex items-center justify-center shadow-sm",
                            field.value === color ? "border-white dark:border-white/5 scale-110 ring-2 ring-primary" : "border-transparent"
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => field.onChange(color)}
                        >
                          {field.value === color && <Check className="h-5 w-5 text-white" />}
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEdit && (
                <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                    <FormItem className="space-y-3">
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                      <ShieldCheck className="h-3 w-3" />
                      {t("classes.form.classStatus")}
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger className="h-14 rounded-2xl bg-muted/20 border-none focus:ring-primary transition-all font-bold">
                            <SelectValue />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-none shadow-2xl">
                        <SelectItem value={ClassStatus.ACTIVE} className="rounded-lg font-bold text-start">{t("classes.form.status.active")}</SelectItem>
                        <SelectItem value={ClassStatus.INACTIVE} className="rounded-lg font-bold text-start">{t("classes.form.status.inactive")}</SelectItem>
                        <SelectItem value={ClassStatus.ARCHIVED} className="rounded-lg font-bold text-start">{t("classes.form.status.archived")}</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            )}
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="space-y-3 text-start">
                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  {t("classes.form.description")}
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Textarea 
                      placeholder={t("classes.form.descriptionPlaceholder")} 
                      className="min-h-[150px] rounded-2xl bg-muted/20 border-none focus-visible:ring-primary p-6 text-sm leading-relaxed shadow-inner transition-all resize-none"
                      {...field} 
                    />
                    <div className={cn("absolute bottom-4 opacity-10 group-focus-within:opacity-30 transition-opacity", isAr ? "left-4" : "right-4")}>
                      <Sparkles className="h-6 w-6" />
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Schedule Builder Card */}
      <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2rem] overflow-hidden">
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
                  className="flex flex-col md:flex-row items-end gap-4 p-6 rounded-2xl bg-muted/10 border border-black/[0.03] dark:border-white/[0.03] group text-start"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
                    <FormField
                      control={form.control}
                      name={`schedules.${index}.day`}
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t("classes.form.day")}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 rounded-xl bg-background border-none focus:ring-primary transition-all font-bold">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border-none shadow-2xl">
                              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                                <SelectItem key={day} value={day} className="rounded-lg font-bold text-start">{t(`days.${day}` as any)}</SelectItem>
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
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t("classes.form.startTime")}</FormLabel>
                          <FormControl>
                            <div className="relative group/input">
                              <Clock className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-primary transition-colors", isAr ? "right-3" : "left-3")} />
                              <Input type="time" className={cn("h-12 rounded-xl bg-background border-none focus-visible:ring-primary font-bold", isAr ? "pr-10" : "pl-10")} {...field} />
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
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t("classes.form.endTime")}</FormLabel>
                          <FormControl>
                            <div className="relative group/input">
                              <Clock className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-primary transition-colors", isAr ? "right-3" : "left-3")} />
                              <Input type="time" className={cn("h-12 rounded-xl bg-background border-none focus-visible:ring-primary font-bold", isAr ? "pr-10" : "pl-10")} {...field} />
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

      <div className="pt-6 flex justify-end">
        <Button 
          type="submit" 
          size="lg" 
          disabled={formLoading} 
          className="h-16 rounded-[1.5rem] px-12 font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 transition-all hover:scale-[1.05] active:scale-[0.95] relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shine_2s_infinite] pointer-events-none" />
          {formLoading ? (
            <div className="flex gap-3 items-center">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>{t("buttons.saving")}</span>
            </div>
          ) : (
            <div className="flex gap-3 items-center">
              <Save className="h-6 w-6" />
              <span>{isEdit ? t("buttons.saveChanges") : t("buttons.createClass")}</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};

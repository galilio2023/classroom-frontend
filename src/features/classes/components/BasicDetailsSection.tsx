import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  LayoutDashboard,
  Users,
  Palette,
  FileText,
  Sparkles,
  Check,
  ShieldCheck,
  Calendar,
  PlusCircle,
} from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { ClassStatus, AcademicTerm } from "@/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface BasicDetailsSectionProps {
  form: UseFormReturn<any>;
  subjectOptions: { value: string | number; label: string }[];
  terms: AcademicTerm[];
  termsLoading: boolean;
  isEdit?: boolean;
  isCreatingNewSubject?: boolean;
  setIsCreatingNewSubject?: (value: boolean) => void;
  subjectsLoading?: boolean;
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

export const BasicDetailsSection = ({
  form,
  subjectOptions,
  terms,
  termsLoading,
  isEdit = false,
  isCreatingNewSubject = false,
  setIsCreatingNewSubject,
  subjectsLoading = false,
}: BasicDetailsSectionProps) => {
  const { t } = useTranslation();
  const selectedColor = form.watch("color");

  return (
    <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-4xl overflow-hidden">
      <div
        className="h-1.5 w-full transition-colors duration-500"
        style={{ backgroundColor: selectedColor }}
      />
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
                  <Input
                    placeholder={t("classes.form.classNamePlaceholder")}
                    {...field}
                    className="h-14 rounded-2xl bg-muted/20 border-none focus-visible:ring-primary font-bold"
                  />
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
                      onChange={(e) =>
                        field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                      }
                      className="h-14 rounded-2xl bg-muted/20 border-none focus-visible:ring-primary font-black text-center text-xl"
                    />
                    <span
                      className={cn(
                        "absolute top-1/2 -translate-y-1/2 text-[10px] font-black opacity-20 group-focus-within:opacity-40 transition-opacity",
                        "end-4"
                      )}
                    >
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
                  onValueChange={(value) => {
                    if (value === "new-subject") {
                      setIsCreatingNewSubject?.(true);
                      field.onChange(undefined);
                    } else {
                      setIsCreatingNewSubject?.(false);
                      form.setValue("newSubjectName", "");
                      field.onChange(Number(value));
                    }
                  }}
                  value={isCreatingNewSubject ? "new-subject" : field.value?.toString() || ""}
                  disabled={subjectsLoading}
                >
                  <FormControl>
                    <SelectTrigger className="h-14 rounded-2xl bg-muted/20 border-none focus:ring-primary transition-all font-bold">
                      <SelectValue placeholder={t("classes.form.selectSubject")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl border-none shadow-2xl">
                    {subjectOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={String(option.value)}
                        className="rounded-lg font-bold text-start"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                    {!isEdit && (
                      <SelectItem
                        value="new-subject"
                        className="rounded-lg font-bold text-start text-primary"
                      >
                        <PlusCircle className="inline-block h-4 w-4 me-2" />{" "}
                        {t("classes.form.createNewSubject")}
                      </SelectItem>
                    )}
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
                  disabled={termsLoading || terms.length === 0}
                >
                  <FormControl>
                    <SelectTrigger className="h-14 rounded-2xl bg-muted/20 border-none focus:ring-primary transition-all font-bold">
                      <SelectValue
                        placeholder={
                          terms.length === 0
                            ? t("terms.noTermsFound" as any)
                            : t("classes.form.selectTerm")
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl border-none shadow-2xl">
                    {terms.map((term: AcademicTerm) => (
                      <SelectItem
                        key={term.id}
                        value={String(term.id)}
                        className="rounded-lg font-bold text-start"
                      >
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

        {isCreatingNewSubject && (
          <FormField
            control={form.control}
            name="newSubjectName"
            render={({ field }) => (
              <FormItem className="space-y-3 text-start">
                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <BookOpen className="h-3 w-3" />
                  {t("classes.form.newSubjectName")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("classes.form.newSubjectName")}
                    {...field}
                    className="h-14 rounded-2xl bg-muted/20 border-none focus-visible:ring-primary font-bold"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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
                  <div className="flex flex-wrap gap-3 p-4 rounded-2xl bg-muted/10 border border-black/3 dark:border-white/3">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={cn(
                          "h-10 w-10 rounded-full border-4 transition-all hover:scale-110 flex items-center justify-center shadow-sm",
                          field.value === color
                            ? "border-white dark:border-white/5 scale-110 ring-2 ring-primary"
                            : "border-transparent"
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
                      <SelectItem
                        value={ClassStatus.ACTIVE}
                        className="rounded-lg font-bold text-start"
                      >
                        {t("classes.form.status.active")}
                      </SelectItem>
                      <SelectItem
                        value={ClassStatus.INACTIVE}
                        className="rounded-lg font-bold text-start"
                      >
                        {t("classes.form.status.inactive")}
                      </SelectItem>
                      <SelectItem
                        value={ClassStatus.ARCHIVED}
                        className="rounded-lg font-bold text-start"
                      >
                        {t("classes.form.status.archived")}
                      </SelectItem>
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
                  <div
                    className={cn(
                      "absolute bottom-4 opacity-10 group-focus-within:opacity-30 transition-opacity",
                      "end-4"
                    )}
                  >
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
  );
};

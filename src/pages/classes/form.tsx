import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Calendar, Plus, Trash2, Clock, Check, LayoutDashboard, Users, Palette, FileText, Sparkles, PlusCircle, Save, ShieldCheck, Loader2 } from "lucide-react";
import { UseFormReturn, FieldArrayWithId, UseFieldArrayAppend, UseFieldArrayRemove } from "react-hook-form";
import { ClassStatus } from "@/types";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";

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
  const selectedColor = form.watch("color");

  return (
    <div className="space-y-10">
      {/* Basic Details Card */}
      <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2rem] overflow-hidden">
        <div className="h-1.5 w-full transition-colors duration-500" style={{ backgroundColor: selectedColor }} />
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 opacity-60">
            <BookOpen className="h-4 w-4" />
            {isEdit ? "Update Class Details" : "Core Information"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <LayoutDashboard className="h-3 w-3" />
                    Class Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Math 101 - Section A" {...field} className="h-14 rounded-2xl bg-muted/20 border-none focus-visible:ring-primary font-bold" />
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
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    Student Capacity
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        className="h-14 rounded-2xl bg-muted/20 border-none focus-visible:ring-primary font-black text-center text-xl" 
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-20 group-focus-within:opacity-40 transition-opacity">STUDENTS</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <BookOpen className="h-3 w-3" />
                    Subject Area
                  </FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value ? String(field.value) : ""}
                  >
                    <FormControl>
                      <SelectTrigger className="h-14 rounded-2xl bg-muted/20 border-none focus:ring-primary transition-all font-bold">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-none shadow-2xl">
                      {subjectOptions.map((option) => (
                        <SelectItem key={option.value} value={String(option.value)} className="rounded-lg font-bold">
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
              name="color"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <Palette className="h-3 w-3" />
                    Theme Color
                  </FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-3 p-4 rounded-2xl bg-muted/10 border border-black/[0.03] dark:border-white/[0.03]">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={cn(
                            "h-10 w-10 rounded-full border-4 transition-all hover:scale-110 flex items-center justify-center shadow-sm",
                            field.value === color ? "border-white dark:border-zinc-800 scale-110 ring-2 ring-primary" : "border-transparent"
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
          </div>

          {isEdit && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                    <FormItem className="space-y-3">
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                      <ShieldCheck className="h-3 w-3" />
                      Class Status
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger className="h-14 rounded-2xl bg-muted/20 border-none focus:ring-primary transition-all font-bold">
                            <SelectValue />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-none shadow-2xl">
                        <SelectItem value={ClassStatus.ACTIVE} className="rounded-lg font-bold">Active</SelectItem>
                        <SelectItem value={ClassStatus.INACTIVE} className="rounded-lg font-bold">Inactive</SelectItem>
                        <SelectItem value={ClassStatus.ARCHIVED} className="rounded-lg font-bold">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
          )}

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  Description
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Textarea 
                      placeholder="Provide a brief overview of the class goals..." 
                      className="min-h-[150px] rounded-2xl bg-muted/20 border-none focus-visible:ring-primary p-6 text-sm leading-relaxed shadow-inner transition-all resize-none"
                      {...field} 
                    />
                    <div className="absolute bottom-4 right-4 opacity-10 group-focus-within:opacity-30 transition-opacity">
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
          <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 opacity-60">
            <Calendar className="h-4 w-4" />
            Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-6">
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {fields.map((field, index) => (
                <motion.div 
                  key={field.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex flex-col md:flex-row items-end gap-4 p-6 rounded-2xl bg-muted/10 border border-black/[0.03] dark:border-white/[0.03] group"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
                    <FormField
                      control={form.control}
                      name={`schedules.${index}.day`}
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Day</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 rounded-xl bg-background border-none focus:ring-primary transition-all font-bold">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border-none shadow-2xl">
                              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                                <SelectItem key={day} value={day} className="rounded-lg font-bold">{day}</SelectItem>
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
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Start Time</FormLabel>
                          <FormControl>
                            <div className="relative group/input">
                              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                              <Input type="time" className="h-12 rounded-xl bg-background border-none focus-visible:ring-primary pl-10 font-bold" {...field} />
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
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">End Time</FormLabel>
                          <FormControl>
                            <div className="relative group/input">
                              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                              <Input type="time" className="h-12 rounded-xl bg-background border-none focus-visible:ring-primary pl-10 font-bold" {...field} />
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
              Add Time Slot
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
              <span>Saving...</span>
            </div>
          ) : (
            <div className="flex gap-3 items-center">
              <Save className="h-6 w-6" />
              <span>{isEdit ? "Save Changes" : "Create Class"}</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};

import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateView } from "@/components/refine-ui/views/create-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Textarea } from "@/components/ui/textarea";
import { useBack, useList, useGetIdentity, HttpError, BaseRecord } from "@refinedev/core";
import { Loader2, Check, ChevronLeft, LayoutDashboard, BookOpen, Users, Palette, FileText, Sparkles, PlusCircle, Info, Calendar } from "lucide-react";
import { classCreateFormSchema } from "@/schemas/class";
import { Subject, User, ClassStatus, AcademicTerm } from "@/types";
import { toast } from "sonner";
import z from "zod";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";

type ClassCreateFormValues = z.infer<typeof classCreateFormSchema>;

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

const ClassesCreate = () => {
  const back = useBack();
  const { data: identity } = useGetIdentity<User>();

  const form = useForm<BaseRecord, HttpError, ClassCreateFormValues>({
    resolver: zodResolver(classCreateFormSchema) as any,
    refineCoreProps: {
      resource: "classes",
      action: "create",
      redirect: "list",
    },
    defaultValues: {
      name: "",
      description: "",
      subjectId: undefined,
      termId: undefined,
      capacity: 30,
      status: ClassStatus.ACTIVE,
      schedules: [],
      color: PRESET_COLORS[0],
    },
  });

  const {
    refineCore: { onFinish },
    handleSubmit,
    formState: { isSubmitting },
    watch,
  } = form;

  const selectedColor = watch("color");

  const onSubmit = async (values: ClassCreateFormValues) => {
    if (!identity?.id) {
      toast.error("Cannot create class: User identity not found.");
      return;
    }
    await onFinish({
      ...values,
      teacherId: identity.id,
    } as any);
  };

  const { query: subjectsQuery } = useList<Subject>({
    resource: "subjects",
    pagination: { pageSize: 100 },
  });

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

  const subjects = subjectsQuery.data?.data ?? [];
  const subjectsLoading = subjectsQuery.isLoading;

  const terms = termsQuery.data?.data ?? [];
  const termsLoading = termsQuery.isLoading;

  return (
    <CreateView className="class-view pb-20">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <Breadcrumb />
            <h1 className="text-4xl font-black tracking-tighter leading-none">Create a Class</h1>
            <p className="text-muted-foreground font-medium">Provide the required information below to add a new classroom.</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => back()}
            className="rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[10px] gap-2 border-primary/20 hover:bg-primary/5 text-primary transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2rem] overflow-hidden">
            <div className="h-1.5 w-full transition-colors duration-500" style={{ backgroundColor: selectedColor }} />
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 opacity-60">
                <LayoutDashboard className="h-4 w-4" />
                Class Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4">
              <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-8">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                              <LayoutDashboard className="h-3 w-3" />
                              Class Name <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Introduction to Biology" {...field} className="h-14 rounded-2xl bg-muted/20 border-none focus-visible:ring-primary font-bold" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="subjectId"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <BookOpen className="h-3 w-3" />
                                Subject <span className="text-destructive">*</span>
                              </FormLabel>
                              <Select
                                onValueChange={(value) => field.onChange(Number(value))}
                                value={field.value?.toString()}
                                disabled={subjectsLoading}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-14 rounded-2xl bg-muted/20 border-none focus:ring-primary transition-all font-bold">
                                    <SelectValue placeholder="Select a subject" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-xl border-none shadow-2xl">
                                  {subjects.map((subject) => (
                                    <SelectItem key={subject.id} value={subject.id.toString()} className="rounded-lg font-bold">
                                      {subject.name}
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
                                Academic Term <span className="text-destructive">*</span>
                              </FormLabel>
                              <Select
                                onValueChange={(value) => field.onChange(Number(value))}
                                value={field.value?.toString()}
                                disabled={termsLoading}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-14 rounded-2xl bg-muted/20 border-none focus:ring-primary transition-all font-bold">
                                    <SelectValue placeholder="Select a term" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-xl border-none shadow-2xl">
                                  {terms.map((term) => (
                                    <SelectItem key={term.id} value={term.id.toString()} className="rounded-lg font-bold">
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="capacity"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <Users className="h-3 w-3" />
                                Capacity <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <Input
                                    type="number"
                                    min={1}
                                    placeholder="30"
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
                         <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem className="space-y-4">
                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                              <Palette className="h-3 w-3" />
                              Class Theme Color
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


                    </div>

                    <div className="space-y-8">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                              <FileText className="h-3 w-3" />
                              Class Description
                            </FormLabel>
                            <FormControl>
                              <div className="relative group">
                                <Textarea 
                                  placeholder="Provide a brief overview of the class goals and curriculum..." 
                                  className="min-h-[280px] rounded-[1.5rem] bg-muted/20 border-none focus-visible:ring-primary p-6 text-sm leading-relaxed shadow-inner transition-all"
                                  {...field} 
                                />
                                <div className="absolute bottom-4 right-4 opacity-10 group-focus-within:opacity-30 transition-opacity">
                                  <Sparkles className="h-8 w-8" />
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-black/[0.03] dark:border-white/[0.03]">
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full h-16 rounded-[1.5rem] font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 transition-all hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden group"
                      disabled={isSubmitting}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shine_2s_infinite] pointer-events-none" />
                      {isSubmitting ? (
                        <div className="flex gap-3 items-center">
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <span>Creating Classroom...</span>
                        </div>
                      ) : (
                        <div className="flex gap-3 items-center">
                          <PlusCircle className="h-6 w-6" />
                          <span>Create Class</span>
                        </div>
                      )}
                    </Button>
                    <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground/40">
                      <Info className="h-3.5 w-3.5" />
                      <span className="text-[9px] font-black uppercase tracking-widest">You can invite co-teachers and students after creation</span>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </CreateView>
  );
};

export default ClassesCreate;

import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreateView } from "@/components/refine-ui/views/create-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchParams, useLocation } from "react-router-dom";
import { useGo, useList } from "@refinedev/core";
import { toast } from "sonner";
import { AIAssignmentHelper } from "@/components/ai-assignment-helper";
import { FileUpload } from "@/components/file-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Sparkles, 
  Paperclip, 
  Loader2, 
  Wand2, 
  X, 
  BookOpen, 
  Plus, 
  Trash2, 
  Users, 
  Calendar, 
  LayoutDashboard, 
  FileText, 
  Info,
  MessageSquare,
  CheckCircle2
} from "lucide-react";
import { FieldValues, useFieldArray } from "react-hook-form";
import { Module, Class } from "@/types";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

const createAssignmentSchema = (t: any) => z.object({
  title: z.string().min(1, t("assignments.create.validation.titleRequired")),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  fileUrl: z.string().optional(),
  fileCldPubId: z.string().optional(),
  moduleId: z.coerce.number().optional().nullable(),
  classId: z.coerce.number().min(1, t("assignments.create.validation.classRequired")),
  hasPeerReview: z.boolean().default(false),
  isGroupAssignment: z.boolean().default(false),
  peerReviewWeight: z.coerce.number().min(0).max(100).default(20),
  rubric: z.array(z.object({
    criteria: z.string().min(1, t("assignments.create.validation.criteriaRequired")),
    maxPoints: z.coerce.number().min(1, t("assignments.create.validation.pointsRequired")),
  })).default([]),
});

type AssignmentFormValues = z.infer<ReturnType<typeof createAssignmentSchema>>;

export const AssignmentCreate = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const urlClassId = searchParams.get("classId");
  const initialModuleId = searchParams.get("moduleId");
  const go = useGo();
  const [showAI, setShowAI] = useState(false);
  const isAr = i18n.language === 'ar';

  const { query: classesQuery } = useList<Class>({
    resource: "classes",
    pagination: { mode: "off" },
  });

  const classes = classesQuery.data?.data || [];
  const classesLoading = classesQuery.isLoading;

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(createAssignmentSchema(t)) as any,
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      fileUrl: "",
      fileCldPubId: "",
      moduleId: initialModuleId ? Number(initialModuleId) : null,
      classId: urlClassId ? Number(urlClassId) : undefined as any,
      hasPeerReview: false,
      isGroupAssignment: false,
      peerReviewWeight: 20,
      rubric: [{ criteria: "Accuracy", maxPoints: 10 }, { criteria: "Clarity", maxPoints: 10 }],
    },
    refineCoreProps: {
      resource: "assignments",
      action: "create",
      onMutationSuccess: () => {
        const targetClassId = form.getValues("classId");
        go({ to: `/classes/show/${targetClassId}`, type: "replace" });
      },
    },
  });

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    refineCore: { onFinish, formLoading },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rubric",
  });

  const selectedClassId = watch("classId");
  const hasPeerReview = watch("hasPeerReview");

  const { query: modulesQuery } = useList<Module>({
    resource: "modules",
    filters: [{ field: "classId", operator: "eq", value: selectedClassId }],
    queryOptions: { enabled: !!selectedClassId },
  });

  const modules = modulesQuery.data?.data || [];
  const modulesLoading = modulesQuery.isLoading;

  useEffect(() => {
    if (initialModuleId) {
      setValue("moduleId", Number(initialModuleId));
    }
    
    const stateContent = location.state?.pendingContent;
    const sessionContent = sessionStorage.getItem("pending_ai_assignment");
    const pendingContent = stateContent || sessionContent;

    if (pendingContent) {
        setValue("description", pendingContent);
        if (sessionContent) sessionStorage.removeItem("pending_ai_assignment");
        toast.info(t("assignments.create.toasts.aiDraftApplied"));
        setShowAI(false);
    }
  }, [initialModuleId, setValue, location.state, t]);

  const onSubmit = (values: FieldValues) => {
    onFinish(values);
  };

  const handleUseAIContent = (content: string) => {
    setValue("description", content);
    toast.success(t("assignments.create.toasts.aiContentApplied"));
    document.getElementById("description")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileUpload = (url: string, publicId: string) => {
    setValue("fileUrl", url);
    setValue("fileCldPubId", publicId);
  };

  return (
    <CreateView className="max-w-full">
      <div className="flex flex-col gap-8 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-full px-3 py-1 font-black text-[10px] uppercase tracking-widest bg-primary/10 text-primary border-none">
                    {t("assignments.create.teacherDashboard")}
                  </Badge>
                </div>
                <h1 className="text-4xl font-black tracking-tighter">{t("buttons.createAssignment")}</h1>
                <p className="text-muted-foreground font-medium">{t("assignments.create.designAndPublish")}</p>
            </div>
            <AnimatePresence mode="wait">
              {!showAI && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Button 
                        variant="outline" 
                        onClick={() => setShowAI(true)}
                        className="gap-2 rounded-2xl h-12 px-8 border-ai-primary/20 text-ai-primary hover:bg-ai-primary/5 transition-all relative overflow-hidden group shadow-lg shadow-ai-primary/5"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out] pointer-events-none" />
                        <Sparkles className="h-4 w-4" />
                        <span className="font-black uppercase tracking-widest text-[10px]">{t("buttons.aiWritingAssistant")}</span>
                    </Button>
                  </motion.div>
              )}
            </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
            {/* Main Form */}
            <motion.div 
              layout
              className={cn(
                "transition-all duration-500 ease-in-out",
                showAI ? "xl:col-span-7" : "xl:col-span-8 xl:col-start-3"
              )}
            >
                <Card className="shadow-2xl border-none bg-card/50 backdrop-blur-xl overflow-hidden rounded-[2rem]">
                    <div className="h-1.5 bg-gradient-to-r from-primary via-ai-primary to-primary w-full" />
                    <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 opacity-60">
                          <LayoutDashboard className="h-4 w-4" />
                          {t("assignments.create.assignmentConfig")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-4">
                        <Form {...form}>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 text-start">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <FormField
                                        control={control}
                                        name="classId"
                                        render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                                <BookOpen className="h-3 w-3" />
                                                {t("assignments.create.targetClass")}
                                            </FormLabel>
                                            <Select 
                                                onValueChange={(val) => {
                                                    field.onChange(Number(val));
                                                    setValue("moduleId", null);
                                                }} 
                                                value={field.value?.toString()}
                                                disabled={!!urlClassId}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-14 rounded-2xl bg-muted/20 border-none focus:ring-primary transition-all text-start">
                                                        <SelectValue placeholder={classesLoading ? t("assignments.create.placeholders.loadingClasses") : t("assignments.create.placeholders.selectClass")} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-xl border-none shadow-2xl">
                                                    {classes.map((c: Class) => (
                                                        <SelectItem key={c.id} value={c.id.toString()} className="rounded-lg font-bold text-start">{c.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name="title"
                                        render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                              <FileText className="h-3 w-3" />
                                              {t("assignments.create.assignmentTitle")}
                                            </FormLabel>
                                            <FormControl>
                                            <Input placeholder={t("assignments.create.placeholders.title")} {...field} className="h-14 rounded-2xl bg-muted/20 border-none focus-visible:ring-primary font-bold" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <FormField
                                        control={control}
                                        name="moduleId"
                                        render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                              <LayoutDashboard className="h-3 w-3" />
                                              {t("assignments.create.curriculumModule")}
                                            </FormLabel>
                                            <Select 
                                                onValueChange={field.onChange} 
                                                value={field.value?.toString() || "0"}
                                                disabled={!selectedClassId}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-14 rounded-2xl bg-muted/20 border-none focus:ring-primary transition-all text-start">
                                                        <SelectValue placeholder={!selectedClassId ? t("assignments.create.placeholders.selectClassFirst") : modulesLoading ? t("assignments.create.placeholders.loadingClasses") : t("assignments.create.placeholders.selectModule")} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-xl border-none shadow-2xl">
                                                    <SelectItem value="0" className="rounded-lg font-bold text-start">{t("assignments.create.placeholders.noneGlobal")}</SelectItem>
                                                    {modules.map((m: Module) => (
                                                        <SelectItem key={m.id} value={m.id.toString()} className="rounded-lg font-bold text-start">{m.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name="dueDate"
                                        render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                              <Calendar className="h-3 w-3" />
                                              {t("assignments.create.submissionDeadline")}
                                            </FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} className="h-14 rounded-2xl bg-muted/20 border-none focus-visible:ring-primary font-bold" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={control}
                                    name="description"
                                    render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                          <MessageSquare className="h-3.5 w-3.5" />
                                          {t("assignments.create.instructionsAndContent")}
                                        </FormLabel>
                                        <FormControl>
                                            <div className="rounded-2xl overflow-hidden border-2 border-transparent focus-within:border-primary/20 transition-all shadow-inner">
                                              <RichTextEditor 
                                                  value={field.value || ""} 
                                                  onChange={field.onChange}
                                                  placeholder={t("assignments.create.placeholders.instructions")}
                                                  className="min-h-[350px]"
                                              />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />

                                {/* Settings Section: Peer Review & Group Assignment */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Group Assignment Toggle */}
                                    <div className="p-6 bg-card rounded-[2rem] border border-border shadow-sm space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <FormLabel className="text-base font-bold flex items-center gap-2">
                                                    <Users className="h-5 w-5 text-primary" />
                                                    {t("assignments.create.groupAssignment")}
                                                </FormLabel>
                                                <FormDescription className="text-xs">
                                                    {t("assignments.create.groupDescription")}
                                                </FormDescription>
                                            </div>
                                            <FormField
                                                control={control}
                                                name="isGroupAssignment"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Switch
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                                className="data-[state=checked]:bg-primary"
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Peer Review Toggle */}
                                    <div className="p-6 bg-card rounded-[2rem] border border-border shadow-sm space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <FormLabel className="text-base font-bold flex items-center gap-2">
                                                    <Users className="h-5 w-5 text-primary" />
                                                    {t("assignments.list.labels.peerReview")}
                                                </FormLabel>
                                                <FormDescription className="text-xs">
                                                    {t("assignments.create.peerReviewDescription")}
                                                </FormDescription>
                                            </div>
                                            <FormField
                                                control={control}
                                                name="hasPeerReview"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Switch
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                                className="data-[state=checked]:bg-primary"
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                  {hasPeerReview && (
                                      <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-8 relative z-10 overflow-hidden"
                                      >
                                          <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/10 space-y-8 relative overflow-hidden">
                                              <FormField
                                                  control={control}
                                                  name="peerReviewWeight"
                                                  render={({ field }) => (
                                                      <FormItem className="space-y-3">
                                                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t("assignments.create.peerWeight")}</FormLabel>
                                                          <FormControl>
                                                              <div className="relative group">
                                                                <Input type="number" {...field} className="h-14 rounded-2xl bg-background border-none focus-visible:ring-primary font-black text-center text-2xl" />
                                                                <span className={cn("absolute top-1/2 -translate-y-1/2 text-xl font-black opacity-20", isAr ? "left-6" : "right-6")}>%</span>
                                                              </div>
                                                          </FormControl>
                                                          <FormDescription className="text-[10px] font-bold text-center">
                                                              {t("assignments.create.peerWeightDescription")}
                                                          </FormDescription>
                                                          <FormMessage />
                                                      </FormItem>
                                                  )}
                                              />

                                              <div className="space-y-6">
                                                  <div className="flex items-center justify-between">
                                                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t("assignments.create.gradingRubric")}</Label>
                                                      <Button 
                                                          type="button" 
                                                          variant="outline" 
                                                          size="sm" 
                                                          onClick={() => append({ criteria: "", maxPoints: 10 })}
                                                          className="h-9 rounded-xl text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5"
                                                      >
                                                          <Plus className="h-3.5 w-3.5 mr-1.5" /> {t("buttons.addCriteria")}
                                                      </Button>
                                                  </div>
                                                  
                                                  <div className="space-y-4">
                                                      {fields.map((field, index) => (
                                                          <motion.div 
                                                            key={field.id} 
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className="flex gap-4 items-start p-4 rounded-2xl bg-background/50 border border-black/[0.03] dark:border-white/[0.03] shadow-sm group"
                                                          >
                                                              <FormField
                                                                  control={control}
                                                                  name={`rubric.${index}.criteria`}
                                                                  render={({ field }) => (
                                                                      <FormItem className="flex-1">
                                                                          <FormControl>
                                                                              <Input placeholder={t("assignments.create.placeholders.criteriaName")} {...field} className="h-12 rounded-xl bg-muted/20 border-none focus-visible:ring-primary font-bold" />
                                                                          </FormControl>
                                                                          <FormMessage />
                                                                      </FormItem>
                                                                  )}
                                                              />
                                                              <FormField
                                                                  control={control}
                                                                  name={`rubric.${index}.maxPoints`}
                                                                  render={({ field }) => (
                                                                      <FormItem className="w-28">
                                                                          <FormControl>
                                                                              <div className="relative">
                                                                                <Input type="number" placeholder={t("assignments.create.placeholders.max")} {...field} className="h-12 rounded-xl bg-muted/20 border-none focus-visible:ring-primary font-black text-center" />
                                                                                <span className={cn("absolute top-1/2 -translate-y-1/2 text-[9px] font-black opacity-20", isAr ? "left-3" : "right-3")}>PTS</span>
                                                                              </div>
                                                                          </FormControl>
                                                                          <FormMessage />
                                                                      </FormItem>
                                                                  )}
                                                              />
                                                              <Button 
                                                                  type="button" 
                                                                  variant="ghost" 
                                                                  size="icon" 
                                                                  onClick={() => remove(index)}
                                                                  className="h-12 w-12 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
                                                              >
                                                                  <Trash2 className="h-5 w-5" />
                                                              </Button>
                                                          </motion.div>
                                                      ))}
                                                  </div>
                                              </div>
                                          </div>
                                      </motion.div>
                                  )}
                                </AnimatePresence>

                                <div className="p-8 bg-muted/30 rounded-[2rem] border-2 border-dashed border-muted-foreground/10 space-y-4">
                                    <div className="flex items-center gap-2">
                                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t("assignments.create.referenceMaterials")}</Label>
                                    </div>
                                    <FileUpload 
                                        label={t("assignments.create.uploadMaterial")}
                                        folder="assignments"
                                        onUploadSuccess={handleFileUpload}
                                    />
                                    <AnimatePresence>
                                      {watch("fileUrl") && (
                                          <motion.div 
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-4 flex items-center gap-3 p-4 rounded-2xl bg-success/5 border border-success/20 w-fit shadow-sm"
                                          >
                                              <div className="p-2 rounded-lg bg-success/10 text-success">
                                                <CheckCircle2 className="h-4 w-4" />
                                              </div>
                                              <div className="flex flex-col">
                                                <span className="text-xs font-black text-success uppercase tracking-widest">{t("assignments.create.attached")}</span>
                                                <span className="text-[10px] text-muted-foreground font-medium">{t("assignments.create.attachedDesc")}</span>
                                              </div>
                                          </motion.div>
                                      )}
                                    </AnimatePresence>
                                </div>

                                <div className="pt-4">
                                  <Button 
                                    type="submit" 
                                    disabled={formLoading} 
                                    size="lg" 
                                    className="w-full h-16 rounded-[1.5rem] font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 transition-all hover:scale-[1.01] active:scale-[0.98] relative overflow-hidden group"
                                  >
                                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shine_2s_infinite] pointer-events-none" />
                                      {formLoading ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Wand2 className="mr-3 h-6 w-6" />}
                                      {formLoading ? t("buttons.publishing") : t("buttons.publishAssignment")}
                                  </Button>
                                  <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground/40">
                                    <Info className="h-3.5 w-3.5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{t("assignments.create.notificationNote")}</span>
                                  </div>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </motion.div>

            {/* AI Assistant Side Panel */}
            <AnimatePresence>
              {showAI && (
                  <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="xl:col-span-5 sticky top-24"
                  >
                      <Card className="border-none shadow-2xl bg-card/80 backdrop-blur-2xl overflow-hidden rounded-[2rem] border border-ai-primary/20">
                          <div className="h-1.5 bg-ai-primary w-full" />
                          <CardHeader className="bg-ai-primary/5 border-b border-ai-primary/10 p-6 flex flex-row items-center justify-between">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-xl bg-ai-primary/10 text-ai-primary">
                                    <Sparkles className="h-5 w-5" />
                                  </div>
                                  <CardTitle className="text-ai-primary text-sm font-black uppercase tracking-widest">{t("buttons.aiWritingAssistant")}</CardTitle>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => setShowAI(false)} className="h-10 w-10 rounded-full hover:bg-ai-primary/10 text-ai-primary transition-colors">
                                  <X className="h-5 w-5" />
                              </Button>
                          </CardHeader>
                          <CardContent className="p-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                              <AIAssignmentHelper onUseContent={handleUseAIContent} />
                          </CardContent>
                      </Card>
                  </motion.div>
              )}
            </AnimatePresence>
        </div>
      </div>
    </CreateView>
  );
};
